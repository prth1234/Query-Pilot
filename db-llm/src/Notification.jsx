import React, { useState, useEffect } from 'react';
import './Notification.css';
import { CheckCircleIcon, XCircleIcon, XIcon, ChevronDownIcon } from '@primer/octicons-react';

const Notification = ({ type, message, onClose, duration = 4000, action }) => {
    const [timeLeft, setTimeLeft] = useState(duration / 1000);
    const [isPaused, setIsPaused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        if (timeLeft <= 0) {
            handleClose();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 0.1));
        }, 100);

        return () => clearInterval(interval);
    }, [timeLeft, isPaused]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for slideOut animation
    };

    const handleAction = (e) => {
        e.stopPropagation();
        if (action?.onClick) {
            action.onClick();
        }
    };

    // Calculate progress percentage
    const progress = Math.max(0, (timeLeft / (duration / 1000)) * 100);

    return (
        <div className={`notification-card ${type} ${isClosing ? 'closing' : ''}`}>
            <div className="notification-main">
                <div className="notification-icon-wrapper">
                    {type === 'success' ? <CheckCircleIcon size={20} /> : <XCircleIcon size={20} />}
                </div>
                <div className="notification-content">
                    <span className="notification-title">{message}</span>
                </div>
                <div className="notification-actions">
                    <button className="icon-button" onClick={() => setIsExpanded(!isExpanded)}>
                        <ChevronDownIcon size={16} className={`chevron ${isExpanded ? 'rotated' : ''}`} />
                    </button>
                    <button className="icon-button" onClick={handleClose}>
                        <XIcon size={16} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="notification-footer" onClick={() => setIsPaused(!isPaused)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span className="notification-timer">
                            Closing in {Math.ceil(timeLeft)}s.
                        </span>
                        {action && (
                            <span
                                className="action-link"
                                onClick={handleAction}
                                style={{ margin: 0 }}
                            >
                                {action.label}
                            </span>
                        )}
                        {!action && (
                            <span className="action-link">{isPaused ? 'Resume' : 'Stop'}</span>
                        )}
                    </div>
                </div>
            )}

            <div className="notification-progress-bg">
                <div
                    className="notification-progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Notification;
