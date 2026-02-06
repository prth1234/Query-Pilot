import { useRef, useEffect, useState } from 'react'
import { GearIcon } from '@primer/octicons-react'
import { MdLightMode, MdDarkMode, MdComputer } from 'react-icons/md'
import './ThemeSettings.css'

function ThemeSettings({ theme, toggleTheme, themeMode, setThemeMode }) {
    const [showThemeSettings, setShowThemeSettings] = useState(false)
    const [justChanged, setJustChanged] = useState(false)
    const themeSettingsRef = useRef(null)

    // Handle theme mode change
    const handleThemeModeChange = (mode) => {
        setThemeMode(mode)
        setJustChanged(true)
        setShowThemeSettings(false)

        // Reset "just changed" state after animation
        setTimeout(() => setJustChanged(false), 300)
    }

    // Click outside handler for theme settings
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (themeSettingsRef.current && !themeSettingsRef.current.contains(event.target)) {
                setShowThemeSettings(false)
            }
        }

        if (showThemeSettings) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showThemeSettings])

    return (
        <div className="theme-settings-wrapper" ref={themeSettingsRef}>
            <button
                className={`theme-settings-button ${showThemeSettings ? 'active' : ''}`}
                onClick={() => setShowThemeSettings(!showThemeSettings)}
                title="Theme Settings"
            >
                <GearIcon size={20} />
            </button>
            {showThemeSettings && (
                <div className="theme-settings-dropdown">
                    <div className="theme-dropdown-header">Theme Settings</div>
                    <div className="theme-options">
                        <button
                            className={`theme-option ${themeMode === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeModeChange('light')}
                        >
                            <MdLightMode size={20} />
                            <span>Light</span>
                            {themeMode === 'light' && <div className="active-indicator"></div>}
                        </button>
                        <button
                            className={`theme-option ${themeMode === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeModeChange('dark')}
                        >
                            <MdDarkMode size={20} />
                            <span>Dark</span>
                            {themeMode === 'dark' && <div className="active-indicator"></div>}
                        </button>
                        <button
                            className={`theme-option ${themeMode === 'system' ? 'active' : ''}`}
                            onClick={() => handleThemeModeChange('system')}
                        >
                            <MdComputer size={20} />
                            <span>System</span>
                            {themeMode === 'system' && <div className="active-indicator"></div>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ThemeSettings
