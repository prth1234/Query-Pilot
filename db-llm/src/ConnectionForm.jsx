import { useState, useEffect } from 'react'
import { Heading, Text, Button, Box } from '@primer/react-brand'
import './ConnectionForm.css'
import ConnectionTestModal from './ConnectionTestModal'

// Validation rules for each database field
const validationRules = {
    mysql: {
        host: {
            pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^localhost$|^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            message: 'Valid IP, localhost, or hostname required'
        },
        port: {
            pattern: /^([1-9][0-9]{0,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
            message: 'Port must be between 1-65535'
        },
        database: {
            pattern: /^[a-zA-Z0-9_]{1,64}$/,
            message: 'Letters, numbers, underscores only (max 64)'
        },
        user: {
            pattern: /^[a-zA-Z0-9_@.-]{1,32}$/,
            message: 'Valid username required (max 32 chars)'
        },
        password: {
            pattern: /^.{3,}$/,
            message: 'Minimum 3 characters'
        }
    },
    postgresql: {
        host: {
            pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^localhost$|^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            message: 'Valid IP, localhost, or hostname required'
        },
        port: {
            pattern: /^([1-9][0-9]{0,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
            message: 'Port must be between 1-65535'
        },
        database: {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/,
            message: 'Must start with letter/underscore (max 63)'
        },
        user: {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/,
            message: 'Valid PostgreSQL username required'
        },
        password: {
            pattern: /^.{3,}$/,
            message: 'Minimum 3 characters'
        }
    },
    mongodb: {
        connectionString: {
            pattern: /^mongodb(\+srv)?:\/\/.+/,
            message: 'Must be a valid MongoDB connection URI'
        },
        username: {
            pattern: /^.*$/,
            message: 'Valid username format'
        },
        password: {
            pattern: /^.*$/,
            message: ''
        }
    },
    snowflake: {
        account: {
            pattern: /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,
            message: 'Format: account.region (e.g., xy12345.us-east-1)'
        },
        warehouse: {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,254}$/,
            message: 'Must start with letter, alphanumeric + underscore'
        },
        database: {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,254}$/,
            message: 'Valid database identifier required'
        },
        schema: {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,254}$/,
            message: 'Valid schema identifier required'
        },
        username: {
            pattern: /^[a-zA-Z0-9_@.-]{1,255}$/,
            message: 'Valid Snowflake username required'
        },
        password: {
            pattern: /^.{3,}$/,
            message: 'Minimum 3 characters'
        }
    },
    bigquery: {
        projectId: {
            pattern: /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/,
            message: 'Lowercase, 6-30 chars, start with letter'
        },
        dataset: {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]{0,1023}$/,
            message: 'Valid BigQuery dataset name required'
        },
        credentials: {
            pattern: /^\s*\{[\s\S]*"type"\s*:\s*"service_account"[\s\S]*\}\s*$/,
            message: 'Valid service account JSON required'
        }
    },
    databricks: {
        host: {
            pattern: /^[a-zA-Z0-9-]+\.cloud\.databricks\.com$/,
            message: 'Format: xxx.cloud.databricks.com'
        },
        httpPath: {
            pattern: /^sql\/protocolv1\/o\/[0-9]+\/[a-zA-Z0-9_-]+$/,
            message: 'Format: sql/protocolv1/o/xxx/xxx'
        },
        token: {
            pattern: /^dapi[a-z0-9]{32,}$/,
            message: 'Must start with "dapi" followed by token'
        }
    }
}

