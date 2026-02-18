import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const DMAScheduling = () => {
  const [dmas, setDmas] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dmaId: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    duration: 240, // 4 hours default
    notes: ''
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dmasRes, activeRes] = await Promise.all([
        api.get('/dma'),
        api.get('/dma/schedules/active')
      ]);

      setDmas(dmasRes.data);
      setActiveSchedules(activeRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/dma/${formData.dmaId}/schedules`, formData);
      setShowForm(false);
      setFormData({
        dmaId: '',
        scheduleDate: new Date().toISOString().split('T')[0],
        startTime: '06:00',
        duration: 240,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('Failed to create schedule');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          DMA WATER SUPPLY SCHEDULING
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {showForm ? 'CANCEL' : 'NEW SCHEDULE'}
        </button>
      </div>

      {/* Active Schedules Panel */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '1rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333'
        }}>
          CURRENTLY ACTIVE SCHEDULES
        </h3>
        {activeSchedules.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No active schedules
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSchedules.map(schedule => (
              <div
                key={schedule.id}
                style={{
                  padding: '1rem',
                  backgroundColor: schedule.isActive ? '#e8f5e9' : '#fff3e0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {schedule.dmaName || `DMA ${schedule.dmaId}`}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {schedule.scheduleDate} | {schedule.startTime} - {schedule.endTime} 
                    ({Math.floor(schedule.duration / 60)}h {schedule.duration % 60}m)
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: schedule.isActive ? '#00a86b' : '#f39c12',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {schedule.isActive ? 'ACTIVE' : 'UPCOMING'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#333'
          }}>
            CREATE NEW SCHEDULE
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  DMA
                </label>
                <select
                  value={formData.dmaId}
                  onChange={(e) => setFormData({ ...formData, dmaId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select DMA</option>
                  {dmas.map(dma => (
                    <option key={dma.dmaId} value={dma.dmaId}>
                      {dma.dmaName || `DMA ${dma.dmaId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  SCHEDULE DATE
                </label>
                <input
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  START TIME
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  DURATION (MINUTES)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                  min="60"
                  step="60"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                NOTES (OPTIONAL)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#00a86b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              CREATE SCHEDULE
            </button>
          </form>
        </div>
      )}

      {/* All DMAs List */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '1rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333'
        }}>
          ALL DMAs
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {dmas.map(dma => (
            <div
              key={dma.dmaId}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => {
                setFormData({ ...formData, dmaId: dma.dmaId });
                setShowForm(true);
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {dma.dmaName || `DMA ${dma.dmaId}`}
              </div>
              {dma.zoneName && (
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Zone: {dma.zoneName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DMAScheduling;
