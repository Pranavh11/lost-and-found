import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ItemDetail({ itemId, setCurrentPage, API_URL, user, addToast }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Claim state
  const [claims, setClaims] = useState([]);
  const [userClaim, setUserClaim] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    proofDescription: '',
    verificationAnswer: ''
  });
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const fetchItemDetails = () => {
    setLoading(true);
    fetch(`${API_URL}/items/${itemId}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
        
        // If logged-in user is the owner, fetch claims received for this item
        if (user && data.reportedBy._id === user.id) {
          fetchClaimsForItem();
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchClaimsForItem = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/claims/item/${itemId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setClaims(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  };

  // Check if logged-in user has already claimed this item
  const checkUserClaims = () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/claims/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const matching = data.find(c => c.item && c.item._id === itemId);
          if (matching) setUserClaim(matching);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (itemId) {
      fetchItemDetails();
      checkUserClaims();
    }
  }, [itemId, user]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setSubmittingClaim(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          proofDescription: claimForm.proofDescription,
          verificationAnswer: claimForm.verificationAnswer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit claim');

      addToast('Claim request submitted successfully! The reporter will review it.', 'success');
      setUserClaim(data);
      setShowClaimModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleManageClaim = async (claimId, action) => {
    // action: 'approved' or 'rejected'
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/claims/${claimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update claim');

      addToast(`Claim request ${action} successfully!`, 'success');
      fetchItemDetails(); // Reload item to show claimed status
      fetchClaimsForItem(); // Reload claims lists
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Item not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => setCurrentPage('browse')}>
          Back to Listings
        </button>
      </div>
    );
  }

  const isOwner = user && item.reportedBy._id === user.id;

  return (
    <div className="item-detail-container animated-fade-in">
      
      {/* Back Button */}
      <button 
        onClick={() => setCurrentPage('browse')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-color)',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Column: Image & Quick Stats Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '0px', overflow: 'hidden', height: '350px' }}>
            <img 
              src={item.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=600&q=80'} 
              alt={item.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Reward information removed */}
        </div>

        {/* Right Column: Descriptions & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card">
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-found" style={{ marginBottom: '8px' }}>{item.category}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{item.title}</h2>
              </div>
              <span className={`badge badge-${item.type}`} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                {item.type} Report
              </span>
            </div>

            {/* Meta details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '20px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Location:</strong> {item.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Date Reported:</strong> {new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Item Status:</strong> <span className={`badge badge-${item.status === 'claimed' ? 'claimed' : 'pending'}`} style={{ textTransform: 'capitalize' }}>{item.status}</span></span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.05rem' }}>Description</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {item.description}
              </p>
            </div>

            {/* Reporter Profile */}
            <div style={{
              background: 'var(--bg-color)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={item.reportedBy.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
                  alt="Reporter" 
                  style={{ width: '44px', height: '44px', borderRadius: '50px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reported By</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.reportedBy.username}</div>
                </div>
              </div>
            </div>

            {/* Action buttons (Claims) */}
            <div style={{ marginTop: '24px' }}>
              {item.status === 'claimed' ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  color: 'var(--success)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  ✅ Resolved: This item has been successfully claimed and returned.
                </div>
              ) : isOwner ? (
                <div style={{
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  ℹ️ You reported this item. Review incoming claims below.
                </div>
              ) : userClaim ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  color: 'var(--warning)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  border: '1px dashed rgba(245, 158, 11, 0.3)'
                }}>
                  ⏳ Claim request submitted — Status: <span style={{ textTransform: 'capitalize', fontWeight: 800 }}>{userClaim.status}</span>
                </div>
              ) : user ? (
                <button 
                  onClick={() => setShowClaimModal(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Submit Claim / Ownership Verification
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentPage('auth')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Login to Claim this Item
                </button>
              )}
            </div>

          </div>

          {/* Admin Owner Reviewing Claims Section */}
          {isOwner && (
            <div className="glass-card" style={{ marginTop: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Received Claims ({claims.length})</h3>
              {claims.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                  No claims submitted for this item yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {claims.map((cl) => (
                    <div 
                      key={cl._id} 
                      style={{
                        background: 'var(--bg-color)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--surface-border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={cl.claimer.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
                            alt="Claimer" 
                            style={{ width: '32px', height: '32px', borderRadius: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cl.claimer.username}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              {cl.claimer.phone || cl.claimer.email}
                            </span>
                          </div>
                        </div>
                        <span className={`badge badge-${cl.status}`}>{cl.status}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                        <div>
                          <strong>Proof Description:</strong>
                          <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{cl.proofDescription}</p>
                        </div>
                        <div>
                          <strong>Verification Answer:</strong>
                          <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{cl.verificationAnswer}</p>
                        </div>
                      </div>

                      {cl.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => handleManageClaim(cl._id, 'approved')}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                          >
                            Approve claim
                          </button>
                          <button 
                            onClick={() => handleManageClaim(cl._id, 'rejected')}
                            className="btn btn-danger"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                          >
                            Reject claim
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Claim Modal Popout */}
      {showClaimModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', background: 'var(--surface-color)' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <HelpCircle style={{ color: 'var(--primary)' }} /> Submit Verification Claim
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Answer the security verification questions to provide proof of ownership to the finder of this item.
            </p>

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label className="form-label">Ownership Description (Proof)</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  placeholder="Describe unique details (e.g. keychains attached, contents of a wallet, scratches, serial numbers)..."
                  value={claimForm.proofDescription}
                  onChange={(e) => setClaimForm({ ...claimForm, proofDescription: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Answer (Security Question verification)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. The wallet contains my driver license with name Jane Smith"
                  value={claimForm.verificationAnswer}
                  onChange={(e) => setClaimForm({ ...claimForm, verificationAnswer: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submittingClaim}
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowClaimModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
