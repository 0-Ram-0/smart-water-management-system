import React from 'react';

const SensorPanels = ({ latestReadings, loading, error, onRetry }) => {
  const grouped = React.useMemo(() => {
    const base = { pressure: [], flow: [], level: [] };
    if (!Array.isArray(latestReadings)) return base;
    latestReadings.forEach((item) => {
      if (!item.sensor_type && !item.sensorType) return;
      const type = item.sensor_type || item.sensorType;
      if (!base[type]) return;
      base[type].push({
        sensorId: item.sensor_id || item.sensorId,
        sensorType: type,
        dmaName: item.dma_name || item.dmaName,
        status: 'active',
        latestValue: item.value,
        lastUpdate: item.recorded_at || item.recordedAt
      });
    });
    return base;
  }, [latestReadings]);

  const SensorPanel = ({ title, sensors, unit }) => {
    if (loading) {
      return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '1rem',
        flex: '1',
        minWidth: '300px'
      }}>
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '1rem',
          fontFamily: 'Arial, sans-serif',
          borderBottom: '1px solid #eee',
          paddingBottom: '0.5rem'
        }}>
          {title.toUpperCase()} SENSORS
        </h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {sensors.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
              No {title} sensors
            </div>
          ) : (
            sensors.map(sensor => (
              <div
                key={sensor.sensorId}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    SENSOR {sensor.sensorId}
                  </div>
                  {sensor.dmaName && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#666',
                      fontFamily: 'monospace'
                    }}>
                      {sensor.dmaName}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {sensor.latestValue !== null ? (
                    <>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: sensor.status === 'active' ? '#00a86b' : '#e74c3c'
                      }}>
                        {sensor.latestValue.toFixed(2)} {unit}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#999',
                        fontFamily: 'monospace'
                      }}>
                        {sensor.lastUpdate ? new Date(sensor.lastUpdate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#999',
                      fontStyle: 'italic'
                    }}>
                      No data
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '1rem', fontFamily: 'Arial, sans-serif' }}>
          SENSOR MONITORING
        </h3>
        <div style={{ padding: '1rem', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Failed to load sensor data</span>
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
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '1rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        SENSOR MONITORING
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        <SensorPanel title="Pressure" sensors={grouped.pressure} unit="m" />
        <SensorPanel title="Flow" sensors={grouped.flow} unit="L/s" />
        <SensorPanel title="Tank Level" sensors={grouped.level} unit="m" />
      </div>
    </div>
  );
};

export default SensorPanels;
