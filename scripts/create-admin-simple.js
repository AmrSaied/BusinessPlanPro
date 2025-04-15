// Simple admin user creation script
import pg from 'pg';
import { createHash } from 'crypto';

// Create a simple hash for the password
function simpleHash(password) {
  return createHash('sha256').update(password).digest('hex');
}

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    // Admin credentials
    const admin = {
      username: 'admin',
      password: simpleHash('admin123'),
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };
    
    // Insert into database
    await client.query(`
      INSERT INTO users (
        username, password, email, first_name, last_name,
        role, is_active, preferred_language
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      admin.username,
      admin.password,
      admin.email,
      admin.firstName,
      admin.lastName,
      admin.role,
      true,
      'en'
    ]);
    
    console.log('Admin user created successfully with SHA-256 hashed password');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    client.release();
  }
}

createAdminUser()
  .then(() => pool.end())
  .catch((error) => {
    console.error('Script error:', error);
    pool.end();
  });