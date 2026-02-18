import React from 'react';

const Header = () => {
  return (
    <header style={{
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      padding: '0.75rem 2rem',
      borderBottom: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.25rem',
          fontWeight: '600',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff'
        }}>
          SMART WATER MANAGEMENT SYSTEM
        </h1>
        <p style={{ 
          margin: '0.125rem 0 0 0', 
          fontSize: '0.75rem', 
          color: '#999',
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          SOLAPUR MUNICIPAL CORPORATION | CONTROL ROOM
        </p>
      </div>
      <div style={{
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        color: '#00a86b'
      }}>
        {new Date().toLocaleString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).toUpperCase()}
      </div>
    </header>
  );
};

export default Header;
