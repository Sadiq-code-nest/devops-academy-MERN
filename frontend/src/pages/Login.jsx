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
    if (!form.email.trim())           e.email    = 'Email is required';
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)               e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
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

        <div style={s.brand}>
          <span style={{ color:'#3B82F6' }}>Dev</span>
          <span style={{ color:'#22C55E' }}>Ops</span>
          <span style={{ color:'#3B82F6' }}>.</span>Academy
        </div>

        <div style={s.headingBlock}>
          <h2 style={s.title}>Student Login</h2>
          <p style={s.sub}>Enter your credentials to continue</p>
        </div>

        {/* Email */}
        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <input
            name="email" type="email"
            value={form.email} onChange={handle}
            placeholder="Enter your email"
            style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
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
            style={{ ...s.input, ...(errors.password ? s.inputError : {}) }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {errors.password && <span style={s.fieldErr}>{errors.password}</span>}
        </div>

        {apiError && <div style={s.apiError}>{apiError}</div>}

        <button onClick={submit} disabled={loading} style={s.btn}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <div style={s.divider}>
          <span style={s.dividerText}>New here?</span>
        </div>

        <Link to="/register" style={s.registerBtn}>
          Create a student account
        </Link>

        <Link to="/adminlogin" style={s.adminLink}>
          Admin access
        </Link>
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
    flexDirection: 'column',
    gap: '.9rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: '-.5px',
  },
  headingBlock: { textAlign: 'center', marginBottom: '.25rem' },
  title: { fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 },
  sub:   { fontSize: '.85rem', color: '#6B7280', marginTop: '.3rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '.3rem' },
  label: { fontSize: '.85rem', fontWeight: '600', color: '#374151' },
  input: {
    padding: '.7rem .9rem',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '.95rem',
    color: '#111827',
    background: '#F9FAFB',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border .2s',
  },
  inputError: { borderColor: '#EF4444' },
  fieldErr:   { fontSize: '.78rem', color: '#EF4444' },
  apiError: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: '.6rem .9rem',
    borderRadius: '8px',
    fontSize: '.85rem',
  },
  btn: {
    padding: '.8rem',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity .2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    margin: '.1rem 0',
  },
  dividerText: {
    fontSize: '.8rem',
    color: '#9CA3AF',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center',
  },
  registerBtn: {
    display: 'block',
    padding: '.75rem',
    background: '#F0FDF4',
    border: '1.5px solid #BBF7D0',
    borderRadius: '8px',
    color: '#16A34A',
    textAlign: 'center',
    fontSize: '.9rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
  adminLink: {
    display: 'block',
    textAlign: 'center',
    fontSize: '.78rem',
    color: '#9CA3AF',
    textDecoration: 'none',
    marginTop: '-.2rem',
  },
};
