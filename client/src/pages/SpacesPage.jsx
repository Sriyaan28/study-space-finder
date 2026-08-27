import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import StudySpaceCard from '../components/StudySpaceCard';
import FilterBar from '../components/FilterBar';

export const SpacesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [spaces, setSpaces] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  // Parse filters from searchParams
  const filters = {
    search: searchParams.get('search') || '',
    noiseLevel: searchParams.get('noiseLevel') || 'all',
    wifi: searchParams.get('wifi') || 'any',
    building: searchParams.get('building') || 'all',
    availableNow: searchParams.get('availableNow') || '',
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'any') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await api.getBuildings();
        if (res.success && res.data) {
          setBuildings(res.data);
        }
      } catch (e) {
        console.error('Failed to fetch buildings:', e.message);
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchFilteredSpaces = async () => {
      setLoading(true);
      try {
        const res = await api.getSpaces(filters);
        if (res.success && res.data) {
          setSpaces(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch spaces:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredSpaces();
  }, [searchParams]);

  // Sort logic
  const sortedSpaces = [...spaces].sort((a, b) => {
    if (sortBy === 'available') {
      const availA = a.liveStats?.availableSeats || 0;
      const availB = b.liveStats?.availableSeats || 0;
      return availB - availA;
    }
    if (sortBy === 'capacity') {
      return (b.capacity || 0) - (a.capacity || 0);
    }
    if (sortBy === 'noise') {
      const noiseOrder = { silent: 1, quiet: 2, moderate: 3, noisy: 4 };
      return (noiseOrder[a.noiseLevel] || 3) - (noiseOrder[b.noiseLevel] || 3);
    }
    // Default: featured first, then newest
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Discover Study Spaces
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Real-time availability, verified noise ratings, and interactive seat booking across campus.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        buildings={buildings}
        totalCount={spaces.length}
      />

      {/* Results Header & Sorting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {filters.search ? `Results for "${filters.search}"` : 'All Study Hubs'}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="featured">Featured & Recommended</option>
            <option value="available">Most Available Seats</option>
            <option value="noise">Quietest Atmosphere</option>
            <option value="capacity">Largest Capacity</option>
          </select>
        </div>
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading live space sensors...</p>
        </div>
      ) : sortedSpaces.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {sortedSpaces.map((space) => (
            <StudySpaceCard key={space._id} space={space} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No matching study spaces found
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Try adjusting your search query, noise preference, or clearing the "Available Now" filter.
          </p>
          <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SpacesPage;
