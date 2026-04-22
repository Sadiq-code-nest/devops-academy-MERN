import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', studentId: '',
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handle = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name      = 'Name is required';
    else if (form.name.trim().length < 2) e.name    = 'Name too short';
    if (!form.studentId.trim())         e.studentId = 'Student ID is required';
    if (!form.email.trim())             e.email     = 'Email is required';
    else if (!emailRegex.test(form.email)) e.email  = 'Enter a valid email';
    if (!form.password)                 e.password  = 'Password is required';
    else if (form.password.length < 6)  e.password  = 'Minimum 6 characters';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name:'name',      label:'Full Name',  type:'text',     placeholder:'Enter your full name'  },
    { name:'studentId', label:'Student ID', type:'text',     placeholder:'Enter your student ID' },
    { name:'email',     label:'Email',      type:'email',    placeholder:'Enter your email'      },
    { name:'password',  label:'Password',   type:'password', placeholder:'Enter your password'   },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>
          <span style={{ color:'#3B82F6' }}>Dev</span>
          <span style={{ color:'#22C55E' }}>Ops</span>
          <span style={{ color:'#3B82F6' }}>.</span>Academy
        </div>

        <div style={s.headingBlock}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.sub}>Register as a student to get started</p>
        </div>

        {fields.map(f => (
          <div key={f.name} style={s.field}>
            <label style={s.label}>{f.label}</label>
            <input
              name={f.name} type={f.type}
              value={form[f.name]} onChange={handle}
              placeholder={f.placeholder}
              style={{ ...s.input, ...(errors[f.name] ? s.inputError : {}) }}
            />
            {errors[f.name] && <span style={s.fieldErr}>{errors[f.name]}</span>}
          </div>
        ))}

        {apiError && <div style={s.apiError}>{apiError}</div>}
        {success  && <div style={s.successBox}>{success}</div>}

        <button onClick={submit} disabled={loading || !!success} style={s.btn}>
          {loading ? 'Creating account...' : 'Register →'}
        </button>

        <p style={s.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Login here</Link>
        </p>
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
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '.85rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  brand: { fontSize:'1.5rem', fontWeight:'800', textAlign:'center', letterSpacing:'-.5px' },
  headingBlock: { textAlign:'center', marginBottom:'.1rem' },
  title: { fontSize:'1.15rem', fontWeight:'700', color:'#111827', margin:0 },
  sub:   { fontSize:'.85rem', color:'#6B7280', marginTop:'.3rem' },
  field: { display:'flex', flexDirection:'column', gap:'.3rem' },
  label: { fontSize:'.85rem', fontWeight:'600', color:'#374151' },
  input: {
    padding: '.7rem .9rem',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '.95rem',
    color: '#111827',
    background: '#F9FAFB',
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputError:  { borderColor:'#EF4444' },
  fieldErr:    { fontSize:'.78rem', color:'#EF4444' },
  apiError: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    color: '#DC2626', padding: '.6rem .9rem',
    borderRadius: '8px', fontSize: '.85rem',
  },
  successBox: {
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    color: '#16A34A', padding: '.6rem .9rem',
    borderRadius: '8px', fontSize: '.85rem',
  },
  btn: {
    padding: '.8rem', background: '#22C55E', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '.95rem',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },
  loginText: { textAlign:'center', fontSize:'.875rem', color:'#6B7280', margin:0 },
  link:      { color:'#3B82F6', fontWeight:'600', textDecoration:'none' },
};
