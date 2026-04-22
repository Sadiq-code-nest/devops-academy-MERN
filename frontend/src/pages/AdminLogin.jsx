import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminLogin() {
  const { setUserManually } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.username || !form.password)
      return setError('All fields required');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUserManually(data.user);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.lockIcon}>🔒</div>
        <h2 style={s.title}>Admin Access</h2>
        <p style={s.sub}>Restricted area — authorized personnel only</p>

        <div style={s.field}>
          <label style={s.label}>Username</label>
          <input name="username" value={form.username} onChange={handle}
            placeholder="admin" style={s.input} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input name="password" type="password" value={form.password}
            onChange={handle} placeholder="••••••••" style={s.input}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button onClick={submit} disabled={loading} style={s.btn}>
          {loading ? 'Verifying...' : 'Login as Admin →'}
        </button>

        <a href="/login" style={s.back}>← Student login</a>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#F0F2F5', padding: '1rem',
  },
  card: {
    background: '#fff', border: '1px solid #E0DED8',
    borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '380px',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  },
  lockIcon: { fontSize: '2rem', textAlign: 'center' },
  title:    { fontSize: '1.2rem', fontWeight: '700', color: '#0D1117',
              textAlign: 'center', margin: 0 },
  sub:      { color: '#586069', fontSize: '.85rem', textAlign: 'center',
              marginTop: '-.5rem' },
  field:    { display: 'flex', flexDirection: 'column', gap: '.35rem' },
  label:    { fontSize: '.85rem', fontWeight: '600', color: '#0D1117' },
  input: {
    padding: '.75rem 1rem', border: '1px solid #D0D7DE',
    borderRadius: '8px', background: '#FAFAFA', color: '#0D1117',
    fontSize: '.95rem', outline: 'none', fontFamily: 'inherit',
  },
  btn: {
    padding: '.85rem', background: '#0D1117', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },
  error: {
    background: '#FFF0F0', border: '1px solid #CF222E',
    color: '#CF222E', padding: '.6rem 1rem',
    borderRadius: '6px', fontSize: '.85rem',
  },
  back: {
    textAlign: 'center', fontSize: '.85rem',
    color: '#8B949E', textDecoration: 'none', display: 'block',
  },
};
