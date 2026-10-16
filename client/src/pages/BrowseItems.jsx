import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  HelpCircle, 
  Package, 
  PlusCircle, 
  Layers, 
  Tag, 
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { getCategories, getLostItems, getFoundItems, getPhotoUrl } from '../services/items.service';
import StatusBadge from '../components/StatusBadge';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const [activeTab, setActiveTab] = useState(initialType); // 'all' | 'lost' | 'found'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch items based on activeTab and filters
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      let combined = [];

      if (activeTab === 'lost') {
        const res = await getLostItems(params);
        combined = (res.items || []).map((item) => ({ ...item, itemType: 'lost' }));
      } else if (activeTab === 'found') {
        const res = await getFoundItems(params);
        combined = (res.items || []).map((item) => ({ ...item, itemType: 'found' }));
      } else {
        // Fetch both lost and found
        const [lostRes, foundRes] = await Promise.all([
          getLostItems(params),
          getFoundItems(params)
        ]);
        const lostWithTag = (lostRes.items || []).map((i) => ({ ...i, itemType: 'lost' }));
        const foundWithTag = (foundRes.items || []).map((i) => ({ ...i, itemType: 'found' }));
        combined = [...lostWithTag, ...foundWithTag].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      setItems(combined);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Unable to load items from the database.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [fetchItems]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ type: tab });
  };

  return (
    <div className="browse-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Bar with Search & Action Buttons */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Campus Belongings Feed</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Browse lost reports and found campus items with real-time filters.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}>
            <HelpCircle size={16} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.875rem', borderColor: '#059669', color: '#059669' }}>
            <Package size={16} /> Report Found
          </Link>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Type Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          {[
            { id: 'all', label: 'All Items', icon: Layers },
            { id: 'lost', label: 'Lost Items', icon: HelpCircle },
            { id: 'found', label: 'Found Items', icon: Package }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: isActive ? '#7c3aed' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input & Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Live Search */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, brand, color, location..."
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem 0.625rem 2.4rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open / Unrecovered</option>
            <option value="available">Available with Finder</option>
            <option value="claimed">Claimed</option>
            <option value="recovered">Recovered</option>
          </select>

          <button
            onClick={fetchItems}
            className="btn-secondary"
            style={{ padding: '0.6rem 0.8rem' }}
            title="Refresh feed"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #ede9fe',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading items from campus database...</p>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#94a3b8'
          }}>
            <Search size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Items Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            No belongings match your current search and filter criteria. Try adjusting keywords or clear filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedStatus('');
            }}
            className="btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {items.map((item) => {
            const isLost = item.itemType === 'lost';
            const photoUrl = getPhotoUrl(item.photo);
            const dateStr = new Date(isLost ? item.dateLost : item.dateFound).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <Link
                key={item._id}
                to={`/items/${item.itemType}/${item._id}`}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(109, 40, 217, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                {/* Photo or Fallback Box */}
                <div style={{
                  height: '180px',
                  backgroundColor: isLost ? '#f5f3ff' : '#ecfdf5',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: isLost ? '#a78bfa' : '#6ee7b7' }}>
                      <ImageIcon size={48} style={{ margin: '0 auto 0.25rem' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                        No Photo Provided
                      </span>
                    </div>
                  )}

                  {/* Type Pill */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: isLost ? '#7c3aed' : '#059669',
                    color: '#ffffff',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {isLost ? 'LOST' : 'FOUND'}
                  </span>

                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.785rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase' }}>
                    {item.category?.name || 'General Item'}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>
                    {item.name}
                  </h3>

                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#7c3aed" />
                      <span>{isLost ? item.lastSeenLocation : item.locationFound}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="#7c3aed" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
