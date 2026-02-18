import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', code: 'DASH' },
          { path: '/admin/map', label: 'GIS Map', code: 'MAP' },
          { path: '/admin/sensors', label: 'Sensors', code: 'SENS' },
          { path: '/admin/dma', label: 'DMA Management', code: 'DMA' },
          { path: '/admin/alerts', label: 'Alerts', code: 'ALRT' },
          { path: '/admin/tasks', label: 'Task Management', code: 'TASK' },
          { path: '/admin/complaints', label: 'Complaints', code: 'COMP' },
          { path: '/admin/reports', label: 'Reports', code: 'RPT' },
          { path: '/admin/users', label: 'User Management', code: 'USER' }
        ];
      case 'engineer':
        return [
          { path: '/engineer/dashboard', label: 'Dashboard', code: 'DASH' },
          { path: '/engineer/tasks', label: 'My Tasks', code: 'TASK' },
          { path: '/engineer/map', label: 'Map View', code: 'MAP' },
          { path: '/engineer/complaints', label: 'Complaints', code: 'COMP' }
        ];
      case 'citizen':
        return [
          { path: '/citizen/dashboard', label: 'Dashboard', code: 'DASH' },
          { path: '/citizen/complaints', label: 'My Complaints', code: 'COMP' },
          { path: '/citizen/bills', label: 'Bills & Payments', code: 'BILL' },
          { path: '/citizen/water-supply', label: 'Water Supply', code: 'WTR' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '220px',
      backgroundColor: '#1e1e2e',
      color: '#e0e0e0',
      minHeight: '100vh',
      padding: '0',
      borderRight: '1px solid #333',
      fontFamily: 'monospace'
    }}>
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              color: location.pathname === item.path ? '#ffffff' : '#b0b0b0',
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? '#0066cc' : 'transparent',
              borderLeft: location.pathname === item.path ? '3px solid #00a86b' : '3px solid transparent',
              fontSize: '0.875rem',
              fontWeight: location.pathname === item.path ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = '#2a2a3a';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#b0b0b0';
              }
            }}
          >
            <span style={{ 
              marginRight: '0.75rem', 
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: location.pathname === item.path ? '#00a86b' : '#666',
              fontWeight: '600',
              minWidth: '35px'
            }}>
              {item.code}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
