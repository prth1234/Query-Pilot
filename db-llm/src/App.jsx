import { useState, useEffect, useCallback } from 'react'
import { Heading, Text, Grid, Stack, Box } from '@primer/react-brand'
import { ThemeProvider } from '@primer/react-brand'
import '@primer/react-brand/lib/css/main.css'
import LoadingAnimation from './LoadingAnimation'
import ConnectionForm from './ConnectionForm'
import Workspace from './Workspace'
import ThemeTransition from './ThemeTransition'
import WorkspaceHistory from './WorkspaceHistory'
import { databases } from './databaseConfig'
import queryPilotLogo from './assets/query-pilot-logo.png'
import './App.css'

import ThemeSettings from './ThemeSettings'
import TargetCursor from './TargetCursor'
import TextType from './TextType'

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
  // Removed duplicate connectionDetails definitions

  // Removed displayedText and typingComplete as they are replaced by TextType animation

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark'
  })

  // Theme transition state
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false)
  const [pendingTheme, setPendingTheme] = useState(null)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
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
  }, [theme])

  // System theme detection
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        if (theme !== newTheme) {
          toggleTheme();
        }
      };

      // Set initial theme based on system preference
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      if (theme !== systemTheme) {
        toggleTheme();
      }

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Enforce manual mode selection
      if (themeMode !== theme) {
        // Only toggle if mismatched (e.g. user selected 'dark' but theme is 'light')
        if ((themeMode === 'dark' && theme !== 'dark') || (themeMode === 'light' && theme !== 'light')) {
          toggleTheme();
        }
      }
    }
  }, [themeMode, theme, toggleTheme]);

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
    // Animation state managed by TextType component
  }, [isLoading, showContent])

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

  // Save workspace to recent and optionally to saved
  const saveWorkspace = (database, credentials, workspaceName = null) => {
    const workspaceId = `${database.id}-${credentials.host}-${credentials.database}-${Date.now()}`
    const workspace = {
      id: workspaceId,
      name: workspaceName || `${database.name} - ${credentials.database}`,
      database: database,
      connectionDetails: credentials,
      lastUsed: new Date().toISOString()
    }

    // Always save to recent workspaces
    try {
      const recent = JSON.parse(localStorage.getItem('recentWorkspaces') || '[]')
      // Remove if already exists (to update timestamp)
      const filtered = recent.filter(w =>
        !(w.database?.id === database.id &&
          w.connectionDetails?.host === credentials.host &&
          w.connectionDetails?.database === credentials.database)
      )
      // Add to beginning
      const updated = [workspace, ...filtered].slice(0, 10) // Keep last 10
      localStorage.setItem('recentWorkspaces', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving to recent workspaces:', error)
    }
  }

  const handleConnect = (database, credentials) => {
    console.log('Connecting to:', database.name, 'with credentials:', credentials)
    setConnectedDatabase(database)
    setConnectionDetails(credentials)

    // Save to workspace history
    saveWorkspace(database, credentials)
  }

  // Handle selecting a workspace from history
  const handleSelectWorkspace = (workspace) => {
    if (workspace.database && workspace.connectionDetails) {
      setConnectedDatabase(workspace.database)
      setConnectionDetails(workspace.connectionDetails)

      // Update last used time in recent workspaces
      try {
        const recent = JSON.parse(localStorage.getItem('recentWorkspaces') || '[]')
        const updated = recent.map(w =>
          w.id === workspace.id
            ? { ...w, lastUsed: new Date().toISOString() }
            : w
        )
        localStorage.setItem('recentWorkspaces', JSON.stringify(updated))
      } catch (error) {
        console.error('Error updating workspace:', error)
      }
    }
  }

  const handleDisconnect = () => {
    setConnectedDatabase(null)
    setConnectionDetails(null)
  }

  // Handle updating connection settings
  const handleUpdateConnection = (database, newConnectionDetails) => {
    // Update the connection details
    setConnectionDetails(newConnectionDetails)
    // Save to localStorage
    localStorage.setItem('connectionDetails', JSON.stringify(newConnectionDetails))
    // The workspace will automatically reconnect since connectionDetails prop changed
  }

  const commonThemeProps = {
    theme,
    toggleTheme,
    themeMode,
    setThemeMode
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

          {connectedDatabase ? (
            <Workspace
              database={connectedDatabase}
              connectionDetails={connectionDetails}
              onDisconnect={handleDisconnect}
              onUpdateConnection={handleUpdateConnection}
              {...commonThemeProps}
            />
          ) : !selectedDatabase ? (
            <Box paddingBlockStart={32} paddingBlockEnd={64} paddingInlineStart={48} paddingInlineEnd={48} style={{ position: 'relative' }}>
              <TargetCursor
                spinDuration={2}
                hideDefaultCursor
                parallaxOn
                hoverDuration={0.2}
              />

              {/* Common Settings Button for Selection Screen */}
              <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}>
                <ThemeSettings {...commonThemeProps} />
              </div>

              {/* Logo */}
              <Box className="logo-container" marginBlockEnd={64}>
                <img src={queryPilotLogo} alt="Query Pilot" className="app-logo" />
              </Box>

              {/* TextType Heading - White Normal */}
              <Box className="heading-container" marginBlockEnd={48}>
                <TextType
                  text="Select Your Database"
                  className="typewriter-heading"
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor
                  cursorCharacter="_"
                  loop={false}
                  initialDelay={500}
                />
              </Box>

              {/* Database Grid */}
              <div className="database-grid">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`database-card-wrapper ${!db.available ? 'disabled' : 'cursor-target'}`}
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

              {/* Workspace History - Moved below database grid */}
              <WorkspaceHistory
                onSelectWorkspace={handleSelectWorkspace}
                databases={databases}
              />
            </Box>
          ) : (
            <>
              <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}>
                <ThemeSettings {...commonThemeProps} />
              </div>
              <ConnectionForm
                database={selectedDatabase}
                onBack={handleBackToSelection}
                onConnect={handleConnect}
              />
            </>
          )}
        </div>
      </ThemeProvider>
    </>
  )
}

export default App