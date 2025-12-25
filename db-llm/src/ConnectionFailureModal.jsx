import React from 'react'
import { Box } from '@primer/react-brand'
import { XCircleIcon, XIcon } from '@primer/octicons-react'
import './ConnectionFailureModal.css'

function ConnectionFailureModal({ isOpen, onClose, onEditConfig, onDisconnect }) {
    if (!isOpen) return null

    return (
        <div className="failure-modal-overlay">
            <div className="failure-modal-content">
                <button className="failure-close-btn" onClick={onClose}>
                    <XIcon size={20} />
                </button>

                <div className="failure-icon-wrapper">
                    <XCircleIcon size={48} />
                </div>

                <h2 className="failure-title">Connection Failed</h2>

                <p className="failure-message">
                    We couldn't connect to the database with the provided credentials.
                    Please check your configuration or try again.
                </p>

                <div className="failure-actions-row">
                    <button
                        className="btn-action-outline"
                        onClick={onEditConfig}
                    >
                        Edit Configuration
                    </button>

                    <button
                        className="btn-action-ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>

                <button className="btn-action-link" onClick={onDisconnect}>
                    Connect to a different database
                </button>
            </div>
        </div>
    )
}

export default ConnectionFailureModal
