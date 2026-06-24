import React, { useState, useEffect } from 'react';
import { FileText, Save, Info, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80',
  Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
  Wallets: 'https://images.unsplash.com/photo-1627124718515-47f9b31d8e9f?auto=format&fit=crop&w=600&q=80',
  Pets: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  Documents: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
  Others: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=600&q=80'
};

export default function ReportForm({ setCurrentPage, setCurrentItemId, API_URL, addToast }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Others',
    type: 'lost',
    location: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read pre-configured report type if any (e.g. from Dashboard click)
    const savedType = sessionStorage.getItem('reportType');
    if (savedType) {
      setFormData(prev => ({ ...prev, type: savedType }));
      sessionStorage.removeItem('reportType');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (selectedType) => {
    setFormData(prev => ({ ...prev, type: selectedType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    // Auto-generate placeholder if image is empty
    let imageUrl = formData.image;
    if (!imageUrl) {
      imageUrl = CATEGORY_IMAGES[formData.category] || CATEGORY_IMAGES.Others;
    }

    const payload = {
      ...formData,
      image: imageUrl
    };

    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit report');

      addToast(`Successfully reported ${formData.type} item!`, 'success');
      setCurrentItemId(data._id);
      setCurrentPage('detail');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container animated-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Report Lost or Found Item</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in details to help match ownership claims with the community</p>
      </div>

      <div className="glass-card">
        
        {/* Toggle between Lost & Found */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '6px',
          marginBottom: '28px'
        }}>
          <button
            type="button"
            onClick={() => handleTypeSelect('lost')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: formData.type === 'lost' ? 'linear-gradient(135deg, var(--danger), #f43f5e)' : 'transparent',
              color: formData.type === 'lost' ? 'white' : 'var(--text-muted)',
              boxShadow: formData.type === 'lost' ? '0 4px 12px rgba(244, 63, 94, 0.2)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            🔴 I Lost Something (Report Lost)
          </button>
          <button
            type="button"
            onClick={() => handleTypeSelect('found')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: formData.type === 'found' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              color: formData.type === 'found' ? 'white' : 'var(--text-muted)',
              boxShadow: formData.type === 'found' ? '0 4px 12px var(--primary-glow)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            🔵 I Found Something (Report Found)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input 
              type="text" 
              name="title"
              className="form-input"
              placeholder="e.g. Silver Ring, iPhone 14 Pro, Black Labrador"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Electronics">Electronics</option>
                <option value="Keys">Keys</option>
                <option value="Wallets">Wallets</option>
                <option value="Pets">Pets</option>
                <option value="Documents">Documents</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Lost/Found</label>
              <input 
                type="date" 
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Specific details)</label>
            <input 
              type="text" 
              name="location"
              className="form-input"
              placeholder="e.g. Science Hall 3rd floor lounge"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Item Image URL (Optional)</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="url" 
                name="image"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Paste web URL or leave empty for auto-generated placeholder"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              💡 If empty, we will auto-assign a beautiful placeholder matching the "{formData.category}" category.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description / Instructions</label>
            <textarea 
              name="description"
              className="form-input"
              rows="5"
              placeholder="Describe unique characteristics, color, brand, condition, or how you lost/found it. Keep verification details vague if reporting a found item."
              value={formData.description}
              onChange={handleChange}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Warning Banner */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <strong>Notice:</strong> Please make sure your contact information is up to date in your activity page. Other community members will be able to message you securely through our chat portal without exposing your email addresses.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Reporting...' : 'Publish Report'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setCurrentPage('dashboard')}
            >
              Cancel
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
