import React from 'react'
import * as Diff from 'diff'
import './CodeDiffView.css'

function CodeDiffView({
    originalCode,
    suggestedCode,
    onAccept,
    onReject,
    fontSize,
    fontFamily
}) {
    // Compute line-by-line diff
    const diffResult = Diff.diffLines(originalCode, suggestedCode)

    const renderOriginalSide = () => {
        const lines = []
        let lineNumber = 1

        diffResult.forEach((part, partIndex) => {
            if (part.added) return // Skip added lines in original side

            const partLines = part.value.split('\n')
            if (partLines[partLines.length - 1] === '') {
                partLines.pop()
            }

            partLines.forEach((line, lineIndex) => {
                const type = part.removed ? 'removed' : 'unchanged'

                lines.push(
                    <div
                        key={`orig-${partIndex}-${lineIndex}`}
                        className={`diff-line ${type}`}
                    >
                        <span className="line-number">{lineNumber}</span>
                        <span className="line-indicator">
                            {type === 'removed' ? '-' : ' '}
                        </span>
                        <span className="line-content">{line || ' '}</span>
                    </div>
                )
                lineNumber++
            })
        })

        return lines
    }

    const renderSuggestedSide = () => {
        const lines = []
        let lineNumber = 1

        diffResult.forEach((part, partIndex) => {
            if (part.removed) return // Skip removed lines in suggested side

            const partLines = part.value.split('\n')
            if (partLines[partLines.length - 1] === '') {
                partLines.pop()
            }

            partLines.forEach((line, lineIndex) => {
                const type = part.added ? 'added' : 'unchanged'

                lines.push(
                    <div
                        key={`sugg-${partIndex}-${lineIndex}`}
                        className={`diff-line ${type}`}
                    >
                        <span className="line-number">{lineNumber}</span>
                        <span className="line-indicator">
                            {type === 'added' ? '+' : ' '}
                        </span>
                        <span className="line-content">{line || ' '}</span>
                    </div>
                )
                lineNumber++
            })
        })

        return lines
    }

    return (
        <div
            className="code-diff-view-sidebyside"
            style={{
                '--diff-font-size': `${fontSize}px`,
                '--diff-font-family': fontFamily
            }}
        >
            <div className="diff-container">
                {/* Original Code Side */}
                <div className="diff-pane original-pane">
                    <div className="diff-pane-header">Current Code</div>
                    <div className="diff-pane-content">
                        {renderOriginalSide()}
                    </div>
                </div>

                {/* Suggested Code Side with AI Glow */}
                <div className="diff-pane suggested-pane ai-suggestion-glow">
                    <div className="diff-pane-header suggested-header">
                        <span>AI Suggestion</span>
                        <div className="diff-actions">
                            <button className="diff-action-btn reject" onClick={onReject}>
                                <span>✕</span>
                                Reject
                            </button>
                            <button className="diff-action-btn accept" onClick={onAccept}>
                                <span>✓</span>
                                Accept
                            </button>
                        </div>
                    </div>
                    <div className="diff-pane-content">
                        {renderSuggestedSide()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodeDiffView
