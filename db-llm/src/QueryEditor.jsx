import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { autocompletion } from '@codemirror/autocomplete'
import { EditorView } from "@codemirror/view"
import { Box } from '@primer/react-brand'
import { PlayIcon, ChevronDownIcon, GearIcon, DownloadIcon, ClockIcon, TrashIcon, PencilIcon, PlusIcon, StopIcon } from '@primer/octicons-react'
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import { TbCancel } from "react-icons/tb"
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'
import { createSQLAutocomplete } from './sqlAutocomplete'
import AIGeneratorButton from './AIGeneratorButton'
import CodeDiffView from './CodeDiffView'
import ResultsTable from './ResultsTable'
import './QueryEditor.css'

export const RUN_OPTIONS = [
    { label: 'Run Limit 1000', value: 1000 },
    { label: 'Run Top 100', value: 100 },
    { label: 'Run Top 500', value: 500 },
    { label: 'Run Top 5000', value: 5000 },
    { label: 'Run All', value: -1 }
]

export const THEMES = [
    { name: 'VS Code Dark', value: 'vscode', theme: vscodeDark },
    { name: 'GitHub Dark', value: 'github', theme: githubDark },
    { name: 'GitHub Light', value: 'github-light', theme: githubLight },
    { name: 'Dracula', value: 'dracula', theme: dracula },
    { name: 'Tokyo Night', value: 'tokyo', theme: tokyoNight }
]

export const FONT_FAMILIES = [
    { name: 'SF Mono (Default)', value: 'sf-mono', family: "var(--font-mono)" },
    { name: 'Fira Code', value: 'fira', family: "'Fira Code', 'Courier New', monospace" },
    { name: 'JetBrains Mono', value: 'jetbrains', family: "'JetBrains Mono', 'Courier New', monospace" },
    { name: 'Consolas', value: 'consolas', family: "'Consolas', 'Courier New', monospace" },
    { name: 'Monaco', value: 'monaco', family: "'Monaco', 'Courier New', monospace" },
    { name: 'Courier New', value: 'courier', family: "'Courier New', monospace" }
]

