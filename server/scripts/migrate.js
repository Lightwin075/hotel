const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'receptionist')),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id)
      )
    `);

    // Create rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe', 'presidential')),
        capacity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        amenities JSONB DEFAULT '[]',
        floor INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning', 'reserved')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id)
      )
    `);

    // Create guests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        date_of_birth DATE,
        id_type VARCHAR(50),
        id_number VARCHAR(100),
        preferences JSONB DEFAULT '{}',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id)
      )
    `);

    // Create reservations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        guest_id INTEGER NOT NULL REFERENCES guests(id),
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        adults INTEGER NOT NULL DEFAULT 1,
        children INTEGER DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
        special_requests TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id),
        CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
      )
    `);

    // Create billing table
    await client.query(`
      CREATE TABLE IF NOT EXISTS billing (
        id SERIAL PRIMARY KEY,
        reservation_id INTEGER NOT NULL REFERENCES reservations(id),
        guest_id INTEGER NOT NULL REFERENCES guests(id),
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        base_amount DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        service_charges DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
        payment_method VARCHAR(50),
        payment_date TIMESTAMP,
        invoice_number VARCHAR(50) UNIQUE,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id)
      )
    `);

    // Create housekeeping table
    await client.query(`
      CREATE TABLE IF NOT EXISTS housekeeping (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('daily_cleaning', 'deep_cleaning', 'maintenance', 'inspection')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
        assigned_to INTEGER REFERENCES users(id),
        scheduled_date DATE NOT NULL,
        completed_date TIMESTAMP,
        notes TEXT,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(room_number) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(first_name, last_name) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations(guest_id) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_billing_reservation ON billing(reservation_id) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_billing_guest ON billing(guest_id) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(payment_status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_housekeeping_room ON housekeeping(room_id) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping(status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_housekeeping_date ON housekeeping(scheduled_date) WHERE deleted_at IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const createDefaultAdmin = async () => {
  const client = await pool.connect();
  
  try {
    // Check if admin user already exists
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      ['admin@hotel.com']
    );

    if (existingAdmin.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, ['admin@hotel.com', hashedPassword, 'Admin', 'User', 'admin']);
      
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@hotel.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  } finally {
    client.release();
  }
};

const createSampleData = async () => {
  const client = await pool.connect();
  
  try {
    // Create sample rooms
    const sampleRooms = [
      { roomNumber: '101', type: 'single', capacity: 1, price: 80.00, floor: 1, description: 'Comfortable single room' },
      { roomNumber: '102', type: 'double', capacity: 2, price: 120.00, floor: 1, description: 'Spacious double room' },
      { roomNumber: '201', type: 'suite', capacity: 4, price: 200.00, floor: 2, description: 'Luxury suite with view' },
      { roomNumber: '202', type: 'deluxe', capacity: 3, price: 150.00, floor: 2, description: 'Deluxe room with amenities' },
      { roomNumber: '301', type: 'presidential', capacity: 6, price: 500.00, floor: 3, description: 'Presidential suite' }
    ];

    for (const room of sampleRooms) {
      await client.query(`
        INSERT INTO rooms (room_number, type, capacity, price, floor, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (room_number) DO NOTHING
      `, [room.roomNumber, room.type, room.capacity, room.price, room.floor, room.description]);
    }

    console.log('✅ Sample rooms created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    await createTables();
    await createDefaultAdmin();
    await createSampleData();
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Database is ready for use');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { createTables, createDefaultAdmin, createSampleData }; 