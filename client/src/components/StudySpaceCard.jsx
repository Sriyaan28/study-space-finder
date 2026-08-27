import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Heart,
  MapPin,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudySpaceCard = ({ space, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(space.isFavorite || false);
  const [favLoading, setFavLoading] = useState(false);

  const live = space.liveStats || {
    totalSeats: space.capacity || 30,
    occupiedSeats: 0,
    availableSeats: space.capacity || 30,
    occupancyPercentage: 0,
    isAvailableNow: space.status === 'open',
  };

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to save spaces to your favorites.');
      return;
    }

    setFavLoading(true);
    try {
      if (isFav) {
        await api.removeFavorite(space._id);
        setIsFav(false);
      } else {
        await api.addFavorite(space._id);
        setIsFav(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(space._id, !isFav);
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
    } finally {
      setFavLoading(false);
    }
  };

  // Noise level icon and class
  const getNoiseBadge = (level) => {
    switch (level) {
      case 'silent':
        return { label: 'Silent Zone', class: 'noise-silent', icon: <VolumeX size={12} /> };
      case 'quiet':
        return { label: 'Quiet Study', class: 'noise-quiet', icon: <Volume1 size={12} /> };
      case 'moderate':
        return { label: 'Moderate', class: 'noise-moderate', icon: <Volume2 size={12} /> };
      default:
        return { label: 'Collaborative', class: 'noise-noisy', icon: <Volume2 size={12} /> };
    }
  };

  const noiseInfo = getNoiseBadge(space.noiseLevel);

  // Occupancy color
  const getOccupancyColor = (pct) => {
    if (pct >= 85) return 'var(--rose-500)';
    if (pct >= 60) return 'var(--amber-500)';
    return 'var(--emerald-500)';
  };

  return (
    <div className="card card-hover space-card">
      {/* Thumbnail Header */}
      <div className="card-thumb-container">
        <img
          src={space.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80'}
          alt={space.name}
          className="card-thumb-img"
          loading="lazy"
        />
        <div className="thumb-overlay-gradient"></div>

        {/* Top Badges */}
        <div className="thumb-top-badges">
          <span className={`badge ${noiseInfo.class}`}>
            {noiseInfo.icon} {noiseInfo.label}
          </span>

          <button
            type="button"
            className={`heart-btn ${isFav ? 'heart-active' : ''}`}
            onClick={handleHeartClick}
            disabled={favLoading}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={isFav ? '#f43f5e' : 'none'} color={isFav ? '#f43f5e' : '#ffffff'} />
          </button>
        </div>

        {/* Status Pill */}
        <div className="thumb-bottom-badges">
          {space.status === 'open' ? (
            live.availableSeats > 0 ? (
              <span className="badge badge-emerald">
                <span className="live-pulse"></span> {live.availableSeats} Available Now
              </span>
            ) : (
              <span className="badge badge-rose">Fully Occupied</span>
            )
          ) : (
            <span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>
              {space.status.replace('_', ' ')}
            </span>
          )}

          {space.wifiAvailable ? (
            <span className="badge badge-indigo" title="High-Speed Campus Wi-Fi">
              <Wifi size={12} /> Wi-Fi
            </span>
          ) : (
            <span className="badge badge-slate" title="No Wi-Fi">
              <WifiOff size={12} /> No Wi-Fi
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="space-location-meta">
          <MapPin size={13} color="var(--primary)" />
          <span>{space.building} · {space.floor}</span>
        </div>

        <Link to={`/spaces/${space._id}`}>
          <h3 className="space-title">{space.name}</h3>
        </Link>

        <p className="space-room-tag">{space.room}</p>

        {/* Amenities row */}
        <div className="amenities-chips">
          {space.amenities?.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-chip">
              {amenity}
            </span>
          ))}
          {space.amenities?.length > 3 && (
            <span className="amenity-chip">+{space.amenities.length - 3} more</span>
          )}
        </div>

        {/* Occupancy Indicator */}
        <div className="occupancy-section">
          <div className="occupancy-labels">
            <span className="occupancy-text">
              <strong>{live.occupiedSeats}</strong> / {live.totalSeats} seats occupied
            </span>
            <span className="occupancy-pct" style={{ color: getOccupancyColor(live.occupancyPercentage) }}>
              {live.occupancyPercentage}%
            </span>
          </div>

          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${live.occupancyPercentage}%`,
                backgroundColor: getOccupancyColor(live.occupancyPercentage),
              }}
            ></div>
          </div>
        </div>

        {/* Predicted Availability Pill */}
        <div className="prediction-preview">
          <TrendingUp size={13} color="var(--primary)" />
          <span>
            {live.occupancyPercentage < 65 ? 'Predicted: High availability next 60 mins' : 'Predicted: Peak occupancy expected'}
          </span>
        </div>

        {/* Card Action Footer */}
        <div className="card-footer-action">
          <Link to={`/spaces/${space._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>Select Seat</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <style>{`
        .space-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card-thumb-container {
          position: relative;
          height: 180px;
          overflow: hidden;
          background-color: #0f172a;
        }
        .card-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .space-card:hover .card-thumb-img {
          transform: scale(1.05);
        }
        .thumb-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.7) 100%);
        }
        .thumb-top-badges {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 2;
        }
        .thumb-bottom-badges {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 2;
        }
        .heart-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .heart-btn:hover {
          background: rgba(15, 23, 42, 0.9);
          transform: scale(1.1);
        }
        .live-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #10b981;
          display: inline-block;
          box-shadow: 0 0 6px #10b981;
        }
        .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .space-location-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.375rem;
        }
        .space-title {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.3;
          margin-bottom: 0.25rem;
          transition: var(--transition);
        }
        .space-title:hover {
          color: var(--primary);
        }
        .space-room-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .amenities-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }
        .amenity-chip {
          background: #f1f5f9;
          color: var(--text-muted);
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .occupancy-section {
          margin-top: auto;
          padding-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .occupancy-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.375rem;
        }
        .occupancy-text {
          color: var(--text-muted);
        }
        .occupancy-pct {
          font-weight: 700;
        }
        .prediction-preview {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          padding: 0.375rem 0.625rem;
          border-radius: var(--radius-sm);
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .card-footer-action {
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default StudySpaceCard;
