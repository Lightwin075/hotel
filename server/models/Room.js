const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class Room {
  static async create(roomData) {
    const { 
      roomNumber, 
      type, 
      capacity, 
      price, 
      description, 
      amenities, 
      floor, 
      status = 'available' 
    } = roomData;
    
    const query = `
      INSERT INTO rooms (room_number, type, capacity, price, description, amenities, floor, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, room_number, type, capacity, price, description, amenities, floor, status, created_at, updated_at
    `;
    
    const values = [roomNumber, type, capacity, price, description, amenities, floor, status];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating room: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, room_number, type, capacity, price, description, amenities, floor, status, 
             created_at, updated_at, deleted_at, deleted_by
      FROM rooms 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding room by ID: ${error.message}`);
    }
  }

  static async findByRoomNumber(roomNumber) {
    const query = `
      SELECT id, room_number, type, capacity, price, description, amenities, floor, status, 
             created_at, updated_at, deleted_at, deleted_by
      FROM rooms 
      WHERE room_number = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [roomNumber]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding room by number: ${error.message}`);
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT id, room_number, type, capacity, price, description, amenities, floor, status, 
             created_at, updated_at, deleted_at, deleted_by
      FROM rooms 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.type) {
      query += ` AND type = $${valueIndex}`;
      values.push(filters.type);
      valueIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.floor) {
      query += ` AND floor = $${valueIndex}`;
      values.push(filters.floor);
      valueIndex++;
    }
    
    if (filters.minPrice !== undefined) {
      query += ` AND price >= $${valueIndex}`;
      values.push(filters.minPrice);
      valueIndex++;
    }
    
    if (filters.maxPrice !== undefined) {
      query += ` AND price <= $${valueIndex}`;
      values.push(filters.maxPrice);
      valueIndex++;
    }
    
    query += ` ORDER BY room_number ASC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all rooms: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const { 
      roomNumber, 
      type, 
      capacity, 
      price, 
      description, 
      amenities, 
      floor, 
      status 
    } = updateData;
    
    const query = `
      UPDATE rooms 
      SET room_number = COALESCE($1, room_number),
          type = COALESCE($2, type),
          capacity = COALESCE($3, capacity),
          price = COALESCE($4, price),
          description = COALESCE($5, description),
          amenities = COALESCE($6, amenities),
          floor = COALESCE($7, floor),
          status = COALESCE($8, status),
          updated_at = NOW()
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING id, room_number, type, capacity, price, description, amenities, floor, status, created_at, updated_at
    `;
    
    const values = [roomNumber, type, capacity, price, description, amenities, floor, status, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating room: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE rooms 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, room_number, status, updated_at
    `;
    
    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating room status: ${error.message}`);
    }
  }

  static async softDelete(id, deletedBy) {
    const query = `
      UPDATE rooms 
      SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [deletedBy, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error soft deleting room: ${error.message}`);
    }
  }

  static async restore(id) {
    const query = `
      UPDATE rooms 
      SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id, room_number, type, capacity, price, description, amenities, floor, status, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error restoring room: ${error.message}`);
    }
  }

  static async getAvailable(checkIn, checkOut, roomType = null) {
    let query = `
      SELECT r.id, r.room_number, r.type, r.capacity, r.price, r.description, r.amenities, r.floor, r.status
      FROM rooms r
      WHERE r.deleted_at IS NULL 
        AND r.status = 'available'
        AND r.id NOT IN (
          SELECT DISTINCT res.room_id
          FROM reservations res
          WHERE res.deleted_at IS NULL
            AND res.status != 'cancelled'
            AND (
              (res.check_in_date <= $1 AND res.check_out_date > $1)
              OR (res.check_in_date < $2 AND res.check_out_date >= $2)
              OR (res.check_in_date >= $1 AND res.check_out_date <= $2)
            )
        )
    `;
    
    const values = [checkIn, checkOut];
    
    if (roomType) {
      query += ` AND r.type = $3`;
      values.push(roomType);
    }
    
    query += ` ORDER BY r.room_number ASC`;
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding available rooms: ${error.message}`);
    }
  }

  static async getRoomTypes() {
    const query = `
      SELECT DISTINCT type, COUNT(*) as count
      FROM rooms 
      WHERE deleted_at IS NULL
      GROUP BY type
      ORDER BY type
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting room types: ${error.message}`);
    }
  }

  static async getStatusCounts() {
    const query = `
      SELECT status, COUNT(*) as count
      FROM rooms 
      WHERE deleted_at IS NULL
      GROUP BY status
      ORDER BY status
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting status counts: ${error.message}`);
    }
  }

  static async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM rooms 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.type) {
      query += ` AND type = $${valueIndex}`;
      values.push(filters.type);
      valueIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Error counting rooms: ${error.message}`);
    }
  }
}

module.exports = Room; 