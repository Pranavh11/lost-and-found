import React from 'react';
import { ShieldAlert, LayoutDashboard, Search, FileText, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  return (
    <nav className="glass-card" style={{
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '0px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentPage('dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px var(--primary-glow)'
        }}>
          <ShieldAlert size={20} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Outfit' }}>
          Retrieve<span style={{ color: 'var(--primary)' }}>Hub</span>
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="nav-btn"
          style={{
            background: currentPage === 'dashboard' ? 'var(--primary-glow)' : 'transparent',
            color: currentPage === 'dashboard' ? 'var(--primary)' : 'var(--text-color)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'var(--transition)'
          }}
        >
          <LayoutDashboard size={16} />
          <span className="nav-text">Dashboard</span>
        </button>

        <button 
          onClick={() => setCurrentPage('browse')}
          className="nav-btn"
          style={{
            background: currentPage === 'browse' ? 'var(--primary-glow)' : 'transparent',
            color: currentPage === 'browse' ? 'var(--primary)' : 'var(--text-color)',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'var(--transition)'
          }}
        >
          <Search size={16} />
          <span className="nav-text">Browse</span>
        </button>

        {user && (
          <>
            <button 
              onClick={() => setCurrentPage('report')}
              className="nav-btn"
              style={{
                background: currentPage === 'report' ? 'var(--primary-glow)' : 'transparent',
                color: currentPage === 'report' ? 'var(--primary)' : 'var(--text-color)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition)'
              }}
            >
              <FileText size={16} />
              <span className="nav-text">Report Item</span>
            </button>

            <button 
              onClick={() => setCurrentPage('my-activities')}
              className="nav-btn"
              style={{
                background: currentPage === 'my-activities' ? 'var(--primary-glow)' : 'transparent',
                color: currentPage === 'my-activities' ? 'var(--primary)' : 'var(--text-color)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition)'
              }}
            >
              <User size={16} />
              <span className="nav-text">My Activity</span>
            </button>
          </>
        )}
      </div>

      {/* Right Side Options (User Profile) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
              alt="Profile" 
              style={{ width: '36px', height: '36px', borderRadius: '50px', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div className="nav-profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.username}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Logged In</span>
            </div>
            <button 
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentPage('auth')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <LogIn size={14} />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
