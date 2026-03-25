const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  } else {
    db.serialize(() => {
      db.run("DELETE FROM bookings");
      db.run("DELETE FROM rides");
      db.run("DELETE FROM users");
      db.run("DELETE FROM sqlite_sequence WHERE name='bookings' OR name='rides' OR name='users'", (err) => {
         // Ignore sqlite_sequence errors if they occur
      });
    });
    
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Database wiped successfully.');
    });
  }
});
