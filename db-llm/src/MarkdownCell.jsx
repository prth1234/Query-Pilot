import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import ReactMarkdown from 'react-markdown'
import { TrashIcon, PencilIcon, EyeIcon, CheckIcon } from '@primer/octicons-react'
import './QueryCell.css'

function MarkdownCell({ cell, onChange, onDelete, isFirst, theme, fontSize, fontFamily }) {
    const [isEditing, setIsEditing] = useState(!cell.content)

    const toggleMode = () => setIsEditing(!isEditing)

    return (
        <div className="query-cell markdown-cell">
            <div className="cell-header">
                <div className="cell-left-actions">
                    <div className="cell-label" style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-default)' }}>
                        Markdown
                    </div>
                </div>
                <div className="cell-right-actions">
                    {isEditing ? (
                        <button
                            className="cell-action-button"
                            onClick={() => setIsEditing(false)}
                            title="Done (Show as text)"
                            style={{ color: 'var(--success-fg)' }}
                        >
                            <CheckIcon size={14} />
                        </button>
                    ) : (
                        <button
                            className="cell-action-button"
                            onClick={() => setIsEditing(true)}
                            title="Edit markdown"
                        >
                            <PencilIcon size={14} />
                        </button>
                    )}
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

            <div className="cell-content-wrapper">
                {isEditing ? (
                    <div className="cell-editor-wrapper">
                        <CodeMirror
                            value={cell.content || ''}
                            height="auto"
                            minHeight="60px"
                            theme={theme?.theme || vscodeDark}
                            extensions={[markdown()]}
                            onChange={(val) => onChange(cell.id, val)}
                            className="cell-editor"
                            style={{
                                '--editor-font-size': `${fontSize || 13}px`,
                                '--editor-font-family': fontFamily?.family
                            }}
                            basicSetup={{
                                lineNumbers: false,
                                foldGutter: false,
                            }}
                        />
                        {/* Live Preview in Edit Mode */}
                        {cell.content && (
                            <div className="markdown-live-preview" style={{
                                borderTop: '1px dashed var(--border-default)',
                                padding: '12px',
                                background: 'var(--bg-canvas-subtle)'
                            }}>
                                <div style={{
                                    fontSize: '10px',
                                    color: 'var(--fg-muted)',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>
                                    Preview
                                </div>
                                <div className="markdown-preview" style={{ padding: 0, minHeight: 'auto' }}>
                                    <ReactMarkdown>{cell.content}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="markdown-preview" onDoubleClick={() => setIsEditing(true)}>
                        <ReactMarkdown>{cell.content || '*Double click to edit*'}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MarkdownCell
