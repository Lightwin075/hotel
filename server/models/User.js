const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, role = 'staff', phone } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, phone, created_at, updated_at
    `;
    
    const values = [email, hashedPassword, firstName, lastName, role, phone];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password, first_name, last_name, role, phone, 
             created_at, updated_at, deleted_at, deleted_by
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, role, phone, 
             created_at, updated_at, deleted_at, deleted_by
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, email, first_name, last_name, role, phone, 
             created_at, updated_at, deleted_at, deleted_by
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const { firstName, lastName, role, phone } = updateData;
    
    const query = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          role = COALESCE($3, role),
          phone = COALESCE($4, phone),
          updated_at = NOW()
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING id, email, first_name, last_name, role, phone, created_at, updated_at
    `;
    
    const values = [firstName, lastName, role, phone, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async softDelete(id, deletedBy) {
    const query = `
      UPDATE users 
      SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [deletedBy, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error soft deleting user: ${error.message}`);
    }
  }

  static async restore(id) {
    const query = `
      UPDATE users 
      SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING id, email, first_name, last_name, role, phone, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error restoring user: ${error.message}`);
    }
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async changePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [hashedPassword, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  static async count() {
    const query = `
      SELECT COUNT(*) as total
      FROM users 
      WHERE deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
  }
}

module.exports = User; 