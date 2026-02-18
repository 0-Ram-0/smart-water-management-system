import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';

const CitizenDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="citizen" />
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
                CITIZEN PORTAL
              </h1>
              <p style={{ 
                margin: '0.25rem 0 0 0',
                fontSize: '0.75rem',
                color: '#666',
                fontFamily: 'monospace'
              }}>
                USER: {user?.fullName?.toUpperCase()}
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
          
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem'
            }}>
              COMPLAINTS & BILLING
            </h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Citizen portal for complaint submission and bill payment.
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', marginTop: '0.5rem' }}>
              Complaint and billing features will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
