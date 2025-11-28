import { useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { EditorView } from "@codemirror/view"
import { Box } from '@primer/react-brand'
import { PlayIcon, ChevronDownIcon, GearIcon } from '@primer/octicons-react'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { githubDark } from '@uiw/codemirror-theme-github'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'
import './QueryEditor.css'

const RUN_OPTIONS = [
    { label: 'Run Limit 1000', value: 1000 },
    { label: 'Run Top 100', value: 100 },
    { label: 'Run Top 500', value: 500 },
    { label: 'Run Top 5000', value: 5000 },
    { label: 'Run All', value: -1 }
]

const THEMES = [
    { name: 'VS Code Dark', value: 'vscode', theme: vscodeDark },
    { name: 'GitHub Dark', value: 'github', theme: githubDark },
    { name: 'Dracula', value: 'dracula', theme: dracula },
    { name: 'Tokyo Night', value: 'tokyo', theme: tokyoNight }
]

function QueryEditor({ onExecuteQuery, isExecuting }) {
    const [query, setQuery] = useState('SELECT * FROM your_table;') // Removed LIMIT 10
    const [selectedLimit, setSelectedLimit] = useState(RUN_OPTIONS[0])
    const [showLimitDropdown, setShowLimitDropdown] = useState(false)
    const [showThemeDropdown, setShowThemeDropdown] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
    const [fontSize, setFontSize] = useState(13)

    const limitDropdownRef = useRef(null)
    const themeDropdownRef = useRef(null)

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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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

    const handleKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            handleExecute()
        }
    }

    // Create a theme extension for font size
    const fontSizeExtension = EditorView.theme({
        "&": {
            fontSize: `${fontSize}px !important`
        },
        ".cm-content": {
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace !important"
        },
        ".cm-gutters": {
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace !important"
        }
    })

    return (
        <Box className="query-editor-container">
            <div className="editor-header">
                <div className="editor-title">SQL Query</div>
                <div className="editor-actions">
                    {/* Theme Selector */}
                    <div className="theme-selector" ref={themeDropdownRef}>
                        <button
                            className="theme-button"
                            onClick={() => {
                                setShowThemeDropdown(!showThemeDropdown)
                                setShowLimitDropdown(false)
                            }}
                        >
                            <GearIcon size={14} />
                        </button>
                        {showThemeDropdown && (
                            <div className="dropdown-menu theme-dropdown">
                                <div className="dropdown-content-row">
                                    <div className="dropdown-section font-section">
                                        <div className="dropdown-label">Font Size</div>
                                        {[11, 12, 13, 14, 15, 16].map(size => (
                                            <div
                                                key={size}
                                                className={`dropdown-item ${fontSize === size ? 'active' : ''}`}
                                                onClick={() => {
                                                    setFontSize(size)
                                                }}
                                            >
                                                {size}px
                                            </div>
                                        ))}
                                    </div>
                                    <div className="dropdown-divider-vertical"></div>
                                    <div className="dropdown-section theme-section">
                                        <div className="dropdown-label">Theme</div>
                                        {THEMES.map(theme => (
                                            <div
                                                key={theme.value}
                                                className={`dropdown-item ${selectedTheme.value === theme.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedTheme(theme)
                                                    // Don't close, allow font selection
                                                }}
                                            >
                                                {theme.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Run Button Group */}
                    <div className="run-button-group" ref={limitDropdownRef}>
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
            <div className="editor-wrapper" onKeyDown={handleKeyDown}>
                <CodeMirror
                    value={query}
                    height="200px"
                    theme={selectedTheme.theme}
                    extensions={[sql(), fontSizeExtension]}
                    onChange={(value) => setQuery(value)}
                    onCreateEditor={onCreateEditor}
                    className="code-editor"
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
            </div>
        </Box>
    )
}

export default QueryEditor
