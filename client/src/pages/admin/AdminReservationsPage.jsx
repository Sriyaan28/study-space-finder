import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Trash2,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [spaceFilter, setSpaceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const res = await api.getAllReservations({
        search,
        status: statusFilter,
        spaceId: spaceFilter,
      });
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch (err) {
      console.error('Failed to load campus reservations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await api.getSpaces();
        if (res.success && res.data) setSpaces(res.data);
      } catch (e) {}
    };
    fetchSpaces();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [search, statusFilter, spaceFilter]);

  const handleAdminCancel = async (id, seatId, studentName) => {
    if (!window.confirm(`Cancel reservation for Seat ${seatId} (${studentName})? This will immediately free up the seat on the live campus map.`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      await api.cancelReservation(id);
      await fetchReservations();
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: '320px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Campus Reservations & Passes
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Monitor real-time bookings across all university study halls and manage pass overrides.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student, study room, or seat ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={spaceFilter}
              onChange={(e) => setSpaceFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}
            >
              <option value="all">All Study Spaces</option>
              {spaces.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : reservations.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student</th>
                    <th style={{ padding: '1rem 1rem' }}>Study Space</th>
                    <th style={{ padding: '1rem 1rem' }}>Seat</th>
                    <th style={{ padding: '1rem 1rem' }}>Session Window</th>
                    <th style={{ padding: '1rem 1rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => {
                    const isActive = res.status === 'active';
                    const isCompleted = res.status === 'completed';

                    return (
                      <tr key={res._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            {res.user?.name || 'Student User'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {res.user?.email || 'N/A'} · ID: {res.user?.studentId || 'N/A'}
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                            {res.studySpace?.name || 'Study Hall'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {res.studySpace?.building}
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1rem' }}>
                          <span className="badge badge-indigo" style={{ fontWeight: 800 }}>
                            {res.seatId}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1rem', fontSize: '0.8125rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatTime(res.startTime)} - {formatTime(res.endTime)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatDate(res.startTime)} ({res.durationMinutes || 120}m)
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1rem' }}>
                          <span className={`badge ${
                            isActive ? 'badge-emerald' :
                            isCompleted ? 'badge-slate' : 'badge-rose'
                          }`} style={{ textTransform: 'capitalize' }}>
                            {res.status}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {isActive && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleAdminCancel(res._id, res.seatId, res.user?.name)}
                              disabled={actionLoadingId === res._id}
                            >
                              <XCircle size={14} />
                              <span>{actionLoadingId === res._id ? 'Cancelling...' : 'Cancel Pass'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No reservation logs match the selected search and filter criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReservationsPage;
