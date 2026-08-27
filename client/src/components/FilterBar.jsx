import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Wifi, Volume2, Building } from 'lucide-react';

export const FilterBar = ({
  filters,
  onFilterChange,
  onReset,
  buildings = [],
  totalCount = 0,
}) => {
  const noiseOptions = [
    { value: 'all', label: 'Any Noise' },
    { value: 'silent', label: 'Silent' },
    { value: 'quiet', label: 'Quiet' },
    { value: 'moderate', label: 'Moderate' },
  ];

  return (
    <div className="card filter-bar-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      {/* Top Search & Count Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        {/* Search Field */}
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by space name, building, floor, amenities (e.g. 'Engineering', 'Monitors')..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onFilterChange('search', '')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Action / Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing <strong>{totalCount}</strong> study space{totalCount === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Reset all filters"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="filters-row">
        {/* Noise Filter Pills */}
        <div className="filter-group">
          <label className="filter-label">
            <Volume2 size={13} /> Noise Atmosphere:
          </label>
          <div className="filter-pills">
            {noiseOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-pill ${(filters.noiseLevel || 'all') === opt.value ? 'filter-pill-active' : ''}`}
                onClick={() => onFilterChange('noiseLevel', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Building Select */}
        <div className="filter-group">
          <label className="filter-label">
            <Building size={13} /> Building:
          </label>
          <select
            className="filter-select"
            value={filters.building || 'all'}
            onChange={(e) => onFilterChange('building', e.target.value)}
          >
            <option value="all">All Campus Buildings</option>
            {buildings.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Wi-Fi Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Wifi size={13} /> Wi-Fi:
          </label>
          <select
            className="filter-select"
            value={filters.wifi || 'any'}
            onChange={(e) => onFilterChange('wifi', e.target.value)}
          >
            <option value="any">Any Wi-Fi Status</option>
            <option value="true">Wi-Fi Required</option>
          </select>
        </div>

        {/* Available Now Switch */}
        <div className="filter-group" style={{ marginLeft: 'auto' }}>
          <label className="toggle-switch-label">
            <input
              type="checkbox"
              checked={filters.availableNow === 'true' || filters.availableNow === true}
              onChange={(e) => onFilterChange('availableNow', e.target.checked ? 'true' : '')}
            />
            <span className="toggle-switch-slider"></span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Available Now Only
            </span>
          </label>
        </div>
      </div>

      <style>{`
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .filter-search-input {
          width: 100%;
          padding: 0.65rem 2.25rem 0.65rem 2.5rem;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: #f8fafc;
          transition: var(--transition);
          outline: none;
        }
        .filter-search-input:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px var(--primary-focus);
        }
        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.75rem;
        }
        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: center;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1rem;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .filter-pills {
          display: flex;
          gap: 0.375rem;
        }
        .filter-pill {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f1f5f9;
          color: var(--text-muted);
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-pill:hover {
          background: #e2e8f0;
          color: var(--text-main);
        }
        .filter-pill-active {
          background: var(--primary-light);
          color: var(--primary);
          border-color: rgba(79, 70, 229, 0.3);
          font-weight: 700;
        }
        .filter-select {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-main);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background: #ffffff;
          outline: none;
          cursor: pointer;
        }
        .filter-select:focus {
          border-color: var(--primary);
        }
        .toggle-switch-label {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          cursor: pointer;
          user-select: none;
        }
        .toggle-switch-label input {
          display: none;
        }
        .toggle-switch-slider {
          position: relative;
          width: 36px;
          height: 20px;
          background-color: #cbd5e1;
          border-radius: 20px;
          transition: var(--transition);
        }
        .toggle-switch-slider::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background-color: #ffffff;
          border-radius: 50%;
          transition: var(--transition);
        }
        .toggle-switch-label input:checked + .toggle-switch-slider {
          background-color: var(--primary);
        }
        .toggle-switch-label input:checked + .toggle-switch-slider::before {
          transform: translateX(16px);
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
