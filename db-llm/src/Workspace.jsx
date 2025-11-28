import { Box, Heading, Text, Button } from '@primer/react-brand'
import './Workspace.css'

function Workspace({ database, connectionDetails, onDisconnect }) {
    return (
        <Box className="workspace-container">
            <div className="workspace-header">
                <div className="header-left">
                    <div className="workspace-status">
                        <div className="status-indicator"></div>
                        <Text size="100" className="status-text">Connected</Text>
                    </div>
                    <Heading as="h1" size="4">This is my workspace</Heading>
                    <Text size="200" className="workspace-subtitle">
                        Connected to {database?.name || 'Database'}
                    </Text>
                </div>
                <Button variant="secondary" onClick={onDisconnect}>Disconnect</Button>
            </div>

            <div className="workspace-content">
                <div className="workspace-card">
                    <div className="card-icon">🚀</div>
                    <h3>Welcome to Your Workspace</h3>
                    <p>
                        You've successfully connected to your database.
                        More features coming soon!
                    </p>
                </div>

                <div className="connection-info">
                    <h4>Connection Details</h4>
                    <div className="info-grid">
                        {connectionDetails && Object.entries(connectionDetails).map(([key, value]) => (
                            key !== 'password' && (
                                <div key={key} className="info-item">
                                    <span className="info-label">{key}:</span>
                                    <span className="info-value">{value}</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </Box>
    )
}

export default Workspace
