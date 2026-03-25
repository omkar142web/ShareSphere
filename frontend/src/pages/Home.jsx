import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <div className="hero text-center" style={{ padding: '80px 0' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '24px', letterSpacing: '-2px' }}>
          Share the Ride.<br/><span style={{ color: 'var(--accent)' }}>Save the Planet.</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Join your campus community in reducing carbon emissions. ShareSphere connects drivers and passengers seamlessly, turning daily commutes into climate action.
        </p>
        <div className="flex justify-center" style={{ gap: '16px' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Get Started</Link>
          <Link to="/dashboard" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Find a Ride</Link>
        </div>
      </div>
      
      <div className="grid-2 mt-8" style={{ marginTop: '80px' }}>
        <div className="glass-panel text-center">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌱</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Eco-Friendly Impact</h3>
          <p className="text-secondary">Every shared ride significantly reduces CO₂ emissions. Track your impact via our built-in climate calculator.</p>
        </div>
        <div className="glass-panel text-center">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Campus Exclusive</h3>
          <p className="text-secondary">Safe and trusted. Sign up with your college email and ride exclusively with your peers.</p>
        </div>
      </div>
    </div>
  );
}
