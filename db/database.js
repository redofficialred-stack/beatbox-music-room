// Part 2: Database -> Save as db/database.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'beatbox.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Enable foreign key constraints and create the 3 related tables
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS musicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS instruments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      family TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      musician_id INTEGER NOT NULL,
      instrument_id INTEGER NOT NULL,
      loan_date TEXT NOT NULL,
      return_date TEXT,
      FOREIGN KEY (musician_id) REFERENCES musicians(id) ON DELETE CASCADE,
      FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
    )
  `);

  // Seed sample data only if the tables are empty (no loans are seeded,
  // so the Top three twist starts from a clean state)
  db.get('SELECT COUNT(*) AS count FROM instruments', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO instruments (name, family) VALUES
        ('Violin', 'Strings'),
        ('Acoustic Guitar', 'Strings'),
        ('Cello', 'Strings'),
        ('Snare Drum', 'Percussion'),
        ('Flute', 'Woodwind'),
        ('Trumpet', 'Brass')
      `);
    }
  });

  db.get('SELECT COUNT(*) AS count FROM musicians', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`INSERT INTO musicians (name, email, phone) VALUES
        ('Aarav', 'aarav@example.com', '9876543210'),
        ('Diya', 'diya@example.com', '9876543211'),
        ('Karthik', 'karthik@example.com', '9876543212'),
        ('Meera', 'meera@example.com', '9876543213'),
        ('Rahul', 'rahul@example.com', '9876543214')
      `);
    }
  });
});

// Promise helpers for clean async/await queries
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });

module.exports = { db, all, get, run };
