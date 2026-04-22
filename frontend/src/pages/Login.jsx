import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.email || !form.password)
      return setError('All fields are required');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>
          <span style={{ color: '#1A6ED4' }}>Dev</span>
          <span style={{ color: '#2EA043' }}>Ops</span>
          <span style={{ color: '#1A6ED4' }}>.</span>Academy
        </div>

        <h2 style={s.title}>Student Login</h2>
        <p style={s.sub}>Welcome back — continue your journey</p>

        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <input name="email" type="email" value={form.email}
            onChange={handle} placeholder="you@email.com"
            style={s.input} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input name="password" type="password" value={form.password}
            onChange={handle} placeholder="••••••••"
            style={s.input}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button onClick={submit} disabled={loading} style={s.btn}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <div style={s.divider} />

        <p style={s.registerText}>
          Not registered?{' '}
          <Link to="/register" style={s.link}>Register now</Link>
        </p>

        <Link to="/adminlogin" style={s.adminLink}>
          Admin access →
        </Link>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F7F4',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #E0DED8',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '.25rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0D1117',
    textAlign: 'center',
    margin: 0,
  },
  sub: {
    color: '#586069',
    fontSize: '.875rem',
    textAlign: 'center',
    marginTop: '-.5rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  label: { fontSize: '.85rem', fontWeight: '600', color: '#0D1117' },
  input: {
    padding: '.75rem 1rem',
    border: '1px solid #D0D7DE',
    borderRadius: '8px',
    background: '#FAFAFA',
    color: '#0D1117',
    fontSize: '.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  btn: {
    padding: '.85rem',
    background: '#1A6ED4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '.25rem',
    fontFamily: 'inherit',
  },
  error: {
    background: '#FFF0F0',
    border: '1px solid #CF222E',
    color: '#CF222E',
    padding: '.6rem 1rem',
    borderRadius: '6px',
    fontSize: '.85rem',
  },
  divider: {
    height: '1px',
    background: '#E0DED8',
  },
  registerText: {
    textAlign: 'center',
    fontSize: '.875rem',
    color: '#586069',
    margin: 0,
  },
  link: {
    color: '#1A6ED4',
    fontWeight: '600',
    textDecoration: 'none',
  },
  adminLink: {
    textAlign: 'center',
    fontSize: '.8rem',
    color: '#8B949E',
    textDecoration: 'none',
    display: 'block',
  },
};
