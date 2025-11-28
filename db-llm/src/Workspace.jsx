import { useState, useRef, useEffect } from 'react'
import { Box, Heading, Text } from '@primer/react-brand'
import QueryEditor from './QueryEditor'
import ResultsTable from './ResultsTable'
import './Workspace.css'

function Workspace({ database, connectionDetails, onDisconnect }) {
    const [queryResults, setQueryResults] = useState(() => {
        const saved = localStorage.getItem('queryResults')
        return saved ? JSON.parse(saved) : null
    })
    const [queryError, setQueryError] = useState(null)
    const [isExecuting, setIsExecuting] = useState(false)
    const [executionTime, setExecutionTime] = useState(() => {
        const saved = localStorage.getItem('executionTime')
        return saved ? JSON.parse(saved) : null
    })
    const [editorHeight, setEditorHeight] = useState(250) // Default height in pixels
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef(null)
    const resizerRef = useRef(null)

    const handleExecuteQuery = async (query) => {
        setIsExecuting(true)
        setQueryError(null)
        setQueryResults(null)
        setExecutionTime(null)

        try {
            const response = await fetch('http://localhost:8000/api/execute-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    host: connectionDetails.host,
                    port: connectionDetails.port,
                    database: connectionDetails.database,
                    user: connectionDetails.user,
                    password: connectionDetails.password,
                    db_type: database.id // 'mysql' or 'postgresql'
                }),
            })

            const data = await response.json()

            if (data.success) {
                setQueryResults({
                    columns: data.columns,
                    rows: data.rows,
                    rowCount: data.rowCount
                })
                setExecutionTime(data.executionTime)
            } else {
                setQueryError(data.error || 'Query execution failed')
            }
        } catch (error) {
            setQueryError(`Connection error: ${error.message}`)
        } finally {
            setIsExecuting(false)
        }
    }

    // Handle mouse events for resizing
    const handleMouseDown = (e) => {
        setIsResizing(true)
        e.preventDefault()
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newHeight = e.clientY - containerRect.top

            // Set minimum and maximum heights
            const minHeight = 150
            const maxHeight = containerRect.height - 200 // Leave space for results

            if (newHeight >= minHeight && newHeight <= maxHeight) {
                setEditorHeight(newHeight)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])

    // Persist results and execution time
    useEffect(() => {
        if (queryResults) {
            localStorage.setItem('queryResults', JSON.stringify(queryResults))
        } else {
            localStorage.removeItem('queryResults')
        }
    }, [queryResults])

    useEffect(() => {
        if (executionTime) {
            localStorage.setItem('executionTime', JSON.stringify(executionTime))
        } else {
            localStorage.removeItem('executionTime')
        }
    }, [executionTime])

    return (
        <Box className="workspace-container">
            <div className="workspace-header">
                <div className="header-left">
                    <div className="workspace-status">
                        <div className="status-indicator"></div>
                        <Text size="100" className="status-text">Connected</Text>
                    </div>
                    <Heading as="h1" size="4">SQL Workspace</Heading>
                    <Text size="200" className="workspace-subtitle">
                        {database?.name} • {connectionDetails?.database}
                    </Text>
                </div>
                <button className="disconnect-button" onClick={onDisconnect} aria-label="Disconnect">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <div className="workspace-content" ref={containerRef}>
                <div className="editor-section" style={{ height: `${editorHeight}px` }}>
                    <QueryEditor
                        onExecuteQuery={handleExecuteQuery}
                        isExecuting={isExecuting}
                        height={editorHeight}
                    />
                </div>

                <div
                    className={`resizer ${isResizing ? 'resizing' : ''}`}
                    onMouseDown={handleMouseDown}
                    ref={resizerRef}
                >
                    <div className="resizer-line"></div>
                    <div className="resizer-handle">
                        <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                            <rect x="8" y="2" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
                            <rect x="8" y="5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
                        </svg>
                    </div>
                </div>

                <div className="results-section">
                    <ResultsTable
                        results={queryResults}
                        error={queryError}
                        isLoading={isExecuting}
                        executionTime={executionTime}
                    />
                </div>
            </div>
        </Box>
    )
}

export default Workspace
