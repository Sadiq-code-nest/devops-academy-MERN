import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', studentId: '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.email || !form.password || !form.studentId)
      return setError('All fields are required');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name:'name',      label:'Full Name',   type:'text',     placeholder:'Sadiq Ahmed'         },
    { name:'studentId', label:'Student ID',  type:'text',     placeholder:'STU-2025-001'        },
    { name:'email',     label:'Email',       type:'email',    placeholder:'you@email.com'       },
    { name:'password',  label:'Password',    type:'password', placeholder:'Min 6 characters'   },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>
          <span style={{ color:'#1A6ED4' }}>Dev</span>
          <span style={{ color:'#2EA043' }}>Ops</span>
          <span style={{ color:'#1A6ED4' }}>.</span>Academy
        </div>

        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join the DevOps Academy — it's free to register</p>

        {fields.map(f => (
          <div key={f.name} style={s.field}>
            <label style={s.label}>{f.label}</label>
            <input
              name={f.name} type={f.type}
              value={form[f.name]} onChange={handle}
              placeholder={f.placeholder} style={s.input}
            />
          </div>
        ))}

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <button onClick={submit} disabled={loading} style={s.btn}>
          {loading ? 'Creating account...' : 'Register →'}
        </button>

        <div style={s.divider} />

        <p style={s.loginText}>
          Already registered?{' '}
          <Link to="/login" style={s.link}>Login here</Link>
        </p>
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
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '.85rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: '700',
    textAlign: 'center',
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
    marginTop: '-.25rem',
  },
  field:   { display:'flex', flexDirection:'column', gap:'.35rem' },
  label:   { fontSize:'.85rem', fontWeight:'600', color:'#0D1117' },
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
    background: '#2EA043',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
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
  success: {
    background: '#DCFFE4',
    border: '1px solid #2EA043',
    color: '#2EA043',
    padding: '.6rem 1rem',
    borderRadius: '6px',
    fontSize: '.85rem',
  },
  divider:   { height:'1px', background:'#E0DED8' },
  loginText: { textAlign:'center', fontSize:'.875rem', color:'#586069', margin:0 },
  link:      { color:'#1A6ED4', fontWeight:'600', textDecoration:'none' },
};
