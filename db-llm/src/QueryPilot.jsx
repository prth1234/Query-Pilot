import { useState, useRef, useEffect } from 'react'
import queryPilotLogo from './assets/query-pilot-logo.png'
import BorderGlow from './BorderGlow'
import { FaArrowCircleUp } from "react-icons/fa"
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
    const [prompt, setPrompt] = useState('')
    const [suggestion, setSuggestion] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [diffLines, setDiffLines] = useState([])
    const textareaRef = useRef(null)

    // Auto-focus the textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [])

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

    const handleRun = async () => {
        if (!prompt.trim()) return
        setError(null)
        setIsLoading(true)
        setSuggestion(null)

        try {
            const hasQuery = Boolean(currentQuery && currentQuery.trim())
            const schemaCtx = buildSchemaContext()
            
            const systemPrompt = `You are an elite SQL Database Architect and helpful Query Pilot AI advisor.
Your goal is to assist with SQL tasks—debugging, generation, and optimizing—while also answering general technical questions about databases.

${schemaCtx ? `STRICT SCHEMA CONTEXT:\n${schemaCtx}` : ''}

CRITICAL RULES:
1. ALWAYS prioritize answering the User's explicit intent. 
2. If the user asks a general question, provides advice, or says hi, answer them first.
3. ALL conversational text MUST be prefixed with '# ' (standard SQL comment).
4. If providing code, only return raw, executable SQL (e.g., SELECT ...).
5. DO NOT use markdown code blocks (\`\`\`). Only return plain text (where comments start with #).
6. IF you are fixing/optimizing a query, only return the corrected SQL (plus any advice as '#' comments).`
            
            const userPrompt = `USER INTENT: ${prompt}
${hasQuery ? `\nCURRENT SQL IN EDITOR:\n${currentQuery}` : ''}`

            const raw = await callLLM(systemPrompt, userPrompt)
            const sql = extractSQL(raw)
            setSuggestion(sql)
            setDiffLines(computeDiff(currentQuery || '', sql))
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
        // Enter sends, Shift + Enter creates new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleRun()
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
                    <button className="qp-close-btn" onClick={onClose} title="Close Query Pilot">✕</button>
                </div>
            </div>

            {/* Input area */}
            <div className="qp-input-section">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="qp-magic-textarea-wrap" style={{ flex: 1 }}>
                        <div className="qp-magic-textarea-glow" />
                        <textarea
                            ref={textareaRef}
                            className="qp-magic-textarea"
                            placeholder={currentQuery && currentQuery.trim() ? "Describe how to optimize or fix the current query..." : "Describe the SQL to generate (e.g., Get all active users)..."}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={isLoading || (!prompt.trim() && (!currentQuery || !currentQuery.trim()))}
                        style={{
                            background: 'transparent',
                            color: '#3fb950',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            cursor: isLoading || (!prompt.trim() && (!currentQuery || !currentQuery.trim())) ? 'not-allowed' : 'pointer',
                            padding: 0,
                            margin: 0,
                            flexShrink: 0,
                            transition: 'transform 0.1s, opacity 0.2s',
                            opacity: isLoading || (!prompt.trim() && (!currentQuery || !currentQuery.trim())) ? 0.3 : 1
                        }}
                        title="Run Query Pilot"
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {isLoading ? <span className="qp-spinner" style={{width: 16, height: 16, borderTopColor: '#3fb950', borderColor: 'rgba(63, 185, 80, 0.3)'}} /> : <FaArrowCircleUp />}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="qp-error">
                    <span className="qp-error-icon">⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Diff / Result / Chat Bubble */}
            {suggestion && (
                <div className="qp-result">
                    {/* If more than 50% lines are comments or has no SQL keywords, treat as message */}
                    {suggestion && (suggestion.split('\n').filter(l => l.trim().startsWith('#')).length / suggestion.split('\n').filter(l => l.trim() !== '').length > 0.5 || !suggestion.match(/SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP/i)) ? (
                        <div className="qp-chat-bubble">
                            <div className="qp-chat-content">
                                {suggestion.split('\n').map((l, idx) => (
                                    <div key={idx} style={{ marginBottom: idx === suggestion.split('\n').length - 1 ? 0 : 2 }}>
                                        {l.replace(/^#\s*/, '')}
                                    </div>
                                ))}
                            </div>
                            <div className="qp-chat-actions">
                                <button className="qp-action-btn reject" onClick={handleReject}>Dismiss</button>
                                <button className="qp-action-btn accept" onClick={handleAccept}>Add to Editor</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="qp-result-header">
                                <div className="qp-result-title">
                                    <span className="qp-result-icon">◈</span>
                                    AI Suggestion
                                </div>
                                <div className="qp-result-actions">
                                    <button className="qp-action-btn reject" onClick={handleReject}>✕ Reject</button>
                                    <button className="qp-action-btn accept" onClick={handleAccept}>✓ Accept</button>
                                </div>
                            </div>
                            <div className="qp-diff-view">
                                {diffLines.map((line, idx) => (
                                    <div key={idx} className={`qp-diff-line ${line.type}`}>
                                        <div className="qp-diff-indicator">
                                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                        </div>
                                        <div className="qp-diff-text">{line.text}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="qp-legend">
                                <span className="qp-legend-item removed"><span className="qp-dot red" />Removed</span>
                                <span className="qp-legend-item added"><span className="qp-dot green" />Added</span>
                                <span className="qp-legend-hint">⌘ + Enter to accept</span>
                            </div>
                        </>
                    )}
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
