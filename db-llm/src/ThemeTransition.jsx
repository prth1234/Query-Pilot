import { useEffect, useState } from 'react'
import './ThemeTransition.css'

function ThemeTransition({ isTransitioning, targetTheme, onComplete }) {
    const [showGlow, setShowGlow] = useState(false)

    useEffect(() => {
        if (isTransitioning) {
            setShowGlow(true)

            // Hide after animation completes
            const timer = setTimeout(() => {
                setShowGlow(false)
                onComplete()
            }, 600)

            return () => clearTimeout(timer)
        }
    }, [isTransitioning, onComplete])

    if (!showGlow) return null

    return (
        <div className={`theme-transition-overlay ${targetTheme}`}>
            <div className="glow-bar-top"></div>
        </div>
    )
}

export default ThemeTransition
