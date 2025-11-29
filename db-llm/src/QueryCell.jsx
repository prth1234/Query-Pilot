import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { autocompletion } from '@codemirror/autocomplete'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
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
    fontSize,
    cellRef // New prop for focusing
}) {
    const [isExecuting, setIsExecuting] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const viewRef = useRef(null)
    const queryRef = useRef(cell.query)
    const editorContainerRef = useRef(null)

    // Update query ref when cell query changes
    useEffect(() => {
        queryRef.current = cell.query
    }, [cell.query])

    const onCreateEditor = (view) => {
        viewRef.current = view
    }

    const handleExecute = useCallback(async () => {
        const currentQuery = queryRef.current
        if (isExecuting || !currentQuery.trim()) return

        setIsExecuting(true)
        try {
            await onExecute(cell.id, currentQuery)
        } finally {
            setIsExecuting(false)
        }
    }, [isExecuting, cell.id, onExecute])

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

        // Add keymap to execute query with highest precedence
        exts.push(Prec.highest(keymap.of([
            {
                key: 'Mod-Enter',
                run: (view) => {
                    handleExecute()
                    return true
                }
            },
            {
                key: 'Shift-Enter',
                run: (view) => {
                    handleExecute()
                    return true
                }
            }
        ])))

        return exts
    }, [schema, handleExecute])

    // Resizable Logic
    const [editorHeight, setEditorHeight] = useState(80) // Reduced to ~3 lines
    const [resultsHeight, setResultsHeight] = useState(null)
    const [isResizing, setIsResizing] = useState(false)
    const [resizeTarget, setResizeTarget] = useState(null) // 'middle' or 'bottom'
    const [resizeStart, setResizeStart] = useState({ y: 0, editor: 0, results: 0 })

    const resultsRef = useRef(null)

    // Auto-calculate height based on results
    useEffect(() => {
        if (cell.results && cell.results.rows) {
            const rowCount = cell.results.rows.length
            const rowHeight = 42 // Actual row height in table
            const headerHeight = 100 // Results header + table header + filters
            const footerHeight = 50 // Pagination footer + padding

            // Always cap initial display at 5 rows
            // User can resize to see more
            const visibleRows = Math.min(rowCount, 5)
            let targetHeight = headerHeight + (visibleRows * rowHeight) + footerHeight

            // Ensure reasonable minimum (at least 200px)
            targetHeight = Math.max(targetHeight, 200)
            setResultsHeight(targetHeight)
        }
    }, [cell.results])

    const handleMouseDown = (e, target) => {
        setIsResizing(true)
        setResizeTarget(target)
        setResizeStart({
            y: e.clientY,
            editor: editorHeight,
            results: resultsHeight || 300
        })
        e.preventDefault()
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return

            const delta = e.clientY - resizeStart.y

            if (resizeTarget === 'middle') {
                // Middle resizer: Adjust split between code and results
                // Hinged behavior - one grows, other shrinks
                let newEditorHeight = resizeStart.editor + delta
                let newResultsHeight = resizeStart.results - delta

                const minHeight = 60
                const maxTotal = resizeStart.editor + resizeStart.results

                if (newEditorHeight < minHeight) {
                    newEditorHeight = minHeight
                    newResultsHeight = maxTotal - minHeight
                } else if (newResultsHeight < minHeight) {
                    newResultsHeight = minHeight
                    newEditorHeight = maxTotal - minHeight
                }

                setEditorHeight(newEditorHeight)
                setResultsHeight(newResultsHeight)
            } else if (resizeTarget === 'bottom') {
                // Bottom resizer: Resize WHOLE CELL (code block + result block)
                // Distribution: 25% to code block, 75% to result block
                const editorGrowth = delta * 0.25
                const resultsGrowth = delta * 0.75

                let newEditorHeight = resizeStart.editor + editorGrowth
                let newResultsHeight = resizeStart.results + resultsGrowth

                const minHeight = 60

                if (newEditorHeight < minHeight) {
                    newEditorHeight = minHeight
                }
                if (newResultsHeight < minHeight) {
                    newResultsHeight = minHeight
                }

                setEditorHeight(newEditorHeight)
                setResultsHeight(newResultsHeight)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            setResizeTarget(null)
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, resizeTarget, resizeStart])


    return (
        <div className={`query-cell ${isFullScreen ? 'fullscreen' : ''}`} ref={cellRef}>
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

            <div className="cell-editor-wrapper" ref={editorContainerRef}>
                <CodeMirror
                    value={cell.query}
                    height={isFullScreen ? "100%" : `${editorHeight}px`}
                    minHeight="60px"
                    maxHeight={isFullScreen ? "none" : "none"}
                    theme={theme?.theme || vscodeDark}
                    extensions={extensions}
                    onChange={(value) => onQueryChange(cell.id, value)}
                    onCreateEditor={onCreateEditor}
                    className="cell-editor"
                    style={{
                        '--editor-font-size': `${fontSize || 13}px`,
                        '--editor-font-family': fontFamily?.family || "'SF Mono', 'Monaco', 'Courier New', monospace"
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
                <>
                    <div
                        className={`cell-resizer ${isResizing && resizeTarget === 'middle' ? 'resizing' : ''}`}
                        onMouseDown={(e) => handleMouseDown(e, 'middle')}
                        title="Drag to adjust split between code and results"
                    >
                        <div className="cell-resizer-handle"></div>
                    </div>
                    <div
                        className="cell-results-wrapper"
                        style={{
                            height: resultsHeight ? `${resultsHeight}px` : 'auto'
                        }}
                        ref={resultsRef}
                    >
                        <div className="cell-results-container">
                            <ResultsTable
                                results={cell.results}
                                error={cell.error}
                                isLoading={isExecuting}
                                executionTime={cell.executionTime}
                                compact={false}
                            />
                        </div>
                        <div
                            className={`cell-resizer bottom ${isResizing && resizeTarget === 'bottom' ? 'resizing' : ''}`}
                            onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                            title="Drag to expand entire cell (code + results)"
                        >
                            <div className="cell-resizer-handle horizontal"></div>
                        </div>
                    </div>
                </>
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
