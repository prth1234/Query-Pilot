import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, Text, Stack } from '@primer/react-brand'
import { GearIcon, CheckIcon } from '@primer/octicons-react'
import { MdComputer } from 'react-icons/md'
import { APP_THEMES, SYSTEM_THEME_ID, CUSTOM_ROLES, getThemeAccents } from './themes'
import './ThemeSettings.css'

function ThemeSettings({
    theme,
    themeMode,
    setThemeMode,
    resolvedThemeId,
    customColors,
    onCustomColor,
    onResetCustomColors,
}) {
    const [showThemeSettings, setShowThemeSettings] = useState(false)
    const themeSettingsRef = useRef(null)
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

    // Active selection: explicit theme id or 'system'
    const activeId = themeMode || theme || 'dark'
    // Effective theme driving the UI right now (expands 'system')
    const effectiveId = activeId === SYSTEM_THEME_ID ? (resolvedThemeId || theme || 'dark') : activeId
    const themeDefaults = getThemeAccents(effectiveId)
    const hasCustom = !!(customColors?.primary || customColors?.secondary || customColors?.tertiary)

    const handleSelect = (id) => {
        setThemeMode(id)
        setShowThemeSettings(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            const inTrigger = themeSettingsRef.current && themeSettingsRef.current.contains(event.target)
            const inMenu = dropdownRef.current && dropdownRef.current.contains(event.target)
            if (!inTrigger && !inMenu) {
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

    // Position the floating menu against the trigger button.
    // Rendered via portal so it escapes the header stacking context
    // and always paints above the query results table.
    useEffect(() => {
        if (showThemeSettings && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPos({
                top: rect.bottom + 8,
                right: Math.max(8, window.innerWidth - rect.right),
            })
        }
    }, [showThemeSettings])

    // Close on scroll/resize since the menu is fixed-positioned.
    // Ignore scrolls originating INSIDE the menu so the theme list
    // itself stays scrollable without dismissing.
    useEffect(() => {
        if (!showThemeSettings) return
        const close = () => setShowThemeSettings(false)
        const handleScroll = (e) => {
            if (dropdownRef.current && dropdownRef.current.contains(e.target)) return
            close()
        }
        window.addEventListener('resize', close)
        window.addEventListener('scroll', handleScroll, true)
        return () => {
            window.removeEventListener('resize', close)
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [showThemeSettings])

    return (
        <Box className="theme-settings-wrapper" ref={themeSettingsRef}>
            <button
                ref={buttonRef}
                className={`theme-settings-button ${showThemeSettings ? 'active' : ''}`}
                onClick={() => setShowThemeSettings(!showThemeSettings)}
                title="Theme Settings"
            >
                <GearIcon size={20} />
            </button>
            {showThemeSettings && createPortal(
                <div
                    ref={dropdownRef}
                    className="theme-settings-dropdown theme-picker theme-picker-portal"
                    style={{ top: menuPos.top, right: menuPos.right }}
                >
                    <Box className="theme-dropdown-header">
                        <Text size="200" weight="semibold">Theme Settings</Text>
                    </Box>

                    <Box className="theme-section">
                        <Text size="100" weight="semibold" className="theme-section-label">APPEARANCE</Text>
                        <Stack direction="vertical" gap="none" className="theme-options">
                            <button
                                className={`theme-option ${activeId === SYSTEM_THEME_ID ? 'active' : ''}`}
                                onClick={() => handleSelect(SYSTEM_THEME_ID)}
                            >
                                <span className="theme-swatch system-swatch">
                                    <MdComputer size={14} />
                                </span>
                                <span className="theme-option-text">
                                    <Text size="200" weight="medium">System</Text>
                                    <Text size="100" className="theme-option-desc">Follows OS setting</Text>
                                </span>
                                {activeId === SYSTEM_THEME_ID && <CheckIcon size={16} className="theme-check" />}
                            </button>
                        </Stack>
                    </Box>

                    <Box className="theme-section">
                        <Text size="100" weight="semibold" className="theme-section-label">
                            THEMES · {APP_THEMES.length}
                        </Text>
                        <Stack direction="vertical" gap="none" className="theme-options theme-grid">
                            {APP_THEMES.map((t) => {
                                const isActive = activeId === t.id
                                return (
                                    <button
                                        key={t.id}
                                        className={`theme-option ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelect(t.id)}
                                        title={`${t.name} — ${t.description}`}
                                    >
                                        <span className="theme-rings" aria-hidden="true">
                                            <span className="theme-ring" style={{ backgroundColor: t.swatch.primary }} />
                                            <span className="theme-ring" style={{ backgroundColor: t.swatch.secondary }} />
                                            <span className="theme-ring" style={{ backgroundColor: t.swatch.tertiary }} />
                                        </span>
                                        <span className="theme-option-text">
                                            <Text size="200" weight="medium">{t.name}</Text>
                                            <Text size="100" className="theme-option-desc">{t.description}</Text>
                                        </span>
                                        {isActive && <CheckIcon size={16} className="theme-check" />}
                                    </button>
                                )
                            })}
                        </Stack>
                    </Box>

                    <Box className="theme-section">
                        <Box className="theme-custom-header">
                            <Text size="100" weight="semibold" className="theme-section-label" style={{ padding: 0 }}>
                                CUSTOM COLORS
                            </Text>
                            {hasCustom && (
                                <button className="theme-reset-button" onClick={onResetCustomColors}>
                                    Reset
                                </button>
                            )}
                        </Box>
                        <Stack direction="vertical" gap="none" className="theme-options">
                            {CUSTOM_ROLES.map((roleDef) => {
                                const current = customColors?.[roleDef.role] || themeDefaults[roleDef.role]
                                return (
                                    <label key={roleDef.role} className="theme-option theme-custom-row">
                                        <span
                                            className="theme-ring theme-ring-single"
                                            style={{ backgroundColor: current }}
                                            aria-hidden="true"
                                        />
                                        <span className="theme-option-text">
                                            <Text size="200" weight="medium">
                                                {roleDef.label}
                                                {customColors?.[roleDef.role] && <span className="theme-customized-dot" />}
                                            </Text>
                                            <Text size="100" className="theme-option-desc">{roleDef.hint}</Text>
                                        </span>
                                        <input
                                            type="color"
                                            className="theme-color-input"
                                            value={current}
                                            onChange={(e) => onCustomColor?.(roleDef.role, e.target.value)}
                                            title={`Pick custom ${roleDef.label.toLowerCase()} color`}
                                        />
                                    </label>
                                )
                            })}
                        </Stack>
                    </Box>
                </div>,
                document.body
            )}
        </Box>
    )
}

export default ThemeSettings
