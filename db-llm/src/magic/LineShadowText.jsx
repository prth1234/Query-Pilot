import React from 'react'
import './magic-text.css'

/**
 * Magic UI–style Line Shadow Text: a moving diagonal line shadow
 * rendered behind the text via a ::after layer.
 *
 * Props (mirrors Magic UI): shadowColor, as (element), className.
 * Defaults the shadow to the active theme's tertiary accent.
 */
function LineShadowText({ children, className = '', shadowColor, as: Tag = 'span' }) {
    return (
        <Tag
            className={`magic-line-shadow-text ${className}`}
            data-text={children}
            style={{ '--line-shadow-color': shadowColor ?? 'var(--accent-tertiary)' }}
        >
            {children}
        </Tag>
    )
}

export default LineShadowText
