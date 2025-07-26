const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'hotel.db');
const db = new sqlite3(dbPath);

class User {
  static async create(userData) {
    const { email, password, first_name, last_name, role = 'user' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, hashedPassword, first_name, last_name, role);
    
    return {
      id: result.lastInsertRowid,
      email,
      first_name,
      last_name,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
    return stmt.get(email);
  }

  static async findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1');
    return stmt.get(id);
  }

  static async findAll(limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
      FROM users 
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  static async update(id, updateData) {
    const { first_name, last_name, role, is_active } = updateData;
    
    const stmt = db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(first_name, last_name, role, is_active, id);
    return result.changes > 0;
  }

  static async softDelete(id) {
    const stmt = db.prepare(`
      UPDATE users 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static async restore(id) {
    const stmt = db.prepare(`
      UPDATE users 
      SET is_active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(hashedPassword, id);
    return result.changes > 0;
  }

  static async count() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const result = stmt.get();
    return result.count;
  }
}

module.exports = User; 