function ConnectionForm({ database, onBack, onConnect }) {
    const storageKey = `connectionForm_${database.id}`

    const [formData, setFormData] = useState(() => {
        // Load from localStorage on initial mount
        try {
            const savedData = localStorage.getItem(storageKey)
            return savedData ? JSON.parse(savedData) : {}
        } catch (error) {
            console.error('Error loading form data from localStorage:', error)
            return {}
        }
    })
    const [validationState, setValidationState] = useState({})
    const [isTesting, setIsTesting] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [testSteps, setTestSteps] = useState([])
    const [testSuccess, setTestSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [currentStep, setCurrentStep] = useState(-1)

    // Load saved data on mount and validate
    useEffect(() => {
        // Validate any loaded data
        Object.keys(formData).forEach(fieldName => {
            if (formData[fieldName]) {
                const validation = validateField(fieldName, formData[fieldName])
                setValidationState(prev => ({
                    ...prev,
                    [fieldName]: validation
                }))
            }
        })
    }, []) // Run only on mount

    // Save to localStorage whenever formData changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(formData))
        } catch (error) {
            console.error('Error saving form data to localStorage:', error)
        }
    }, [formData, storageKey])

    const validateField = (fieldName, value) => {
        const dbRules = validationRules[database.id]
        if (!dbRules || !dbRules[fieldName]) return { isValid: true, message: '' }

        const rule = dbRules[fieldName]
        const isValid = rule.pattern.test(value)

        return {
            isValid,
            message: isValid ? '' : rule.message
        }
    }

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }))

        // Validate on change if field has value
        if (value) {
            const validation = validateField(fieldName, value)
            setValidationState(prev => ({
                ...prev,
                [fieldName]: validation
            }))
        } else {
            setValidationState(prev => {
                const newState = { ...prev }
                delete newState[fieldName]
                return newState
            })
        }
    }

    const validateForm = () => {
        const allValid = database.connectionFields.every(field => {
            if (field.required && !formData[field.name]) {
                return false
            }
            if (formData[field.name]) {
                const validation = validateField(field.name, formData[field.name])
                return validation.isValid
            }
            return !field.required
        })

        if (!allValid) {
            alert('Please fix all validation errors before proceeding')
            return false
        }
        return true
    }

    const handleTestConnection = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsTesting(true)
        setShowModal(true)
        setTestSteps([])
        setTestSuccess(false)
        setErrorMessage('')

        try {
            let endpoint = ''
            let requestBody = {}

            if (database.id === 'mysql') {
                endpoint = 'http://localhost:8000/api/test-connection/mysql'
                requestBody = {
                    host: formData.host,
                    port: parseInt(formData.port) || 3306,
                    database: formData.database,
                    user: formData.user,
                    password: formData.password,
                }
            } else if (database.id === 'postgresql') {
                endpoint = 'http://localhost:8000/api/test-connection/postgresql'
                requestBody = {
                    host: formData.host,
                    port: parseInt(formData.port) || 5432,
                    database: formData.database,
                    user: formData.user,
                    password: formData.password,
                }
            } else if (database.id === 'mongodb') {
                endpoint = 'http://localhost:8000/api/test-connection/mongodb'
                requestBody = {
                    connectionString: formData.connectionString,
                    username: formData.username,
                    password: formData.password,
                    database: 'admin' // Default to admin for connection testing
                }
            }

            if (endpoint) {
                // Create an AbortController with a 15-second timeout
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 15000)

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                        signal: controller.signal
                    })

                    clearTimeout(timeoutId)

                    const data = await response.json()

                    setTestSteps(data.steps || [])
                    setTestSuccess(data.success)
                    setErrorMessage(data.error || data.message)
                } catch (fetchError) {
                    clearTimeout(timeoutId)
                    throw fetchError
                }

            } else {
                // For other databases, show a placeholder message
                setTestSteps([
                    { id: 1, label: `${database.name} support coming soon`, status: 'failed' }
                ])
                setTestSuccess(false)
                setErrorMessage(`${database.name} connection testing is not yet implemented. Only MySQL and PostgreSQL are currently supported.`)
            }
        } catch (error) {
            console.error('Connection test error:', error)

            // Create a failed step to show in the modal
            setTestSteps([
                {
                    id: 1,
                    label: 'Connecting to backend service',
                    status: 'failed',
                    error: 'Backend service unavailable'
                }
            ])
            setTestSuccess(false)

            // User-friendly error message for network/server issues
            if (error.name === 'AbortError') {
                setErrorMessage('Connection test timed out after 15 seconds. The backend server may not be running. Please start the backend server and try again.')
            } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                setErrorMessage('Cannot connect to backend server. Please ensure the backend server is running on http://localhost:8000 and try again.')
            } else {
                setErrorMessage(`Connection error: ${error.message}`)
            }
        } finally {
            setIsTesting(false)
        }
    }

    const handleRetry = () => {
        setShowModal(false)
        setTestSteps([])
        setTestSuccess(false)
        setErrorMessage('')
    }

    const handleNavigateToWorkspace = () => {
        const finalFormData = { ...formData }
        // For MongoDB, connection is cluster-wide but backend expects 'database' field
        if (database.id === 'mongodb') {
            finalFormData.database = 'admin'
        }
        onConnect(database, finalFormData)
    }

    const handleDirectConnect = (e) => {
        e.preventDefault()
        if (validateForm()) {
            handleNavigateToWorkspace()
        }
    }

    return (
        <Box className="connection-form-container">
            <Button onClick={onBack} variant="invisible" className="back-button">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
                    <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path>
                </svg>
            </Button>

            <Box className="form-header">
                <Box className="db-logo-large-container">
                    {database.logo && <img src={database.logo} alt={database.name} className="db-logo-large" />}
                </Box>
                <Box className="header-text">
                    <Heading as="h2" size="4">Connect to {database.name}</Heading>
                    <Text size="200" className="form-subtitle">{database.description}</Text>
                </Box>
            </Box>

            <Box as="form" onSubmit={handleDirectConnect} className="connection-form">
                <div className="form-fields-grid">
                    {database.connectionFields.map((field) => {
                        const validation = validationState[field.name]
                        const hasValue = formData[field.name]
                        const isValid = validation?.isValid
                        const isInvalid = hasValue && validation && !validation.isValid

                        return (
                            <div key={field.name} className={`form-field-wrapper ${isInvalid ? 'invalid' : ''} ${isValid ? 'valid' : ''}`}>
                                <label htmlFor={field.name} className="form-label">
                                    {field.label}
                                    {field.required && <span className="required">*</span>}
                                </label>

                                <div className="input-with-validation">
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className={`form-textarea ${isInvalid ? 'error' : ''} ${isValid ? 'success' : ''}`}
                                        />
                                    ) : (
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className={`form-input ${isInvalid ? 'error' : ''} ${isValid ? 'success' : ''}`}
                                        />
                                    )}

                                    {isValid && (
                                        <div className="validation-checkmark">
                                            <svg viewBox="0 0 16 16" width="16" height="16">
                                                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {isInvalid && validation.message && (
                                    <span className="validation-error">{validation.message}</span>
                                )}

                                {field.helpText && !isInvalid && (
                                    <span className="field-help-text">{field.helpText}</span>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Only show "Connect via URL" for databases that use individual fields (not MongoDB) */}
                {!database.usesConnectionString && (
                    <>
                        <div className="divider-container">
                            <div className="divider-line"></div>
                            <span className="divider-text">OR</span>
                            <div className="divider-line"></div>
                        </div>

                        <div className="connection-string-section">
                            <label className="form-label">Connect via URL</label>
                            <input
                                type="text"
                                placeholder={`e.g. ${database.id}://user:password@localhost:${database.id === 'mysql' ? '3306' : '5432'}/dbname`}
                                className="form-input connection-string-input"
                                value={formData.connectionUrl || ''}
                                onChange={(e) => {
                                    const val = e.target.value

                                    // Robust parsing for connection strings
                                    // format: protocol://user:pass@host:port/db
                                    try {
                                        // Remove protocol if present
                                        let str = val
                                        if (str.includes('://')) {
                                            str = str.split('://')[1]
                                        }

                                        // Split into auth+host and path
                                        // We use the first slash to separate the database path
                                        const firstSlashIndex = str.indexOf('/')
                                        let authHost = str
                                        let path = ''

                                        if (firstSlashIndex !== -1) {
                                            authHost = str.substring(0, firstSlashIndex)
                                            path = str.substring(firstSlashIndex + 1)
                                        }

                                        const databaseName = path ? path.split('?')[0] : ''

                                        let user = ''
                                        let password = ''
                                        let host = ''
                                        let port = ''

                                        if (authHost.includes('@')) {
                                            // Use lastIndexOf to handle @ in password
                                            const lastAtIndex = authHost.lastIndexOf('@')
                                            const auth = authHost.substring(0, lastAtIndex)
                                            const hostPort = authHost.substring(lastAtIndex + 1)

                                            // Split user:pass on the FIRST colon to allow colons in password
                                            const firstColonIndex = auth.indexOf(':')
                                            if (firstColonIndex !== -1) {
                                                user = auth.substring(0, firstColonIndex)
                                                password = auth.substring(firstColonIndex + 1)
                                            } else {
                                                user = auth
                                            }

                                            // Split host:port on the LAST colon
                                            const lastColonIndex = hostPort.lastIndexOf(':')
                                            if (lastColonIndex !== -1) {
                                                host = hostPort.substring(0, lastColonIndex)
                                                port = hostPort.substring(lastColonIndex + 1)
                                            } else {
                                                host = hostPort
                                            }
                                        } else {
                                            // No auth provided, just host:port
                                            const lastColonIndex = authHost.lastIndexOf(':')
                                            if (lastColonIndex !== -1) {
                                                host = authHost.substring(0, lastColonIndex)
                                                port = authHost.substring(lastColonIndex + 1)
                                            } else {
                                                host = authHost
                                            }
                                        }

                                        const newFormData = { ...formData, connectionUrl: val }
                                        if (host) newFormData.host = host
                                        if (port) newFormData.port = port
                                        if (user) newFormData.user = user
                                        if (password) newFormData.password = password
                                        if (databaseName) newFormData.database = databaseName

                                        setFormData(newFormData)

                                        // Update validation state
                                        Object.keys(newFormData).forEach(key => {
                                            if (newFormData[key]) {
                                                const validation = validateField(key, newFormData[key])
                                                setValidationState(prev => ({
                                                    ...prev,
                                                    [key]: validation
                                                }))
                                            }
                                        })

                                    } catch (err) {
                                        // Ignore parsing errors while typing
                                    }
                                }}
                            />
                        </div>
                    </>
                )}

                <Box className="form-actions" sx={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        variant="default"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="test-button"
                        type="button"
                    >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleDirectConnect}
                        disabled={isTesting}
                        className="connect-button"
                        type="submit"
                    >
                        Go to Workspace
                    </Button>
                    <Button variant="invisible" onClick={onBack} type="button" className="connection-cancel-button">
                        Cancel
                    </Button>
                </Box>
            </Box>

            <Box className="form-footer">
                <Text size="100">🔒 Encrypted & Secure</Text>
            </Box>

            {/* Connection Test Modal */}
            <ConnectionTestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                steps={testSteps}
                isSuccess={testSuccess}
                errorMessage={errorMessage}
                onRetry={handleRetry}
                onNavigateToWorkspace={handleNavigateToWorkspace}
            />
        </Box>
    )
}

export default ConnectionForm
