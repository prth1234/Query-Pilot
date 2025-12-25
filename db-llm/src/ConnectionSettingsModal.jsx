import { useState, useEffect } from 'react'
import './ConnectionSettingsModal.css'
import ConnectionTestModal from './ConnectionTestModal'
import { MdCastConnected } from "react-icons/md"
import { LuSave, LuEye, LuEyeOff } from "react-icons/lu";

function ConnectionSettingsModal({ isOpen, onClose, database, connectionDetails, onUpdate }) {
    const [formData, setFormData] = useState({
        host: '',
        port: '',
        username: '',
        password: '',
        database: '',
        connectionString: ''
    })

    const [testSteps, setTestSteps] = useState([])
    const [testSuccess, setTestSuccess] = useState(false)
    const [testError, setTestError] = useState('')
    const [isTesting, setIsTesting] = useState(false)
    const [showTestModal, setShowTestModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (isOpen && connectionDetails) {
            console.log('ConnectionSettingsModal: Loaded connectionDetails', connectionDetails)
            setFormData({
                host: connectionDetails.host || '',
                port: connectionDetails.port || '',
                username: connectionDetails.username || connectionDetails.user || '',
                password: connectionDetails.password || '',
                database: connectionDetails.database || '',
                connectionString: connectionDetails.connectionString || ''
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        console.log(`ConnectionSettingsModal: Field changed [${name}]`, name === 'password' ? '***' : value)
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const updatePayload = {
            ...formData,
            user: formData.username
        }
        onUpdate(updatePayload)
        onClose()
    }

    const getDatabaseType = (dbId) => {
        if (!dbId) return 'Database'
        if (['mysql', 'postgresql', 'sqlite'].includes(dbId)) return 'SQL'
        if (['mongodb', 'redis'].includes(dbId)) return 'NoSQL'
        return 'Database'
    }

    const handleTestConnection = async () => {
        setIsTesting(true)
        setShowTestModal(true)
        setTestSteps([])
        setTestSuccess(false)
        setTestError('')

        try {
            let endpoint = ''
            let requestBody = {}

            if (database.id === 'mysql') {
                endpoint = 'http://localhost:8000/api/test-connection/mysql'
                requestBody = {
                    host: formData.host,
                    port: parseInt(formData.port) || 3306,
                    database: formData.database,
                    user: formData.username,
                    password: formData.password,
                }
                console.log('ConnectionSettingsModal: Testing MySQL connection', { ...requestBody, password: '***' })
            } else if (database.id === 'postgresql') {
                endpoint = 'http://localhost:8000/api/test-connection/postgresql'
                requestBody = {
                    host: formData.host,
                    port: parseInt(formData.port) || 5432,
                    database: formData.database,
                    user: formData.username,
                    password: formData.password,
                }
            } else if (database.id === 'sqlite') {
                endpoint = 'http://localhost:8000/api/test-connection/sqlite'
                requestBody = {
                    connectionString: formData.connectionString
                }
            } else if (database.id === 'mongodb') {
                endpoint = 'http://localhost:8000/api/test-connection/mongodb'
                requestBody = {
                    connectionString: formData.connectionString
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            const data = await response.json()
            console.log('ConnectionSettingsModal: Test response', data)

            if (data.steps) {
                setTestSteps(data.steps)
            }

            setTestSuccess(data.success)
            if (!data.success) {
                setTestError(data.error || data.message || 'Connection failed')
            }
        } catch (error) {
            console.error('Test connection error:', error)
            setTestError(error.message)
            setTestSuccess(false)
        } finally {
            setIsTesting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <div className="settings-header-info">
                        <h2 style={{ marginBottom: '10px' }}>Edit Connection Settings</h2>
                        <div className="settings-db-badge-container">
                            <span className="db-type-label">{getDatabaseType(database?.id)}</span>
                            <span className="db-type-separator">/</span>
                            <div className="db-info-badge">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25V5h13V1.75a.25.25 0 0 0-.25-.25Zm13 4.75h-13v8c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z" />
                                </svg>
                                <span>{database?.name}</span>
                            </div>
                        </div>
                    </div>
                    <button className="settings-close-btn" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                        </svg>
                    </button>
                </div>

                <form className="settings-form" onSubmit={handleSubmit}>
                    {/* Database info moved to header */}

                    {database?.connectionType === 'uri' ? (
                        <div className="form-group">
                            <label className="form-label">
                                Connection String
                                <span className="required">*</span>
                            </label>
                            <textarea
                                name="connectionString"
                                value={formData.connectionString}
                                onChange={handleChange}
                                className="form-input form-textarea"
                                placeholder={database.connectionStringPlaceholder}
                                rows="3"
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        Host
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="host"
                                        value={formData.host}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="localhost"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Port
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="port"
                                        value={formData.port}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder={database?.defaultPort}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Username
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="root"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="password-input-container" style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="••••••••"
                                        style={{ paddingRight: '35px' }}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            display: 'flex',
                                            padding: 0,
                                            zIndex: 5
                                        }}
                                    >
                                        {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Database Name
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="database"
                                    value={formData.database}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="my_database"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="settings-modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleTestConnection}>
                            <MdCastConnected size={16} style={{ marginRight: '8px' }} />
                            Test Connection
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary-outline">
                            <LuSave />

                            Save
                        </button>
                    </div>
                </form>
            </div>

            <ConnectionTestModal
                isOpen={showTestModal}
                onClose={() => setShowTestModal(false)}
                steps={testSteps}
                isSuccess={testSuccess}
                errorMessage={testError}
                onRetry={() => {
                    setShowTestModal(false)
                    handleTestConnection()
                }}
            />
        </div>
    )
}

export default ConnectionSettingsModal
