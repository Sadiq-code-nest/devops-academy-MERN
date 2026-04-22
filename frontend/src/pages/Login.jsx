import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())                e.email    = 'Email is required';
    else if (!emailRegex.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                    e.password = 'Password is required';
    else if (form.password.length < 6)     e.password = 'Minimum 6 characters';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Brand */}
        <div style={s.brand}>
          <span style={{ color: '#3B82F6' }}>Dev</span>
          <span style={{ color: '#22C55E' }}>Ops</span>
          <span style={{ color: '#3B82F6' }}>.</span>
          <span style={{ color: '#111827' }}>Academy</span>
        </div>

        <div style={s.headingBlock}>
          <h2 style={s.title}>Welcome Back</h2>
          <p style={s.sub}>Login to continue your DevOps journey</p>
        </div>

        {/* Email */}
        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <input
            name="email" type="email"
            value={form.email} onChange={handle}
            placeholder="Enter your email"
            style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
          />
          {errors.email && <span style={s.fieldErr}>{errors.email}</span>}
        </div>

        {/* Password */}
        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input
            name="password" type="password"
            value={form.password} onChange={handle}
            placeholder="Enter your password"
            style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {errors.password && <span style={s.fieldErr}>{errors.password}</span>}
        </div>

        {/* API error */}
        {apiError && <div style={s.apiError}>{apiError}</div>}

        {/* Login button */}
        <button onClick={submit} disabled={loading} style={s.btn}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        {/* Divider */}
        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerLabel}>New to DevOps Academy?</span>
          <div style={s.dividerLine} />
        </div>

        {/* Register prompt — eye-catching */}
        <div style={s.registerPrompt}>
          Not registered yet?{' '}
          <Link to="/register" style={s.registerLink}>
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    fle
