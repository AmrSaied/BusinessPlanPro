import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const { Pool } = pg;

const scryptAsync = promisify(scrypt);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Password hashing function
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Admin user credentials
const adminUser = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@example.com',
  firstName: 'System',
  lastName: 'Administrator',
  preferredLanguage: 'en',
  role: 'admin'
};

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    // Check if admin user already exists
    const checkResult = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [adminUser.username, adminUser.email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(adminUser.password);
    
    // Insert admin user
    await client.query(`
      INSERT INTO users (
        username, password, email, first_name, last_name, 
        preferred_language, role, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      adminUser.username,
      hashedPassword,
      adminUser.email,
      adminUser.firstName,
      adminUser.lastName,
      adminUser.preferredLanguage,
      adminUser.role,
      true
    ]);
    
    console.log('Admin user created successfully');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: ${adminUser.password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    client.release();
  }
}

createAdminUser()
  .then(() => {
    pool.end();
  })
  .catch(err => {
    console.error('Script error:', err);
    pool.end();
  });