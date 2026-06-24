import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ListFilter, RotateCcw } from 'lucide-react';

export default function BrowseItems({ setCurrentPage, setCurrentItemId, API_URL }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  // Load initial search queries/filters from other pages if saved
  useEffect(() => {
    const savedSearch = sessionStorage.getItem('searchQuery');
    const savedCategory = sessionStorage.getItem('filterCategory');
    
    if (savedSearch) {
      setSearch(savedSearch);
      sessionStorage.removeItem('searchQuery');
    }
    if (savedCategory) {
      setCategory(savedCategory);
      sessionStorage.removeItem('filterCategory');
    }
  }, []);

  // Fetch items based on filters
  const fetchItems = () => {
    setLoading(true);
    let url = `${API_URL}/items?`;
    if (type) url += `type=${type}&`;
    if (category) url += `category=${category}&`;
    if (status) url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (location) url += `location=${encodeURIComponent(location)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Handle sorting in client side
        let sorted = [...data];
        if (sort === 'newest') {
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'oldest') {
          sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        setItems(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, status, search, location, sort]);

  const handleReset = () => {
    setType('');
    setCategory('');
    setStatus('');
    setLocation('');
    setSearch('');
    setSort('newest');
  };

  return (
    <div className="browse-container animated-fade-in">
      
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Browse Reported Items</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Search and filter lost & found items from our active database</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Sidebar Filters */}
        <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListFilter size={16} /> Filters
            </h3>
            <button 
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} /> Reset All
            </button>
          </div>

          {/* Search Input */}
          <div className="form-group">
            <label className="form-label">Search Keyword</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. iPhone, wallet, cat..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="form-group">
            <label className="form-label">Item Status Type</label>
            <select 
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types (Lost & Found)</option>
              <option value="lost">Lost Belongings</option>
              <option value="found">Found Belongings</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Keys">Keys</option>
              <option value="Wallets">Wallets</option>
              <option value="Pets">Pets</option>
              <option value="Documents">Documents</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Library, Park..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label className="form-label">Verification Status</label>
            <select 
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active (Open)</option>
              <option value="claimed">Claimed (Resolved)</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select 
              className="form-input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest Reported</option>
              <option value="oldest">Oldest Reported</option>
            </select>
          </div>

        </div>

        {/* Results Grid */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Updating catalog list...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <h3>No match found</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Try clearing filters or searching for different keywords.</p>
              <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={handleReset}>
                Reset Filter Settings
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px'
            }}>
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="glass-card"
                  onClick={() => {
                    setCurrentItemId(item._id);
                    setCurrentPage('detail');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    padding: '0px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Card Image Cover */}
                   <div style={{ position: 'relative', height: '180px' }}>
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=400&q=80'} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      <span className={`badge badge-${item.type}`}>
                        {item.type}
                      </span>
                      {item.status === 'claimed' && (
                        <span className="badge badge-claimed">
                          Claimed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>
                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        lineHeight: '1.4'
                      }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} />
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
