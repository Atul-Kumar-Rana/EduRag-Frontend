import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="container fade-in">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>🥗</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Create Account</h2>
          <p className="text-muted">Join SmartRecipe and start cooking</p>
        </div>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Your full name" value={form.name} onChange={handleChange} />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirm" className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
              placeholder="Repeat your password" value={form.confirm} onChange={handleChange} />
            {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}
            style={{ borderRadius: '8px', fontWeight: 600 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</> : 'Create Account'}
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
