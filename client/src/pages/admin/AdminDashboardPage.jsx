import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  TrendingUp,
  ShieldAlert,
  Plus,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.getAdminAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const ov = analytics?.overview || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: '320px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.375rem' }}>Campus Operations</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Admin Console Overview
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Monitor live room occupancy, campus seating utilization, and student booking activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/spaces" className="btn btn-primary">
              <Plus size={16} /> Manage Spaces
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <StatCard
                title="Study Spaces"
                value={ov.totalSpaces || 0}
                subtitle="Active campus rooms"
                icon={Building2}
                color="indigo"
              />

              <StatCard
                title="Total Campus Seats"
                value={ov.totalSeats || 0}
                subtitle={`${ov.blockedSeats || 0} under maintenance`}
                icon={Zap}
                color="emerald"
              />

              <StatCard
                title="Active Bookings"
                value={ov.activeReservationsCount || 0}
                subtitle="Students studying now"
                icon={Calendar}
                color="indigo"
              />

              <StatCard
                title="Campus Occupancy"
                value={`${ov.totalCampusOccupancy || 0}%`}
                subtitle="Real-time capacity load"
                icon={TrendingUp}
                color={ov.totalCampusOccupancy > 75 ? 'rose' : 'emerald'}
              />

              <StatCard
                title="Registered Students"
                value={ov.activeStudents || 0}
                subtitle={`${ov.blockedStudents || 0} suspended`}
                icon={Users}
                color={ov.blockedStudents > 0 ? 'amber' : 'indigo'}
              />
            </div>

            {/* Popular Spaces & Hourly Peak Usage */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              {/* Popular Spaces Leaderboard */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Top Utilized Study Spaces
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest reservation frequency</p>
                  </div>
                  <Link to="/admin/spaces" className="btn btn-secondary btn-sm">View All</Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {analytics?.popularSpaces?.map((space, idx) => (
                    <div key={space._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{space.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{space.building}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {space.reservationCount} passes
                        </span>
                        <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Capacity: {space.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Campus Usage Hours */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Campus Peak Usage Hours
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Typical hourly traffic load across libraries</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  {analytics?.hourlyUsage?.map((h, i) => {
                    const maxVal = 70;
                    const heightPct = Math.min(100, (h.count / maxVal) * 100);
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flex: 1 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>{h.count}</span>
                        <div style={{ width: '22px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: '100%',
                              height: `${heightPct}%`,
                              background: h.count > 50 ? 'var(--rose-500)' : 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                              borderRadius: '4px',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h.hour}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Management Actions */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Administrative Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Link to="/admin/spaces" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <Building2 size={18} color="var(--primary)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Create / Edit Spaces</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Update status, amenities & capacity</div>
                  </div>
                </Link>

                <Link to="/admin/students" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <Users size={18} color="var(--primary)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Student Directory</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block/unblock student privileges</div>
                  </div>
                </Link>

                <Link to="/admin/reservations" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>All Campus Passes</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search and cancel reservations</div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
