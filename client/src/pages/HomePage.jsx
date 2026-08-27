import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Wifi,
  Volume2,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import StudySpaceCard from '../components/StudySpaceCard';

export const HomePage = ({ onOpenAI }) => {
  const [spaces, setSpaces] = useState([]);
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await api.getSpaces();
        if (res.success && res.data) {
          setSpaces(res.data);
          const openNow = res.data.filter(
            (s) => s.liveStats && s.liveStats.availableSeats > 0 && s.status === 'open'
          );
          setAvailableSpaces(openNow);
        }
      } catch (err) {
        console.error('Failed to load spaces for homepage:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/spaces?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/spaces');
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          {/* Badge */}
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Campus Live Study Space Discovery & Seating</span>
          </div>

          <h1 className="hero-title">
            Find Your Ideal <span className="hero-title-highlight">Study Sanctuary</span> on Campus
          </h1>

          <p className="hero-subtitle">
            Track real-time seat availability, reserve your favorite desk with interactive BookMyShow-style seating, predict crowd levels, and get AI-powered space recommendations.
          </p>

          {/* Quick Search Box */}
          <form onSubmit={handleSearchSubmit} className="hero-search-box card">
            <Search size={20} className="hero-search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search by building, room, atmosphere (e.g. 'Silent Pods', 'Engineering', 'Wi-Fi 6')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              <span>Find Space</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="hero-quick-tags">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick search:</span>
            <Link to="/spaces?noiseLevel=silent" className="quick-tag">🤫 Silent Zones</Link>
            <Link to="/spaces?noiseLevel=moderate" className="quick-tag">👥 Group Discussion</Link>
            <Link to="/spaces?availableNow=true" className="quick-tag">⚡ Available Now</Link>
            <button type="button" onClick={onOpenAI} className="quick-tag quick-tag-ai">
              <Sparkles size={12} /> Ask AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Campus Stats Banner */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <div className="stats-banner card">
          <div className="stat-banner-item">
            <div className="stat-banner-icon bg-indigo"><Users size={22} color="#4f46e5" /></div>
            <div>
              <h4 className="stat-banner-val">{spaces.length > 0 ? `${spaces.length} Spaces` : '6 Hubs'}</h4>
              <p className="stat-banner-lbl">Campus Study Locations</p>
            </div>
          </div>

          <div className="stat-banner-divider"></div>

          <div className="stat-banner-item">
            <div className="stat-banner-icon bg-emerald"><Zap size={22} color="#10b981" /></div>
            <div>
              <h4 className="stat-banner-val">
                {spaces.reduce((acc, s) => acc + (s.liveStats?.availableSeats || s.capacity || 0), 0)}+
              </h4>
              <p className="stat-banner-lbl">Seats Open Right Now</p>
            </div>
          </div>

          <div className="stat-banner-divider"></div>

          <div className="stat-banner-item">
            <div className="stat-banner-icon bg-amber"><TrendingUp size={22} color="#f59e0b" /></div>
            <div>
              <h4 className="stat-banner-val">Statistical</h4>
              <p className="stat-banner-lbl">Availability Predictions</p>
            </div>
          </div>

          <div className="stat-banner-divider"></div>

          <div className="stat-banner-item">
            <div className="stat-banner-icon bg-purple"><Sparkles size={22} color="#8b5cf6" /></div>
            <div>
              <h4 className="stat-banner-val">AI Grounded</h4>
              <p className="stat-banner-lbl">Natural Language Helper</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Now Section */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#065f46' }}>Live Campus Status</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Available Right Now
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Open study spaces with verified vacant seats ready for immediate reservation.
            </p>
          </div>

          <Link to="/spaces?availableNow=true" className="btn btn-outline btn-sm">
            <span>View All Open Spaces</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : availableSpaces.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {availableSpaces.slice(0, 3).map((space) => (
              <StudySpaceCard key={space._id} space={space} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            All spaces currently experiencing peak hours. Check back shortly or view predicted future availability!
          </div>
        )}
      </section>

      {/* Featured Spaces */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Popular Campus Study Spaces
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Top-rated quiet carrels, high-tech collaborative pods, and 24/7 student lounges.
            </p>
          </div>

          <Link to="/spaces" className="btn btn-secondary btn-sm">
            <span>Explore All Spaces</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {spaces.slice(0, 6).map((space) => (
            <StudySpaceCard key={space._id} space={space} />
          ))}
        </div>
      </section>

      {/* How it Works / Feature Walkthrough */}
      <section className="how-it-works-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              How CampusSpaces Works
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Designed specifically for university students to eliminate the frustration of searching for open desks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {/* Step 1 */}
            <div className="card feature-step-card">
              <div className="step-num-badge">01</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Discover & Filter</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Filter campus study locations by verified noise levels (silent vs. collaborative), Wi-Fi speed, and amenities like standing desks and power outlets.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card feature-step-card">
              <div className="step-num-badge">02</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Pick Exact Seats</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                View visual BookMyShow-style seat layouts with real-time green (available), red (occupied), and amber (reserved) indicators. Pick your favorite spot with one click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card feature-step-card">
              <div className="step-num-badge">03</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Predict & Plan</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Check statistical availability forecasts derived from 30-day historical occupancy patterns to plan study sessions during low-traffic windows.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card feature-step-card">
              <div className="step-num-badge">04</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>AI Study Matcher</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Ask our grounded campus AI assistant in natural language to match your study group requirements with verified real campus rooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="container" style={{ margin: '4rem auto' }}>
        <div className="cta-banner">
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Ready to Lock In Your Study Spot?
            </h2>
            <p style={{ fontSize: '1rem', color: '#c7d2fe', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Sign up free with your student credentials or explore live campus seating without an account.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
              <Link to="/spaces" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
                Browse All Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 4rem 0 3rem 0;
          text-align: center;
          position: relative;
        }
        .hero-container {
          max-width: 860px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.875rem;
          background: #eef2ff;
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 1.25rem;
        }
        .hero-badge-icon {
          color: #7c3aed;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text-main);
          margin-bottom: 1.25rem;
        }
        .hero-title-highlight {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2.25rem;
        }
        .hero-search-box {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 1.25rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
          background: #ffffff;
        }
        .hero-search-icon {
          color: var(--text-muted);
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        .hero-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9375rem;
          color: var(--text-main);
          background: transparent;
        }
        .hero-search-btn {
          flex-shrink: 0;
        }
        .hero-quick-tags {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .quick-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-muted);
          transition: var(--transition);
        }
        .quick-tag:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }
        .quick-tag-ai {
          background: linear-gradient(135deg, #eef2ff, #faf5ff);
          border-color: rgba(99, 102, 241, 0.3);
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
        }
        .stats-banner {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: center;
          padding: 1.5rem 2rem;
          gap: 1.5rem;
          background: #ffffff;
        }
        .stat-banner-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .stat-banner-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-indigo { background: var(--indigo-50); }
        .bg-emerald { background: var(--emerald-50); }
        .bg-amber { background: var(--amber-50); }
        .bg-purple { background: #faf5ff; }
        .stat-banner-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.2;
        }
        .stat-banner-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .stat-banner-divider {
          width: 1px;
          height: 40px;
          background-color: var(--border-subtle);
        }
        .how-it-works-section {
          background: #f1f5f9;
          padding: 4.5rem 0;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }
        .feature-step-card {
          padding: 1.75rem;
          position: relative;
        }
        .step-num-badge {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 800;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .cta-banner {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #7c3aed 100%);
          border-radius: var(--radius-xl);
          padding: 3.5rem 3rem;
          box-shadow: 0 20px 35px -10px rgba(79, 70, 229, 0.4);
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .stats-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .stat-banner-divider {
            display: none;
          }
          .cta-banner {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