function QueryEditor({ onExecuteQuery, onCancelQuery, isExecuting, height = 250, schema, isLoadingSchema, importedQuery, onQueryImported, queryResults, queryError, executionTime, theme }) {
    const [query, setQuery] = useState(() => localStorage.getItem('savedQuery') || 'SELECT * FROM your_table;')
    const [isAiGenerating, setIsAiGenerating] = useState(false)
    const [aiSuggestion, setAiSuggestion] = useState(null)

    useEffect(() => {
        localStorage.setItem('savedQuery', query)
    }, [query])

    // Sync editor theme with app theme
    useLayoutEffect(() => {
        if (theme === 'light') {
            const lightTheme = THEMES.find(t => t.value === 'github-light')
            if (lightTheme) setSelectedTheme(lightTheme)
        } else {
            // Default to VS Code Dark if in dark mode, unless already on a dark theme
            // But for simplicity/consistency, let's revert to a standard dark theme or last saved?
            // If the current theme is light, switch to default dark.
            // If it's already a dark theme (vscode, github-dark, dracula, tokyo), keep it.
            if (selectedTheme.value === 'github-light') {
                const darkTheme = THEMES.find(t => t.value === 'vscode')
                if (darkTheme) setSelectedTheme(darkTheme)
            }
        }
    }, [theme]) // Run when app theme changes

    // Handle imported query from notebook
    useEffect(() => {
        if (importedQuery) {
            setQuery(importedQuery)
            if (onQueryImported) {
                onQueryImported()
            }
        }
    }, [importedQuery, onQueryImported])

    const [selectedLimit, setSelectedLimit] = useState(() => {
        const saved = parseInt(localStorage.getItem('runLimit'))
        return RUN_OPTIONS.find(o => o.value === saved) || RUN_OPTIONS[0]
    })


    useEffect(() => {
        localStorage.setItem('runLimit', selectedLimit.value)
    }, [selectedLimit])

    const [showLimitDropdown, setShowLimitDropdown] = useState(false)
    const [showThemeDropdown, setShowThemeDropdown] = useState(false)

    const [selectedTheme, setSelectedTheme] = useState(() => {
        const saved = localStorage.getItem('editorTheme')
        return THEMES.find(t => t.value === saved) || THEMES[0]
    })

    const [fontSize, setFontSize] = useState(() => {
        return parseInt(localStorage.getItem('editorFontSize')) || 13
    })

    const [fontFamily, setFontFamily] = useState(() => {
        const saved = localStorage.getItem('editorFontFamily')
        return FONT_FAMILIES.find(f => f.value === saved) || FONT_FAMILIES[0]
    })
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [fullscreenEditorHeight, setFullscreenEditorHeight] = useState(50) // Percentage of viewport
    const [isFullscreenResizing, setIsFullscreenResizing] = useState(false)

    // Query name and saved queries
    const [queryName, setQueryName] = useState(() => {
        return localStorage.getItem('queryName') || 'Untitled Query'
    })
    const [isEditingName, setIsEditingName] = useState(false)
    const [savedQueries, setSavedQueries] = useState(() => {
        const saved = localStorage.getItem('savedQueries')
        return saved ? JSON.parse(saved) : []
    })
    const [showSavedQueries, setShowSavedQueries] = useState(false)

    const limitDropdownRef = useRef(null)
    const themeDropdownRef = useRef(null)
    const savedQueriesRef = useRef(null)
    const nameInputRef = useRef(null)

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
                setShowLimitDropdown(false)
            }
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
                setShowThemeDropdown(false)
            }
            if (savedQueriesRef.current && !savedQueriesRef.current.contains(event.target)) {
                setShowSavedQueries(false)
            }
        }

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isFullscreen])

    // Persist query name
    useEffect(() => {
        localStorage.setItem('queryName', queryName)
    }, [queryName])

    // Focus name input when editing
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus()
            nameInputRef.current.select()
        }
    }, [isEditingName])

    // Persist settings
    useEffect(() => {
        localStorage.setItem('editorFontSize', fontSize)
    }, [fontSize])

    useEffect(() => {
        localStorage.setItem('editorFontFamily', fontFamily.value)
    }, [fontFamily])

    useEffect(() => {
        localStorage.setItem('editorTheme', selectedTheme.value)
    }, [selectedTheme])

    // Handle fullscreen resize
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isFullscreenResizing) return

            const newHeightPercent = (e.clientY / window.innerHeight) * 100

            // Set minimum and maximum heights (20% to 80%)
            const minHeight = 20
            const maxHeight = 80

            if (newHeightPercent >= minHeight && newHeightPercent <= maxHeight) {
                setFullscreenEditorHeight(newHeightPercent)
            }
        }

        const handleMouseUp = () => {
            setIsFullscreenResizing(false)
        }

        if (isFullscreenResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isFullscreenResizing])

    const viewRef = useRef(null)

    const onCreateEditor = (view) => {
        viewRef.current = view
    }

    const handleExecute = () => {
        if (!isExecuting) {
            let queryToExecute = query

            // Check if there is a selection
            if (viewRef.current) {
                const state = viewRef.current.state
                const selection = state.selection.main
                if (!selection.empty) {
                    queryToExecute = state.sliceDoc(selection.from, selection.to)
                }
            }

            if (!queryToExecute.trim()) return

            let modifiedQuery = queryToExecute.trim()

            // Remove trailing semicolon(s) and whitespace so LIMIT is appended correctly
            modifiedQuery = modifiedQuery.replace(/;\s*$/, '')

            // Add LIMIT if not already present and limit is specified
            if (selectedLimit.value !== -1) {
                if (!modifiedQuery.toLowerCase().includes('limit')) {
                    modifiedQuery += ` LIMIT ${selectedLimit.value}`
                }
            }

            console.log('Executing query:', modifiedQuery)
            onExecuteQuery(modifiedQuery)
        }
    }

    const handleAiGenerate = () => {
        setIsAiGenerating(true)
        // Simulate AI generation delay
        setTimeout(() => {
            // Mock AI suggestion
            const suggestion = `SELECT 
    u.id, 
    u.username, 
    COUNT(o.id) as total_orders,
    SUM(o.amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
HAVING total_spent > 1000
ORDER BY total_spent DESC;`
            setAiSuggestion(suggestion)
            setIsAiGenerating(false)
        }, 2000)
    }

    const handleAcceptSuggestion = () => {
        setQuery(aiSuggestion)
        setAiSuggestion(null)
    }

    const handleRejectSuggestion = () => {
        setAiSuggestion(null)
    }

    const handleKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            handleExecute()
        }
    }

    // Query name handlers
    const handleNameSubmit = () => {
        if (!queryName.trim()) {
            setQueryName('Untitled Query')
        }
        setIsEditingName(false)
    }

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleNameSubmit()
        }
    }

    // Check if current query state matches ANY saved query (to avoid false "unsaved changes" warnings)
    const isCurrentQueryMatchingAnySaved = () => {
        if (savedQueries.length === 0) return false

        // Check if current state exactly matches any saved query
        for (const savedQuery of savedQueries) {
            // Check name and query content
            if (savedQuery.name !== queryName) continue
            if (savedQuery.query !== query) continue

            // Check settings
            const currentSettings = {
                theme: selectedTheme.value,
                fontSize,
                fontFamily: fontFamily.value,
                limit: selectedLimit.value
            }

            const savedSettings = savedQuery.settings || {}
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

    // Check if query has changes compared to saved version with same name
    const hasQueryChanged = () => {
        if (savedQueries.length === 0) return true

        const sameNameQuery = savedQueries.find(q => q.name === queryName)
        if (!sameNameQuery) return true // Different name = new version

        // Compare query content
        if (sameNameQuery.query !== query) return true

        // Compare settings (using primitive values)
        const currentSettings = {
            theme: selectedTheme.value,
            fontSize,
            fontFamily: fontFamily.value,
            limit: selectedLimit.value
        }

        // Handle backward compatibility where saved settings might be full objects
        const savedSettings = sameNameQuery.settings || {}
        const normalizedSavedSettings = {
            theme: (savedSettings.theme && typeof savedSettings.theme === 'object') ? savedSettings.theme.value : savedSettings.theme,
            fontSize: savedSettings.fontSize,
            fontFamily: (savedSettings.fontFamily && typeof savedSettings.fontFamily === 'object') ? savedSettings.fontFamily.value : savedSettings.fontFamily,
            limit: (savedSettings.limit && typeof savedSettings.limit === 'object') ? savedSettings.limit.value : savedSettings.limit
        }

        if (JSON.stringify(normalizedSavedSettings) !== JSON.stringify(currentSettings)) return true

        return false
    }

    // Save query with versioning
    const handleSaveQuery = () => {
        if (!hasQueryChanged()) {
            alert('No changes detected. Query is already up to date.')
            return
        }

        const timestamp = new Date().toISOString()
        const newQueryData = {
            id: crypto.randomUUID(),
            name: queryName,
            savedAt: timestamp,
            query: query,
            settings: {
                theme: selectedTheme.value,
                fontSize,
                fontFamily: fontFamily.value,
                limit: selectedLimit.value
            }
        }

        const existingIndex = savedQueries.findIndex(q => q.name === queryName)

        let updatedQueries
        if (existingIndex !== -1) {
            // Update existing version
            updatedQueries = [...savedQueries]
            updatedQueries[existingIndex] = newQueryData
            alert(`Query "${queryName}" updated!`)
        } else {
            // Create new version
            updatedQueries = [newQueryData, ...savedQueries]
            alert(`New query "${queryName}" saved!`)
        }

        setSavedQueries(updatedQueries)
        localStorage.setItem('savedQueries', JSON.stringify(updatedQueries))
    }

    // Load a saved query
    const handleLoadQuery = (savedQuery) => {
        // Check if there is a selection
        const hasUnsavedChanges = !isCurrentQueryMatchingAnySaved()
        if (hasUnsavedChanges) {
            if (!window.confirm(`You have unsaved changes.Load "${savedQuery.name}" anyway ? `)) {
                return
            }
        }

        setQuery(savedQuery.query)
        setQueryName(savedQuery.name)
        if (savedQuery.settings) {
            // Handle both old (object) and new (value) formats
            const themeValue = (savedQuery.settings.theme && typeof savedQuery.settings.theme === 'object') ? savedQuery.settings.theme.value : savedQuery.settings.theme
            const fontValue = (savedQuery.settings.fontFamily && typeof savedQuery.settings.fontFamily === 'object') ? savedQuery.settings.fontFamily.value : savedQuery.settings.fontFamily
            const limitValue = (savedQuery.settings.limit && typeof savedQuery.settings.limit === 'object') ? savedQuery.settings.limit.value : savedQuery.settings.limit

            const theme = THEMES.find(t => t.value === themeValue) || THEMES[0]
            const font = FONT_FAMILIES.find(f => f.value === fontValue) || FONT_FAMILIES[0]
            const limit = RUN_OPTIONS.find(o => o.value === limitValue) || RUN_OPTIONS[0]

            setSelectedTheme(theme)
            setFontSize(savedQuery.settings.fontSize)
            setFontFamily(font)
            setSelectedLimit(limit)
        }
        setShowSavedQueries(false)
    }

    // Delete a saved query
    const handleDeleteSavedQuery = (queryId, e) => {
        e.stopPropagation()
        const savedQuery = savedQueries.find(q => q.id === queryId)
        if (window.confirm(`Delete saved query "${savedQuery.name}" ? `)) {
            const updatedQueries = savedQueries.filter(q => q.id !== queryId)
            setSavedQueries(updatedQueries)
            localStorage.setItem('savedQueries', JSON.stringify(updatedQueries))
        }
    }

    // Create a new empty query
    const handleNewQuery = () => {
        // Check if there are unsaved changes
        const hasUnsavedChanges = !isCurrentQueryMatchingAnySaved()
        if (hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Create new query anyway?')) {
                return
            }
        }

        // Reset to default state
        setQuery('SELECT * FROM your_table;')
        setQueryName('Untitled Query')
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

    // Memoize extensions array with schema-aware autocomplete
    const extensions = useMemo(() => {
        const exts = [sql()]

        // Add custom autocomplete if schema is available
        if (schema && schema.tables) {
            const customAutocomplete = autocompletion({
                override: [createSQLAutocomplete(schema)],
                activateOnTyping: true,
                maxRenderedOptions: 15,
                defaultKeymap: true
            })
            exts.push(customAutocomplete)
        }

        // Add font family extension
        const fontTheme = EditorView.theme({
            "&": {
                fontFamily: fontFamily.family
            },
            ".cm-content": {
                fontFamily: fontFamily.family
            },
            ".cm-scroller": {
                fontFamily: fontFamily.family
            }
        })
        exts.push(fontTheme)

        return exts
    }, [schema, fontFamily])

    // Calculate editor height (subtract header height ~42px)
    // In fullscreen, use resizable height
    const editorHeight = isFullscreen
        ? `calc(${fullscreenEditorHeight}vh - 50px)`  // Resizable height minus header
        // Subtract more space for header and borders to prevent overflow (was 42)
        : `${Math.max(height - 52, 100)}px`

    // Mouse down handler for fullscreen resizer
    const handleFullscreenResizerMouseDown = (e) => {
        setIsFullscreenResizing(true)
        e.preventDefault()
    }

    return (
        <Box className={`query-editor-container ${isCollapsed ? 'collapsed' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="editor-header">
                <div className="editor-title-row">
                    <button
                        className="collapse-button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand editor" : "Collapse editor"}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                        >
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Editable Query Name */}
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            className="query-name-input"
                            value={queryName}
                            onChange={(e) => setQueryName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleNameKeyDown}
                        />
                    ) : (
                        <div className="query-name-wrapper" onClick={() => setIsEditingName(true)} title="Click to rename">
                            <div className="query-name-display">{queryName}</div>
                            <PencilIcon size={14} className="edit-icon" />
                        </div>
                    )}

                    {/* Save and Saved buttons next to title */}
                    <div className="query-title-actions">
                        {/* New Query Button - Icon Only */}
                        <button
                            className="notebook-action-button new icon-only"
                            onClick={handleNewQuery}
                            title="Create new empty query"
                        >
                            <PlusIcon size={14} />
                        </button>

                        {/* Save Button - Icon Only */}
                        <button
                            className="notebook-action-button save icon-only"
                            onClick={handleSaveQuery}
                            title="Save current query"
                        >
                            <DownloadIcon size={14} />
                        </button>

                        {/* Saved Queries Button - Icon Only with Badge */}
                        <div className="dropdown-wrapper" style={{ position: 'relative' }} ref={savedQueriesRef}>
                            <button
                                className="notebook-action-button secondary icon-only saved-button"
                                onClick={() => setShowSavedQueries(!showSavedQueries)}
                                title="View saved queries"
                            >
                                <ClockIcon size={14} />
                                {savedQueries.length > 0 && (
                                    <span className="saved-count-badge">{savedQueries.length}</span>
                                )}
                            </button>
                            {showSavedQueries && (
                                <div className="saved-queries-dropdown">
                                    <div className="dropdown-header-title">Saved Queries</div>
                                    <div className="saved-queries-list">
                                        {savedQueries.length === 0 ? (
                                            <div className="no-saved-queries">
                                                <p>No saved queries yet</p>
                                                <small>Click the save icon to save this query</small>
                                            </div>
                                        ) : (
                                            savedQueries.map(savedQuery => (
                                                <div
                                                    key={savedQuery.id}
                                                    className="saved-query-item"
                                                    onClick={() => handleLoadQuery(savedQuery)}
                                                >
                                                    <div className="saved-query-info">
                                                        <div className="saved-query-name">{savedQuery.name}</div>
                                                        <div className="saved-query-meta">
                                                            <span>{formatDate(savedQuery.savedAt)}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="delete-saved-query"
                                                        onClick={(e) => handleDeleteSavedQuery(savedQuery.id, e)}
                                                        title="Delete this query"
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
                <div className="editor-actions">
                    {/* AI Generator Button */}
                    <AIGeneratorButton
                        onClick={handleAiGenerate}
                        isGenerating={isAiGenerating}
                        disabled={true}
                    />

                    {/* Fullscreen Toggle */}
                    <button
                        className="notebook-action-button secondary icon-only"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? <MdFullscreenExit size={16} /> : <MdFullscreen size={16} />}
                    </button>



                    {/* Settings Selector */}
                    <div className="theme-selector" ref={themeDropdownRef}>
                        <button
                            className="notebook-action-button secondary icon-only"
                            onClick={() => {
                                setShowThemeDropdown(!showThemeDropdown)
                                setShowLimitDropdown(false)
                            }}
                        >
                            <GearIcon size={14} />
                        </button>
                        {showThemeDropdown && (() => {
                            const rect = themeDropdownRef.current?.getBoundingClientRect();
                            return (
                                <div
                                    className="dropdown-menu theme-dropdown"
                                    style={{
                                        top: rect ? `${rect.bottom + 4}px` : '100%',
                                        left: rect ? `${rect.right - 320}px` : 'auto',
                                    }}
                                >
                                    <div className="dropdown-header-title">Editor Settings</div>
                                    <div className="dropdown-content-column">

                                        {/* Font Size */}
                                        <div className="setting-group">
                                            <div className="setting-label-row">
                                                <label className="setting-label">Font Size</label>
                                                <span className="setting-value">{fontSize}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="11"
                                                max="20"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="slider"
                                            />
                                        </div>

                                        {/* Font Family */}
                                        <div className="setting-group">
                                            <label className="setting-label">Font Family</label>
                                            <select
                                                value={fontFamily.value}
                                                onChange={(e) => {
                                                    const selected = FONT_FAMILIES.find(f => f.value === e.target.value)
                                                    setFontFamily(selected)
                                                }}
                                                className="select-input"
                                            >
                                                {FONT_FAMILIES.map(font => (
                                                    <option key={font.value} value={font.value}>
                                                        {font.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>



                                        <div className="dropdown-divider-vertical"></div>

                                        {/* Theme */}
                                        <div className="setting-group">
                                            <label className="setting-label">Theme</label>
                                            <div className="theme-list">
                                                {THEMES.map(themeOption => (
                                                    <div
                                                        key={themeOption.value}
                                                        className={`dropdown-item ${selectedTheme.value === themeOption.value ? 'active' : ''}`}
                                                        onClick={() => setSelectedTheme(themeOption)}
                                                    >
                                                        {themeOption.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Run Button Group */}
                    <div className="run-button-group" ref={limitDropdownRef}>
                        {isExecuting && (
                            <button
                                className="cancel-button"
                                onClick={onCancelQuery}
                                title="Cancel execution"
                            >
                                <TbCancel size={14} />
                            </button>
                        )}
                        <button
                            className="execute-button"
                            onClick={handleExecute}
                            disabled={isExecuting || !query.trim()}
                        >
                            <PlayIcon size={12} />
                            <span className="execute-text">
                                {isExecuting ? 'Running...' : selectedLimit.label}
                            </span>
                        </button>

                        <div className="dropdown-wrapper">
                            <button
                                className="execute-dropdown-trigger"
                                onClick={() => {
                                    setShowLimitDropdown(!showLimitDropdown)
                                    setShowThemeDropdown(false)
                                }}
                                disabled={isExecuting}
                            >
                                <ChevronDownIcon size={12} />
                            </button>
                            {showLimitDropdown && (
                                <div className="dropdown-menu run-dropdown">
                                    {RUN_OPTIONS.map(option => (
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

                    <div className="keyboard-hint">⌘ + ↵</div>
                </div>
            </div>
            {
                !isCollapsed && (
                    <div
                        className={`editor-wrapper ${isAiGenerating ? 'ai-analyzing' : ''}`}
                        onKeyDown={handleKeyDown}
                    >
                        {aiSuggestion ? (
                            <div style={{ height: editorHeight, overflow: 'hidden' }}>
                                <CodeDiffView
                                    originalCode={query}
                                    suggestedCode={aiSuggestion}
                                    onAccept={handleAcceptSuggestion}
                                    onReject={handleRejectSuggestion}
                                    fontSize={fontSize}
                                    fontFamily={fontFamily.family}
                                />
                            </div>
                        ) : (
                            <CodeMirror
                                value={query}
                                height={editorHeight}
                                theme={selectedTheme.theme}
                                extensions={extensions}
                                onChange={(value) => setQuery(value)}
                                onCreateEditor={onCreateEditor}
                                className="code-editor"
                                style={{
                                    '--editor-font-size': `${fontSize}px`,
                                    '--editor-font-family': fontFamily.family
                                }}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        )}
                    </div>
                )
            }
            {/* Show resizer and results in fullscreen mode */}
            {
                isFullscreen && !isCollapsed && (
                    <>
                        <div
                            className={`fullscreen-resizer ${isFullscreenResizing ? 'resizing' : ''}`}
                            onMouseDown={handleFullscreenResizerMouseDown}
                        >
                            <div className="resizer-line"></div>
                            <div className="resizer-handle">
                                <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                                    <rect x="8" y="2" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
                                    <rect x="8" y="5" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
                                </svg>
                            </div>
                        </div>
                        <div style={{
                            flex: 1,
                            overflow: 'hidden',
                            background: 'var(--bg-canvas)',
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <ResultsTable
                                results={queryResults}
                                error={queryError}
                                isLoading={isExecuting}
                                executionTime={executionTime}
                            />
                        </div>
                    </>
                )
            }
        </Box >
    )
}

export default QueryEditor
