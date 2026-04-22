import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      setError('');
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="nav-brand" style={{ marginBottom: '1.5rem' }}>
          <span className="brand-prefix">Dev</span>
          <span className="brand-suffix">Ops</span>
          <span className="brand-dot">.</span>Academy
        </div>
        <h2>Admin Login</h2>
        {error && <div className="login-error">{error}</div>}
        <input
          name="email"    type="email"
          placeholder="Email"    value={form.email}
          onChange={handle}      className="ef-field"
        />
        <input
          name="password" type="password"
          placeholder="Password" value={form.password}
          onChange={handle}      className="ef-field"
        />
        <button className="enroll-btn" onClick={submit}>Login →</button>
        <a href="/" style={{ display:'block', marginTop:'1rem', textAlign:'center',
          fontSize:'.85rem', opacity:.6 }}>← Back to site</a>
      </div>
    </div>
  );
}
