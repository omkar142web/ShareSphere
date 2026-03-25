import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PostRide() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [error, setError] = useState('');
  
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/rides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ origin, destination, time, total_seats: Number(seats) })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to post ride');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '24px' }}>Post a New Ride</h2>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Origin</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required placeholder="e.g. Hostels"/>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Destination</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required placeholder="e.g. Main Campus"/>
            </div>
          </div>
          
          <div className="grid-2" style={{ marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Available Seats</label>
              <input type="number" min="1" max="8" value={seats} onChange={(e) => setSeats(e.target.value)} required />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px' }}>Publish Ride & Earn 🌱</button>
        </form>
      </div>
    </div>
  );
}
