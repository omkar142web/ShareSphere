const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'sharesphere_hackathon_super_secret';

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email.endsWith('.edu') && !email.includes('college')) {
    return res.status(400).json({ error: 'Must use a valid college email (.edu or containing college)' });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, 
      [name, email, hashedPassword], 
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, eco_score: user.eco_score } });
  });
});

// Rides: Get all available
app.get('/api/rides', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  let passenger_id = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      passenger_id = decoded.id;
    } catch(err) {}
  }
  
  const query = `
    SELECT rides.*, users.name as driver_name,
    (SELECT COUNT(*) FROM bookings WHERE ride_id = rides.id AND passenger_id = ?) as is_joined,
    (SELECT GROUP_CONCAT(passenger.name, ', ') FROM bookings JOIN users as passenger ON bookings.passenger_id = passenger.id WHERE bookings.ride_id = rides.id) as passengers
    FROM rides 
    JOIN users ON rides.driver_id = users.id 
    ORDER BY rides.id DESC
  `;
  db.all(query, [passenger_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});

// Rides: Post a ride
app.post('/api/rides', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const driver_id = decoded.id;
    const { origin, destination, time, total_seats } = req.body;
    
    db.run(
      `INSERT INTO rides (driver_id, origin, destination, time, total_seats, available_seats) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driver_id, origin, destination, time, total_seats, total_seats],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Add eco points to driver
        db.run(`UPDATE users SET eco_score = eco_score + 10 WHERE id = ?`, [driver_id]);
        
        res.status(201).json({ message: 'Ride posted successfully', rideId: this.lastID });
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Rides: Delete
app.delete('/api/rides/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const driver_id = decoded.id;
    const ride_id = req.params.id;
    
    db.get(`SELECT driver_id FROM rides WHERE id = ?`, [ride_id], (err, ride) => {
      if (err || !ride) return res.status(404).json({ error: 'Ride not found' });
      if (ride.driver_id !== driver_id) return res.status(403).json({ error: 'Forbidden: You can only delete your own rides' });
      
      db.run(`DELETE FROM bookings WHERE ride_id = ?`, [ride_id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        db.run(`DELETE FROM rides WHERE id = ?`, [ride_id], (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Ride deleted successfully' });
        });
      });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Rides: Join
app.post('/api/rides/:id/join', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const passenger_id = decoded.id;
    const ride_id = req.params.id;
    
    db.get(`SELECT available_seats FROM rides WHERE id = ?`, [ride_id], (err, ride) => {
      if (err || !ride) return res.status(404).json({ error: 'Ride not found' });
      if (ride.available_seats <= 0) return res.status(400).json({ error: 'Ride is full' });
      
      db.get(`SELECT * FROM bookings WHERE ride_id = ? AND passenger_id = ?`, [ride_id, passenger_id], (err, booking) => {
        if (booking) return res.status(400).json({ error: 'Already joined this ride' });
        
        db.run(`INSERT INTO bookings (ride_id, passenger_id) VALUES (?, ?)`, [ride_id, passenger_id], (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          db.run(`UPDATE rides SET available_seats = available_seats - 1 WHERE id = ?`, [ride_id]);
          // Add eco points for sharing
          db.run(`UPDATE users SET eco_score = eco_score + 25 WHERE id = ?`, [passenger_id]);
          
          res.json({ message: 'Successfully joined ride', co2_saved: 2.5 }); 
        });
      });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Rides: Cancel Join
app.delete('/api/rides/:id/join', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const passenger_id = decoded.id;
    const ride_id = req.params.id;
    
    db.get(`SELECT * FROM bookings WHERE ride_id = ? AND passenger_id = ?`, [ride_id, passenger_id], (err, booking) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!booking) return res.status(400).json({ error: 'You are not joined to this ride' });
      
      db.run(`DELETE FROM bookings WHERE ride_id = ? AND passenger_id = ?`, [ride_id, passenger_id], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        db.run(`UPDATE rides SET available_seats = available_seats + 1 WHERE id = ?`, [ride_id]);
        db.run(`UPDATE users SET eco_score = eco_score - 25 WHERE id = ?`, [passenger_id]);
        
        res.json({ message: 'Successfully canceled booking' });
      });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// User: Profile & Stats
app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get(`SELECT id, name, email, eco_score FROM users WHERE id = ?`, [decoded.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
