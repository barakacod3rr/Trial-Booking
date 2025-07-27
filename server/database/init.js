const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite';

let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('📦 Connected to SQLite database');
      
      // Create tables
      createTables()
        .then(() => {
          console.log('✅ Database tables initialized');
          resolve();
        })
        .catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      // Bookings table
      `CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        bay_number INTEGER NOT NULL,
        booking_type TEXT NOT NULL CHECK (booking_type IN ('bay_only', 'coaching_bay')),
        players INTEGER NOT NULL CHECK (players >= 1 AND players <= 8),
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        total_cost REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        pesapal_tracking_id TEXT,
        pesapal_merchant_reference TEXT
      )`,
      
      // Time slots table for managing availability
      `CREATE TABLE IF NOT EXISTS time_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bay_number INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available BOOLEAN DEFAULT 1,
        booking_id TEXT,
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
      )`,
      
      // Bay configuration table
      `CREATE TABLE IF NOT EXISTS bays (
        number INTEGER PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('bay_only', 'coaching')),
        hourly_rate REAL NOT NULL,
        max_players INTEGER DEFAULT 8
      )`
    ];

    let completed = 0;
    const total = queries.length;

    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error creating table ${index + 1}:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === total) {
          // Initialize bay data
          initializeBayData()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  });
};

const initializeBayData = () => {
  return new Promise((resolve, reject) => {
    // Check if bays are already initialized
    db.get('SELECT COUNT(*) as count FROM bays', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        resolve(); // Already initialized
        return;
      }

      // Insert bay data
      const bays = [
        // Bay Only - Bays 1-10 (2000 KES/hour)
        ...Array.from({length: 10}, (_, i) => [i + 1, 'bay_only', 2000, 8]),
        // Coaching + Bay - Bays 11-12 (3000 KES/hour)
        [11, 'coaching', 3000, 8],
        [12, 'coaching', 3000, 8]
      ];

      const stmt = db.prepare('INSERT INTO bays (number, type, hourly_rate, max_players) VALUES (?, ?, ?, ?)');
      let completed = 0;

      bays.forEach(bay => {
        stmt.run(bay, (err) => {
          if (err) {
            console.error('Error inserting bay data:', err);
            reject(err);
            return;
          }
          completed++;
          if (completed === bays.length) {
            stmt.finalize();
            console.log('🏌️ Bay data initialized');
            resolve();
          }
        });
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📦 Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase
};