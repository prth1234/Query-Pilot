import { useState } from 'react'
import { Box, Heading, Text } from '@primer/react-brand'
import { LuHistory, LuChevronDown, LuChevronRight } from "react-icons/lu"
import './WorkspaceHistory.css'

function WorkspaceHistory({ onSelectWorkspace, databases }) {
    const [expandedSections, setExpandedSections] = useState({
        saved: true,
        recent: true,
        example: true
    })

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    // Get saved workspaces from localStorage
    const getSavedWorkspaces = () => {
        try {
            const saved = localStorage.getItem('savedWorkspaces')
            return saved ? JSON.parse(saved) : []
        } catch (error) {
            return []
        }
    }

    // Get recent workspaces from localStorage
    const getRecentWorkspaces = () => {
        try {
            const recent = localStorage.getItem('recentWorkspaces')
            return recent ? JSON.parse(recent) : []
        } catch (error) {
            return []
        }
    }

    const savedWorkspaces = getSavedWorkspaces()
    const recentWorkspaces = getRecentWorkspaces().slice(0, 5) // Show only last 5

    // Example workspaces (predefined for quick start)
    const exampleWorkspaces = [
        {
            id: 'example-mysql-1',
            name: 'Local MySQL Demo',
            database: databases.find(db => db.id === 'mysql'),
            connectionDetails: {
                host: 'localhost',
                port: '3306',
                username: 'root',
                password: '',
                database: 'demo_db'
            },
            isExample: true
        },
        {
            id: 'example-postgres-1',
            name: 'Local PostgreSQL Demo',
            database: databases.find(db => db.id === 'postgresql'),
            connectionDetails: {
                host: 'localhost',
                port: '5432',
                username: 'postgres',
                password: '',
                database: 'demo_db'
            },
            isExample: true
        }
    ]

    const formatLastUsed = (timestamp) => {
        if (!timestamp) return 'Never'
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const handleWorkspaceClick = (workspace) => {
        onSelectWorkspace(workspace)
    }

    const handleDeleteWorkspace = (workspaceId, e) => {
        e.stopPropagation()
        const saved = getSavedWorkspaces()
        const updated = saved.filter(w => w.id !== workspaceId)
        localStorage.setItem('savedWorkspaces', JSON.stringify(updated))
        // Force re-render by dispatching a custom event
        window.dispatchEvent(new Event('workspaceUpdated'))
    }

    const WorkspaceCard = ({ workspace, showDelete = false }) => (
        <div
            className="workspace-card cursor-target"
            onClick={() => handleWorkspaceClick(workspace)}
        >
            <div className="workspace-card-header">
                <div className="workspace-db-icon">
                    {workspace.database?.logo ? (
                        <img src={workspace.database.logo} alt={workspace.database.name} className="db-icon-img" />
                    ) : (
                        <span className="db-icon-text">{workspace.database?.icon || '🗄️'}</span>
                    )}
                </div>
                <div className="workspace-info">
                    <div className="workspace-name">{workspace.name}</div>
                    <div className="workspace-meta">
                        <span className="workspace-db-name">{workspace.database?.name}</span>
                        {workspace.connectionDetails?.database && ` / ${workspace.connectionDetails.database}`}
                    </div>
                </div>
                {showDelete && (
                    <button
                        className="delete-workspace-btn"
                        onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                        title="Remove workspace"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5H3V1.75C3 .784 3.784 0 4.75 0h6.5C12.216 0 13 .784 13 1.75ZM4.496 6.675a.75.75 0 1 0-1.492.15l.66 6.6A1.75 1.75 0 0 0 5.405 15h5.19c.9 0 1.653-.681 1.741-1.576l.66-6.6a.75.75 0 0 0-1.492-.149l-.66 6.6a.25.25 0 0 1-.249.225h-5.19a.25.25 0 0 1-.249-.225l-.66-6.6Z" />
                        </svg>
                    </button>
                )}
            </div>
            <div className="workspace-details">
                <span className="workspace-detail-item">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" />
                    </svg>
                    {formatLastUsed(workspace.lastUsed)}
                </span>
                <span className="workspace-detail-item">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25V5h13V1.75a.25.25 0 0 0-.25-.25Zm13 4.75h-13v8c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z" />
                    </svg>
                    {workspace.connectionDetails?.host || 'localhost'}
                </span>
            </div>
        </div>
    )

    const renderSectionHeader = (title, count, icon, sectionKey) => {
        const isExpanded = expandedSections[sectionKey]
        return (
            <div
                className={`section-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleSection(sectionKey)}
            >
                <div className="section-title-container">
                    <span className="section-toggle-icon">
                        {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
                    </span>
                    <Heading as="h3" size="7" className="section-title">
                        {icon}
                        {title}
                    </Heading>
                </div>
                {count !== undefined && (
                    <span className="workspace-count">{count}</span>
                )}
            </div>
        )
    }

    const hasAnyWorkspaces = savedWorkspaces.length > 0 || recentWorkspaces.length > 0

    if (!hasAnyWorkspaces) {
        return null
    }

    return (
        <Box className="workspace-history-container" marginBlockEnd={48}>
            {savedWorkspaces.length > 0 && (
                <div className="workspace-section">
                    {renderSectionHeader(
                        "Saved Workspaces",
                        savedWorkspaces.length,
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="m8.88 1.08-.52.52a3.75 3.75 0 0 1-5.31 0l-.52-.52a.75.75 0 0 0-1.06 1.06l.52.52a5.25 5.25 0 0 0 7.42 0l.52-.52a.75.75 0 0 0-1.06-1.06ZM15 8a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h2.5A.75.75 0 0 1 15 8ZM4.97 12.97a.75.75 0 0 0 1.06 1.06l1.47-1.47a.75.75 0 0 0-1.06-1.06l-1.47 1.47ZM3.28 8A3.22 3.22 0 0 1 6.5 4.78a.75.75 0 0 0 0-1.5A4.72 4.72 0 0 0 1.78 8a.75.75 0 0 0 1.5 0Z" />
                        </svg>,
                        'saved'
                    )}
                    {expandedSections.saved && (
                        <div className="workspace-grid">
                            {savedWorkspaces.map((workspace) => (
                                <WorkspaceCard key={workspace.id} workspace={workspace} showDelete={true} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {recentWorkspaces.length > 0 && (
                <div className="workspace-section">
                    {renderSectionHeader(
                        "Recent Workspaces",
                        recentWorkspaces.length,
                        <LuHistory style={{ marginRight: '8px', fontSize: '16px' }} />,
                        'recent'
                    )}
                    {expandedSections.recent && (
                        <div className="workspace-grid">
                            {recentWorkspaces.map((workspace) => (
                                <WorkspaceCard key={workspace.id} workspace={workspace} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {exampleWorkspaces.length > 0 && (
                <div className="workspace-section">
                    {renderSectionHeader(
                        "Example Workspaces",
                        undefined,
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                        </svg>,
                        'example'
                    )}
                    {expandedSections.example && (
                        <div className="workspace-grid">
                            {exampleWorkspaces.filter(w => w.database).map((workspace) => (
                                <WorkspaceCard key={workspace.id} workspace={workspace} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Box>
    )
}

export default WorkspaceHistory
