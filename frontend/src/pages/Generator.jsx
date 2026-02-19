import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Generator({
  savedData,
  setSavedData,
  savedInput,
  setSavedInput,
  savedCompletedNodes,
  setSavedCompletedNodes,
  savedSelectedNode,
  setSavedSelectedNode,
  setActiveHistoryId,
}) {
  // Use lifted state from parent for persistence
  const [input, setInput] = [savedInput, setSavedInput]
  const [data, setData] = [savedData, setSavedData]
  const [completedNodes, setCompletedNodes] = [savedCompletedNodes, setSavedCompletedNodes]
  const [selectedNode, setSelectedNode] = [savedSelectedNode, setSavedSelectedNode]

  // Local state (doesn't need to persist)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const zoomRef = useRef(null)
  const nodesRef = useRef(null) // Хранит массив узлов с позициями

  const generateRoadmap = async () => {
    if (!input.trim()) {
      setError('Please enter a goal or topic')
      return
    }

    setLoading(true)
    setError('')
    setSelectedNode(null)
    setCompletedNodes(new Set())

    try {
      // Пытаемся взять URL из переменных окружения, иначе используем стандартные пути
      const apiBase = import.meta.env.VITE_API_URL || '';
      const apiUrl = import.meta.env.PROD
        ? `${apiBase}/roadmap`
        : 'http://localhost:5001/roadmap';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: input,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Server error (${response.status})`)
      }

      const parsedData = await response.json()

      if (!parsedData.nodes || !Array.isArray(parsedData.nodes)) {
        throw new Error('Server returned invalid data format')
      }

      parsedData.nodes = parsedData.nodes.map((node) => ({
        ...node,
        id: node.id || `node_${Math.random().toString(36).substr(2, 9)}`,
        label: node.label || 'Node',
        description: node.description || '',
        level: typeof node.level === 'number' ? node.level : 0,
        children: Array.isArray(node.children) ? node.children : [],
        resources: Array.isArray(node.resources) ? node.resources : [],
      }))

      const existingIds = new Set(parsedData.nodes.map((n) => n.id))
      parsedData.nodes = parsedData.nodes.map((node) => ({
        ...node,
        children: node.children.filter((childId) => existingIds.has(childId)),
      }))

      // Auto-correct levels to ensure strict hierarchy (Parent L -> Child L+1)
      const nodeIds = new Map(parsedData.nodes.map(n => [n.id, n]))
      // Find root: explicitly level 0, or the first one if missing
      const rootNode = parsedData.nodes.find(n => n.level === 0) || parsedData.nodes[0]

      if (rootNode) {
        const queue = [{ id: rootNode.id, depth: 0 }]
        let corrections = 0
        const visited = new Set([rootNode.id])

        while (queue.length > 0) {
          const { id, depth } = queue.shift()
          const node = nodeIds.get(id)

          if (node) {
            // Force level to match depth
            if (node.level !== depth) {
              node.level = depth
              corrections++
            }

            // Check children
            if (node.children && node.children.length > 0) {
              node.children.forEach(childId => {
                if (!visited.has(childId)) {
                  visited.add(childId)
                  queue.push({ id: childId, depth: depth + 1 })
                }
              })
            }
          }
        }

        if (corrections > 0) {
          console.warn(`🛡️ Roadmap Auto-Healed: Corrected levels for ${corrections} nodes.`)
        }

        // Attach orphans to root to prevent floating nodes
        parsedData.nodes.forEach(node => {
          if (!visited.has(node.id)) {
            console.warn(`🛡️ Orphaned node rescued: ${node.label}`)
            node.level = 1
            if (!rootNode.children.includes(node.id)) {
              rootNode.children.push(node.id)
            }
          }
        })
      }

      setData(parsedData)

      const newId = Date.now().toString()
      if (setActiveHistoryId) setActiveHistoryId(newId)

      // Save to history
      const historyItem = {
        id: newId,
        timestamp: Date.now(),
        data: parsedData,
        completedNodes: []
      }
      const existingHistory = JSON.parse(localStorage.getItem('roadmap_history') || '[]')
      existingHistory.unshift(historyItem)
      // Keep only last 20 items
      const trimmedHistory = existingHistory.slice(0, 20)
      localStorage.setItem('roadmap_history', JSON.stringify(trimmedHistory))
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred during generation')
    } finally {
      setLoading(false)
    }
  }

  const createLinks = (nodes) => {
    const links = []
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((childId) => {
          links.push({
            source: node.id,
            target: childId,
          })
        })
      }
    })
    return links
  }

  const handleZoomIn = () => {
    if (zoomRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current)
      const newZoom = Math.min(zoom * 1.2, 3)
      zoomRef.current.scaleTo(svg.transition().duration(300), newZoom)
    }
  }

  const handleZoomOut = () => {
    if (zoomRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current)
      const newZoom = Math.max(zoom / 1.2, 0.3)
      zoomRef.current.scaleTo(svg.transition().duration(300), newZoom)
    }
  }

  const handleResetZoom = () => {
    if (zoomRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current)
      const transform = d3.zoomIdentity
      svg.transition().duration(500).call(zoomRef.current.transform, transform)
    }
  }

  const toggleNodeCompletion = (nodeId) => {
    setCompletedNodes((prev) => {
      const newSet = new Set(prev)
      const isCompleting = !newSet.has(nodeId)

      // Recursive function to find all descendant IDs
      const updateDescendants = (id) => {
        const node = data.nodes.find((n) => n.id === id)
        if (node && node.children) {
          node.children.forEach((childId) => {
            if (isCompleting) {
              newSet.add(childId)
            } else {
              newSet.delete(childId)
            }
            updateDescendants(childId)
          })
        }
      }

      if (isCompleting) {
        newSet.add(nodeId)
      } else {
        newSet.delete(nodeId)
      }

      updateDescendants(nodeId)
      return newSet
    })
  }

  const getCompletionStats = () => {
    if (!data) return { completed: 0, total: 0, percentage: 0 }
    const total = data.nodes.length
    const completed = completedNodes.size
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  }

  const exportAsPNG = async () => {
    if (!svgRef.current) return

    try {
      // Hide controls temporarily
      const controls = document.querySelectorAll('.export-hide')
      controls.forEach(el => el.style.display = 'none')

      // Get the SVG element and its container
      const svgElement = svgRef.current
      const container = svgElement.parentElement

      // Capture the canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
      })

      // Restore controls
      controls.forEach(el => el.style.display = '')

      // Download
      const link = document.createElement('a')
      link.download = `${data?.title || 'roadmap'}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PNG. Please try again.')
    }
  }

  const exportAsPDF = async () => {
    if (!svgRef.current) return

    try {
      // Hide controls temporarily
      const controls = document.querySelectorAll('.export-hide')
      controls.forEach(el => el.style.display = 'none')

      // Get the SVG element and its container
      const svgElement = svgRef.current
      const container = svgElement.parentElement

      // Capture the canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
      })

      // Restore controls
      controls.forEach(el => el.style.display = '')

      // Create PDF
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
      })

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${data?.title || 'roadmap'}.pdf`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  useEffect(() => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const defs = svg.append('defs')

    // Improved Glow Filter
    const glowFilter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%')

    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4.5')
      .attr('result', 'coloredBlur')

    const feMerge = glowFilter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Soft Inner Shadow Filter for 3D effect
    const innerShadow = defs.append('filter').attr('id', 'inner-shadow')
    innerShadow.append('feOffset').attr('dx', 0).attr('dy', 2)
    innerShadow.append('feGaussianBlur').attr('stdDeviation', 2).attr('result', 'offset-blur')
    innerShadow.append('feComposite').attr('operator', 'out').attr('in', 'SourceGraphic').attr('in2', 'offset-blur').attr('result', 'inverse')
    innerShadow.append('feFlood').attr('flood-color', 'black').attr('flood-opacity', 0.5).attr('result', 'color')
    innerShadow.append('feComposite').attr('operator', 'in').attr('in', 'color').attr('in2', 'inverse').attr('result', 'shadow')
    innerShadow.append('feComposite').attr('operator', 'over').attr('in', 'shadow').attr('in2', 'SourceGraphic')

    const container = svg.append('g').attr('class', 'zoom-container')

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoom(event.transform.k)
      })

    svg.call(zoomBehavior)
    zoomRef.current = zoomBehavior

    // Intelligent initial placement to prevent tangling
    const nodes = data.nodes.map((d) => {
      const savedPos = nodesRef.current?.find(n => n.id === d.id)
      if (savedPos?.x !== undefined) {
        return { ...d, x: savedPos.x, y: savedPos.y }
      }

      // Spread nodes vertically by level and horizontally by their position in that level
      const levelNodes = data.nodes.filter(n => n.level === d.level)
      const indexInLevel = levelNodes.findIndex(n => n.id === d.id)

      return {
        ...d,
        x: width / 2 + (indexInLevel - (levelNodes.length - 1) / 2) * 200 + (Math.random() - 0.5) * 50,
        y: height / 2 + (d.level * 200) - 300 // Offset upward so it grows down
      }
    })
    nodesRef.current = nodes

    const links = createLinks(nodes)

    // Helper for generating link IDs for gradients
    const linkId = (d) => `link-grad-${d.source.id || d.source}-${d.target.id || d.target}`

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(180)
          .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(90))

    simulationRef.current = simulation

    const linkGroup = container.append('g').attr('class', 'links')
    const nodeGroup = container.append('g').attr('class', 'nodes')

    const getNodeBaseColor = (level) => {
      const colors = {
        0: '#6366f1', // Indigo
        1: '#3b82f6', // Blue
        2: '#ec4899', // Pink
        3: '#10b981', // Green
        4: '#f97316', // Orange
      }
      return colors[level] || colors[4]
    }

    // Generate Link Gradients
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source || n.id === link.source.id)
      const targetNode = nodes.find(n => n.id === link.target || n.id === link.target.id)

      if (sourceNode && targetNode) {
        const grad = defs.append('linearGradient')
          .attr('id', linkId(link))
          .attr('gradientUnits', 'userSpaceOnUse')

        grad.append('stop').attr('offset', '0%').attr('stop-color', getNodeBaseColor(sourceNode.level))
        grad.append('stop').attr('offset', '100%').attr('stop-color', getNodeBaseColor(targetNode.level))
      }
    })

    const linkElements = linkGroup
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => `url(#${linkId(d)})`)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '8,8')
      .attr('class', 'animated-link')
      .style('filter', 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))')

    // Add styles for the link animation
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
      @keyframes flow {
        from { stroke-dashoffset: 64; }
        to { stroke-dashoffset: 0; }
      }
      .animated-link {
        animation: flow 3s linear infinite;
      }
      .node-group:hover circle {
        stroke-width: 5;
        filter: brightness(1.2) url(#glow);
        transform: scale(1.1);
      }
    `
    document.head.appendChild(styleSheet)

    const getNodeColor = (level) => {
      const colors = {
        0: 'url(#gradient-purple)',
        1: 'url(#gradient-blue)',
        2: 'url(#gradient-pink)',
        3: 'url(#gradient-green)',
        4: 'url(#gradient-orange)',
      }
      return colors[level] || colors[4]
    }

      ;['purple', 'blue', 'pink', 'green', 'orange'].forEach((color) => {
        const gradient = defs
          .append('linearGradient')
          .attr('id', `gradient-${color}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%')

        const colors = {
          purple: ['#a78bfa', '#6366f1'],
          blue: ['#60a5fa', '#3b82f6'],
          pink: ['#f472b6', '#ec4899'],
          green: ['#34d399', '#10b981'],
          orange: ['#fb923c', '#f97316'],
        }

        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', colors[color][0])

        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', colors[color][1])
      })

    const nodeElements = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelectedNode(d)
      })

    nodeElements
      .append('circle')
      .attr('r', (d) => (d.level === 0 ? 52 : d.level === 1 ? 44 : d.level === 2 ? 38 : d.level === 3 ? 32 : 28))
      .attr('fill', (d) =>
        completedNodes.has(d.id) ? '#10b981' : getNodeColor(d.level)
      )
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow)')
      .attr('opacity', (d) => (completedNodes.has(d.id) ? 0.9 : 1))
      .style('transition', 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)')

    // Add 3D Reflection Highlight
    nodeElements
      .append('circle')
      .attr('r', (d) => (d.level === 0 ? 30 : d.level === 1 ? 25 : d.level === 2 ? 20 : d.level === 3 ? 15 : 12))
      .attr('cx', (d) => (d.level === 0 ? -12 : -10))
      .attr('cy', (d) => (d.level === 0 ? -12 : -10))
      .attr('fill', 'rgba(255,255,255,0.2)')
      .attr('filter', 'blur(8px)')
      .attr('pointer-events', 'none')

    nodeElements.each(function (d) {
      if (completedNodes.has(d.id)) {
        const g = d3.select(this)
        g.append('circle')
          .attr('r', 14)
          .attr('fill', '#fff')
          .attr('cx', 24)
          .attr('cy', -24)
          .attr('filter', 'url(#glow)')

        g.append('text')
          .attr('x', 24)
          .attr('y', -24)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#10b981')
          .attr('font-size', '16px')
          .attr('font-weight', '900')
          .attr('pointer-events', 'none')
          .text('✓')
      }
    })

    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', (d) => (d.level === 0 ? '15px' : '12px'))
      .attr('font-weight', '800')
      .attr('pointer-events', 'none')
      .attr('font-family', "'Outfit', sans-serif")
      .each(function (d) {
        const words = d.label.split(' ')
        const text = d3.select(this)

        if (words.length === 1) {
          text.text(d.label)
        } else {
          text.text('')
          const midpoint = Math.ceil(words.length / 2)

          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.5em')
            .text(words.slice(0, midpoint).join(' '))

          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em')
            .text(words.slice(midpoint).join(' '))
        }
      })

    // Обновляем ref при каждом тике симуляции
    const updateNodesRef = () => {
      nodesRef.current = nodes.map(n => ({ ...n }))
    }


    simulation.on('tick', () => {
      linkElements
        .attr('d', (d) => {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5 // Multiplier for curve
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
        })
        .attr('x', (d) => {
          // Update gradients positions on every tick
          const grad = d3.select(`#${linkId(d)}`)
          grad.attr('x1', d.source.x).attr('y1', d.source.y)
            .attr('x2', d.target.x).attr('y2', d.target.y)
          return null
        })

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })


    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
      // Обновляем ref без ре-рендера
      updateNodesRef()
    }

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
      // Сохраняем финальные позиции напрямую в savedData (мутация, не setState)
      // Это сохранит позиции при переходе между страницами
      if (nodesRef.current && savedData && savedData.nodes) {
        nodesRef.current.forEach(node => {
          const savedNode = savedData.nodes.find(n => n.id === node.id)
          if (savedNode) {
            savedNode.x = node.x
            savedNode.y = node.y
          }
        })
      }
    }
  }, [data, completedNodes])

  // Background particles - reduced count on mobile
  const particleCount = window.innerWidth < 768 ? 20 : 50;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * (window.innerWidth < 768 ? 2 : 3) + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 w-screen h-screen bg-main text-white overflow-hidden flex pt-16">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(-10px);
          }
          50% {
            transform: translateY(-10px) translateX(10px);
          }
          75% {
            transform: translateY(-25px) translateX(8px);
          }
        }
      `}</style>

      {/* Header - Fully Adaptive & Premium */}
      <div className={`absolute top-20 left-4 right-4 md:left-6 z-20 p-4 md:p-6 bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out ${sidebarOpen ? 'md:right-[500px]' : 'md:right-6'}`}>
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-lg md:text-xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-3 font-outfit text-center w-full">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 text-sm"></i>
              </span>
              <span className="truncate max-w-[80%]">{data?.title || 'AI Roadmap Architect'}</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
            <div className="relative flex-1 group min-w-[200px]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && generateRoadmap()}
                placeholder="What is your next big goal? (e.g. Master Python, Product Design...)"
                className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-medium"
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/0 group-focus-within:border-indigo-500/30 pointer-events-none transition-all"></div>
            </div>

            <button
              onClick={generateRoadmap}
              disabled={loading}
              className={`relative overflow-hidden group w-full lg:w-auto lg:min-w-[240px] px-8 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 flex items-center justify-center gap-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ${loading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white hover:shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:-translate-y-1'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
                  <span className="animate-pulse">Architecting...</span>
                </>
              ) : (
                <>
                  {/* Luxury Shine Effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                  {/* Internal Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)] transition-opacity duration-700"></div>

                  <span className="relative z-10">Create Roadmap</span>
                  <div className="relative z-10 w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <i className="fa-solid fa-bolt-lightning text-[10px] text-indigo-200 group-hover:text-white transition-transform group-hover:scale-110"></i>
                  </div>

                  {/* Animated Border bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-2 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-xl flex items-center gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm"></i>
              </div>
              <p className="text-red-300 text-sm font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      {data && (
        <div className={`export-hide absolute bottom-10 md:top-56 right-6 z-20 flex flex-col gap-2 transition-all duration-300 ${sidebarOpen ? 'md:right-[504px]' : 'md:right-6'} ${window.innerWidth < 768 && sidebarOpen ? 'hidden' : 'flex'}`}>
          {/* Futuristic Circular Progress */}
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-5 bg-slate-900/90 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    stroke="url(#progress-gradient-float)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - getCompletionStats().percentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progress-gradient-float" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none tracking-tighter">
                    {getCompletionStats().percentage}<span className="text-[10px] text-indigo-400 ml-0.5">%</span>
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Current Progress</p>
                <p className="text-[11px] font-bold text-white tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                  {getCompletionStats().completed} / {getCompletionStats().total} <span className="text-slate-500 text-[10px] ml-1">Steps</span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleZoomIn}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600/50 backdrop-blur transition-colors shadow-lg"
            title="Zoom In"
          >
            <i className="fa-solid fa-magnifying-glass-plus text-white"></i>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600/50 backdrop-blur transition-colors shadow-lg"
            title="Zoom Out"
          >
            <i className="fa-solid fa-magnifying-glass-minus text-white"></i>
          </button>
          <button
            onClick={handleResetZoom}
            className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600/50 backdrop-blur transition-colors shadow-lg"
            title="Reset Zoom"
          >
            <i className="fa-solid fa-expand text-white"></i>
          </button>


          {/* Export buttons */}
          <div className="mt-4 pt-4 border-t border-slate-600/50">
            <p className="text-xs text-slate-400 text-center mb-2 font-semibold">Export</p>
            <button
              onClick={exportAsPNG}
              className="w-full p-3 bg-emerald-600/80 hover:bg-emerald-500/80 rounded-lg border border-emerald-500/50 backdrop-blur transition-colors shadow-lg mb-2 group"
              title="Download as PNG"
            >
              <i className="fa-solid fa-image text-white group-hover:scale-110 transition-transform"></i>
            </button>
            <button
              onClick={exportAsPDF}
              className="w-full p-3 bg-rose-600/80 hover:bg-rose-500/80 rounded-lg border border-rose-500/50 backdrop-blur transition-colors shadow-lg group"
              title="Download as PDF"
            >
              <i className="fa-solid fa-file-pdf text-white group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        </div>
      )}

      {/* Main canvas area */}
      <div className="flex-1 relative z-0 mt-48 md:mt-36">
        <svg ref={svgRef} className="w-full h-full" />
        {!data && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 max-w-md shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-route text-white text-2xl"></i>
              </div>
              <h2 className="text-xl font-semibold mb-3 text-white">
                Welcome!
              </h2>
              <p className="text-slate-300 mb-4">
                Enter your goal or learning topic, and the AI will create a personalized roadmap with a step-by-step action plan for you.
              </p>
              <p className="text-sm text-slate-400">
                Example: "become a data scientist" or "learn to play guitar"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Section */}
      <div className="relative flex transition-all duration-300">
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 right-full z-40 bg-slate-800/90 hover:bg-slate-700/90 p-4 rounded-l-2xl border border-r-0 border-slate-600/50 backdrop-blur transition-all shadow-2xl group hidden md:flex ${sidebarOpen ? 'opacity-100' : 'opacity-100 hover:pr-6'}`}
          title={sidebarOpen ? 'Hide Details' : 'Show Details'}
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-right' : 'fa-chevron-left'} text-white group-hover:scale-110 transition-transform`}></i>
        </button>

        {/* Luxury Obsidian FAB - Mobile Exclusive */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-12 right-6 z-50 w-20 h-20 rounded-full flex items-center justify-center text-white animate-bounce-in group/fab active:scale-90 transition-transform duration-500"
          >
            {/* Multi-layered Pulsing Aura */}
            <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -inset-2 bg-purple-500/10 rounded-full blur-xl animate-pulse-slow"></div>

            {/* Obsidian Mirror Base */}
            <div className="absolute inset-0 bg-slate-950 rounded-full border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(99,102,241,0.3)] overflow-hidden">
              {/* Liquid Shine Sweep */}
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '3s' }}></div>

              {/* Internal Diamond Spark */}
              <div className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full blur-[1px] opacity-80 animate-pulse"></div>
            </div>

            {/* Primary Orbiting Photon (Indigo) */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-200 rounded-full shadow-[0_0_15px_#6366f1,0_0_30px_#6366f1]"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-linear-to-b from-indigo-500 to-transparent blur-xs opacity-40"></div>
            </div>

            {/* Secondary Orbiting Photon (Purple/Magenta) - Reverse & Tilted */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full shadow-[0_0_12px_#a855f7,0_0_25px_#a855f7]"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-6 bg-linear-to-t from-purple-500 to-transparent blur-xs opacity-30"></div>
            </div>

            {/* Inner Jewel Core - Refined */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-linear-to-br from-indigo-500 via-purple-600 to-indigo-950 flex flex-col items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_70%)] rounded-full"></div>
              <i className="fa-solid fa-brain text-white text-xl drop-shadow-lg"></i>
              <span className="text-[6px] font-black uppercase tracking-[0.3em] mt-1 text-white drop-shadow-md">Plan</span>
            </div>
          </button>
        )}

        {/* Premium Mobile Close Button - Refined Iconography */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed top-28 right-8 z-50 w-12 h-12 rounded-xl bg-slate-900/60 border border-white/20 flex items-center justify-center text-white shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 active:scale-90 transition-transform"
          >
            <i className="fa-solid fa-chevron-down text-lg animate-bounce-slow"></i>
          </button>
        )}

        {/* Sidebar content - Specialized Mobile UI vs Desktop UI */}
        <div className={`${sidebarOpen
          ? 'fixed inset-x-4 bottom-4 top-24 md:top-0 md:inset-x-auto md:relative md:inset-y-0 md:right-0 md:w-[480px] rounded-[40px] md:rounded-none'
          : 'w-0'} transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) bg-slate-900/98 md:bg-slate-900/40 backdrop-blur-3xl z-40 overflow-hidden border border-white/10 md:border-none shadow-[0_50px_100px_rgba(0,0,0,0.8)] md:shadow-none`}>

          {/* Mobile Drag Handle Decor */}
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full"></div>

          {/* Internal Cosmic Glow for Mobile */}
          <div className="md:hidden absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none"></div>

          <div className={`h-full overflow-y-auto pt-12 md:pt-40 px-6 md:px-10 pb-10 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Physical spacer to force content down */}
            <div className="h-16 w-full mb-8 border-b border-white/5 shadow-xs flex items-end justify-between pb-4 md:hidden">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Detail Explorer</span>
              <i className="fa-solid fa-microchip text-indigo-500/30 text-xs"></i>
            </div>
            <div className="hidden md:block h-20 w-full mb-8 border-b border-white/5 shadow-xs" />

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 0 10px rgba(167, 139, 250, 0.5)',
                        background:
                          selectedNode.level === 0
                            ? 'linear-gradient(135deg, #a78bfa, #6366f1)'
                            : selectedNode.level === 1
                              ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                              : selectedNode.level === 2
                                ? 'linear-gradient(135deg, #f472b6, #ec4899)'
                                : selectedNode.level === 3
                                  ? 'linear-gradient(135deg, #34d399, #10b981)'
                                  : 'linear-gradient(135deg, #fb923c, #f97316)',
                      }}
                    />
                    <span className="text-sm font-bold text-purple-300 uppercase tracking-[0.2em]">
                      {selectedNode.category || 'Step'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-extrabold bg-linear-to-r from-purple-200 via-blue-200 to-pink-200 bg-clip-text text-transparent leading-tight" style={{ letterSpacing: '-0.02em' }}>
                    {selectedNode.label}
                  </h2>
                </div>

                {/* Description Area - Premium Layout */}
                <div className="relative group rounded-3xl my-8">
                  {/* Glowing border effect */}
                  <div className="absolute -inset-px bg-linear-to-r from-indigo-500/40 via-purple-500/40 to-indigo-500/40 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-700"></div>

                  <div className="relative p-10 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden group-hover:bg-slate-900/80 transition-colors duration-500">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">

                      <div
                        className="text-lg leading-loose text-slate-200 font-light tracking-wide space-y-6"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                      >
                        {(selectedNode.description || 'No description available')
                          .split(/[.\n]/)
                          .filter(p => p.trim().length > 0)
                          .map((paragraph, i) => (
                            <p key={i}>
                              {paragraph.trim()}.
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleNodeCompletion(selectedNode.id)}
                  style={{
                    width: '100%',
                    padding: '24px',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease',
                    background: completedNodes.has(selectedNode.id)
                      ? '#10b981'
                      : 'linear-gradient(to right, #7c3aed, #2563eb)'
                  }}
                >
                  {completedNodes.has(selectedNode.id) ? (
                    <>
                      <i className="fa-solid fa-check-circle" style={{ fontSize: '1.4rem' }}></i>
                      <span>Task Completed</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-circle" style={{ fontSize: '1.4rem' }}></i>
                      <span>Mark as Completed</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-6 mt-2">
                  <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-default">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 group-hover:text-purple-300 transition-colors">Complexity Level</p>
                    <p className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-left">
                      {selectedNode.level}
                    </p>
                  </div>

                  {selectedNode.timeEstimate && (
                    <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 group cursor-default">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 group-hover:text-blue-300 transition-colors">Time Estimate</p>
                      <p className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-left">
                        {selectedNode.timeEstimate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Resources */}
                {selectedNode.resources && selectedNode.resources.length > 0 && (
                  <div style={{ padding: '30px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#818cf8', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-graduation-cap"></i>
                      Learning Materials
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {selectedNode.resources.map((resource, idx) => {
                        const getResourceIcon = (type) => {
                          const icons = {
                            youtube: 'fa-brands fa-youtube',
                            documentation: 'fa-solid fa-book',
                            course: 'fa-solid fa-chalkboard-user',
                            article: 'fa-solid fa-newspaper',
                            book: 'fa-solid fa-book-open',
                          }
                          return icons[type] || 'fa-solid fa-link'
                        }

                        return (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-5 p-5 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:shadow-[0_5px_20px_rgba(99,102,241,0.15)] transition-all group"
                          >
                            <i className={getResourceIcon(resource.type)} style={{ fontSize: '1.6rem', color: '#6366f1' }}></i>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{resource.title}</p>
                              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>{resource.type}</p>
                            </div>
                            <i className="fa-solid fa-external-link" style={{ fontSize: '0.9rem', color: '#475569' }}></i>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-steps */}
                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div style={{ padding: '30px', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#a78bfa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-arrow-right"></i>
                      Next Milestones
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {selectedNode.children.map((childId, idx) => {
                        const childNode = data.nodes.find((n) => n.id === childId)
                        if (!childNode) return null
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedNode(childNode)}
                            className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 hover:border-indigo-400 rounded-xl text-indigo-300 text-xs font-black tracking-widest uppercase transition-all shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] active:scale-95"
                          >
                            {childNode.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#6366f1', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Roadmap Legend
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[
                      { level: 0, name: 'Main Goal', color: 'linear-gradient(135deg, #a78bfa, #6366f1)' },
                      { level: 1, name: 'Major Phases', color: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
                      { level: 2, name: 'Key Milestones', color: 'linear-gradient(135deg, #f472b6, #ec4899)' },
                      { level: 3, name: 'Specific Tasks', color: 'linear-gradient(135deg, #34d399, #10b981)' },
                      { level: 4, name: 'Micro-Steps', color: 'linear-gradient(135deg, #fb923c, #f97316)' },
                    ].map((item) => (
                      <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: item.color,
                            border: '2px solid rgba(255,255,255,0.3)'
                          }}
                        />
                        <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: '500' }}>
                          Level {item.level}: <span style={{ color: 'white' }}>{item.name}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 30px', borderRadius: '50%', border: '2px dashed rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-hand-pointer" style={{ fontSize: '2.5rem', color: '#a78bfa' }}></i>
                  </div>
                  <p style={{ fontSize: '1.4rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>Select a Step</p>
                  <p style={{ color: '#94a3b8' }}>Click on a node to view the action plan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
