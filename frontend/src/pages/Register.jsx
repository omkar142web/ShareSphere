import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check .edu quickly on client side as well
    if (!email.includes('.edu') && !email.includes('college')) {
      setError('Please use a valid college email address (must contain .edu or college)');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Auto login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          login(loginData.token, loginData.user);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '60px' }}>
      <div className="glass-panel">
        <h2 className="text-center" style={{ marginBottom: '8px' }}>Join ShareSphere</h2>
        <p className="text-center text-secondary mb-8">Create your campus ride-sharing account</p>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe"/>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>College Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@college.edu"/>
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px' }}>Sign Up & Join</button>
        </form>
        <p className="text-center mt-8 text-secondary">
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
