import { useState, useEffect, useRef } from 'react'
import { Box } from '@primer/react-brand'
import { PlusIcon, PlayIcon, TrashIcon, GearIcon, PaintbrushIcon, ChevronDownIcon, ScreenFullIcon, ScreenNormalIcon, TypographyIcon, PencilIcon, UploadIcon, DownloadIcon, ClockIcon } from '@primer/octicons-react'
import QueryCell from './QueryCell'
import MarkdownCell from './MarkdownCell'
import AIGeneratorButton from './AIGeneratorButton'
import { RUN_OPTIONS, THEMES, FONT_FAMILIES } from './QueryEditor'
import './NotebookView.css'



function NotebookView({ onExecuteQuery, schema, connectionDetails, database, onImportToEditor }) {
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
    const [showSavedNotebooks, setShowSavedNotebooks] = useState(false)
    const [savedNotebooks, setSavedNotebooks] = useState(() => {
        try {
            const saved = localStorage.getItem('savedNotebooks')
            return saved ? JSON.parse(saved) : []
        } catch (e) {
            console.error('Failed to load saved notebooks:', e)
            return []
        }
    })

    // ... (other state)

    // Persist saved notebooks
    useEffect(() => {
        localStorage.setItem('savedNotebooks', JSON.stringify(savedNotebooks))
    }, [savedNotebooks])



    const limitDropdownRef = useRef(null)
    const themeDropdownRef = useRef(null)
    const savedNotebooksRef = useRef(null)
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
            if (savedNotebooksRef.current && !savedNotebooksRef.current.contains(event.target)) {
                setShowSavedNotebooks(false)
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

        // Scroll to new cell
        setTimeout(() => {
            const el = cellRefs.current[newCell.id]
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 100)
    }

    const handleAddMarkdownCell = () => {
        const newCell = {
            id: crypto.randomUUID(),
            type: 'markdown',
            content: '### New Text Cell\nDouble-click to edit',
            isEditing: true
        }
        setCells([...cells, newCell])

        // Scroll to new cell
        setTimeout(() => {
            const el = cellRefs.current[newCell.id]
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
                    username: connectionDetails.username,
                    password: connectionDetails.password,
                    connectionString: connectionDetails.connectionString,
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

    const [notebookName, setNotebookName] = useState(() => {
        return localStorage.getItem('notebookName') || 'Untitled Notebook'
    })
    const [isEditingName, setIsEditingName] = useState(false)
    const nameInputRef = useRef(null)

    // Persist notebook name
    useEffect(() => {
        localStorage.setItem('notebookName', notebookName)
    }, [notebookName])

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus()
            nameInputRef.current.select()
        }
    }, [isEditingName])

    const handleNameSubmit = () => {
        if (!notebookName.trim()) {
            setNotebookName('Untitled Notebook')
        }
        setIsEditingName(false)
    }

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleNameSubmit()
        }
    }

    // Handle importing all SQL queries to editor
    const handleImportToEditor = () => {
        const sqlCells = cells.filter(cell => cell.type === 'sql')
        if (sqlCells.length === 0) {
            alert('No SQL queries to import')
            return
        }

        const consolidatedQuery = sqlCells
            .map((cell, index) => {
                const query = cell.query.trim()
                return `-- Query ${index + 1}\n${query}`
            })
            .join('\n\n')

        if (onImportToEditor) {
            onImportToEditor(consolidatedQuery)
            alert('SQL queries imported to editor view!')
        }
    }

    // Check if current notebook state matches ANY saved notebook (to avoid false "unsaved changes" warnings)
    const isCurrentStateMatchingAnySaved = () => {
        if (savedNotebooks.length === 0) return false

        // Check if current state exactly matches any saved notebook
        for (const savedNotebook of savedNotebooks) {
            // Check name
            if (savedNotebook.name !== notebookName) continue

            // Check cell count
            if (savedNotebook.cells.length !== cells.length) continue

            // Check each cell's content
            let cellsMatch = true
            for (let i = 0; i < cells.length; i++) {
                const currentCell = cells[i]
                const savedCell = savedNotebook.cells[i]

                if (currentCell.type !== savedCell.type) {
                    cellsMatch = false
                    break
                }

                if (currentCell.type === 'sql') {
                    if (currentCell.query !== savedCell.query) {
                        cellsMatch = false
                        break
                    }
                } else if (currentCell.type === 'markdown') {
                    if (currentCell.content !== savedCell.content) {
                        cellsMatch = false
                        break
                    }
                }
            }

            if (!cellsMatch) continue

            // Check settings
            const currentSettings = {
                theme: selectedTheme.value,
                fontSize,
                fontFamily: fontFamily.value,
                limit: selectedLimit.value
            }

            const savedSettings = savedNotebook.settings || {}
            const normalizedSavedSettings = {
                theme: (savedSettings.theme && typeof savedSettings.theme === 'object') ? savedSettings.theme.value : savedSettings.theme,
                fontSize: savedSettings.fontSize,
                fontFamily: (savedSettings.fontFamily && typeof savedSettings.fontFamily === 'object') ? savedSettings.fontFamily.value : savedSettings.fontFamily,
                limit: (savedSettings.limit && typeof savedSettings.limit === 'object') ? savedSettings.limit.value : savedSettings.limit
            }

            if (JSON.stringify(normalizedSavedSettings) === JSON.stringify(currentSettings)) {
                // Found exact match!
                return true
            }
        }

        return false
    }

    // Check if notebook has changes compared to last saved version
    const hasNotebookChanged = () => {
        if (savedNotebooks.length === 0) return true // No previous saves, so it's new

        // Find saved notebook with the same name
        const sameNameNotebook = savedNotebooks.find(n => n.name === notebookName)
        if (!sameNameNotebook) return true // Different name, so it's a new version

        // Compare number of cells
        if (sameNameNotebook.cells.length !== cells.length) return true

        // Compare each cell's content (excluding results and execution times)
        for (let i = 0; i < cells.length; i++) {
            const currentCell = cells[i]
            const savedCell = sameNameNotebook.cells[i]

            if (currentCell.type !== savedCell.type) return true

            if (currentCell.type === 'sql') {
                if (currentCell.query !== savedCell.query) return true
            } else if (currentCell.type === 'markdown') {
                if (currentCell.content !== savedCell.content) return true
            }
        }

        // Compare settings (using primitive values)
        const currentSettings = {
            theme: selectedTheme.value,
            fontSize,
            fontFamily: fontFamily.value,
            limit: selectedLimit.value
        }

        // Handle backward compatibility where saved settings might be full objects
        const savedSettings = sameNameNotebook.settings || {}
        const normalizedSavedSettings = {
            theme: (savedSettings.theme && typeof savedSettings.theme === 'object') ? savedSettings.theme.value : savedSettings.theme,
            fontSize: savedSettings.fontSize,
            fontFamily: (savedSettings.fontFamily && typeof savedSettings.fontFamily === 'object') ? savedSettings.fontFamily.value : savedSettings.fontFamily,
            limit: (savedSettings.limit && typeof savedSettings.limit === 'object') ? savedSettings.limit.value : savedSettings.limit
        }

        if (JSON.stringify(normalizedSavedSettings) !== JSON.stringify(currentSettings)) return true

        return false // No changes detected
    }

    // Save current notebook with smart versioning
    const handleSaveNotebook = () => {
        // Check if there are actual changes
        if (!hasNotebookChanged()) {
            alert('No changes detected. Notebook is already up to date with the last saved version.')
            return
        }

        const timestamp = new Date().toISOString()
        const newNotebookData = {
            id: crypto.randomUUID(),
            name: notebookName,
            savedAt: timestamp,
            cells: JSON.parse(JSON.stringify(cells)),
            settings: {
                theme: selectedTheme.value,
                fontSize,
                fontFamily: fontFamily.value,
                limit: selectedLimit.value
            }
        }

        // Check if a notebook with the same name exists
        const existingIndex = savedNotebooks.findIndex(n => n.name === notebookName)

        let updatedNotebooks
        if (existingIndex !== -1) {
            // Update the existing version (replace it)
            updatedNotebooks = [...savedNotebooks]
            updatedNotebooks[existingIndex] = newNotebookData
            alert(`Notebook "${notebookName}" updated!`)
        } else {
            // Create new version (name is different)
            updatedNotebooks = [newNotebookData, ...savedNotebooks]
            alert(`New notebook version "${notebookName}" created!`)
        }

        setSavedNotebooks(updatedNotebooks)
        localStorage.setItem('savedNotebooks', JSON.stringify(updatedNotebooks))
    }

    // Load a saved notebook
    const handleLoadNotebook = (notebook) => {
        console.log('handleLoadNotebook called with:', notebook)

        if (!notebook) {
            console.error('Notebook is null or undefined')
            alert('Error: Invalid notebook data.')
            return
        }

        if (!notebook.cells) {
            console.error('Notebook has no cells property')
            alert('Error: Invalid notebook data (no cells).')
            return
        }

        // Check if there are unsaved changes (current state doesn't match any saved notebook)
        const hasUnsavedChanges = !isCurrentStateMatchingAnySaved()
        if (hasUnsavedChanges) {
            if (!window.confirm(`You have unsaved changes. Load "${notebook.name}" anyway?`)) {
                console.log('User cancelled due to unsaved changes')
                return
            }
        }

        console.log('Loading notebook...')
        setCells(notebook.cells)
        setNotebookName(notebook.name)
        if (notebook.settings) {
            // Handle both old (object) and new (value) formats
            const themeValue = (notebook.settings.theme && typeof notebook.settings.theme === 'object') ? notebook.settings.theme.value : notebook.settings.theme
            const fontValue = (notebook.settings.fontFamily && typeof notebook.settings.fontFamily === 'object') ? notebook.settings.fontFamily.value : notebook.settings.fontFamily
            const limitValue = (notebook.settings.limit && typeof notebook.settings.limit === 'object') ? notebook.settings.limit.value : notebook.settings.limit

            const theme = THEMES.find(t => t.value === themeValue) || THEMES[0]
            const font = FONT_FAMILIES.find(f => f.value === fontValue) || FONT_FAMILIES[0]
            const limit = RUN_OPTIONS.find(o => o.value === limitValue) || RUN_OPTIONS[0]

            setSelectedTheme(theme)
            setFontSize(notebook.settings.fontSize)
            setFontFamily(font)
            setSelectedLimit(limit)
        }
        setShowSavedNotebooks(false)
        console.log('Notebook loaded successfully')
    }

    // Delete a saved notebook
    const handleDeleteSavedNotebook = (notebookId, e) => {
        console.log('handleDeleteSavedNotebook called with ID:', notebookId)
        console.log('Event:', e)
        e.stopPropagation()

        const notebook = savedNotebooks.find(n => n.id === notebookId)
        console.log('Found notebook:', notebook)

        if (!notebook) {
            console.error('Notebook not found with ID:', notebookId)
            alert('Error: Notebook not found.')
            return
        }

        console.log('Showing confirm dialog...')
        if (window.confirm(`Delete saved notebook "${notebook.name}"?`)) {
            console.log('User confirmed, deleting...')
            const updatedNotebooks = savedNotebooks.filter(n => n.id !== notebookId)
            console.log('Updated notebooks list:', updatedNotebooks)
            setSavedNotebooks(updatedNotebooks)
            console.log('Notebook deleted successfully')
        } else {
            console.log('User cancelled deletion')
        }
    }

    // Create a new empty notebook
    const handleNewNotebook = () => {
        // Check if there are unsaved changes
        const hasUnsavedChanges = !isCurrentStateMatchingAnySaved()
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Create new notebook anyway?')) {
                return
            }
        }

        // Reset to default state
        const defaultCell = {
            id: crypto.randomUUID(),
            type: 'sql',
            query: '',
            results: null,
            error: null,
            executionTime: null
        }
        setCells([defaultCell])
        setNotebookName('Untitled Notebook')
    }

    // Format date for display
    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Box className={`notebook-view ${isFullScreen ? 'full-screen-mode' : ''}`}>
            <div className="notebook-header">
                <div className="notebook-title">
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            className="notebook-name-input"
                            value={notebookName}
                            onChange={(e) => setNotebookName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleNameKeyDown}
                        />
                    ) : (
                        <div className="notebook-name-wrapper" onClick={() => setIsEditingName(true)} title="Click to rename">
                            <h1 className="notebook-name-display">
                                {notebookName}
                            </h1>
                            <PencilIcon size={16} className="edit-icon" />
                        </div>
                    )}

                    {/* Save and Saved buttons next to title */}
                    <div className="notebook-title-actions">
                        {/* New Notebook Button - Icon Only */}
                        <button
                            className="notebook-action-button new icon-only"
                            onClick={handleNewNotebook}
                            title="Create new empty notebook"
                        >
                            <PlusIcon size={14} />
                        </button>

                        {/* Save Notebook Button - Icon Only */}
                        <button
                            className="notebook-action-button save icon-only"
                            onClick={handleSaveNotebook}
                            title="Save current notebook version"
                        >
                            <DownloadIcon size={14} />
                        </button>

                        {/* Saved Notebooks Button - Icon Only with Badge */}
                        <div className="dropdown-wrapper" style={{ position: 'relative' }} ref={savedNotebooksRef}>
                            <button
                                className="notebook-action-button secondary icon-only saved-button"
                                onClick={() => setShowSavedNotebooks(!showSavedNotebooks)}
                                title="View saved notebooks"
                            >
                                <ClockIcon size={14} />
                                {savedNotebooks.length > 0 && (
                                    <span className="saved-count-badge">{savedNotebooks.length}</span>
                                )}
                            </button>
                            {showSavedNotebooks && (
                                <div className="saved-notebooks-dropdown">
                                    <div className="dropdown-header-title">Saved Notebooks</div>
                                    <div className="saved-notebooks-list">
                                        {savedNotebooks.length === 0 ? (
                                            <div className="no-saved-notebooks">
                                                <p>No saved notebooks yet</p>
                                                <small>Click the save icon to create a version</small>
                                            </div>
                                        ) : (
                                            savedNotebooks.map(notebook => (
                                                <div
                                                    key={notebook.id}
                                                    className="saved-notebook-item"
                                                    onClick={() => handleLoadNotebook(notebook)}
                                                >
                                                    <div className="saved-notebook-info">
                                                        <div className="saved-notebook-name">{notebook.name}</div>
                                                        <div className="saved-notebook-meta">
                                                            <span>{formatDate(notebook.savedAt)}</span>
                                                            <span>•</span>
                                                            <span>{notebook.cells.length} cells</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="delete-saved-notebook"
                                                        onClick={(e) => handleDeleteSavedNotebook(notebook.id, e)}
                                                        title="Delete this version"
                                                    >
                                                        <TrashIcon size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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

                        <div className="notebook-divider-vertical"></div>

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

                    <div className="keyboard-hints" style={{ marginRight: '8px' }}>
                        <span className="hint" style={{ fontSize: '11px', color: '#8b949e' }}>
                            <kbd style={{
                                background: 'rgba(110, 118, 129, 0.1)',
                                border: '1px solid rgba(110, 118, 129, 0.2)',
                                borderRadius: '3px',
                                padding: '2px 4px',
                                fontFamily: 'monospace',
                                fontSize: '10px',
                                color: '#c9d1d9'
                            }}>Cmd</kbd> + <kbd style={{
                                background: 'rgba(110, 118, 129, 0.1)',
                                border: '1px solid rgba(110, 118, 129, 0.2)',
                                borderRadius: '3px',
                                padding: '2px 4px',
                                fontFamily: 'monospace',
                                fontSize: '10px',
                                color: '#c9d1d9'
                            }}>Enter</kbd> to run
                        </span>
                    </div>

                    {/* Import to Editor Button */}
                    <button
                        className="notebook-action-button secondary"
                        onClick={handleImportToEditor}
                        title="Import all SQL queries to Editor view"
                    >
                        <UploadIcon size={12} />
                        To Editor
                    </button>

                    <button
                        className="notebook-action-button destructive"
                        onClick={handleClearAll}
                        title="Delete all results"
                    >
                        <TrashIcon size={12} />
                        Delete All
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
                        onClick={handleAddMarkdownCell}
                        title="Add text cell"
                    >
                        <PlusIcon size={14} />
                        Add Text
                    </button>
                    <button
                        className="notebook-action-button add"
                        onClick={handleAddCell}
                        title="Add SQL query cell"
                    >
                        <PlusIcon size={14} />
                        Add Query
                    </button>
                </div>
            </div>

            <div
                className="notebook-cells-container"
            >
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
                {/* Spacer to allow scrolling last cell to center */}
                <div style={{ minHeight: '40vh' }}></div>
            </div>
        </Box>
    )
}

export default NotebookView
