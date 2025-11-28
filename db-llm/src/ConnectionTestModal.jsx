import { useEffect, useState } from 'react'
import { Box, Button } from '@primer/react-brand'
import './ConnectionTestModal.css'

function ConnectionTestModal({ isOpen, onClose, steps, isSuccess, errorMessage, onRetry, onNavigateToWorkspace }) {
    const [visibleSteps, setVisibleSteps] = useState([])
    const [showResult, setShowResult] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setVisibleSteps([])
            setShowResult(false)
            return
        }

        if (steps.length === 0) {
            setVisibleSteps([])
            setShowResult(false)
        } else {
            // Reset first to ensure clean slate
            setVisibleSteps([])
            setShowResult(false)

            const timeouts = []

            // Fast cascade animation: 50ms per step
            steps.forEach((step, index) => {
                const t = setTimeout(() => {
                    setVisibleSteps(prev => {
                        if (prev.find(s => s.id === step.id)) return prev
                        return [...prev, step]
                    })
                }, index * 50)
                timeouts.push(t)
            })

            // Show result quickly after steps
            const tResult = setTimeout(() => {
                setShowResult(true)
            }, steps.length * 50 + 100)
            timeouts.push(tResult)

            return () => timeouts.forEach(clearTimeout)
        }
    }, [isOpen, steps])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Genie animation effect */}
                <div className="genie-effect"></div>

                <Box className="modal-content">
                    <div className="modal-header">
                        <h2 style={{paddingBottom:15}}>Testing Connection</h2>
                        {/* <button className="close-button" onClick={onClose}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                            </svg>
                        </button> */}
                    </div>

                    {/* Show a fallback loader when there are no steps yet and result hasn't appeared */}
                    {visibleSteps.length === 0 && !showResult && (
                        <div className="fallback-loader">
                            <div className="spinner-large" aria-hidden="true"></div>
                            <div className="testing-text">Testing connection...</div>
                        </div>
                    )}

                    <div className="timeline-container">
                        {visibleSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`timeline-step ${step.status === 'completed' ? 'completed' : ''} ${step.status === 'failed' ? 'failed' : ''} ${step.status === 'in_progress' ? 'in-progress' : ''}`}
                            >
                                {/* Timeline connector */}
                                {index < visibleSteps.length - 1 && (
                                    <div className={`timeline-connector ${step.status === 'completed' ? 'active' : ''}`}></div>
                                )}

                                {/* Step icon */}
                                <div className="timeline-icon">
                                    {step.status === 'completed' ? (
                                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                            <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                                        </svg>
                                    ) : step.status === 'failed' ? (
                                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                                        </svg>
                                    ) : (
                                        <div className="spinner-small"></div>
                                    )}
                                </div>

                                {/* Step content */}
                                <div className="timeline-content">
                                    <div className="step-label">{step.label}</div>
                                    {step.error && (
                                        <div className="step-error">{step.error}</div>
                                    )}
                                    {step.tables_found !== undefined && (
                                        <div className="step-info">{step.tables_found} tables found</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Result section */}
                    {showResult && (
                        <div className={`result-section ${isSuccess ? 'success' : 'error'}`}>
                            <div className="result-icon">
                                {isSuccess ? (
                                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                                    </svg>
                                )}
                            </div>
                            <h3 className="result-title">
                                {isSuccess ? 'Connection Successful!' : 'Connection Failed'}
                            </h3>
                            <p className="result-message">
                                {isSuccess
                                    ? 'Your database is ready to use. You can now proceed to your workspace.'
                                    : errorMessage || 'Unable to connect to the database. Please check your credentials and try again.'
                                }
                            </p>

                            <div className="result-actions">
                                {isSuccess ? (
                                    <>
                                        <Button
                                            variant="primary"
                                            onClick={onNavigateToWorkspace}
                                            className="action-button primary"
                                        >
                                            Go to Workspace
                                        </Button>
                                        <Button
                                            variant="invisible"
                                            onClick={onClose}
                                            className="action-button"
                                        >
                                            Close
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="primary"
                                            onClick={onRetry}
                                            className="action-button primary"
                                        >
                                            Try Again
                                        </Button>
                                        <Button
                                            variant="invisible"
                                            onClick={onClose}
                                            className="action-button"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Box>
            </div>
        </div>
    )
}

export default ConnectionTestModal
