const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class Reservation {
  static async create(reservationData) {
    const { 
      guestId, 
      roomId, 
      checkInDate, 
      checkOutDate, 
      adults, 
      children, 
      totalAmount, 
      status = 'confirmed',
      specialRequests,
      createdBy
    } = reservationData;
    
    const query = `
      INSERT INTO reservations (guest_id, room_id, check_in_date, check_out_date, adults, children, 
                               total_amount, status, special_requests, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, guest_id, room_id, check_in_date, check_out_date, adults, children, 
                total_amount, status, special_requests, created_by, created_at, updated_at
    `;
    
    const values = [guestId, roomId, checkInDate, checkOutDate, adults, children, totalAmount, status, specialRequests, createdBy];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating reservation: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT r.id, r.guest_id, r.room_id, r.check_in_date, r.check_out_date, r.adults, r.children,
             r.total_amount, r.status, r.special_requests, r.created_by, r.created_at, r.updated_at,
             r.deleted_at, r.deleted_by,
             g.first_name as guest_first_name, g.last_name as guest_last_name, g.email as guest_email,
             rm.room_number, rm.type as room_type, rm.price as room_price
      FROM reservations r
      LEFT JOIN guests g ON r.guest_id = g.id
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding reservation by ID: ${error.message}`);
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT r.id, r.guest_id, r.room_id, r.check_in_date, r.check_out_date, r.adults, r.children,
             r.total_amount, r.status, r.special_requests, r.created_by, r.created_at, r.updated_at,
             g.first_name as guest_first_name, g.last_name as guest_last_name, g.email as guest_email,
             rm.room_number, rm.type as room_type
      FROM reservations r
      LEFT JOIN guests g ON r.guest_id = g.id
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE r.deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.status) {
      query += ` AND r.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.guestId) {
      query += ` AND r.guest_id = $${valueIndex}`;
      values.push(filters.guestId);
      valueIndex++;
    }
    
    if (filters.roomId) {
      query += ` AND r.room_id = $${valueIndex}`;
      values.push(filters.roomId);
      valueIndex++;
    }
    
    if (filters.checkInDate) {
      query += ` AND r.check_in_date >= $${valueIndex}`;
      values.push(filters.checkInDate);
      valueIndex++;
    }
    
    if (filters.checkOutDate) {
      query += ` AND r.check_out_date <= $${valueIndex}`;
      values.push(filters.checkOutDate);
      valueIndex++;
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all reservations: ${error.message}`);
    }
  }

  static async findByGuest(guestId, limit = 10, offset = 0) {
    const query = `
      SELECT r.id, r.guest_id, r.room_id, r.check_in_date, r.check_out_date, r.adults, r.children,
             r.total_amount, r.status, r.special_requests, r.created_at, r.updated_at,
             rm.room_number, rm.type as room_type
      FROM reservations r
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE r.guest_id = $1 AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [guestId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding reservations by guest: ${error.message}`);
    }
  }

  static async findByRoom(roomId, limit = 10, offset = 0) {
    const query = `
      SELECT r.id, r.guest_id, r.room_id, r.check_in_date, r.check_out_date, r.adults, r.children,
             r.total_amount, r.status, r.special_requests, r.created_at, r.updated_at,
             g.first_name as guest_first_name, g.last_name as guest_last_name, g.email as guest_email
      FROM reservations r
      LEFT JOIN guests g ON r.guest_id = g.id
      WHERE r.room_id = $1 AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [roomId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding reservations by room: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const { 
      checkInDate, 
      checkOutDate, 
      adults, 
      children, 
      totalAmount, 
      status, 
      specialRequests 
    } = updateData;
    
    const query = `
      UPDATE reservations 
      SET check_in_date = COALESCE($1, check_in_date),
          check_out_date = COALESCE($2, check_out_date),
          adults = COALESCE($3, adults),
          children = COALESCE($4, children),
          total_amount = COALESCE($5, total_amount),
          status = COALESCE($6, status),
          special_requests = COALESCE($7, special_requests),
          updated_at = NOW()
      WHERE id = $8 AND deleted_at IS NULL
      RETURNING id, guest_id, room_id, check_in_date, check_out_date, adults, children, 
                total_amount, status, special_requests, created_at, updated_at
    `;
    
    const values = [checkInDate, checkOutDate, adults, children, totalAmount, status, specialRequests, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE reservations 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, status, updated_at
    `;
    
    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating reservation status: ${error.message}`);
    }
  }

  static async cancel(id) {
    const query = `
      UPDATE reservations 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, status, updated_at
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error cancelling reservation: ${error.message}`);
    }
  }

  static async softDelete(id, deletedBy) {
    const query = `
      UPDATE reservations 
      SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [deletedBy, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error soft deleting reservation: ${error.message}`);
    }
  }

  static async restore(id) {
    const query = `
      UPDATE reservations 
      SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id, guest_id, room_id, check_in_date, check_out_date, adults, children, 
                total_amount, status, special_requests, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error restoring reservation: ${error.message}`);
    }
  }

  static async checkAvailability(roomId, checkIn, checkOut, excludeReservationId = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE room_id = $1 
        AND deleted_at IS NULL
        AND status != 'cancelled'
        AND (
          (check_in_date <= $2 AND check_out_date > $2)
          OR (check_in_date < $3 AND check_out_date >= $3)
          OR (check_in_date >= $2 AND check_out_date <= $3)
        )
    `;
    
    const values = [roomId, checkIn, checkOut];
    
    if (excludeReservationId) {
      query += ` AND id != $4`;
      values.push(excludeReservationId);
    }
    
    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count) === 0;
    } catch (error) {
      throw new Error(`Error checking availability: ${error.message}`);
    }
  }

  static async getUpcomingReservations(days = 7) {
    const query = `
      SELECT r.id, r.guest_id, r.room_id, r.check_in_date, r.check_out_date, r.adults, r.children,
             r.total_amount, r.status, r.created_at,
             g.first_name as guest_first_name, g.last_name as guest_last_name, g.email as guest_email,
             rm.room_number, rm.type as room_type
      FROM reservations r
      LEFT JOIN guests g ON r.guest_id = g.id
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE r.deleted_at IS NULL 
        AND r.status = 'confirmed'
        AND r.check_in_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
      ORDER BY r.check_in_date ASC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting upcoming reservations: ${error.message}`);
    }
  }

  static async getStatusCounts() {
    const query = `
      SELECT status, COUNT(*) as count
      FROM reservations 
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
      FROM reservations 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }
    
    if (filters.guestId) {
      query += ` AND guest_id = $${valueIndex}`;
      values.push(filters.guestId);
      valueIndex++;
    }
    
    if (filters.roomId) {
      query += ` AND room_id = $${valueIndex}`;
      values.push(filters.roomId);
      valueIndex++;
    }
    
    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Error counting reservations: ${error.message}`);
    }
  }
}

module.exports = Reservation; 