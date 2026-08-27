import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReservationModal = ({
  space,
  seat,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [durationMinutes, setDurationMinutes] = useState(120); // 2 hours default
  const [purpose, setPurpose] = useState('Deep Study & Exam Prep');
  const [notes, setNotes] = useState('');
  const [startTimeOffset, setStartTimeOffset] = useState(0); // 0 mins from now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const durationOptions = [
    { label: '1 Hour', minutes: 60 },
    { label: '2 Hours (Standard)', minutes: 120 },
    { label: '3 Hours', minutes: 180 },
    { label: '4 Hours (Max)', minutes: 240 },
  ];

  const purposeOptions = [
    'Deep Study & Exam Prep',
    'Coding & Software Lab',
    'Literature Review & Reading',
    'Group Discussion & Project',
    'Online Lecture / Webinar',
  ];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!space || !seat) return;

    setLoading(true);
    setError(null);

    const now = new Date();
    const start = new Date(now.getTime() + startTimeOffset * 60 * 1000);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    try {
      const res = await api.createReservation({
        studySpaceId: space._id,
        seatId: seat._id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes,
        purpose,
        notes,
      });

      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatedStart = new Date(Date.now() + startTimeOffset * 60 * 1000);
  const calculatedEnd = new Date(calculatedStart.getTime() + durationMinutes * 60 * 1000);

  const formatTime = (d) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>Confirm Seat Reservation</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>University Study Space Pass</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBooking} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Space & Seat Summary Card */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{space?.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <MapPin size={12} color="var(--primary)" />
                  <span>{space?.building} · {space?.room}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.875rem', padding: '0.35rem 0.75rem' }}>
                  Seat {seat?.seatId}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
              <span>Type: <strong>{seat?.type?.replace('_', ' ')}</strong></span>
              {seat?.hasPower && <span>⚡ Power Outlet</span>}
              {seat?.isWindowSeat && <span>🪟 Window Seat</span>}
            </div>
          </div>

          {/* Duration Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Session Duration:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {durationOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setDurationMinutes(opt.minutes)}
                  className={`btn btn-sm ${durationMinutes === opt.minutes ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <Clock size={14} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Preview */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} />
              <span><strong>Session Time:</strong> {formatTime(calculatedStart)} - {formatTime(calculatedEnd)} Today</span>
            </div>
          </div>

          {/* Purpose Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Study Purpose:
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: '#ffffff', outline: 'none' }}
            >
              {purposeOptions.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? 'Confirming with Campus Server...' : `Confirm Seat ${seat?.seatId}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
