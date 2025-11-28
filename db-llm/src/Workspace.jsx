import { useState } from 'react'
import { Box, Heading, Text } from '@primer/react-brand'
import QueryEditor from './QueryEditor'
import ResultsTable from './ResultsTable'
import './Workspace.css'

function Workspace({ database, connectionDetails, onDisconnect }) {
    const [queryResults, setQueryResults] = useState(null)
    const [queryError, setQueryError] = useState(null)
    const [isExecuting, setIsExecuting] = useState(false)
    const [executionTime, setExecutionTime] = useState(null)

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

            <div className="workspace-content">
                <QueryEditor
                    onExecuteQuery={handleExecuteQuery}
                    isExecuting={isExecuting}
                />

                <ResultsTable
                    results={queryResults}
                    error={queryError}
                    isLoading={isExecuting}
                    executionTime={executionTime}
                />
            </div>
        </Box>
    )
}

export default Workspace

