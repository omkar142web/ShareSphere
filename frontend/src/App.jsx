import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostRide from './pages/PostRide';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="container text-center mt-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
      <div className="container flex items-center justify-between">
        <a href="/" style={{ color: 'var(--accent)', fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none' }}>
          ShareSphere
        </a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <>
              <a href="/dashboard" style={{ color: 'var(--text-primary)'}}>Dashboard</a>
              <a href="/post-ride" style={{ color: 'var(--text-primary)'}}>Post Ride</a>
              <span style={{color: 'var(--accent)', marginLeft: '12px', fontWeight: 600}}>🌱 {user.eco_score} pts</span>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 16px', marginLeft: '12px' }}>Logout</button>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: 'var(--text-primary)'}}>Login</a>
              <a href="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign Up</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/post-ride" element={<ProtectedRoute><PostRide /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
