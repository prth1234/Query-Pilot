import { useState, useRef, useMemo, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { autocompletion } from '@codemirror/autocomplete'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { PlayIcon, TrashIcon, ScreenFullIcon, ScreenNormalIcon } from '@primer/octicons-react'
import { createSQLAutocomplete } from './sqlAutocomplete'
import ResultsTable from './ResultsTable'
import './QueryCell.css'

function QueryCell({
    cell,
    onExecute,
    onDelete,
    onQueryChange,
    schema,
    isFirst,
    isLast,
    theme,
    fontFamily,
    fontSize
}) {
    const [isExecuting, setIsExecuting] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const viewRef = useRef(null)

    const onCreateEditor = (view) => {
        viewRef.current = view
    }

    const handleExecute = async () => {
        if (isExecuting || !cell.query.trim()) return

        setIsExecuting(true)
        try {
            await onExecute(cell.id, cell.query)
        } finally {
            setIsExecuting(false)
        }
    }

    const handleKeyDown = (event) => {
        // Shift+Enter or Cmd+Enter (Mac) or Ctrl+Enter (Windows) to run cell
        if ((event.shiftKey && event.key === 'Enter') ||
            ((event.metaKey || event.ctrlKey) && event.key === 'Enter')) {
            event.preventDefault()
            handleExecute()
        }
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen)
    }

    // Memoize extensions with schema-aware autocomplete
    const extensions = useMemo(() => {
        const exts = [sql()]

        if (schema && schema.tables) {
            const customAutocomplete = autocompletion({
                override: [createSQLAutocomplete(schema)],
                activateOnTyping: true,
                maxRenderedOptions: 15,
                defaultKeymap: true
            })
            exts.push(customAutocomplete)
        }

        return exts
    }, [schema])

    // Resizable Results Logic
    const [resultsHeight, setResultsHeight] = useState(300)
    const [isResizing, setIsResizing] = useState(false)
    const resultsRef = useRef(null)

    const handleMouseDown = (e) => {
        setIsResizing(true)
        e.preventDefault()
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return

            // Calculate new height based on mouse movement relative to the results container top
            // Since we don't have a ref to the container top easily available in this context without more refs,
            // we can use the movementY or just track the initial click.
            // A simpler way for a bottom resizer:
            // New height = current mouse Y - results top Y
            if (resultsRef.current) {
                const rect = resultsRef.current.getBoundingClientRect()
                const newHeight = e.clientY - rect.top
                if (newHeight > 100 && newHeight < 800) {
                    setResultsHeight(newHeight)
                }
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

    // Apply font styles to editor
    const editorStyle = {
        fontSize: `${fontSize} px`,
        fontFamily: fontFamily?.family || 'monospace'
    }

    return (
        <div className={`query - cell ${isFullScreen ? 'fullscreen' : ''} `}>
            <div className="cell-header">
                <div className="cell-left-actions">
                    <button
                        className="cell-run-button-icon"
                        onClick={handleExecute}
                        disabled={isExecuting || !cell.query.trim()}
                        title="Run cell (Cmd+Enter or Shift+Enter)"
                    >
                        <PlayIcon size={16} />
                    </button>
                    <div className="cell-label">Query Cell</div>
                </div>
                <div className="cell-right-actions">
                    <button
                        className="cell-action-button"
                        onClick={toggleFullScreen}
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen Editor"}
                    >
                        {isFullScreen ? <ScreenNormalIcon size={14} /> : <ScreenFullIcon size={14} />}
                    </button>
                    {!isFirst && (
                        <button
                            className="cell-delete-button"
                            onClick={() => onDelete(cell.id)}
                            title="Delete cell"
                        >
                            <TrashIcon size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="cell-editor-wrapper" onKeyDown={handleKeyDown} style={editorStyle}>
                <CodeMirror
                    value={cell.query}
                    height={isFullScreen ? "100%" : "auto"}
                    minHeight="60px"
                    maxHeight={isFullScreen ? "none" : "300px"}
                    theme={theme?.theme || vscodeDark}
                    extensions={extensions}
                    onChange={(value) => onQueryChange(cell.id, value)}
                    onCreateEditor={onCreateEditor}
                    className="cell-editor"
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

            {cell.results && (
                <div
                    className="cell-results-wrapper"
                    style={{ height: resultsHeight }}
                    ref={resultsRef}
                >
                    <div className="cell-results-container">
                        <ResultsTable
                            results={cell.results}
                            error={cell.error}
                            isLoading={isExecuting}
                            executionTime={cell.executionTime}
                        />
                    </div>
                    <div
                        className={`cell - resizer ${isResizing ? 'resizing' : ''} `}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="cell-resizer-handle"></div>
                    </div>
                </div>
            )}

            {cell.error && !cell.results && (
                <div className="cell-error">
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">{cell.error}</div>
                </div>
            )}
        </div>
    )
}

export default QueryCell
