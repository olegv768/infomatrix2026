import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Generator from './pages/Generator'
import About from './pages/About'
import Contact from './pages/Contact'
import History from './pages/History'

function App() {
    const [currentPage, setCurrentPage] = useState('home')

    // Persisted state for Generator
    const [savedData, setSavedData] = useState(null)
    const [savedInput, setSavedInput] = useState('')
    const [savedCompletedNodes, setSavedCompletedNodes] = useState(new Set())
    const [savedSelectedNode, setSavedSelectedNode] = useState(null)
    const [activeHistoryId, setActiveHistoryId] = useState(null)

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
                }
            } catch (e) {
                console.error('Failed to sync history:', e)
            }
        }
    }, [savedCompletedNodes, savedData, activeHistoryId])

    // Function to load a roadmap from history
    const handleLoadRoadmap = (item) => {
        setSavedData(item.data)
        setSavedInput(item.data?.title || '')
        setSavedCompletedNodes(new Set(item.completedNodes || []))
        setSavedSelectedNode(null)
        setActiveHistoryId(item.id)
    }

    const renderPage = () => {
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
                    />
                )
            case 'history':
                return <History onNavigate={setCurrentPage} onLoadRoadmap={handleLoadRoadmap} />
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
        </div>
    )
}

export default App
