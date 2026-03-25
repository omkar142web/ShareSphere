const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the local SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      eco_score INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      time TEXT NOT NULL,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      FOREIGN KEY(driver_id) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id INTEGER,
      passenger_id INTEGER,
      FOREIGN KEY(ride_id) REFERENCES rides(id),
      FOREIGN KEY(passenger_id) REFERENCES users(id)
    )`);
  }
});

module.exports = db;
