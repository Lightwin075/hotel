const { postgresPool } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const client = await postgresPool.connect();
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, language_preference, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@hotel.com', adminPassword, 'Admin', 'User', 'admin', 'en', 1]
    );

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 12);
    const staffUser = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, language_preference, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['staff@hotel.com', staffPassword, 'Staff', 'Member', 'staff', 'en', 1]
    );

    // Create sample guest user
    const guestPassword = await bcrypt.hash('guest123', 12);
    const guestUser = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, language_preference, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['guest@example.com', guestPassword, 'John', 'Doe', 'guest', 'en', 1]
    );

    // Create sample rooms
    const rooms = [
      {
        room_number: '101',
        room_type: 'Standard',
        capacity: 2,
        price_per_night: 100.00,
        description: 'Comfortable standard room with basic amenities',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'])
      },
      {
        room_number: '102',
        room_type: 'Standard',
        capacity: 2,
        price_per_night: 100.00,
        description: 'Comfortable standard room with basic amenities',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'])
      },
      {
        room_number: '201',
        room_type: 'Deluxe',
        capacity: 3,
        price_per_night: 150.00,
        description: 'Spacious deluxe room with premium amenities',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony'])
      },
      {
        room_number: '202',
        room_type: 'Deluxe',
        capacity: 3,
        price_per_night: 150.00,
        description: 'Spacious deluxe room with premium amenities',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony'])
      },
      {
        room_number: '301',
        room_type: 'Suite',
        capacity: 4,
        price_per_night: 250.00,
        description: 'Luxury suite with separate living area',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Living Room', 'Kitchen'])
      }
    ];

    for (const room of rooms) {
      await client.query(
        `INSERT INTO rooms (room_number, room_type, capacity, price_per_night, status, description, amenities, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (room_number) DO NOTHING`,
        [room.room_number, room.room_type, room.capacity, room.price_per_night, 'available', room.description, room.amenities, 1]
      );
    }

    // Create guest profile for sample guest
    if (guestUser.rows.length > 0) {
      await client.query(
        `INSERT INTO guests (user_id, phone, address, preferences, created_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO NOTHING`,
        [guestUser.rows[0].id, '+1234567890', '123 Main St, City, Country', JSON.stringify({ 'preferred_room_type': 'Standard', 'special_requests': 'High floor preferred' }), 1]
      );
    }

    // Create sample housekeeping tasks
    const housekeepingTasks = [
      {
        room_id: 1,
        task_type: 'Daily Cleaning',
        status: 'pending',
        scheduled_date: new Date().toISOString().split('T')[0]
      },
      {
        room_id: 2,
        task_type: 'Deep Cleaning',
        status: 'in_progress',
        scheduled_date: new Date().toISOString().split('T')[0]
      }
    ];

    for (const task of housekeepingTasks) {
      await client.query(
        `INSERT INTO housekeeping (room_id, assigned_to, task_type, status, scheduled_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [task.room_id, staffUser.rows.length > 0 ? staffUser.rows[0].id : null, task.task_type, task.status, task.scheduled_date, 1]
      );
    }

    // Create sample export configurations
    const exportConfigs = [
      {
        name: 'Daily Reservations Export',
        table_name: 'reservations',
        schedule: '0 6 * * *' // Daily at 6 AM
      },
      {
        name: 'Weekly Billing Export',
        table_name: 'billing',
        schedule: '0 8 * * 1' // Weekly on Monday at 8 AM
      }
    ];

    for (const config of exportConfigs) {
      await client.query(
        `INSERT INTO export_configs (name, table_name, schedule)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [config.name, config.table_name, config.schedule]
      );
    }

    client.release();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('👥 Sample users created:');
    console.log('   - Admin: admin@hotel.com / admin123');
    console.log('   - Staff: staff@hotel.com / staff123');
    console.log('   - Guest: guest@example.com / guest123');
    console.log('🏨 Sample rooms created: 5 rooms (Standard, Deluxe, Suite)');
    console.log('🧹 Sample housekeeping tasks created');
    console.log('📊 Sample export configurations created');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 