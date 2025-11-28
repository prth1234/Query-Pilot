import { useEffect, useState } from 'react'
import './LoadingAnimation.css'

function LoadingAnimation({ onComplete }) {
    const [isAnimationComplete, setIsAnimationComplete] = useState(false)

    useEffect(() => {
        // Check if user has seen the loading animation before
        const hasSeenLoading = localStorage.getItem('hasSeenLoading')

        if (hasSeenLoading) {
            // Skip animation if already seen
            onComplete()
            return
        }

        // Animation takes 5 seconds to show all databases, then fade out for 0.5s
        const timer = setTimeout(() => {
            setIsAnimationComplete(true)
            // Mark as seen in localStorage
            localStorage.setItem('hasSeenLoading', 'true')
            // Wait for fade out, then notify parent
            setTimeout(() => {
                onComplete()
            }, 500)
        }, 5000)

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className={`loading-overlay ${isAnimationComplete ? 'fade-out' : ''}`}>
            <div className="card">
                <div className="loader">
                    <p>Connect to your</p>
                    <div className="words">
                        <span className="word">MySQL</span>
                        <span className="word">PostgreSQL</span>
                        <span className="word">MongoDB</span>
                        <span className="word">Snowflake</span>
                        <span className="word">Databricks</span>
                        <span className="word">Big Query</span>
                        <span className="word">Or Literally Any Database</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingAnimation
