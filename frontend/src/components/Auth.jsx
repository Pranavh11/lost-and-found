import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export default function Auth({ onAuthSuccess, API_URL, addToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };

    if (!isLogin && formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match!', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      addToast(isLogin ? `Welcome back, ${data.user.username}!` : 'Account created successfully!', 'success');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animated-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--text-color), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isLogin ? 'Manage and recover your lost belongings' : 'Join our network to track and return items'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '28px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: isLogin ? 'var(--surface-color)' : 'transparent',
              color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <LogIn size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: !isLogin ? 'var(--surface-color)' : 'transparent',
              color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: !isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="e.g. john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                name="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register here
              </a>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Login here
              </a>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
