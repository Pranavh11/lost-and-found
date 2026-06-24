import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ArrowRight, Layers, FileQuestion, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard({ setCurrentPage, setCurrentItemId, API_URL, user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/items`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [API_URL]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('browse');
      // We can pass query states via App or local storage. Let's save in sessionStorage for instant retrieval on Browse screen.
      sessionStorage.setItem('searchQuery', searchQuery);
    }
  };

  const getStats = () => {
    const total = items.length;
    const lost = items.filter(i => i.type === 'lost' && i.status === 'active').length;
    const found = items.filter(i => i.type === 'found' && i.status === 'active').length;
    const resolved = items.filter(i => i.status === 'claimed').length;
    return { total, lost, found, resolved };
  };

  const stats = getStats();
  const recentItems = items.slice(0, 4);

  const categories = [
    { name: 'Electronics', count: items.filter(i => i.category === 'Electronics').length, color: '#3b82f6' },
    { name: 'Keys', count: items.filter(i => i.category === 'Keys').length, color: '#f59e0b' },
    { name: 'Wallets', count: items.filter(i => i.category === 'Wallets').length, color: '#10b981' },
    { name: 'Pets', count: items.filter(i => i.category === 'Pets').length, color: '#ec4899' },
    { name: 'Documents', count: items.filter(i => i.category === 'Documents').length, color: '#8b5cf6' },
    { name: 'Others', count: items.filter(i => i.category === 'Others' || !['Electronics', 'Keys', 'Wallets', 'Pets', 'Documents'].includes(i.category)).length, color: '#6b7280' }
  ];

  return (
    <div className="dashboard-container animated-fade-in">
      
      {/* Hero Banner Section */}
      <div style={{
        background: 'var(--surface-color)',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
        padding: '48px 32px',
        borderRadius: '24px',
        textAlign: 'center',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-found" style={{ marginBottom: '16px', textTransform: 'none', padding: '6px 14px', fontSize: '0.8rem' }}>
            ✨ Community-driven retrieval helper
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
            Recover What's Yours, Return What's Found
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 28px auto', fontSize: '1.05rem' }}>
            Register your lost belongings or post items you've spotted. Our claim matching system helps return lost belongings back to their rightful owners.
          </p>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                if (user) {
                  sessionStorage.setItem('reportType', 'lost');
                  setCurrentPage('report');
                } else {
                  setCurrentPage('auth');
                }
              }}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              I Lost Something
            </button>
            <button 
              onClick={() => {
                if (user) {
                  sessionStorage.setItem('reportType', 'found');
                  setCurrentPage('report');
                } else {
                  setCurrentPage('auth');
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              I Found Something
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ maxWidth: '600px', margin: '-50px auto 32px auto', position: 'relative', zIndex: 5 }}>
        <form onSubmit={handleSearchSubmit} className="glass-card" style={{ padding: '8px', borderRadius: '50px', display: 'flex', gap: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search lost & found items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-color)',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '50px', padding: '10px 24px' }}>
            Search
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '12px' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Items Reported</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px' }}>
            <FileQuestion size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.lost}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Lost Reports</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.found}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Found Reports</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.resolved}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resolved Claims</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent feed vs Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Recent Items */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Recent Listings</h3>
            <button 
              onClick={() => {
                sessionStorage.removeItem('searchQuery');
                setCurrentPage('browse');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Browse All <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading listings...</div>
          ) : recentItems.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No listings reported yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentItems.map((item) => (
                <div 
                  key={item._id} 
                  className="glass-card" 
                  onClick={() => {
                    setCurrentItemId(item._id);
                    setCurrentPage('detail');
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '20px',
                    cursor: 'pointer',
                    padding: '16px'
                  }}
                >
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=200&q=80'} 
                    alt={item.title} 
                    style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.title}</h4>
                        <span className={`badge badge-${item.type}`}>
                          {item.type}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {item.location}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Categories & Info Panel */}
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Categories</h3>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            {categories.map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => {
                  sessionStorage.setItem('filterCategory', cat.name);
                  setCurrentPage('browse');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: 'var(--bg-color)',
                  transition: 'var(--transition)'
                }}
                className="category-row-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50px', backgroundColor: cat.color }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat.name}</span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: 'var(--surface-color)',
                  padding: '2px 8px',
                  borderRadius: '50px',
                  border: '1px solid var(--surface-border)'
                }}>
                  {cat.count}
                </span>
              </div>
            ))}
          </div>

          {/* Useful Tips Card */}
          <div className="glass-card" style={{
            marginTop: '24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))',
            borderColor: 'rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertCircle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Recovery Tip</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  When submitting a verification request for found items, describe specific characteristics (e.g. engravings, unique scratches, contents inside) that verify your ownership without giving away public details.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
