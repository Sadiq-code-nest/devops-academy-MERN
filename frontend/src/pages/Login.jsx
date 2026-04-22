import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [tab,  setTab]  = useState('login');   // 'login' | 'register'
  const [role, setRole] = useState('student'); // 'student' | 'instructor'
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'register') {
        // Register then auto-login
        const api = (await import('../api/axios')).default;
        await api.post('/auth/register', { ...form, role });
      }
      const user = await login(form.email, form.password);
      const dest  = user.role === 'instructor'
        ? '/instructor-dashboard'
        : user.role === 'admin'
        ? '/admin'
        : '/student-dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Brand */}
        <div style={styles.brand}>
          <span style={{ color:'var(--blue)' }}>Dev</span>
          <span style={{ color:'var(--green)' }}>Ops</span>
          <span style={{ color:'var(--blue)' }}>.</span>Academy
        </div>
        <p style={styles.subtitle}>
          {tab === 'login' ? 'Welcome back' : 'Create your account'}
        </p>

        {/* Tab Switch */}
        <div style={styles.tabRow}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Role Selector */}
        <div style={styles.roleRow}>
          {['student','instructor'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{ ...styles.roleBtn, ...(role === r ? styles.roleBtnActive : {}) }}>
              {r === 'student' ? '🎓 Student' : '👨‍🏫 Instructor'}
            </button>
          ))}
        </div>

        {/* Fields */}
        {tab === 'register' && (
          <input name="name" placeholder="Full Name"
            value={form.name} onChange={handle} style={styles.input} />
        )}
        <input name="email" type="email" placeholder="Email Address"
          value={form.email} onChange={handle} style={styles.input} />
        <input name="password" type="password" placeholder="Password"
          value={form.password} onChange={handle} style={styles.input}
          onKeyDown={e => e.key === 'Enter' && submit()} />

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Submit */}
        <button onClick={submit} disabled={loading} style={styles.btn}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Login →' : 'Create Account →'}
        </button>

        {/* Seed note */}
        <div style={styles.note}>
          Admin: admin@devopsacademy.com / Admin@1234
        </div>

        <Link to="/" style={styles.back}>← Back to site</Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '1rem',
  },
  card: {
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: 'var(--shadow-lg)',
  },
  brand: {
    fontSize: '1.6rem',
    fontWeight: '700',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
    color: 'var(--text)',
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '.9rem',
    marginTop: '-.5rem',
  },
  tabRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: 'var(--bg)',
    borderRadius: '8px',
    padding: '4px',
    gap: '4px',
  },
  tab: {
    padding: '.5rem',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '.9rem',
    color: 'var(--text-muted)',
    transition: 'all .2s',
  },
  tabActive: {
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: '600',
  },
  roleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.5rem',
  },
  roleBtn: {
    padding: '.6rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '.85rem',
    color: 'var(--text-muted)',
    transition: 'all .2s',
  },
  roleBtnActive: {
    border: '1px solid var(--blue)',
    color: 'var(--blue)',
    background: 'var(--blue-light)',
    fontWeight: '600',
  },
  input: {
    padding: '.75rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: '.95rem',
    outline: 'none',
    width: '100%',
  },
  btn: {
    padding: '.85rem',
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '.25rem',
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #CF222E',
    color: '#CF222E',
    padding: '.6rem 1rem',
    borderRadius: '6px',
    fontSize: '.85rem',
  },
  note: {
    textAlign: 'center',
    fontSize: '.75rem',
    color: 'var(--text-light)',
    fontFamily: 'var(--font-mono)',
  },
  back: {
    textAlign: 'center',
    fontSize: '.85rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
  },
};
