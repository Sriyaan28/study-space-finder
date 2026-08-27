import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '3.5rem 2rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Compass size={32} />
        </div>
        <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>404 Error</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          The campus study space or destination you were looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
