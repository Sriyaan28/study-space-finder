import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import ReservationModal from '../components/ReservationModal';

export const SpaceDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [seatingData, setSeatingData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchSpaceDetails = async () => {
    try {
      const [spaceRes, seatsRes, predRes] = await Promise.all([
        api.getSpaceById(id),
        api.getSpaceSeats(id),
        api.getSpacePrediction(id),
      ]);

      if (spaceRes.success) {
        setSpace(spaceRes.data);
        setIsFav(spaceRes.data.isFavorite || false);
      }
      if (seatsRes.success) {
        setSeatingData(seatsRes.data);
      }
      if (predRes.success) {
        setPrediction(predRes.data);
      }
    } catch (err) {
      console.error('Error fetching space details:', err.message);
      setError(err.message || 'Failed to load study space details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceDetails();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        await api.removeFavorite(space._id);
        setIsFav(false);
      } else {
        await api.addFavorite(space._id);
        setIsFav(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
    }
  };

  const handleSeatSelected = (seat) => {
    setSelectedSeat(seat);
  };

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedSeat) {
      alert('Please click on an available green seat on the map first.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleBookingComplete = (newReservation) => {
    setIsModalOpen(false);
    setSelectedSeat(null);
    setBookingSuccess(newReservation);
    // Refresh seating map & space availability
    fetchSpaceDetails();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading real-time seating map...</p>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Study Space Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This campus location could not be located.'}</p>
        <Link to="/spaces" className="btn btn-primary">Back to Spaces</Link>
      </div>
    );
  }

  const live = space.liveStats || seatingData?.summary || {
    totalSeats: space.capacity,
    availableSeats: space.capacity,
    occupiedSeats: 0,
    occupancyPercentage: 0,
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/spaces" className="btn btn-secondary btn-sm">
          <ChevronLeft size={16} /> All Study Spaces
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${isFav ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleFavoriteToggle}
          >
            <Heart size={15} fill={isFav ? '#f43f5e' : 'none'} color={isFav ? '#f43f5e' : 'currentColor'} />
            <span>{isFav ? 'Favorited' : 'Save to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Booking Success Banner */}
      {bookingSuccess && (
        <div className="animate-slide-up" style={{ backgroundColor: 'var(--emerald-50)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
                Seat {bookingSuccess.seatId} Confirmed!
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#047857' }}>
                Your study pass is active. View your pass in your student dashboard.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Go to Dashboard
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBookingSuccess(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Space Banner & Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left: Space Title, Photo & Description */}
        <div>
          <div style={{ height: '320px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
            <img
              src={space.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80'}
              alt={space.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }}></div>

            <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', right: '1.5rem', color: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)', color: '#ffffff' }}>
                  {space.status === 'open' ? 'Open for Students' : space.status}
                </span>
                <span className="badge badge-indigo" style={{ backgroundColor: 'rgba(79, 70, 229, 0.9)', color: '#ffffff', textTransform: 'capitalize' }}>
                  {space.noiseLevel} Zone
                </span>
              </div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, lineHeight: '1.2' }}>{space.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
                <MapPin size={15} />
                <span>{space.building} · {space.floor} · {space.room}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              About this Study Space
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              {space.description || 'Modern campus study space equipped with comfortable ergonomic workstations, charging stations, and high-speed Wi-Fi.'}
            </p>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Available Amenities & Equipment
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {space.amenities?.map((amenity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle size={14} color="var(--primary)" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Availability & Statistical Prediction Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live Availability Status Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Live Availability
              </span>
              <span className="badge badge-emerald">
                <span className="live-pulse"></span> Verified Live
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--emerald-600)', lineHeight: '1' }}>
                {live.availableSeats}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / {live.totalSeats || space.capacity} seats available
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {live.occupiedSeats} students currently studying in this room ({live.occupancyPercentage}% full).
            </p>

            <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '1.25rem' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${live.occupancyPercentage}%`,
                  backgroundColor: live.occupancyPercentage >= 85 ? 'var(--rose-500)' : live.occupancyPercentage >= 60 ? 'var(--amber-500)' : 'var(--emerald-500)',
                }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={14} /> Hours:
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {space.openingHours?.is24Hours ? '24/7 Access' : `${space.openingHours?.open || '08:00'} - ${space.openingHours?.close || '22:00'} (${space.openingHours?.days || 'Mon - Sun'})`}
              </span>
            </div>
          </div>

          {/* Statistical Prediction Card */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Availability Forecast
                </h4>
              </div>

              {prediction?.confidence && (
                <span className={`badge ${
                  prediction.confidence === 'high' ? 'badge-emerald' :
                  prediction.confidence === 'medium' ? 'badge-indigo' : 'badge-amber'
                }`}>
                  {prediction.confidence} confidence
                </span>
              )}
            </div>

            {prediction?.hasEnoughData ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Predicted for <strong>{prediction.dayName} at {prediction.timeFormatted}</strong>:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {prediction.predictedOccupancy}% full
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.875rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
                  💡 {prediction.outlook}: Approx. <strong>{prediction.predictedAvailableSeats} seats</strong> expected open.
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  *Statistical projection based on {prediction.sampleCount} historical campus occupancy data points and past booking logs.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {prediction?.message || 'Gathering historical booking records for this space. Base live sensors active.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BookMyShow Interactive Seating Section */}
      <section style={{ marginTop: '3rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
              Interactive Seat Picker
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Select Your Desk / Pod
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Click any green seat to reserve your dedicated spot in this room.
            </p>
          </div>

          {selectedSeat && (
            <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Selected Seat:</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedSeat.label || `Seat ${selectedSeat.seatId}`}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleOpenBooking}
              >
                Reserve Seat {selectedSeat.seatId}
              </button>
            </div>
          )}
        </div>

        {/* Seat Map */}
        <SeatMap
          seats={seatingData?.seats || []}
          selectedSeat={selectedSeat}
          onSelectSeat={handleSeatSelected}
          roomName={space.name}
        />
      </section>

      {/* Reservation Modal */}
      {isModalOpen && selectedSeat && (
        <ReservationModal
          space={space}
          seat={selectedSeat}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleBookingComplete}
        />
      )}

      {/* Sticky Bottom Bar for Mobile when seat selected */}
      {selectedSeat && (
        <div className="sticky-mobile-booking-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Selected Spot:</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Seat {selectedSeat.seatId}</h4>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenBooking}
            >
              Reserve Now
            </button>
          </div>
        </div>
      )}

      <style>{`
        .sticky-mobile-booking-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #0f172a;
          padding: 1rem 1.5rem;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.25);
          z-index: 35;
        }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: minmax(0, 1.8fr)"] {
            grid-templateColumns: 1fr !important;
          }
          .sticky-mobile-booking-bar {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceDetailPage;
