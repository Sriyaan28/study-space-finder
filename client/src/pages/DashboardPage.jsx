import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StudySpaceCard from '../components/StudySpaceCard';

export const DashboardPage = ({ onOpenAI }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendedSpaces, setRecommendedSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, resRes, favRes, spacesRes] = await Promise.all([
          api.getStudentAnalytics(),
          api.getMyReservations('active'),
          api.getMyFavorites(),
          api.getSpaces({ availableNow: 'true' }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (resRes.success) setReservations(resRes.data);
        if (favRes.success) setFavorites(favRes.data);
        if (spacesRes.success) setRecommendedSpaces(spacesRes.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeReservation = reservations.length > 0 ? reservations[0] : null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Welcome Banner */}
      <div className="card dashboard-welcome-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>
              Student Hub · {user?.department || 'General Studies'}
            </span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Track your active passes, analyze your study habits, and find quiet spots on campus.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline" onClick={onOpenAI}>
              <Sparkles size={16} /> Ask AI Assistant
            </button>
            <Link to="/spaces" className="btn btn-primary">
              <Search size={16} /> Find a Study Space
            </Link>
          </div>
        </div>
      </div>

      {/* Active Reservation Alert Banner */}
      {activeReservation ? (
        <div className="card active-booking-card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="active-booking-icon-box">
                <Calendar size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-emerald">
                    <span className="live-pulse"></span> Active Reservation
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Expires at {new Date(activeReservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {activeReservation.studySpace?.name} — <span style={{ color: 'var(--primary)' }}>Seat {activeReservation.seatId}</span>
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {activeReservation.studySpace?.building} · {activeReservation.studySpace?.room}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={`/spaces/${activeReservation.studySpace?._id}`} className="btn btn-secondary btn-sm">
                View Room Map
              </Link>
              <Link to="/reservations" className="btn btn-primary btn-sm">
                Manage Passes
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No active study reservation right now. Ready to lock in a quiet desk?
            </span>
          </div>
          <Link to="/spaces" className="btn btn-primary btn-sm">
            Reserve a Seat Now
          </Link>
        </div>
      )}

      {/* Analytics Stats Grid */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Personal Study Activity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Sessions This Week"
            value={stats?.sessionsThisWeek ?? 0}
            subtitle="Campus study passes logged"
            icon={Calendar}
            color="indigo"
          />

          <StatCard
            title="Total Study Hours"
            value={`${stats?.totalHours ?? 0} hrs`}
            subtitle="Dedicated focus time"
            icon={Clock}
            color="emerald"
          />

          <StatCard
            title="Favorite Location"
            value={stats?.mostUsedLocation || 'Exploring'}
            subtitle="Your top campus spot"
            icon={MapPin}
            color="amber"
          />

          <StatCard
            title="Completed Passes"
            value={stats?.completedReservations ?? 0}
            subtitle="Reservations fulfilled"
            icon={CheckCircle2}
            color="indigo"
          />
        </div>
      </div>

      {/* Favorited Spaces */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Saved Study Spaces ({favorites.length})
            </h3>
          </div>

          <Link to="/favorites" className="btn btn-secondary btn-sm">
            View All Saved
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favorites.slice(0, 3).map((space) => (
              <StudySpaceCard key={space._id} space={space} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            You haven't favorited any spaces yet. Click the heart icon on any study space card to save it here for fast booking.
          </div>
        )}
      </div>

      {/* Recommended Open Spaces */}
      {recommendedSpaces.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Recommended Available Now
              </h3>
            </div>

            <Link to="/spaces?availableNow=true" className="btn btn-secondary btn-sm">
              Explore Available
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {recommendedSpaces.map((space) => (
              <StudySpaceCard key={space._id} space={space} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .dashboard-welcome-card {
          padding: 2rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .active-booking-card {
          padding: 1.5rem 1.75rem;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        .active-booking-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
