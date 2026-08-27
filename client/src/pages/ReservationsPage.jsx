import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const res = await api.getMyReservations();
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id, seatId) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for Seat ${seatId}? This seat will become available to other students.`)) {
      return;
    }

    setCancellingId(id);
    try {
      await api.cancelReservation(id);
      await fetchReservations();
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const activeList = reservations.filter((r) => r.status === 'active');
  const historyList = reservations.filter((r) => r.status === 'completed' || r.status === 'cancelled');

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            My Campus Passes & History
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            Review active seat reservations and track your past study sessions.
          </p>
        </div>

        <Link to="/spaces" className="btn btn-primary">
          Reserve New Seat
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'active' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="live-pulse" style={{ display: activeList.length > 0 ? 'inline-block' : 'none' }}></span>
          <span>Active Passes ({activeList.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>Session History ({historyList.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : activeTab === 'active' ? (
        activeList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeList.map((res) => (
              <div key={res._id} className="card reservation-card animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={res.studySpace?.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=80'}
                        alt={res.studySpace?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-emerald">
                          <span className="live-pulse"></span> Active Pass
                        </span>
                        <span className="badge badge-indigo">
                          Seat {res.seatId}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {res.studySpace?.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {res.studySpace?.building} · {res.studySpace?.room}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatTime(res.startTime)} - {formatTime(res.endTime)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(res.startTime)} ({res.durationMinutes} mins)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Purpose: <strong>{res.purpose || 'Study Session'}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(res._id, res.seatId)}
                      disabled={cancellingId === res._id}
                    >
                      {cancellingId === res._id ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                    <Link to={`/spaces/${res.studySpace?._id}`} className="btn btn-secondary btn-sm">
                      <span>View Space</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Active Reservations
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You do not have any active study space bookings. Browse open campus rooms to reserve a desk.
            </p>
            <Link to="/spaces" className="btn btn-primary">Find Available Spaces</Link>
          </div>
        )
      ) : (
        /* History Tab */
        historyList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyList.map((res) => (
              <div key={res._id} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className={`badge ${res.status === 'completed' ? 'badge-emerald' : 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                      {res.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Seat {res.seatId}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{res.studySpace?.name || 'Campus Study Space'}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(res.startTime)} · {formatTime(res.startTime)} ({res.durationMinutes || 120} mins)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {res.studySpace?._id && (
                    <Link to={`/spaces/${res.studySpace._id}`} className="btn btn-secondary btn-sm">
                      Book Again
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No past study session history recorded yet.
          </div>
        )
      )}

      <style>{`
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--text-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: -1px;
        }
        .tab-btn:hover {
          color: var(--primary);
        }
        .tab-btn-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .reservation-card {
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default ReservationsPage;
