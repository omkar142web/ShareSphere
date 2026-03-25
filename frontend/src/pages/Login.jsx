import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '60px' }}>
      <div className="glass-panel">
        <h2 className="text-center" style={{ marginBottom: '8px' }}>Welcome Back</h2>
        <p className="text-center text-secondary mb-8">Login to continue sharing rides</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>College Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@college.edu"/>
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px' }}>Login Securely</button>
        </form>
        <p className="text-center mt-8 text-secondary">
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
