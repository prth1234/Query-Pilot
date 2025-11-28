import { useState, useEffect } from 'react'
import { Heading, Text, Grid, Stack, Box } from '@primer/react-brand'
import { ThemeProvider } from '@primer/react-brand'
import '@primer/react-brand/lib/css/main.css'
import LoadingAnimation from './LoadingAnimation'
import ConnectionForm from './ConnectionForm'
import Workspace from './Workspace'
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

      <ThemeProvider colorMode="dark">
        <div className={`app-container ${showContent ? 'fade-in' : ''}`}>
          {connectedDatabase ? (
            <Workspace
              database={connectedDatabase}
              connectionDetails={connectionDetails}
              onDisconnect={handleDisconnect}
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