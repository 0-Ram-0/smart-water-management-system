import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import EngineerDashboard from './pages/engineer/EngineerDashboard';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import api from './config/api';

function App() {
  const { isAuthenticated, login, role } = useAuthStore();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !isAuthenticated) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.user) {
            login(response.data.user, storedToken);
          }
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={
                  role === 'admin' ? '/admin/dashboard' :
                  role === 'engineer' ? '/engineer/dashboard' :
                  '/citizen/dashboard'
                } replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engineer/*" 
            element={
              <ProtectedRoute allowedRoles={['engineer']}>
                <EngineerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/*" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
