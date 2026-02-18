import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

const AlertPanel = ({ alerts: initialAlerts, loading, error, onRetry }) => {
  const [alerts, setAlerts] = React.useState(initialAlerts || []);
  const navigate = useNavigate();

  React.useEffect(() => {
    setAlerts(initialAlerts || []);
  }, [initialAlerts]);

  // Listen for real-time alert updates via WebSocket
  useSocket('new_alert', (newAlert) => {
    setAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep only latest 10
  });

  useSocket('alert_updated', (updatedAlert) => {
    setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? { ...a, ...updatedAlert } : a));
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getTypeLabel = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading && alerts.length === 0) {
    return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading alerts...</div>;
  }

  if (error && alerts.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', fontFamily: 'Arial, sans-serif' }}>ACTIVE ALERTS</h3>
        </div>
        <div style={{ padding: '1rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Failed to load alerts</span>
          <button
            onClick={onRetry}
            style={{ padding: '0.25rem 0.75rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#333',
          fontFamily: 'Arial, sans-serif'
        }}>
          ACTIVE ALERTS
        </h3>
        <button
          onClick={() => navigate('/admin/alerts')}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          VIEW ALL
        </button>
      </div>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No active alerts
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => navigate(`/admin/alerts/${alert.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '4px',
                  height: '100%',
                  backgroundColor: getSeverityColor(alert.severity),
                  borderRadius: '2px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.25rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {alert.title}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#666',
                      fontFamily: 'monospace'
                    }}>
                      {new Date(alert.createdAt).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginBottom: '0.25rem'
                  }}>
                    {getTypeLabel(alert.type)} | {alert.severity.toUpperCase()}
                  </div>
                  {alert.location && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#999',
                      fontFamily: 'monospace'
                    }}>
                      {alert.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
