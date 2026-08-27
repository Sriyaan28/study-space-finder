import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await api.getStudents({
        search: searchQuery,
        status: statusFilter,
      });
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, statusFilter]);

  const handleBlockStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to suspend student privileges for ${student.name}? They will not be able to make new reservations.`)) {
      return;
    }

    setActionLoadingId(student._id);
    setAlertMsg(null);
    try {
      const res = await api.blockStudent(student._id);
      if (res.success) {
        setAlertMsg({ type: 'success', text: `Student ${student.name} has been suspended.` });
        await fetchStudents();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to block student' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblockStudent = async (student) => {
    setActionLoadingId(student._id);
    setAlertMsg(null);
    try {
      const res = await api.unblockStudent(student._id);
      if (res.success) {
        setAlertMsg({ type: 'success', text: `Student ${student.name} account has been restored to active.` });
        await fetchStudents();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to unblock student' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: '320px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Student Account Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Review registered campus accounts, track study bookings, and manage student authorization status.
          </p>
        </div>

        {alertMsg && (
          <div style={{ backgroundColor: alertMsg.type === 'success' ? 'var(--emerald-50)' : 'var(--rose-50)', color: alertMsg.type === 'success' ? 'var(--emerald-700)' : 'var(--rose-600)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            {alertMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}
            >
              <option value="all">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="blocked">Suspended / Blocked Only</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : students.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student Profile</th>
                    <th style={{ padding: '1rem 1rem' }}>Student ID</th>
                    <th style={{ padding: '1rem 1rem' }}>Department</th>
                    <th style={{ padding: '1rem 1rem' }}>Registered</th>
                    <th style={{ padding: '1rem 1rem' }}>Total Passes</th>
                    <th style={{ padding: '1rem 1rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Authorization Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((stu) => {
                    const isBlocked = stu.status === 'blocked';
                    const isActionLoading = actionLoadingId === stu._id;

                    return (
                      <tr key={stu._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: isBlocked ? '#f1f5f9' : 'var(--primary-light)', color: isBlocked ? 'var(--text-muted)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem' }}>
                              {stu.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{stu.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {stu.studentId || 'STU-000000'}
                        </td>

                        <td style={{ padding: '1rem 1rem', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                          {stu.department || 'General Studies'}
                        </td>

                        <td style={{ padding: '1rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {formatDate(stu.createdAt)}
                        </td>

                        <td style={{ padding: '1rem 1rem' }}>
                          <span className="badge badge-indigo">
                            {stu.reservationCount} bookings
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1rem' }}>
                          <span className={`badge ${isBlocked ? 'badge-rose' : 'badge-emerald'}`}>
                            {isBlocked ? 'Suspended' : 'Active'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {isBlocked ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleUnblockStudent(stu)}
                              disabled={isActionLoading}
                            >
                              <UserCheck size={14} color="#059669" />
                              <span>{isActionLoading ? 'Restoring...' : 'Unblock Account'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleBlockStudent(stu)}
                              disabled={isActionLoading}
                            >
                              <UserX size={14} />
                              <span>{isActionLoading ? 'Suspending...' : 'Block Student'}</span>
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
              No student accounts found matching your query.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminStudentsPage;
