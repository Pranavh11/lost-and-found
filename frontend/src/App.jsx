import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BrowseItems from './components/BrowseItems';
import ItemDetail from './components/ItemDetail';
import ReportForm from './components/ReportForm';
import MyActivities from './components/MyActivities';
import Auth from './components/Auth';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentItemId, setCurrentItemId] = useState(null);

  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Custom Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Load User & Token from localStorage on start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    addToast('Logged out successfully', 'info');
    setCurrentPage('dashboard');
  };

  // Toast Utility
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setCurrentItemId={setCurrentItemId} 
            API_URL={API_URL} 
            user={user}
          />
        );
      case 'browse':
        return (
          <BrowseItems 
            setCurrentPage={setCurrentPage} 
            setCurrentItemId={setCurrentItemId} 
            API_URL={API_URL} 
          />
        );
      case 'report':
        return (
          <ReportForm 
            setCurrentPage={setCurrentPage} 
            setCurrentItemId={setCurrentItemId} 
            API_URL={API_URL} 
            addToast={addToast}
          />
        );
      case 'detail':
        return (
          <ItemDetail 
            itemId={currentItemId} 
            setCurrentPage={setCurrentPage} 
            API_URL={API_URL} 
            user={user} 
            addToast={addToast}
          />
        );
      case 'my-activities':
        return (
          <MyActivities 
            setCurrentPage={setCurrentPage} 
            setCurrentItemId={setCurrentItemId} 
            API_URL={API_URL} 
            user={user} 
            addToast={addToast}
          />
        );
      case 'auth':
        return (
          <Auth 
            onAuthSuccess={handleAuthSuccess} 
            API_URL={API_URL} 
            addToast={addToast} 
          />
        );
      default:
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setCurrentItemId={setCurrentItemId} 
            API_URL={API_URL} 
            user={user}
          />
        );
    }
  };

  return (
    <div className="app-container">
      
      {/* Top Navigation */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        onLogout={handleLogout}
      />

      {/* Main Pages Frame */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Custom Toast Notifications Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '350px',
        width: '100%'
      }}>
        {toasts.map((toast) => {
          let color = '#3b82f6';
          let bg = 'rgba(59, 130, 246, 0.1)';
          let icon = <Info size={18} />;

          if (toast.type === 'success') {
            color = '#10b981';
            bg = 'rgba(16, 185, 129, 0.1)';
            icon = <CheckCircle size={18} />;
          } else if (toast.type === 'error') {
            color = '#ef4444';
            bg = 'rgba(239, 68, 68, 0.1)';
            icon = <AlertCircle size={18} />;
          } else if (toast.type === 'warning') {
            color = '#f59e0b';
            bg = 'rgba(245, 158, 11, 0.1)';
            icon = <AlertTriangle size={18} />;
          }

          return (
            <div 
              key={toast.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderRadius: '12px',
                borderLeft: `5px solid ${color}`,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                background: 'var(--surface-color)',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color }}>{icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{toast.message}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
