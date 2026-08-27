import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, User, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science & Engineering',
    'Biomedical Sciences',
    'School of Law',
    'College of Arts & Humanities',
    'Business & Economics',
    'Physics & Mathematics',
    'General Studies',
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, department, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        name,
        email,
        department,
        password,
        role: 'student',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
            <Compass size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Create Student Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Join CampusSpaces to reserve desks and track study hours
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="name"
                placeholder="Alex Rivera"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              University Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name="email"
                placeholder="alex@campus.edu"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Department / Major
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <BookOpen size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', backgroundColor: '#ffffff', outline: 'none' }}
              >
                {departments.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                Confirm
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.6875rem 1rem 0.6875rem 2.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
