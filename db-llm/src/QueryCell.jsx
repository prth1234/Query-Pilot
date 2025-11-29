import { useState, useRef, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { autocompletion } from '@codemirror/autocomplete'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { PlayIcon, TrashIcon } from '@primer/octicons-react'
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
    isLast
}) {
    const [isExecuting, setIsExecuting] = useState(false)
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
        // Shift+Enter to run cell
        if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault()
            handleExecute()
        }
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

    return (
        <div className="query-cell">
            <div className="cell-header">
                <div className="cell-label">Query Cell</div>
                <div className="cell-actions">
                    <button
                        className="cell-run-button"
                        onClick={handleExecute}
                        disabled={isExecuting || !cell.query.trim()}
                        title="Run cell (Shift+Enter)"
                    >
                        <PlayIcon size={12} />
                        <span>{isExecuting ? 'Running...' : 'Run'}</span>
                    </button>
                    {!isFirst && (
                        <button
                            className="cell-delete-button"
                            onClick={() => onDelete(cell.id)}
                            title="Delete cell"
                        >
                            <TrashIcon size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="cell-editor-wrapper" onKeyDown={handleKeyDown}>
                <CodeMirror
                    value={cell.query}
                    height="auto"
                    minHeight="60px"
                    maxHeight="400px"
                    theme={vscodeDark}
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
                <div className="cell-results">
                    <ResultsTable
                        results={cell.results}
                        error={cell.error}
                        isLoading={isExecuting}
                        executionTime={cell.executionTime}
                    />
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
