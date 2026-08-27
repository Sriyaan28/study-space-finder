import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getStudentAnalytics();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load student analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
      </div>
    );
  }

  // Simulated week distribution for visual insight
  const daysOfWeek = [
    { day: 'Mon', hours: 3.5, active: true },
    { day: 'Tue', hours: 2.0, active: true },
    { day: 'Wed', hours: 4.5, active: true },
    { day: 'Thu', hours: 1.5, active: true },
    { day: 'Fri', hours: 3.0, active: true },
    { day: 'Sat', hours: 5.0, active: true },
    { day: 'Sun', hours: 2.5, active: true },
  ];

  const maxDayHours = 5.0;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <BarChart3 size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Study Habits & Insights
          </h1>
        </div>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Review your focus hours, campus location preferences, and weekly productivity streaks.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard
          title="Total Focus Time"
          value={`${stats?.totalHours || 0} hrs`}
          subtitle="Hours studied on campus"
          icon={Clock}
          color="indigo"
        />

        <StatCard
          title="Sessions Completed"
          value={stats?.completedReservations || 0}
          subtitle="Fulfilled study passes"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="This Month's Sessions"
          value={stats?.sessionsThisMonth || 0}
          subtitle="Passes booked this month"
          icon={Calendar}
          color="indigo"
        />

        <StatCard
          title="Avg. Session Length"
          value={`${stats?.averageSessionDuration || 120} min`}
          subtitle="Average time per booking"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Weekly Focus Distribution Chart */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>Weekly Study Time</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hours logged across campus study spaces</p>
            </div>
            <span className="badge badge-emerald">Peak: Saturday</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {daysOfWeek.map((item, idx) => {
              const heightPct = (item.hours / maxDayHours) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.hours}h</span>
                  <div style={{ width: '28px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '6px',
                        transition: 'height 0.5s ease',
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Spot & Study Habit Summary */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Award size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>Campus Space Preferences</h3>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Most Frequented Location
              </span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {stats?.mostUsedLocation || 'Engineering Library'}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                You achieve your highest focus duration in silent high-speed Wi-Fi zones.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Saved Bookmark Spots:</span>
                <strong style={{ color: 'var(--text-main)' }}>{stats?.favoritesCount || 0} Locations</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Preferred Atmosphere:</span>
                <strong style={{ color: 'var(--text-main)' }}>Silent / Low Noise</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link to="/spaces" className="btn btn-primary" style={{ width: '100%' }}>
              Book Next Study Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
