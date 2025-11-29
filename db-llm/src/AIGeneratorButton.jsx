import React from 'react'
import queryPilotLogo from './assets/query-pilot-logo.png'
import './AIGeneratorButton.css'

function AIGeneratorButton({ onClick, isGenerating }) {
    return (
        <button
            className={`ai-generator-button ${isGenerating ? 'generating' : ''}`}
            onClick={onClick}
            disabled={isGenerating}
        >
            <div className="ai-button-glow"></div>
            <div className="ai-button-content">
                <img src={queryPilotLogo} alt="Query Pilot" style={{ width: 16, height: 16 }} />
                <span className="ai-button-text">Query Pilot</span>
            </div>
        </button>
    )
}

export default AIGeneratorButton
