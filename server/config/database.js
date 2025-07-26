const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Configuration
const postgresConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hotel_management',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// SQL Server Configuration (for exports)
const sqlServerConfig = {
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || 'password',
  server: process.env.SQLSERVER_HOST || 'localhost',
  database: process.env.SQLSERVER_DB || 'hotel_export',
  port: process.env.SQLSERVER_PORT || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Create PostgreSQL pool
const postgresPool = new Pool(postgresConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await postgresPool.connect();
    console.log('✅ PostgreSQL database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await postgresPool.connect();
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'guest',
        language_preference VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(20) UNIQUE NOT NULL,
        room_type VARCHAR(100) NOT NULL,
        capacity INTEGER NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        description TEXT,
        amenities JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        phone VARCHAR(20),
        address TEXT,
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        guest_id INTEGER REFERENCES guests(id),
        room_id INTEGER REFERENCES rooms(id),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS billing (
        id SERIAL PRIMARY KEY,
        reservation_id INTEGER REFERENCES reservations(id),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS housekeeping (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id),
        assigned_to INTEGER REFERENCES users(id),
        task_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        scheduled_date DATE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        deleted_at TIMESTAMP,
        deleted_by INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        record_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS export_configs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        schedule VARCHAR(100),
        last_export TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  postgresPool,
  sqlServerConfig,
  testConnection,
  initializeDatabase
}; 