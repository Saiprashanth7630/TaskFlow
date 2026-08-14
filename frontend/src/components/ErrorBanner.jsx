import React from 'react';

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-content">
        <span className="error-icon" aria-hidden="true">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      <button 
        type="button" 
        className="error-dismiss-btn" 
        onClick={onClose} 
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}
