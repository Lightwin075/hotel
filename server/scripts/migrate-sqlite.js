const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('🚀 Starting SQLite database migration...');

// Create database file in the server directory
const dbPath = path.join(__dirname, '..', 'hotel.db');
const db = new sqlite3(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

async function createTables() {
  console.log('📋 Creating tables...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'staff', 'user')),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe')),
      floor INTEGER NOT NULL,
      price_per_night DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
      description TEXT,
      amenities TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Guests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT DEFAULT 'Unknown',
      id_type TEXT,
      id_number TEXT,
      date_of_birth DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reservations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
      total_amount DECIMAL(10,2) NOT NULL,
      deposit_amount DECIMAL(10,2) DEFAULT 0,
      special_requests TEXT,
      notes TEXT,
      created_by INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guest_id) REFERENCES guests (id),
      FOREIGN KEY (room_id) REFERENCES rooms (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Billing table
  db.exec(`
    CREATE TABLE IF NOT EXISTS billing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'online')),
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
      billing_date DATE NOT NULL,
      due_date DATE,
      notes TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reservation_id) REFERENCES reservations (id),
      FOREIGN KEY (guest_id) REFERENCES guests (id),
      FOREIGN KEY (room_id) REFERENCES rooms (id)
    )
  `);

  // Housekeeping table
  db.exec(`
    CREATE TABLE IF NOT EXISTS housekeeping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      assigned_to INTEGER,
      task_type TEXT NOT NULL CHECK (task_type IN ('cleaning', 'maintenance', 'inspection', 'restocking')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      scheduled_date DATE NOT NULL,
      completed_date DATETIME,
      notes TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms (id),
      FOREIGN KEY (assigned_to) REFERENCES users (id)
    )
  `);

  console.log('✅ Tables created successfully');
}

async function createDefaultAdmin() {
  console.log('👤 Creating default admin user...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run('admin@hotel.com', hashedPassword, 'Admin', 'User', 'admin');
  console.log('✅ Default admin user created (email: admin@hotel.com, password: admin123)');
}

async function createSampleData() {
  console.log('📊 Creating sample data...');

  // Sample rooms
  const roomStmt = db.prepare(`
    INSERT OR IGNORE INTO rooms (room_number, type, floor, price_per_night, description, amenities)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleRooms = [
    ['101', 'single', 1, 80.00, 'Comfortable single room with city view', 'WiFi, TV, AC, Private Bathroom'],
    ['102', 'single', 1, 80.00, 'Cozy single room with garden view', 'WiFi, TV, AC, Private Bathroom'],
    ['201', 'double', 2, 120.00, 'Spacious double room with balcony', 'WiFi, TV, AC, Private Bathroom, Balcony'],
    ['202', 'double', 2, 120.00, 'Modern double room with city view', 'WiFi, TV, AC, Private Bathroom, Mini Bar'],
    ['301', 'suite', 3, 200.00, 'Luxury suite with separate living area', 'WiFi, TV, AC, Private Bathroom, Living Room, Mini Bar'],
    ['302', 'deluxe', 3, 180.00, 'Deluxe room with premium amenities', 'WiFi, TV, AC, Private Bathroom, Mini Bar, Room Service']
  ];

  sampleRooms.forEach(room => {
    roomStmt.run(...room);
  });

  console.log('✅ Sample data created successfully');
}

async function runMigrations() {
  try {
    await createTables();
    await createDefaultAdmin();
    await createSampleData();
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📁 Database file created at:', dbPath);
    console.log('🔑 Admin credentials: admin@hotel.com / admin123');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigrations(); 