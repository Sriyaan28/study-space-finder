import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillStudent = () => {
    setEmail('student@campus.edu');
    setPassword('StudentPass123!');
    setError(null);
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@campus.edu');
    setPassword('AdminPass123!');
    setError(null);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
            <Compass size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Sign In to CampusSpaces
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Access university study reservations & analytics
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Autofill Bar */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem', textAlign: 'center' }}>
            Demo 1-Click Credentials
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleQuickFillStudent}
              style={{ fontSize: '0.75rem' }}
            >
              <User size={12} /> Student Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleQuickFillAdmin}
              style={{ fontSize: '0.75rem' }}
            >
              <Shield size={12} /> Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              University Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
