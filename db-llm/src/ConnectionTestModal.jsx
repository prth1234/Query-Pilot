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
                        <h2 style={{ paddingBottom: 15, fontSize: 40 }}>Testing Connection</h2>
                        {/* <button className="close-button" onClick={onClose}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                            </svg>
                        </button> */}
                    </div>

                    {/* Show a fallback loader when there are no steps yet and result hasn't appeared */}
                    {visibleSteps.length === 0 && !showResult && (
                        <div className="fallback-loader">
                            <div className="earth-loader">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                    <path
                                        transform="translate(100 100)"
                                        d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                                        fill="#7CC133"
                                    ></path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                    <path
                                        transform="translate(100 100)"
                                        d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                        fill="#7CC133"
                                    ></path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                    <path
                                        transform="translate(100 100)"
                                        d="M30.6,-49.2C42.5,-46.1,57.1,-43.7,67.6,-35.7C78.1,-27.6,84.6,-13.8,80.3,-2.4C76.1,8.9,61.2,17.8,52.5,29.1C43.8,40.3,41.4,53.9,33.7,64C26,74.1,13,80.6,2.2,76.9C-8.6,73.1,-17.3,59,-30.6,52.1C-43.9,45.3,-61.9,45.7,-74.1,38.2C-86.4,30.7,-92.9,15.4,-88.6,2.5C-84.4,-10.5,-69.4,-20.9,-60.7,-34.6C-52.1,-48.3,-49.8,-65.3,-40.7,-70C-31.6,-74.8,-15.8,-67.4,-3.2,-61.8C9.3,-56.1,18.6,-52.3,30.6,-49.2Z"
                                        fill="#7CC133"
                                    ></path>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                    <path
                                        transform="translate(100 100)"
                                        d="M39.4,-66C48.6,-62.9,51.9,-47.4,52.9,-34.3C53.8,-21.3,52.4,-10.6,54.4,1.1C56.3,12.9,61.7,25.8,57.5,33.2C53.2,40.5,39.3,42.3,28.2,46C17,49.6,8.5,55.1,1.3,52.8C-5.9,50.5,-11.7,40.5,-23.6,37.2C-35.4,34,-53.3,37.5,-62,32.4C-70.7,27.4,-70.4,13.7,-72.4,-1.1C-74.3,-15.9,-78.6,-31.9,-73.3,-43C-68.1,-54.2,-53.3,-60.5,-39.5,-60.9C-25.7,-61.4,-12.9,-56,1.1,-58C15.1,-59.9,30.2,-69.2,39.4,-66Z"
                                        fill="#7CC133"
                                    ></path>
                                </svg>
                            </div>
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
                                    <div className="success-animation">
                                        <div className="ripple-ring"></div>
                                        <div className="ripple-ring delay"></div>
                                        <div className="sparkles">
                                            <span></span><span></span><span></span><span></span>
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="error-animation">
                                        <div className="ripple-ring error-ring"></div>
                                        <div className="sparkles error-sparks">
                                            <span></span><span></span><span></span><span></span>
                                        </div>
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
        </div>
    )
}

export default ConnectionTestModal
