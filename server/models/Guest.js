const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class Guest {
  static async create(guestData) {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      postalCode,
      dateOfBirth,
      idType,
      idNumber,
      preferences,
      createdBy
    } = guestData;
    
    const query = `
      INSERT INTO guests (first_name, last_name, email, phone, address, city, state, country, 
                         postal_code, date_of_birth, id_type, id_number, preferences, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, first_name, last_name, email, phone, address, city, state, country, 
                postal_code, date_of_birth, id_type, id_number, preferences, created_at, updated_at
    `;
    
    const values = [firstName, lastName, email, phone, address, city, state, country, postalCode, 
                   dateOfBirth, idType, idNumber, preferences, createdBy];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating guest: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, first_name, last_name, email, phone, address, city, state, country, 
             postal_code, date_of_birth, id_type, id_number, preferences, 
             created_at, updated_at, deleted_at, deleted_by
      FROM guests 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding guest by ID: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, first_name, last_name, email, phone, address, city, state, country, 
             postal_code, date_of_birth, id_type, id_number, preferences, 
             created_at, updated_at, deleted_at, deleted_by
      FROM guests 
      WHERE email = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding guest by email: ${error.message}`);
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT id, first_name, last_name, email, phone, address, city, state, country, 
             postal_code, date_of_birth, id_type, id_number, preferences, 
             created_at, updated_at
      FROM guests 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.search) {
      query += ` AND (LOWER(first_name) LIKE LOWER($${valueIndex}) OR LOWER(last_name) LIKE LOWER($${valueIndex}) OR LOWER(email) LIKE LOWER($${valueIndex}))`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }
    
    if (filters.city) {
      query += ` AND LOWER(city) = LOWER($${valueIndex})`;
      values.push(filters.city);
      valueIndex++;
    }
    
    if (filters.country) {
      query += ` AND LOWER(country) = LOWER($${valueIndex})`;
      values.push(filters.country);
      valueIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all guests: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      postalCode,
      dateOfBirth,
      idType,
      idNumber,
      preferences
    } = updateData;
    
    const query = `
      UPDATE guests 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          city = COALESCE($6, city),
          state = COALESCE($7, state),
          country = COALESCE($8, country),
          postal_code = COALESCE($9, postal_code),
          date_of_birth = COALESCE($10, date_of_birth),
          id_type = COALESCE($11, id_type),
          id_number = COALESCE($12, id_number),
          preferences = COALESCE($13, preferences),
          updated_at = NOW()
      WHERE id = $14 AND deleted_at IS NULL
      RETURNING id, first_name, last_name, email, phone, address, city, state, country, 
                postal_code, date_of_birth, id_type, id_number, preferences, created_at, updated_at
    `;
    
    const values = [firstName, lastName, email, phone, address, city, state, country, postalCode, 
                   dateOfBirth, idType, idNumber, preferences, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating guest: ${error.message}`);
    }
  }

  static async softDelete(id, deletedBy) {
    const query = `
      UPDATE guests 
      SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [deletedBy, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error soft deleting guest: ${error.message}`);
    }
  }

  static async restore(id) {
    const query = `
      UPDATE guests 
      SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id, first_name, last_name, email, phone, address, city, state, country, 
                postal_code, date_of_birth, id_type, id_number, preferences, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error restoring guest: ${error.message}`);
    }
  }

  static async getHistory(guestId, limit = 10, offset = 0) {
    const query = `
      SELECT r.id, r.check_in_date, r.check_out_date, r.adults, r.children, r.total_amount, r.status,
             rm.room_number, rm.type as room_type, rm.price as room_price
      FROM reservations r
      LEFT JOIN rooms rm ON r.room_id = rm.id
      WHERE r.guest_id = $1 AND r.deleted_at IS NULL
      ORDER BY r.check_in_date DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await pool.query(query, [guestId, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting guest history: ${error.message}`);
    }
  }

  static async getStats(guestId) {
    const query = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_spent,
        AVG(CASE WHEN status = 'completed' THEN total_amount ELSE NULL END) as average_spent,
        MIN(check_in_date) as first_visit,
        MAX(check_in_date) as last_visit
      FROM reservations
      WHERE guest_id = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [guestId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting guest stats: ${error.message}`);
    }
  }

  static async getFrequentGuests(limit = 10) {
    const query = `
      SELECT g.id, g.first_name, g.last_name, g.email, g.phone,
             COUNT(r.id) as reservation_count,
             SUM(CASE WHEN r.status = 'completed' THEN r.total_amount ELSE 0 END) as total_spent
      FROM guests g
      LEFT JOIN reservations r ON g.id = r.guest_id AND r.deleted_at IS NULL
      WHERE g.deleted_at IS NULL
      GROUP BY g.id, g.first_name, g.last_name, g.email, g.phone
      HAVING COUNT(r.id) > 0
      ORDER BY reservation_count DESC, total_spent DESC
      LIMIT $1
    `;
    
    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting frequent guests: ${error.message}`);
    }
  }

  static async getGuestsByCountry() {
    const query = `
      SELECT country, COUNT(*) as guest_count
      FROM guests 
      WHERE deleted_at IS NULL
      GROUP BY country
      ORDER BY guest_count DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting guests by country: ${error.message}`);
    }
  }

  static async searchGuests(searchTerm, limit = 10) {
    const query = `
      SELECT id, first_name, last_name, email, phone, city, country, created_at
      FROM guests 
      WHERE deleted_at IS NULL
        AND (LOWER(first_name) LIKE LOWER($1) 
             OR LOWER(last_name) LIKE LOWER($1) 
             OR LOWER(email) LIKE LOWER($1)
             OR LOWER(phone) LIKE LOWER($1))
      ORDER BY 
        CASE 
          WHEN LOWER(first_name) = LOWER($1) OR LOWER(last_name) = LOWER($1) THEN 1
          WHEN LOWER(first_name) LIKE LOWER($1) || '%' OR LOWER(last_name) LIKE LOWER($1) || '%' THEN 2
          ELSE 3
        END,
        created_at DESC
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching guests: ${error.message}`);
    }
  }

  static async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM guests 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let valueIndex = 1;
    
    // Add filters
    if (filters.search) {
      query += ` AND (LOWER(first_name) LIKE LOWER($${valueIndex}) OR LOWER(last_name) LIKE LOWER($${valueIndex}) OR LOWER(email) LIKE LOWER($${valueIndex}))`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }
    
    if (filters.city) {
      query += ` AND LOWER(city) = LOWER($${valueIndex})`;
      values.push(filters.city);
      valueIndex++;
    }
    
    if (filters.country) {
      query += ` AND LOWER(country) = LOWER($${valueIndex})`;
      values.push(filters.country);
      valueIndex++;
    }
    
    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Error counting guests: ${error.message}`);
    }
  }
}

module.exports = Guest; 