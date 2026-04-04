import { useState, useRef, useEffect } from 'react'
import queryPilotLogo from './assets/query-pilot-logo.png'
import './QueryPilot.css'

const API_BASE = 'http://localhost:8000'

/**
 * QueryPilot – AI-powered SQL assistant panel.
 *
 * Props:
 *   currentQuery   – the SQL currently in the editor
 *   schema         – { tables: [...] } for context
 *   onAccept(sql)  – called when user accepts a suggestion
 *   onClose()      – called to dismiss the panel
 */
function QueryPilot({ currentQuery, schema, onAccept, onClose }) {
    const [mode, setMode] = useState('fix')   // 'fix' | 'generate'
    const [prompt, setPrompt] = useState('')
    const [suggestion, setSuggestion] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [diffLines, setDiffLines] = useState([])
    const textareaRef = useRef(null)

    // Auto-focus the textarea when switching to generate mode
    useEffect(() => {
        if (mode === 'generate' && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [mode])

    // Build schema context string
    const buildSchemaContext = () => {
        if (!schema?.tables?.length) return ''
        const tableLines = schema.tables.map(t => {
            const cols = t.columns?.map(c => `${c.name} ${c.type}`).join(', ') || ''
            return `  ${t.name}(${cols})`
        })
        return `Database schema:\n${tableLines.join('\n')}\n\n`
    }

    const callLLM = async (systemPrompt, userPrompt) => {
        const response = await fetch(`${API_BASE}/api/query-pilot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_prompt: systemPrompt, user_prompt: userPrompt })
        })
        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'LLM request failed' }))
            throw new Error(err.detail || 'LLM request failed')
        }
        const data = await response.json()
        return data.sql
    }

    const extractSQL = (text) => {
        // strip markdown code fences if present
        const fenceMatch = text.match(/```(?:sql)?\s*([\s\S]*?)```/i)
        if (fenceMatch) return fenceMatch[1].trim()
        return text.trim()
    }

    const computeDiff = (original, suggested) => {
        const origLines = original.split('\n')
        const suggLines = suggested.split('\n')

        // Simple LCS-based diff
        const m = origLines.length
        const n = suggLines.length

        // Build LCS table
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (origLines[i - 1] === suggLines[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                }
            }
        }

        // Backtrack to find diff
        const result = []
        let i = m, j = n
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && origLines[i - 1] === suggLines[j - 1]) {
                result.unshift({ type: 'unchanged', text: origLines[i - 1] })
                i--; j--
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                result.unshift({ type: 'added', text: suggLines[j - 1] })
                j--
            } else {
                result.unshift({ type: 'removed', text: origLines[i - 1] })
                i--
            }
        }
        return result
    }

    const handleFix = async () => {
        setError(null)
        setIsLoading(true)
        setSuggestion(null)

        try {
            const schemaCtx = buildSchemaContext()
            const systemPrompt = `You are an elite SQL Database Architect and Query Optimization Expert.
Your purpose is to debug, fix, and optimize SQL queries with absolute precision and high performance.
Ensure strict adherence to best practices, robust indexing conventions, and execution efficiency.

${schemaCtx ? `STRICT SCHEMA CONTEXT:\n${schemaCtx}` : ''}
CRITICAL RULES:
1. ONLY return the raw, executable SQL query.
2. DO NOT wrap the SQL in markdown blocks (e.g., no \`\`\`sql).
3. DO NOT include any conversational text, prose, or formatting before or after the SQL block.
4. Fix syntax errors and resolve illogical joins, but otherwise maintain the valid structure of the query.
5. Format the resulting string with clean, readable indentation and uppercase SQL keywords.`
            
            const userPrompt = `TASK: FIX AND OPTIMIZE QUERY
${prompt.trim() ? `USER INSTRUCTIONS: ${prompt}\n` : ''}
CURRENT QUERY:
${currentQuery}`

            const raw = await callLLM(systemPrompt, userPrompt)
            const sql = extractSQL(raw)
            setSuggestion(sql)
            setDiffLines(computeDiff(currentQuery, sql))
        } catch (e) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setError(null)
        setIsLoading(true)
        setSuggestion(null)

        try {
            const schemaCtx = buildSchemaContext()
            const systemPrompt = `You are an elite SQL Database Architect and Query Optimization Expert.
Your purpose is to generate high-performance, complex SQL queries from natural language requests.
Ensure strict adherence to best practices, robust indexing conventions, and execution efficiency.

${schemaCtx ? `STRICT SCHEMA CONTEXT:\n${schemaCtx}` : ''}
CRITICAL RULES:
1. ONLY return the raw, executable SQL query.
2. DO NOT wrap the SQL in markdown blocks (e.g., no \`\`\`sql).
3. DO NOT include any conversational text, prose, or formatting before or after the SQL block.
4. Ensure the query is perfectly optimized and fully functional out-of-the-box.
5. Format the resulting string with clean, readable indentation and uppercase SQL keywords.`
            
            const userPrompt = `TASK: GENERATE SQL QUERY
INTENT: ${prompt}`

            const raw = await callLLM(systemPrompt, userPrompt)
            const sql = extractSQL(raw)
            setSuggestion(sql)
            setDiffLines(computeDiff('', sql))
        } catch (e) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAccept = () => {
        if (suggestion) {
            onAccept(suggestion)
            setSuggestion(null)
            setPrompt('')
        }
    }

    const handleReject = () => {
        setSuggestion(null)
        setDiffLines([])
    }

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            if (mode === 'fix') handleFix()
            else handleGenerate()
        }
    }

    return (
        <div className="qp-panel">
            {/* Header */}
            <div className="qp-header">
                <div className="qp-header-left">
                    <div className="qp-logo-wrap">
                        <img src={queryPilotLogo} alt="Query Pilot" className="qp-logo" />
                        <div className="qp-logo-glow" />
                    </div>
                    <span className="qp-title">Query Pilot</span>
                    <span className="qp-badge">AI</span>
                </div>
                <div className="qp-header-right">
                    <div className="qp-mode-toggle">
                        <button
                            className={`qp-mode-btn ${mode === 'fix' ? 'active' : ''}`}
                            onClick={() => { setMode('fix'); setSuggestion(null); setError(null) }}
                        >
                            ✦ Fix Code
                        </button>
                        <button
                            className={`qp-mode-btn ${mode === 'generate' ? 'active' : ''}`}
                            onClick={() => { setMode('generate'); setSuggestion(null); setError(null) }}
                        >
                            ✦ Generate
                        </button>
                    </div>
                    <button className="qp-close-btn" onClick={onClose} title="Close Query Pilot">✕</button>
                </div>
            </div>

            {/* Input area */}
            <div className="qp-input-section">
                {mode === 'fix' ? (
                    <div className="qp-fix-area">
                        <div className="qp-magic-input-wrap">
                            <div className="qp-magic-glow" />
                            <input
                                type="text"
                                className="qp-magic-input"
                                placeholder="Optional: describe what to fix, or leave blank to auto-improve…"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            className={`qp-run-btn ${isLoading ? 'loading' : ''}`}
                            onClick={handleFix}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? <><span className="qp-spinner" /> Thinking…</>
                                : <><span className="qp-btn-icon"></span> Fix Query</>
                            }
                        </button>
                    </div>
                ) : (
                    <div className="qp-generate-area">
                        <div className="qp-magic-textarea-wrap">
                            <div className="qp-magic-textarea-glow" />
                            <textarea
                                ref={textareaRef}
                                className="qp-magic-textarea"
                                placeholder="Describe the SQL you want… e.g. 'Get all users who placed more than 3 orders last month'"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                            />
                        </div>
                        <button
                            className={`qp-run-btn ${isLoading ? 'loading' : ''}`}
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading
                                ? <><span className="qp-spinner" /> Generating…</>
                                : <><span className="qp-btn-icon"></span> Generate SQL</>
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="qp-error">
                    <span className="qp-error-icon">⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Diff / Result */}
            {suggestion && (
                <div className="qp-result">
                    <div className="qp-result-header">
                        <div className="qp-result-title">
                            <span className="qp-result-icon">◈</span>
                            AI Suggestion
                        </div>
                        <div className="qp-result-actions">
                            <button className="qp-action-btn reject" onClick={handleReject}>
                                <span>✕</span> Reject
                            </button>
                            <button className="qp-action-btn accept" onClick={handleAccept}>
                                <span>✓</span> Accept
                            </button>
                        </div>
                    </div>

                    <div className="qp-diff-view">
                        {diffLines.map((line, idx) => (
                            <div key={idx} className={`qp-diff-line ${line.type}`}>
                                <span className="qp-diff-indicator">
                                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                </span>
                                <span className="qp-diff-text">{line.text || ' '}</span>
                            </div>
                        ))}
                    </div>

                    <div className="qp-legend">
                        <span className="qp-legend-item removed"><span className="qp-dot red" />Removed</span>
                        <span className="qp-legend-item added"><span className="qp-dot green" />Added</span>
                        <span className="qp-legend-hint">⌘ + Enter to accept</span>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && !suggestion && (
                <div className="qp-skeleton">
                    <div className="qp-skeleton-bar" style={{ width: '80%' }} />
                    <div className="qp-skeleton-bar" style={{ width: '60%' }} />
                    <div className="qp-skeleton-bar" style={{ width: '70%' }} />
                    <div className="qp-skeleton-bar" style={{ width: '50%' }} />
                    <div className="qp-skeleton-label">
                        <span className="qp-spinner" /> Llama 3.2 is thinking…
                    </div>
                </div>
            )}
        </div>
    )
}

export default QueryPilot
