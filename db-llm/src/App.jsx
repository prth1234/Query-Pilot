import { useState, useEffect, useCallback } from 'react'
import { Heading, Text, Grid, Stack, Box } from '@primer/react-brand'
import { ThemeProvider } from '@primer/react-brand'
import '@primer/react-brand/lib/css/main.css'
import LoadingAnimation from './LoadingAnimation'
import ConnectionForm from './ConnectionForm'
import Workspace from './Workspace'
import ThemeTransition from './ThemeTransition'
import { databases } from './databaseConfig'
import queryPilotLogo from './assets/query-pilot-logo.png'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return !localStorage.getItem('hasSeenLoading')
  })
  // If not loading (seen before), show content immediately
  const [showContent, setShowContent] = useState(() => {
    return !!localStorage.getItem('hasSeenLoading')
  })
  const [selectedDatabase, setSelectedDatabase] = useState(() => {
    const saved = localStorage.getItem('selectedDatabase')
    return saved ? JSON.parse(saved) : null
  })
  const [connectedDatabase, setConnectedDatabase] = useState(() => {
    const saved = localStorage.getItem('connectedDatabase')
    return saved ? JSON.parse(saved) : null
  })
  const [connectionDetails, setConnectionDetails] = useState(() => {
    const saved = localStorage.getItem('connectionDetails')
    return saved ? JSON.parse(saved) : null
  })
  const [displayedText, setDisplayedText] = useState('')
  const [typingComplete, setTypingComplete] = useState(false)

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  // Theme transition state
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false)
  const [pendingTheme, setPendingTheme] = useState(null)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setPendingTheme(newTheme)
    setIsThemeTransitioning(true)

    // Disable all CSS transitions so everything changes at once
    document.documentElement.classList.add('theme-transitioning')

    // Change theme immediately
    setTheme(newTheme)

    // Re-enable transitions after a brief moment
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 50)
  }

  const handleThemeTransitionComplete = useCallback(() => {
    setIsThemeTransitioning(false)
    setPendingTheme(null)
  }, [])

  const fullText = 'Select Your Database'

  // Persist state changes
  useEffect(() => {
    if (selectedDatabase) {
      localStorage.setItem('selectedDatabase', JSON.stringify(selectedDatabase))
    } else {
      localStorage.removeItem('selectedDatabase')
    }
  }, [selectedDatabase])

  useEffect(() => {
    if (connectedDatabase) {
      localStorage.setItem('connectedDatabase', JSON.stringify(connectedDatabase))
    } else {
      localStorage.removeItem('connectedDatabase')
    }
  }, [connectedDatabase])

  useEffect(() => {
    if (connectionDetails) {
      localStorage.setItem('connectionDetails', JSON.stringify(connectionDetails))
    } else {
      localStorage.removeItem('connectionDetails')
    }
  }, [connectionDetails])

  useEffect(() => {
    if (!isLoading && showContent && !typingComplete) {
      let index = 0
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.substring(0, index + 1))
          index++
        } else {
          clearInterval(typingInterval)
          setTypingComplete(true)
        }
      }, 80)

      return () => clearInterval(typingInterval)
    }
  }, [isLoading, showContent, typingComplete, fullText])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setTimeout(() => {
      setShowContent(true)
    }, 100)
  }

  const handleSelectDatabase = (database) => {
    if (database.available) {
      setSelectedDatabase(database)
    }
  }

  const handleBackToSelection = () => {
    setSelectedDatabase(null)
  }

  const handleConnect = (database, credentials) => {
    console.log('Connecting to:', database.name, 'with credentials:', credentials)
    setConnectedDatabase(database)
    setConnectionDetails(credentials)
  }

  const handleDisconnect = () => {
    setConnectedDatabase(null)
    setConnectionDetails(null)
  }

  return (
    <>
      {isLoading && <LoadingAnimation onComplete={handleLoadingComplete} />}

      {/* Theme Transition Wave Overlay */}
      <ThemeTransition
        isTransitioning={isThemeTransitioning}
        targetTheme={pendingTheme || theme}
        onComplete={handleThemeTransitionComplete}
      />

      <ThemeProvider colorMode={theme}>
        <div className={`app-container ${showContent ? 'fade-in' : ''}`}>
          {/* Global Theme Toggle */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--fg-muted)',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-large)',
                backdropFilter: 'blur(4px)'
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>

          {connectedDatabase ? (
            <Workspace
              database={connectedDatabase}
              connectionDetails={connectionDetails}
              onDisconnect={handleDisconnect}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          ) : !selectedDatabase ? (
            <Box paddingBlockStart={32} paddingBlockEnd={64} paddingInlineStart={48} paddingInlineEnd={48}>
              {/* Logo */}
              <Box className="logo-container" marginBlockEnd={64}>
                <img src={queryPilotLogo} alt="Query Pilot" className="app-logo" />
              </Box>

              {/* Typewriter Heading */}
              <Box className="heading-container" marginBlockEnd={64}>
                <Heading as="h1" size="1" className="typewriter-heading">
                  {displayedText}
                  <span className={`cursor ${typingComplete ? 'blink' : ''}`}>|</span>
                </Heading>
              </Box>

              {/* Database Grid */}
              <div className="database-grid">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`database-card-wrapper ${!db.available ? 'disabled' : ''}`}
                  >
                    <Box
                      className={`database-card ${!db.available ? 'coming-soon' : ''}`}
                      onClick={() => handleSelectDatabase(db)}
                    >
                      <Stack direction="horizontal" gap="normal" alignItems="center" className="card-content">
                        <Box className="db-logo-container">
                          {db.logo ? (
                            <img src={db.logo} alt={db.name} className="db-logo" />
                          ) : (
                            <Text size="400" className="db-icon">{db.icon}</Text>
                          )}
                        </Box>

                        <Heading as="h1" size="9" className="db-name">
                          {db.name}
                        </Heading>

                        {db.comingSoon && (
                          <Box className="coming-soon-badge">
                            <Text size="100" weight="semibold">SOON</Text>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </div>
                ))}
              </div>
            </Box>
          ) : (
            <ConnectionForm
              database={selectedDatabase}
              onBack={handleBackToSelection}
              onConnect={handleConnect}
            />
          )}
        </div>
      </ThemeProvider>
    </>
  )
}

export default App