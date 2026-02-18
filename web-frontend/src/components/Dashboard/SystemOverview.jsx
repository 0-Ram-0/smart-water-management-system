import React from 'react';

const SystemOverview = ({ data, loading, error, onRetry }) => {
  if (loading && !data) {
    return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!data) {
    return (
      <div style={{ padding: '1rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Failed to load data</span>
        <button
          onClick={onRetry}
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
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ label, total, active, unit = '' }) => (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '1rem',
      flex: '1',
      minWidth: '150px'
    }}>
      <div style={{
        fontSize: '0.75rem',
        color: '#666',
        marginBottom: '0.5rem',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
      }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '0.25rem'
      }}>
        {total} {unit}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#00a86b'
      }}>
        Active: {active}
      </div>
    </div>
  );

  return (
    <div>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '1rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        SYSTEM OVERVIEW
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <StatCard 
          label="Pipelines" 
          total={data.pipelines ?? 0} 
          active={data.pipelines ?? 0} 
        />
        <StatCard 
          label="Sensors" 
          total={data.sensors ?? 0} 
          active={data.sensors ?? 0} 
        />
        <StatCard 
          label="Tanks" 
          total={data.tanks ?? 0} 
          active={data.tanks ?? 0} 
        />
        <StatCard 
          label="Sources" 
          total={data.sources ?? 0} 
          active={data.sources ?? 0} 
        />
        <StatCard 
          label="Active Alerts" 
          total={data.alerts?.active ?? 0} 
          active={data.alerts?.total ?? 0} 
        />
        <StatCard 
          label="Avg Pressure" 
          total={(data.avgPressure ?? 0).toFixed(2)} 
          active={(data.avgPressure ?? 0).toFixed(2)} 
          unit="m"
        />
        <StatCard 
          label="Avg Flow" 
          total={(data.avgFlow ?? 0).toFixed(2)} 
          active={(data.avgFlow ?? 0).toFixed(2)} 
          unit="L/s"
        />
      </div>
    </div>
  );
};

export default SystemOverview;
