import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rides');
      const data = await res.json();
      setRides(data);
    } catch (err) {
      setError('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}. You saved ~${data.co2_saved}kg CO₂! 🌱`);
        fetchRides(); // Refresh list
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to join ride');
    }
    
    // Clear message after 4s
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchRides();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete ride');
    }
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  if (loading) return <div className="container text-center mt-8 text-secondary">Loading rides...</div>;

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <h2>Available Rides</h2>
        <Link to="/post-ride" className="btn btn-primary">Post a Ride</Link>
      </div>

      {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

      <div className="grid-2">
        {rides.length === 0 ? (
          <div className="glass-panel text-secondary">No rides available right now. Be the first to post one!</div>
        ) : (
          rides.map(ride => (
            <div key={ride.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ride.origin} → {ride.destination}</span>
              </div>
              
              <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '4px' }}>🕒 {ride.time}</div>
                <div style={{ marginBottom: '4px' }}>🚗 Driver: <span style={{ color: 'var(--text-primary)'}}>{ride.driver_name}</span></div>
                <div>🪑 Seats: {ride.available_seats} / {ride.total_seats}</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                {user.name === ride.driver_name ? (
                  <button 
                    onClick={() => handleDelete(ride.id)}
                    className="btn btn-outline btn-full" 
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    Delete Ride
                  </button>
                ) : (
                  <button 
                    onClick={() => handleJoin(ride.id)} 
                    className="btn btn-primary btn-full"
                    disabled={ride.available_seats === 0}
                    style={ride.available_seats === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {ride.available_seats === 0 ? 'Full' : 'Join Ride'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
