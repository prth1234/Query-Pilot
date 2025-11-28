import { XIcon } from '@primer/octicons-react'
import './TableSettings.css'

function TableSettings({ settings, onSettingsChange, onClose, onReset }) {
    const updateSetting = (key, value) => {
        onSettingsChange({ ...settings, [key]: value })
    }

    return (
        <div className="table-settings-panel">
            <div className="settings-header">
                <h3>Table Display Settings</h3>
                <button className="close-button" onClick={onClose}>
                    <XIcon size={16} />
                </button>
            </div>

            <div className="settings-content">
                {/* Row Height */}
                <div className="setting-group">
                    <label className="setting-label">Size</label>
                    <div className="radio-group">
                        {['compact', 'normal', 'comfortable'].map(option => (
                            <label key={option} className="radio-option">
                                <input
                                    type="radio"
                                    name="rowHeight"
                                    value={option}
                                    checked={settings.rowHeight === option}
                                    onChange={(e) => updateSetting('rowHeight', e.target.value)}
                                />
                                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="setting-group">
                    <label className="setting-label">
                        Font Size: {settings.fontSize}px
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="18"
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                        className="slider"
                    />
                </div>

                {/* Font Family */}
                <div className="setting-group">
                    <label className="setting-label">Font Family</label>
                    <select
                        value={settings.fontFamily}
                        onChange={(e) => updateSetting('fontFamily', e.target.value)}
                        className="select-input"
                    >
                        <option value="monospace">System Mono (Default)</option>
                        <option value="sans-serif">System Sans-Serif</option>
                        <option value="serif">System Serif</option>
                        <option value="arial">Arial</option>
                        <option value="verdana">Verdana</option>
                        <option value="courier">Courier New</option>
                        <option value="georgia">Georgia</option>
                    </select>
                </div>

                {/* Header Style */}
                <div className="setting-group">
                    <label className="setting-label">Header Style</label>
                    <div className="radio-group">
                        {['dark', 'light', 'colored'].map(option => (
                            <label key={option} className="radio-option">
                                <input
                                    type="radio"
                                    name="headerStyle"
                                    value={option}
                                    checked={settings.headerStyle === option}
                                    onChange={(e) => updateSetting('headerStyle', e.target.value)}
                                />
                                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Toggle Settings */}
                <div className="setting-group">
                    <label className="setting-label">Display Options</label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.showStripedRows}
                            onChange={(e) => updateSetting('showStripedRows', e.target.checked)}
                        />
                        <span>Striped Rows</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.showHoverEffect}
                            onChange={(e) => updateSetting('showHoverEffect', e.target.checked)}
                        />
                        <span>Hover Effects</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.showBorders}
                            onChange={(e) => updateSetting('showBorders', e.target.checked)}
                        />
                        <span>Cell Borders</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.stickyHeader}
                            onChange={(e) => updateSetting('stickyHeader', e.target.checked)}
                        />
                        <span>Sticky Header</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.wrapText}
                            onChange={(e) => updateSetting('wrapText', e.target.checked)}
                        />
                        <span>Wrap Text</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.showNullAsText}
                            onChange={(e) => updateSetting('showNullAsText', e.target.checked)}
                        />
                        <span>Show NULL as Text</span>
                    </label>

                    <label className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={settings.showRowNumbers}
                            onChange={(e) => updateSetting('showRowNumbers', e.target.checked)}
                        />
                        <span>Show Row Numbers</span>
                    </label>
                </div>
            </div>

            <div className="settings-footer">
                <button className="reset-button" onClick={onReset}>
                    Reset to Defaults
                </button>
                <button className="apply-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default TableSettings
