import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password');
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
          <div style={{ fontSize: '2.5rem' }}>🍽</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Welcome Back</h2>
          <p className="text-muted">Sign in to your SmartRecipe account</p>
        </div>

        {apiError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Your password" value={form.password} onChange={handleChange} />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}
            style={{ borderRadius: '8px', fontWeight: 600 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : 'Sign In'}
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
