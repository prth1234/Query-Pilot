import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, Button } from '@primer/react-brand'
import NumberTicker from './magic/NumberTicker'
import './ConnectionTestModal.css'

function ConnectionTestModal({ isOpen, onClose, steps, isSuccess, errorMessage, onRetry, onNavigateToWorkspace }) {
    const [visibleSteps, setVisibleSteps] = useState([])
    const [showResult, setShowResult] = useState(false)
    // Indeterminate progress while the backend hasn't sent steps yet
    const [pulse, setPulse] = useState(0)

    useEffect(() => {
        if (!isOpen) {
            setVisibleSteps([])
            setShowResult(false)
            setPulse(0)
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

    // Gently advance an indeterminate readout until real steps arrive
    useEffect(() => {
        if (!isOpen || showResult || steps.length > 0) return
        const id = setInterval(() => {
            setPulse((p) => Math.min(90, p + 2 + Math.round(Math.random() * 5)))
        }, 350)
        return () => clearInterval(id)
    }, [isOpen, showResult, steps.length])

    if (!isOpen) return null

    const progress = steps.length > 0
        ? Math.round((visibleSteps.length / steps.length) * 100)
        : pulse
    const statusLabel = showResult
        ? (isSuccess ? 'Connection successful' : 'Connection failed')
        : visibleSteps.length > 0
            ? visibleSteps[visibleSteps.length - 1].label
            : 'Contacting server…'

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <Box className="modal-content">
                    <div className="modal-header">
                        <h2 style={{ paddingBottom: 15, fontSize: 40 }}>Testing Connection</h2>
                        <button className="close-button" onClick={onClose}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Ticker progress readout while the test runs */}
                    {!showResult && (
                        <div className="ticker-loader">
                            <div className="ticker-value">
                                <NumberTicker value={progress} duration={0.6} />
                                <span className="ticker-pct">%</span>
                            </div>
                            <div className="ticker-track">
                                <div className="ticker-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="ticker-status">{statusLabel}</div>
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
                            <div className="result-icon-container">
                                {isSuccess ? (
                                    <div className="pro-result-icon success">
                                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="pro-result-icon error">
                                        <svg className="crossmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                            <circle className="crossmark__circle" cx="26" cy="26" r="25" fill="none" />
                                            <path className="crossmark__check" fill="none" d="M16 16 36 36 M36 16 16 36" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h3 className="result-title">
                                {isSuccess ? 'Connection Successful!' : 'Connection Failed'}
                            </h3>
                            <p className="result-message">
                                {isSuccess
                                    ? 'Your database is ready to use.'
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
        </div>,
        document.body
    )
}

export default ConnectionTestModal
