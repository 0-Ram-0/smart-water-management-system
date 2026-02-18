import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import SystemOverview from '../../components/Dashboard/SystemOverview';
import AlertPanel from '../../components/Dashboard/AlertPanel';
import SensorPanels from '../../components/Dashboard/SensorPanels';
import DashboardCharts from '../../components/Dashboard/DashboardCharts';
import api from '../../config/api';
import MapView from './MapView';
import DMAScheduling from './DMAScheduling';
import EngineerManagement from './EngineerManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="admin" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ 
          padding: '2rem',
          backgroundColor: '#f5f7fa'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #ddd'
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                fontFamily: 'Arial, sans-serif'
              }}>
                CONTROL ROOM DASHBOARD
              </h1>
              <p style={{ 
                margin: '0.25rem 0 0 0',
                fontSize: '0.75rem',
                color: '#666',
                fontFamily: 'monospace'
              }}>
                OPERATOR: {user?.fullName?.toUpperCase()} | ROLE: {user?.role?.toUpperCase()}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              LOGOUT
            </button>
          </div>
          
          <Routes>
            <Route path="dashboard" element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SystemOverview 
                  data={dashboardData?.kpis} 
                  loading={loading} 
                  error={error} 
                  onRetry={fetchDashboard}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <AlertPanel 
                    alerts={dashboardData?.activeAlerts || []}
                    loading={loading}
                    error={!!error}
                    onRetry={fetchDashboard}
                  />
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '1rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      QUICK ACTIONS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        onClick={() => navigate('/admin/map')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#0066cc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        VIEW GIS MAP
                      </button>
                      <button 
                        onClick={() => navigate('/admin/dma')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#00a86b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        DMA SCHEDULING
                      </button>
                      <button 
                        onClick={() => navigate('/admin/tasks')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f39c12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        ENGINEER MANAGEMENT
                      </button>
                    </div>
                  </div>
                </div>
                <SensorPanels 
                  latestReadings={dashboardData?.latestReadings || []}
                  loading={loading}
                  error={!!error}
                  onRetry={fetchDashboard}
                />
                <DashboardCharts 
                  trends={dashboardData?.trends}
                  dmaStats={dashboardData?.dmaStats}
                  loading={loading}
                  error={!!error}
                  onRetry={fetchDashboard}
                />
              </div>
            } />
            <Route path="map" element={
              <div style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
                <MapView />
              </div>
            } />
            <Route path="dma" element={<DMAScheduling />} />
            <Route path="tasks" element={<EngineerManagement />} />
            <Route path="*" element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SystemOverview 
                  data={dashboardData?.kpis} 
                  loading={loading} 
                  error={error} 
                  onRetry={fetchDashboard}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <AlertPanel 
                    alerts={dashboardData?.activeAlerts || []}
                    loading={loading}
                    error={!!error}
                    onRetry={fetchDashboard}
                  />
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '1rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      QUICK ACTIONS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        onClick={() => navigate('/admin/map')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#0066cc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        VIEW GIS MAP
                      </button>
                      <button 
                        onClick={() => navigate('/admin/dma')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#00a86b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        DMA SCHEDULING
                      </button>
                      <button 
                        onClick={() => navigate('/admin/tasks')}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#f39c12',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textAlign: 'left'
                        }}
                      >
                        ENGINEER MANAGEMENT
                      </button>
                    </div>
                  </div>
                </div>
                <SensorPanels 
                  latestReadings={dashboardData?.latestReadings || []}
                  loading={loading}
                  error={!!error}
                  onRetry={fetchDashboard}
                />
                <DashboardCharts 
                  trends={dashboardData?.trends}
                  dmaStats={dashboardData?.dmaStats}
                  loading={loading}
                  error={!!error}
                  onRetry={fetchDashboard}
                />
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
