import { useState, useEffect, useRef } from 'react'
import { Box } from '@primer/react-brand'
import { PlusIcon, PlayIcon, TrashIcon, GearIcon, PaintbrushIcon, ChevronDownIcon, ScreenFullIcon, ScreenNormalIcon, TypographyIcon } from '@primer/octicons-react'
import QueryCell from './QueryCell'
import MarkdownCell from './MarkdownCell'
import { RUN_OPTIONS, THEMES, FONT_FAMILIES } from './QueryEditor'
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
            id: crypto.randomUUID(),
            type: 'sql',
            query: '-- Write your SQL query here\nSELECT * FROM your_table LIMIT 10;',
            results: null,
            error: null,
            executionTime: null
        }]
    })

    // Settings State
    const [selectedLimit, setSelectedLimit] = useState(() => {
        const saved = parseInt(localStorage.getItem('notebookRunLimit'))
        return RUN_OPTIONS.find(o => o.value === saved) || RUN_OPTIONS[0]
    })
    const [selectedTheme, setSelectedTheme] = useState(() => {
        const saved = localStorage.getItem('notebookTheme')
        return THEMES.find(t => t.value === saved) || THEMES[0]
    })
    const [fontSize, setFontSize] = useState(() => {
        return parseInt(localStorage.getItem('notebookFontSize')) || 13
    })
    const [fontFamily, setFontFamily] = useState(() => {
        const saved = localStorage.getItem('notebookFontFamily')
        return FONT_FAMILIES.find(f => f.value === saved) || FONT_FAMILIES[0]
    })

    const [showLimitDropdown, setShowLimitDropdown] = useState(false)
    const [showThemeDropdown, setShowThemeDropdown] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)

    const limitDropdownRef = useRef(null)
    const themeDropdownRef = useRef(null)
    const cellRefs = useRef({})

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
                setShowLimitDropdown(false)
            }
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
                setShowThemeDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle Escape key to exit full screen
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isFullScreen) {
                setIsFullScreen(false)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isFullScreen])

    // Persist settings
    useEffect(() => { localStorage.setItem('notebookRunLimit', selectedLimit.value) }, [selectedLimit])
    useEffect(() => { localStorage.setItem('notebookTheme', selectedTheme.value) }, [selectedTheme])
    useEffect(() => { localStorage.setItem('notebookFontSize', fontSize) }, [fontSize])
    useEffect(() => { localStorage.setItem('notebookFontFamily', fontFamily.value) }, [fontFamily])

    // Save cells to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('notebookCells', JSON.stringify(cells))
    }, [cells])

    const handleAddCell = () => {
        const newCell = {
            id: crypto.randomUUID(),
            type: 'sql',
            query: '-- New query\n',
            results: null,
            error: null,
            executionTime: null
        }
        setCells([...cells, newCell])
        scrollToNewCell(newCell.id)
    }

    const handleAddMarkdownCell = () => {
        const newCell = {
            id: crypto.randomUUID(),
            type: 'markdown',
            content: ''
        }
        setCells([...cells, newCell])
        scrollToNewCell(newCell.id)
    }

    const scrollToNewCell = (cellId) => {
        setTimeout(() => {
            const cellElement = cellRefs.current[cellId]
            if (cellElement) {
                cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // Focus the editor
                const editorElement = cellElement.querySelector('.cm-content') || cellElement.querySelector('.markdown-preview')
                if (editorElement) {
                    editorElement.focus()
                    // If markdown, trigger edit mode? Logic inside component handles it.
                }
            }
        }, 100)
    }

    const handleDeleteCell = (cellId) => {
        if (cells.length === 1) return
        setCells(prev => prev.filter(cell => cell.id !== cellId))
    }

    const handleClearResult = (cellId) => {
        setCells(prev => prev.map(cell =>
            cell.id === cellId ? { ...cell, results: null, error: null, executionTime: null } : cell
        ))
    }

    const handleContentChange = (cellId, newContent) => {
        setCells(cells.map(cell => {
            if (cell.id === cellId) {
                if (cell.type === 'markdown') {
                    return { ...cell, content: newContent }
                } else {
                    return { ...cell, query: newContent }
                }
            }
            return cell
        }))
    }

    const handleExecuteCell = async (cellId, query) => {
        let queryToExecute = query.trim()

        // Append LIMIT if needed
        if (selectedLimit.value !== -1) {
            // Simple check to avoid double LIMIT
            // Remove trailing semicolon
            queryToExecute = queryToExecute.replace(/;\s*$/, '')
            if (!queryToExecute.toLowerCase().includes('limit')) {
                queryToExecute += ` LIMIT ${selectedLimit.value}`
            }
        }

        try {
            const response = await fetch('http://localhost:8000/api/execute-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: queryToExecute,
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
                setCells(prev => prev.map(cell =>
                    cell.id === cellId
                        ? {
                            ...cell,
                            results: {
                                columns: data.columns,
                                rows: data.rows,
                                rowCount: data.rowCount
                            },
                            executionTime: data.executionTime,
                            lastRunAt: Date.now(),
                            error: null
                        }
                        : cell
                ))
            } else {
                setCells(prev => prev.map(cell =>
                    cell.id === cellId
                        ? { ...cell, results: null, error: data.error || 'Query execution failed' }
                        : cell
                ))
            }
        } catch (error) {
            setCells(prev => prev.map(cell =>
                cell.id === cellId
                    ? { ...cell, results: null, error: `Connection error: ${error.message}` }
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
        if (window.confirm('Are you sure you want to delete all results? Your queries will remain.')) {
            setCells(cells.map(cell => ({
                ...cell,
                results: null,
                error: null,
                executionTime: null
            })))
        }
    }

    return (
        <Box className={`notebook-view ${isFullScreen ? 'full-screen-mode' : ''}`}>
            <div className="notebook-header">
                <div className="notebook-title">
                    <h1>Notebook Mode</h1>
                </div>
                <div className="notebook-actions">
                    {/* Theme & Font Settings */}
                    <div className="notebook-settings-group">
                        {/* Full Screen Toggle */}
                        <button
                            className={`notebook-action-button secondary icon-only ${isFullScreen ? 'active' : ''}`}
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                        >
                            {isFullScreen ? <ScreenNormalIcon size={14} /> : <ScreenFullIcon size={14} />}
                        </button>

                        {/* Theme Dropdown */}
                        <div className="dropdown-wrapper" ref={themeDropdownRef}>
                            <button
                                className="notebook-action-button secondary icon-only"
                                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                title="Editor Settings"
                            >
                                <GearIcon size={14} />
                            </button>
                            {showThemeDropdown && (
                                <div className="theme-dropdown">
                                    <div className="dropdown-header-title">Editor Settings</div>
                                    <div className="dropdown-content-column">
                                        {/* Font Size */}
                                        <div className="setting-group">
                                            <div className="setting-label-row">
                                                <span className="setting-label">Font Size</span>
                                                <span className="setting-value">{fontSize}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="24"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="slider"
                                            />
                                        </div>

                                        <div className="dropdown-divider-vertical"></div>

                                        {/* Font Family */}
                                        <div className="setting-group">
                                            <span className="setting-label">Font Family</span>
                                            <select
                                                className="select-input"
                                                value={fontFamily.value}
                                                onChange={(e) => setFontFamily(FONT_FAMILIES.find(f => f.value === e.target.value))}
                                            >
                                                {FONT_FAMILIES.map(font => (
                                                    <option key={font.value} value={font.value}>{font.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="dropdown-divider-vertical"></div>

                                        {/* Theme */}
                                        <div className="setting-group">
                                            <span className="setting-label">Theme</span>
                                            <div className="theme-list">
                                                {THEMES.map(theme => (
                                                    <div
                                                        key={theme.value}
                                                        className={`dropdown-item ${selectedTheme.value === theme.value ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setSelectedTheme(theme)
                                                            setShowThemeDropdown(false)
                                                        }}
                                                    >
                                                        {theme.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Limit Dropdown */}
                        <div className="dropdown-wrapper" ref={limitDropdownRef}>
                            <button
                                className="notebook-action-button secondary"
                                onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                                title="Run Limit"
                            >
                                <span>{selectedLimit.label.replace('Run ', '')}</span>
                                <ChevronDownIcon size={12} />
                            </button>
                            {showLimitDropdown && (
                                <div className="dropdown-menu run-dropdown">
                                    {RUN_OPTIONS.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`dropdown-item ${selectedLimit.value === option.value ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedLimit(option)
                                                setShowLimitDropdown(false)
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="notebook-divider-vertical"></div>

                    <button
                        className="clear-results-badge"
                        onClick={handleClearAll}
                        title="Delete all results"
                    >
                        <TrashIcon size={12} />
                        Delete All
                    </button>
                    <button
                        className="coming-soon-badge"
                        onClick={handleRunAll}
                        title="Run all cells (Shift+Enter in each cell to run individually)"
                    >
                        <PlayIcon size={12} />
                        Run All
                    </button>
                    <button
                        className="results-badge"
                        onClick={handleAddMarkdownCell}
                        title="Add text cell"
                    >
                        <TypographyIcon size={12} />
                        Add Text
                    </button>
                    <button
                        className="results-badge"
                        onClick={handleAddCell}
                        title="Add SQL query cell"
                    >
                        <PlusIcon size={12} />
                        Add Query
                    </button>
                </div>
            </div>

            <div className="notebook-cells-container">
                {cells.map((cell, index) => (
                    cell.type === 'markdown' ? (
                        <MarkdownCell
                            key={cell.id}
                            cell={cell}
                            onChange={handleContentChange}
                            onDelete={handleDeleteCell}
                            isFirst={cells.length === 1}
                            theme={selectedTheme}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                        />
                    ) : (
                        <QueryCell
                            key={cell.id}
                            cell={cell}
                            cellRef={(el) => cellRefs.current[cell.id] = el}
                            onExecute={handleExecuteCell}
                            onDelete={handleDeleteCell}
                            onClearResult={handleClearResult}
                            onQueryChange={handleContentChange}
                            schema={schema}
                            isFirst={cells.length === 1}
                            isLast={index === cells.length - 1}
                            theme={selectedTheme}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                        />
                    )
                ))}
            </div>

            <div className="notebook-footer">
                <button className="add-cell-button" onClick={handleAddCell}>
                    <PlusIcon size={16} />
                    <span>Add Cell</span>
                </button>
                <div className="keyboard-hints">
                    <span className="hint">
                        <kbd>Cmd</kbd> + <kbd>Enter</kbd> to run cell
                    </span>
                </div>
            </div>
        </Box>
    )
}

export default NotebookView
