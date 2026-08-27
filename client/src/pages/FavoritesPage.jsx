import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Search } from 'lucide-react';
import api from '../services/api';
import StudySpaceCard from '../components/StudySpaceCard';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await api.getMyFavorites();
      if (res.success && res.data) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (spaceId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((s) => s._id !== spaceId));
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Bookmark size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Saved Study Spaces
            </h1>
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            Quick-access bookmark list for your preferred campus study spots.
          </p>
        </div>

        <Link to="/spaces" className="btn btn-secondary btn-sm">
          Browse More Spaces
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : favorites.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {favorites.map((space) => (
            <StudySpaceCard
              key={space._id}
              space={space}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '520px', margin: '2rem auto' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Heart size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Saved Study Spaces Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Click the heart icon on any space card across the campus discovery portal to save your top study locations for 1-click reservations.
          </p>
          <Link to="/spaces" className="btn btn-primary">
            Explore Campus Spaces
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
