import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Generator from './pages/Generator'
import About from './pages/About'
import Contact from './pages/Contact'
import History from './pages/History'
import Profile from './pages/Profile'
import ProgressWidget from './components/ProgressWidget'

function App() {
    const [currentPage, setCurrentPage] = useState('home')

    // Persisted state for Generator
    const [savedData, setSavedData] = useState(null)
    const [savedInput, setSavedInput] = useState('')
    const [savedCompletedNodes, setSavedCompletedNodes] = useState(new Set())
    const [savedSelectedNode, setSavedSelectedNode] = useState(null)
    const [activeHistoryId, setActiveHistoryId] = useState(null)

    // Background generation state
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [generationError, setGenerationError] = useState('')
    const [generationGoal, setGenerationGoal] = useState('')

    // Simulated progress for background generation
    useEffect(() => {
        let interval
        if (isGenerating) {
            setGenerationProgress(0)
            interval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev < 40) return prev + Math.random() * 1.2
                    if (prev < 75) return prev + Math.random() * 0.6
                    if (prev < 99) return prev + 0.05
                    return prev
                })
            }, 200)
        } else {
            setGenerationProgress(0)
        }
        return () => clearInterval(interval)
    }, [isGenerating])

    // Background generation function
    const generateRoadmap = useCallback(async (goal) => {
        if (!goal.trim() || isGenerating) return

        setIsGenerating(true)
        setGenerationProgress(0)
        setGenerationError('')
        setGenerationGoal(goal)
        setSavedSelectedNode(null)
        setSavedCompletedNodes(new Set())

        try {
            const apiBase = import.meta.env.VITE_API_URL || ''
            const apiUrl = import.meta.env.PROD
                ? `${apiBase}/roadmap`
                : 'http://localhost:5001/roadmap'

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || errorData.details || `Server error (${response.status})`)
            }

            const parsedData = await response.json()

            if (!parsedData.nodes || !Array.isArray(parsedData.nodes)) {
                throw new Error('Server returned invalid data format')
            }

            // Data normalization
            parsedData.nodes = parsedData.nodes.map(node => ({
                ...node,
                id: node.id || `node_${Math.random().toString(36).substr(2, 9)}`,
                label: node.label || 'Node',
                description: node.description || '',
                level: typeof node.level === 'number' ? node.level : 0,
                children: Array.isArray(node.children) ? node.children : [],
                resources: Array.isArray(node.resources) ? node.resources : [],
            }))

            const existingIds = new Set(parsedData.nodes.map(n => n.id))
            parsedData.nodes = parsedData.nodes.map(node => ({
                ...node,
                children: node.children.filter(childId => existingIds.has(childId)),
            }))

            // Auto-correct levels
            const nodeIds = new Map(parsedData.nodes.map(n => [n.id, n]))
            const rootNode = parsedData.nodes.find(n => n.level === 0) || parsedData.nodes[0]

            if (rootNode) {
                const queue = [{ id: rootNode.id, depth: 0 }]
                let corrections = 0
                const visited = new Set([rootNode.id])

                while (queue.length > 0) {
                    const { id, depth } = queue.shift()
                    const node = nodeIds.get(id)
                    if (node) {
                        if (node.level !== depth) {
                            node.level = depth
                            corrections++
                        }
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

                // Attach orphans
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

            setGenerationProgress(100)
            await new Promise(resolve => setTimeout(resolve, 300))

            setSavedData(parsedData)
            setSavedInput(goal)

            const newId = Date.now().toString()
            setActiveHistoryId(newId)

            // Save to history
            const historyItem = {
                id: newId,
                timestamp: Date.now(),
                data: parsedData,
                completedNodes: []
            }
            const existingHistory = JSON.parse(localStorage.getItem('roadmap_history') || '[]')
            existingHistory.unshift(historyItem)
            const trimmedHistory = existingHistory.slice(0, 20)
            localStorage.setItem('roadmap_history', JSON.stringify(trimmedHistory))

            // Auto-navigate to generator when done
            setCurrentPage('generator')
        } catch (err) {
            console.error('Error:', err)
            setGenerationError(err.message || 'An error occurred during generation')
        } finally {
            setIsGenerating(false)
        }
    }, [isGenerating])

    // Sync progress to history in real-time
    useEffect(() => {
        if (!activeHistoryId || !savedData) return

        const saved = localStorage.getItem('roadmap_history')
        if (saved) {
            try {
                const history = JSON.parse(saved)
                const index = history.findIndex(item => item.id === activeHistoryId)
                if (index !== -1) {
                    history[index].completedNodes = Array.from(savedCompletedNodes)
                    history[index].data = savedData
                    localStorage.setItem('roadmap_history', JSON.stringify(history))

                    // Also save current active session info for refresh persistence
                    localStorage.setItem('active_roadmap_id', activeHistoryId)
                }
            } catch (e) {
                console.error('Failed to sync history:', e)
            }
        }
    }, [savedCompletedNodes, savedData, activeHistoryId])

    // Initial Hydration from localStorage
    useEffect(() => {
        const lastActiveId = localStorage.getItem('active_roadmap_id')
        const savedHistory = localStorage.getItem('roadmap_history')

        if (lastActiveId && savedHistory) {
            try {
                const history = JSON.parse(savedHistory)
                const activeItem = history.find(item => item.id === lastActiveId)
                if (activeItem) {
                    setSavedData(activeItem.data)
                    setSavedInput(activeItem.data?.title || '')
                    setSavedCompletedNodes(new Set(activeItem.completedNodes || []))
                    setActiveHistoryId(activeItem.id)
                }
            } catch (e) {
                console.error('Hydration failed:', e)
            }
        }
    }, [])

    // Function to load a roadmap from history
    const handleLoadRoadmap = (item) => {
        setSavedData(item.data)
        setSavedInput(item.data?.title || '')
        setSavedCompletedNodes(new Set(item.completedNodes || []))
        setSavedSelectedNode(null)
        setActiveHistoryId(item.id)
        setCurrentPage('generator')
    }

    const renderPage = () => {
        // Dynamic SEO Update
        const titles = {
            home: 'Level Up Map — Transform Your Goals into Actionable Learning Paths',
            generator: 'AI Generator — Create Your Personalized Learning Roadmap',
            history: 'My Roadmaps — Progress History | Level Up Map',
            profile: 'My Profile — Level & Stats | Level Up Map',
            about: 'About Us — The Mission of Level Up Map',
            contact: 'Contact Us — Get in touch with Level Up Map Team'
        }
        const descriptions = {
            home: 'Use AI to generate personalized step-by-step career roadmaps and learning paths. Powered by Gemini AI.',
            generator: 'Enter your goal and our AI will create a comprehensive learning roadmap with resources and tasks.',
            about: 'Learn more about the team behind Level Up Map and how we use AI to democratize learning.',
            contact: 'Reach out for support, feedback, or collaboration opportunities.'
        }

        document.title = titles[currentPage] || 'Level Up Map'
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) metaDesc.setAttribute('content', descriptions[currentPage] || descriptions.home)

        switch (currentPage) {
            case 'home':
                return <Home onNavigate={setCurrentPage} />
            case 'generator':
                return (
                    <Generator
                        savedData={savedData}
                        setSavedData={setSavedData}
                        savedInput={savedInput}
                        setSavedInput={setSavedInput}
                        savedCompletedNodes={savedCompletedNodes}
                        setSavedCompletedNodes={setSavedCompletedNodes}
                        savedSelectedNode={savedSelectedNode}
                        setSavedSelectedNode={setSavedSelectedNode}
                        setActiveHistoryId={setActiveHistoryId}
                        generateRoadmap={generateRoadmap}
                        isGenerating={isGenerating}
                        generationProgress={generationProgress}
                        generationError={generationError}
                    />
                )
            case 'history':
                return <History onNavigate={setCurrentPage} onLoadRoadmap={handleLoadRoadmap} />
            case 'profile':
                return <Profile onNavigate={setCurrentPage} />
            case 'about':
                return <About onNavigate={setCurrentPage} />
            case 'contact':
                return <Contact onNavigate={setCurrentPage} />
            default:
                return <Home onNavigate={setCurrentPage} />
        }
    }

    return (
        <div className="min-h-screen bg-main text-white">
            <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main>
                {renderPage()}
            </main>

            {/* Permanent Widget */}
            <ProgressWidget
                data={savedData}
                completedNodes={savedCompletedNodes}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                generationGoal={generationGoal}
                generationError={generationError}
                onReturn={() => setCurrentPage('generator')}
                visible={currentPage !== 'generator'}
            />
        </div>
    )
}

export default App
