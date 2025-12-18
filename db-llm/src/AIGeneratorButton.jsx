import React from 'react'
import queryPilotLogo from './assets/query-pilot-logo.png'
import './AIGeneratorButton.css'

function AIGeneratorButton({ onClick, isGenerating, disabled = true }) {
    return (
        <button
            className={`ai-generator-button ${isGenerating ? 'generating' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={disabled ? null : onClick}
            disabled={disabled || isGenerating}
            title={disabled ? "Query Pilot - Coming Soon" : "Generate SQL with AI"}
        >
            <div className="ai-button-glow"></div>
            <div className="ai-button-content">
                <img src={queryPilotLogo} alt="Query Pilot" style={{ width: 16, height: 16, opacity: disabled ? 0.5 : 1 }} />
                <span className="ai-button-text">Query Pilot</span>
            </div>
        </button>
    )
}

export default AIGeneratorButton
