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
      const apiUrl = import.meta.env.PROD
        ? '/api/roadmap'
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
        throw new Error('Server error. Make sure the backend is running on port 5001')
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

      setData(parsedData)
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
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
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

    // Используем сохраненные позиции из ref если они есть
    const nodes = data.nodes.map((d) => {
      const savedPos = nodesRef.current?.find(n => n.id === d.id)
      return {
        ...d,
        x: savedPos?.x !== undefined ? savedPos.x : (d.x !== undefined ? d.x : width / 2 + (Math.random() - 0.5) * 200),
        y: savedPos?.y !== undefined ? savedPos.y : (d.y !== undefined ? d.y : height / 2 + (Math.random() - 0.5) * 200),
      }
    })
    // Сохраняем ссылку на узлы
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
          .distance(200)
          .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(100))

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

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 w-screen h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden flex pt-16">
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

      {/* Header */}
      <div className={`absolute top-20 left-4 z-20 p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-300 ${sidebarOpen ? 'right-[420px]' : 'right-4'}`}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-3 text-white tracking-tight flex items-center gap-3">
            <i className="fa-solid fa-route text-indigo-400"></i>
            {data?.title || 'AI Roadmap Generator'}
          </h1>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && generateRoadmap()}
              placeholder="Enter your goal (e.g., become a frontend developer, learn machine learning)..."
              className="flex-1 px-5 py-3 bg-slate-800/70 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              disabled={loading}
            />

            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  Create Roadmap
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-red-400"></i>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      {data && (
        <div className={`export-hide absolute top-56 z-20 flex flex-col gap-2 transition-all duration-300 ${sidebarOpen ? 'right-[408px]' : 'right-6'}`}>
          {/* Progress indicator */}
          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-600/50 backdrop-blur shadow-lg mb-2">
            <div className="text-center mb-2">
              <div className="text-2xl font-bold text-white">
                {getCompletionStats().percentage}%
              </div>
              <div className="text-xs text-slate-400">Progress</div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${getCompletionStats().percentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 text-center mt-2">
              {getCompletionStats().completed} / {getCompletionStats().total}
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
          <div className="mt-2 p-2 bg-slate-800/80 rounded-lg border border-slate-600/50 backdrop-blur text-center shadow-lg">
            <span className="text-xs text-slate-300 font-semibold">
              {Math.round(zoom * 100)}%
            </span>
          </div>

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
      <div className="flex-1 relative z-0 mt-36">
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
          className={`absolute top-1/2 -translate-y-1/2 right-full z-40 bg-slate-800/90 hover:bg-slate-700/90 p-4 rounded-l-2xl border border-r-0 border-slate-600/50 backdrop-blur transition-all shadow-2xl group flex items-center justify-center ${sidebarOpen ? 'opacity-100' : 'opacity-100 hover:pr-6'}`}
          title={sidebarOpen ? 'Hide Details' : 'Show Details'}
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-right' : 'fa-chevron-left'} text-white group-hover:scale-110 transition-transform`}></i>
        </button>

        {/* Sidebar content */}
        <div className={`${sidebarOpen ? 'w-96 border-l' : 'w-0 border-l-0'} transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-slate-700/50 z-30 overflow-hidden relative`}>
          <div className={`h-full overflow-y-auto pt-40 px-6 pb-6 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Physical spacer to force content down */}
            <div className="h-20 w-full mb-8 border-b border-white/5 shadow-xs" />

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{
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
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      {selectedNode.category || 'Step'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold bg-linear-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent leading-tight">
                    {selectedNode.label}
                  </h2>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-purple-500/30 backdrop-blur">
                  <p className="text-gray-200 leading-relaxed">
                    {selectedNode.description || 'No description available'}
                  </p>
                </div>

                <button
                  onClick={() => toggleNodeCompletion(selectedNode.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${completedNodes.has(selectedNode.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                    }`}
                >
                  {completedNodes.has(selectedNode.id) ? (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Completed
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-circle"></i>
                      Mark as Complete
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30 backdrop-blur">
                    <p className="text-xs text-purple-300 mb-1">Level</p>
                    <p className="text-lg font-bold text-white">
                      {selectedNode.level}
                    </p>
                  </div>

                  {selectedNode.timeEstimate && (
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 backdrop-blur">
                      <p className="text-xs text-blue-300 mb-1">Time</p>
                      <p className="text-lg font-bold text-white">
                        {selectedNode.timeEstimate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Learning Resources Section */}
                {selectedNode.resources && selectedNode.resources.length > 0 && (
                  <div className="p-4 bg-linear-to-br from-indigo-500/20 to-cyan-500/20 rounded-lg border border-indigo-400/40 backdrop-blur">
                    <p className="text-sm font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-graduation-cap"></i>
                      Learning Resources:
                    </p>
                    <div className="space-y-2">
                      {selectedNode.resources.map((resource, idx) => {
                        const getResourceIcon = (type) => {
                          const icons = {
                            youtube: 'fa-brands fa-youtube text-red-400',
                            documentation: 'fa-solid fa-book text-blue-400',
                            course: 'fa-solid fa-chalkboard-user text-green-400',
                            article: 'fa-solid fa-newspaper text-yellow-400',
                            book: 'fa-solid fa-book-open text-purple-400',
                          }
                          return icons[type] || 'fa-solid fa-link text-gray-400'
                        }

                        return (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/10 hover:border-indigo-400/50"
                          >
                            <i className={`${getResourceIcon(resource.type)} text-xl`}></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                                {resource.title}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {resource.type}
                              </p>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-400 group-hover:text-indigo-400 transition-colors text-xs"></i>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="p-4 bg-linear-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/40 backdrop-blur">
                    <p className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-arrow-right"></i>
                      Next Steps:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.children
                        .map((childId, idx) => {
                          const childNode = data.nodes.find((n) => n.id === childId)
                          if (!childNode) return null
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedNode(childNode)}
                              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-all border border-white/40 backdrop-blur shadow-lg hover:shadow-purple-500/50"
                            >
                              {childNode.label}
                            </button>
                          )
                        })
                        .filter(Boolean)}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-purple-500/30">
                  <p className="text-xs font-semibold text-purple-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-layer-group"></i>
                    Levels
                  </p>
                  <div className="space-y-2">
                    {[
                      { level: 0, name: 'Main Goal', color: 'from-purple-400 to-indigo-500' },
                      { level: 1, name: 'Major Phases', color: 'from-blue-400 to-blue-600' },
                      { level: 2, name: 'Key Milestones', color: 'from-pink-400 to-pink-600' },
                      { level: 3, name: 'Specific Tasks', color: 'from-emerald-400 to-emerald-600' },
                      { level: 4, name: 'Micro-Steps', color: 'from-orange-400 to-orange-600' },
                    ].map((item) => (
                      <div key={item.level} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-linear-to-br ${item.color} border border-white/50 shadow-lg`}
                        />
                        <span className="text-sm text-gray-300">
                          Level {item.level}: {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-purple-400/50 bg-linear-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shadow-xl">
                    <i className="fa-solid fa-hand-pointer text-purple-400 text-2xl"></i>
                  </div>
                  <p className="text-purple-200">
                    Click on a node to view details
                  </p>
                  <p className="text-sm text-purple-400/70 mt-2">
                    You can drag nodes with your mouse
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
