import React from 'react'
import './magic-text.css'

/**
 * Magic UI–style Aurora Text: an animated aurora gradient sweep.
 * Defaults to the active theme's secondary / tertiary / primary accents,
 * so it follows Theme Settings + custom colors automatically.
 *
 * Props (mirrors Magic UI): className, colors[], speed (1 = default).
 */
function AuroraText({ children, className = '', colors, speed = 1 }) {
    const palette = colors ?? [
        'var(--accent-secondary)',
        'var(--accent-tertiary)',
        'var(--accent-fg)',
        'var(--accent-secondary)',
    ]
    const style = {
        backgroundImage: `linear-gradient(135deg, ${palette.join(', ')}, ${palette[0]})`,
        backgroundSize: '300% 100%',
        animationDuration: `${8 / speed}s`,
    }
    return (
        <span className={`magic-aurora-text ${className}`} style={style}>
            {children}
        </span>
    )
}

export default AuroraText
