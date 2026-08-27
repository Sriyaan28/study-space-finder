import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-subtle)', marginTop: '4rem', padding: '3.5rem 0 2rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>Campus<span style={{ color: 'var(--primary)' }}>Spaces</span></span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              The modern university study space discovery, interactive seating reservation, and statistical availability tracking platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Campus Discovery
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li><Link to="/spaces" style={{ transition: 'var(--transition)' }}>Browse All Spaces</Link></li>
              <li><Link to="/spaces?noiseLevel=silent">Silent Study Zones</Link></li>
              <li><Link to="/spaces?noiseLevel=moderate">Collaborative Tech Hubs</Link></li>
              <li><Link to="/spaces?availableNow=true">Available Right Now</Link></li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Student Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li><Link to="/dashboard">Personal Dashboard</Link></li>
              <li><Link to="/reservations">Manage Reservations</Link></li>
              <li><Link to="/favorites">Saved Study Spots</Link></li>
              <li><Link to="/analytics">Study Habit Analytics</Link></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Campus System
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#065f46' }}>All Campus Sensors Online</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Powered by real-time seat tracking & statistical occupancy forecasting.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <p>© 2026 CampusSpaces Inc. Built for university excellence.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Campus Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
