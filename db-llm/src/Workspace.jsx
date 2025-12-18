import { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Heading, Text } from '@primer/react-brand'
import { CodeIcon, BookIcon } from '@primer/octicons-react'
import QueryEditor from './QueryEditor'
import ResultsTable from './ResultsTable'
import NotebookView from './NotebookView'
import MagicReveal from './MagicReveal'
import './Workspace.css'

function Workspace({ database, connectionDetails, onDisconnect }) {
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'editor') // 'editor' or 'notebook'

    useEffect(() => {
        localStorage.setItem('viewMode', viewMode)
    }, [viewMode])

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
    const [schema, setSchema] = useState(null) // Database schema for autocomplete
    const [isLoadingSchema, setIsLoadingSchema] = useState(false)
    const [importedQuery, setImportedQuery] = useState(null) // For importing from notebook
    const containerRef = useRef(null)
    const resizerRef = useRef(null)

    // Handle import from notebook to editor
    const handleImportFromNotebook = (query) => {
        setImportedQuery(query)
        setViewMode('editor')
    }

    // Fetch database schema on mount
    useEffect(() => {
        const fetchSchema = async () => {
            setIsLoadingSchema(true)
            try {
                const response = await fetch('http://localhost:8000/api/schema', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        host: connectionDetails.host,
                        port: connectionDetails.port,
                        database: connectionDetails.database,
                        user: connectionDetails.user,
                        username: connectionDetails.username,
                        password: connectionDetails.password,
                        connectionString: connectionDetails.connectionString,
                    }),
                })

                const data = await response.json()
                setSchema(data)
                console.log('Schema loaded:', data)
            } catch (error) {
                console.error('Failed to fetch schema:', error)
            } finally {
                setIsLoadingSchema(false)
            }
        }

        fetchSchema()
    }, [connectionDetails])

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
                    username: connectionDetails.username,
                    password: connectionDetails.password,
                    connectionString: connectionDetails.connectionString,
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
            setQueryError(`Connection error: ${error.message} `)
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

    const handleDisconnect = useCallback(() => {
        onDisconnect();
    }, [onDisconnect]);

    return (
        <MagicReveal>
            <Box className="workspace-container">
                <div className="workspace-header">
                    <div className="header-left">
                        <div className="status-badge">
                            <div className="status-dot"></div>
                            <span>Connected</span>
                        </div>
                        <h1 className="workspace-title">SQL Warehouse</h1>
                        <div className="workspace-subtitle">
                            <span className="db-type">{database?.name || 'Database'}</span>
                            <span className="separator">•</span>
                            <span className="db-name">{connectionDetails?.database || 'No Database'}</span>
                        </div>
                    </div>

                    <div className="view-toggle-wrapper">
                        <div className="view-toggle-container">
                            <button
                                className={`view-toggle-button ${viewMode === 'editor' ? 'active' : ''}`}
                                onClick={() => setViewMode('editor')}
                            >
                                <CodeIcon size={16} />
                                <span>Editor</span>
                            </button>
                            <button
                                className={`view-toggle-button ${viewMode === 'notebook' ? 'active' : ''}`}
                                onClick={() => setViewMode('notebook')}
                            >
                                <BookIcon size={16} />
                                <span>Notebook</span>
                            </button>
                        </div>
                    </div>

                    <div className="header-right">
                        <button
                            className="disconnect-button"
                            onClick={handleDisconnect}
                            title="Disconnect"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="workspace-content" ref={containerRef}>
                    {viewMode === 'editor' ? (
                        <>
                            <div className="editor-section" style={{ height: `${editorHeight}px` }}>
                                <QueryEditor
                                    onExecuteQuery={handleExecuteQuery}
                                    isExecuting={isExecuting}
                                    height={editorHeight}
                                    schema={schema}
                                    isLoadingSchema={isLoadingSchema}
                                    importedQuery={importedQuery}
                                    onQueryImported={() => setImportedQuery(null)}
                                    queryResults={queryResults}
                                    queryError={queryError}
                                    executionTime={executionTime}
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
                        </>
                    ) : (
                        <NotebookView
                            onExecuteQuery={handleExecuteQuery}
                            schema={schema}
                            connectionDetails={connectionDetails}
                            database={database}
                            onImportToEditor={handleImportFromNotebook}
                        />
                    )}
                </div>
            </Box>
        </MagicReveal>
    )
}

export default Workspace
