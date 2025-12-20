import { useState } from 'react'
import './DatabaseSelector.css'
import { databases } from './databaseConfig'

function DatabaseSelector({ onSelectDatabase }) {
    const [selectedDb, setSelectedDb] = useState(null)

    const handleSelectDatabase = (database) => {
        if (database.available) {
            setSelectedDb(database.id)
            onSelectDatabase(database)
        }
    }

    return (
        <div className="database-selector">
            <div className="selector-header">
                <h2>Select Your Database</h2>
                <p className="subtitle">Choose from our supported databases to get started</p>
            </div>

            <div className="database-grid">
                {databases.map((db) => (
                    <div
                        key={db.id}
                        className={`database-card ${selectedDb === db.id ? 'selected' : ''} ${!db.available ? 'disabled' : ''}`}
                        onClick={() => handleSelectDatabase(db)}
                    >
                        <div className="db-icon">{db.icon}</div>
                        <h3 className="db-name">{db.name}</h3>
                        <p className="db-category">{db.category}</p>
                        <p className="db-description">{db.description}</p>
                        {/* {db.comingSoon && <span className="coming-soon-badge">Coming Soon</span>} */}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DatabaseSelector
