import { useState, useEffect } from 'react'
import { Box, Button } from '@primer/react-brand'
import { PlusIcon, PlayIcon } from '@primer/octicons-react'
import QueryCell from './QueryCell'
import './NotebookView.css'

function NotebookView({ onExecuteQuery, schema, connectionDetails, database }) {
    const [cells, setCells] = useState(() => {
        // Load cells from localStorage or create default cell
        const saved = localStorage.getItem('notebookCells')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                console.error('Failed to load notebook cells:', e)
            }
        }
        return [{
            id: Date.now(),
            query: '-- Write your SQL query here\nSELECT * FROM your_table LIMIT 10;',
            results: null,
            error: null,
            executionTime: null
        }]
    })

    // Save cells to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('notebookCells', JSON.stringify(cells))
    }, [cells])

    const handleAddCell = () => {
        const newCell = {
            id: Date.now(),
            query: '-- New query\n',
            results: null,
            error: null,
            executionTime: null
        }
        setCells([...cells, newCell])
    }

    const handleDeleteCell = (cellId) => {
        if (cells.length === 1) {
            // Don't allow deleting the last cell
            return
        }
        setCells(cells.filter(cell => cell.id !== cellId))
    }

    const handleQueryChange = (cellId, newQuery) => {
        setCells(cells.map(cell =>
            cell.id === cellId
                ? { ...cell, query: newQuery }
                : cell
        ))
    }

    const handleExecuteCell = async (cellId, query) => {
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
                    db_type: database?.id || connectionDetails.db_type || 'mysql'
                }),
            })

            const data = await response.json()

            if (data.success) {
                setCells(cells.map(cell =>
                    cell.id === cellId
                        ? {
                            ...cell,
                            results: {
                                columns: data.columns,
                                rows: data.rows,
                                rowCount: data.rowCount
                            },
                            executionTime: data.executionTime,
                            error: null
                        }
                        : cell
                ))
            } else {
                setCells(cells.map(cell =>
                    cell.id === cellId
                        ? {
                            ...cell,
                            results: null,
                            error: data.error || 'Query execution failed'
                        }
                        : cell
                ))
            }
        } catch (error) {
            setCells(cells.map(cell =>
                cell.id === cellId
                    ? {
                        ...cell,
                        results: null,
                        error: `Connection error: ${error.message}`
                    }
                    : cell
            ))
        }
    }

    const handleRunAll = async () => {
        for (const cell of cells) {
            if (cell.query.trim()) {
                await handleExecuteCell(cell.id, cell.query)
            }
        }
    }

    const handleClearAll = () => {
        setCells(cells.map(cell => ({
            ...cell,
            results: null,
            error: null,
            executionTime: null
        })))
    }

    return (
        <Box className="notebook-view">
            <div className="notebook-header">
                <div className="notebook-title">
                    <div className="notebook-icon">📓</div>
                    <div>
                        <h3>Notebook Mode</h3>
                        <p className="notebook-subtitle">Run multiple SQL queries in separate cells</p>
                    </div>
                </div>
                <div className="notebook-actions">
                    <button
                        className="notebook-action-button secondary"
                        onClick={handleClearAll}
                        title="Clear all results"
                    >
                        Clear All
                    </button>
                    <button
                        className="notebook-action-button primary"
                        onClick={handleRunAll}
                        title="Run all cells (Shift+Enter in each cell to run individually)"
                    >
                        <PlayIcon size={12} />
                        Run All
                    </button>
                    <button
                        className="notebook-action-button add"
                        onClick={handleAddCell}
                        title="Add new cell"
                    >
                        <PlusIcon size={14} />
                        Add Cell
                    </button>
                </div>
            </div>

            <div className="notebook-cells-container">
                {cells.map((cell, index) => (
                    <QueryCell
                        key={cell.id}
                        cell={cell}
                        onExecute={handleExecuteCell}
                        onDelete={handleDeleteCell}
                        onQueryChange={handleQueryChange}
                        schema={schema}
                        isFirst={cells.length === 1}
                        isLast={index === cells.length - 1}
                    />
                ))}
            </div>

            <div className="notebook-footer">
                <button className="add-cell-button" onClick={handleAddCell}>
                    <PlusIcon size={16} />
                    <span>Add Cell</span>
                </button>
                <div className="keyboard-hints">
                    <span className="hint">
                        <kbd>Shift</kbd> + <kbd>Enter</kbd> to run cell
                    </span>
                </div>
            </div>
        </Box>
    )
}

export default NotebookView
