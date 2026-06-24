import React, { useState, useEffect } from 'react';
import { ListTodo, ShieldAlert, FileText, CheckSquare, Trash2, Calendar, MapPin, ExternalLink } from 'lucide-react';

export default function MyActivities({ setCurrentPage, setCurrentItemId, API_URL, user, addToast }) {
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'claims'

  const fetchUserItems = () => {
    setLoadingItems(true);
    // Fetch all items and filter by reportedBy
    fetch(`${API_URL}/items`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const userItems = data.filter(item => item.reportedBy && item.reportedBy._id === user.id);
          setMyItems(userItems);
        }
        setLoadingItems(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingItems(false);
      });
  };

  const fetchUserClaims = () => {
    setLoadingClaims(true);
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/claims/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setMyClaims(Array.isArray(data) ? data : []);
        setLoadingClaims(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingClaims(false);
      });
  };

  useEffect(() => {
    if (user) {
      fetchUserItems();
      fetchUserClaims();
    }
  }, [user]);

  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation(); // Prevent navigation to detail
    if (!window.confirm('Are you sure you want to remove this item report?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to remove report');
      addToast('Report deleted successfully', 'success');
      setMyItems(myItems.filter(item => item._id !== itemId));
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="activities-container animated-fade-in">
      
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>My Activities & Center</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review reports published by you and track your verification claims status</p>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--surface-border)',
        marginBottom: '28px',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-muted)',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)'
          }}
        >
          <FileText size={18} />
          My Published Reports ({myItems.length})
        </button>
        
        <button
          onClick={() => setActiveTab('claims')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'claims' ? 'var(--primary)' : 'var(--text-muted)',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)'
          }}
        >
          <ListTodo size={18} />
          My Verification Claims ({myClaims.length})
        </button>
      </div>

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <div>
          {loadingItems ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</div>
          ) : myItems.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <h3>No items reported</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>If you've lost or found anything, publish a report now.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '20px' }}
                onClick={() => setCurrentPage('report')}
              >
                Create New Report
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myItems.map((item) => (
                <div
                  key={item._id}
                  className="glass-card"
                  onClick={() => {
                    setCurrentItemId(item._id);
                    setCurrentPage('detail');
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '20px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '16px'
                  }}
                >
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=200&q=80'} 
                    alt={item.title} 
                    style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.title}</h4>
                      <span className={`badge badge-${item.type}`}>{item.type}</span>
                      <span className={`badge badge-${item.status === 'claimed' ? 'claimed' : 'pending'}`}>{item.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {item.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={(e) => handleDeleteItem(item._id, e)}
                      className="btn btn-secondary"
                      style={{ color: 'var(--danger)', borderColor: 'var(--surface-border)', padding: '10px' }}
                      title="Delete report"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '10px' }}
                      title="View claims & details"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claims Tab Content */}
      {activeTab === 'claims' && (
        <div>
          {loadingClaims ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading claims...</div>
          ) : myClaims.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <h3>No verification claims submitted</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>When you see an item reported by someone else that belongs to you, submit a verification claim.</p>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '20px' }}
                onClick={() => setCurrentPage('browse')}
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myClaims.map((cl) => {
                if (!cl.item) return null;
                return (
                  <div
                    key={cl._id}
                    className="glass-card"
                    onClick={() => {
                      setCurrentItemId(cl.item._id);
                      setCurrentPage('detail');
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '20px',
                      cursor: 'pointer',
                      padding: '20px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Claim for: {cl.item.title}</h4>
                        <span className={`badge badge-${cl.status}`}>{cl.status}</span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>My Proof Details:</strong> {cl.proofDescription}</div>
                        <div><strong>Security Answer:</strong> {cl.verificationAnswer}</div>
                        {cl.item.reportedBy && (
                          <div style={{ color: 'var(--text-color)', marginTop: '8px', fontStyle: 'italic' }}>
                            Posted by user: <strong>{cl.item.reportedBy.username}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
