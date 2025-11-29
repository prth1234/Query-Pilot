import React from 'react';
import './MagicReveal.css';

const MagicReveal = ({ children }) => {
    return (
        <div className="magic-reveal-container">
            {children}
            <div className="magic-wave-overlay"></div>
        </div>
    );
};

export default MagicReveal;
