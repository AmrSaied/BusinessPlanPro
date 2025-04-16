import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { users, flights, passengers, bookings, airports, bookingPassengers, systemLogs } from '@shared/schema';

// Create a PostgreSQL connection pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema: { users, flights, passengers, bookings, airports, bookingPassengers, systemLogs } });

// Initialize database (create tables if they don't exist)
export async function initDb() {
  try {
    console.log('Initializing database...');

    // Check if users table exists, if not create all tables
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('Tables do not exist, creating them...');
      
      // Create tables based on schema
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          preferred_language TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS airports (
          id SERIAL PRIMARY KEY,
          iata_code TEXT NOT NULL UNIQUE,
          icao_code TEXT,
          name TEXT NOT NULL,
          city TEXT NOT NULL,
          country TEXT NOT NULL,
          country_code TEXT NOT NULL,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          timezone TEXT,
          local_name JSONB
        );

        CREATE TABLE IF NOT EXISTS flights (
          id SERIAL PRIMARY KEY,
          airline_code TEXT NOT NULL,
          airline_name TEXT NOT NULL,
          flight_number TEXT NOT NULL,
          departure_airport TEXT NOT NULL,
          departure_city TEXT NOT NULL,
          departure_country TEXT NOT NULL,
          arrival_airport TEXT NOT NULL,
          arrival_city TEXT NOT NULL,
          arrival_country TEXT NOT NULL,
          departure_time TEXT NOT NULL,
          arrival_time TEXT NOT NULL,
          duration TEXT NOT NULL,
          base_price INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS passengers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          date_of_birth TEXT NOT NULL,
          passport_number TEXT NOT NULL,
          passport_expiry TEXT NOT NULL,
          nationality TEXT NOT NULL,
          is_saved BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER REFERENCES users(id),
          flight_id INTEGER REFERENCES flights(id),
          booking_reference TEXT NOT NULL UNIQUE,
          total_price INTEGER NOT NULL,
          currency TEXT,
          status TEXT NOT NULL,
          express_processing BOOLEAN,
          editable_ticket BOOLEAN,
          hotel_reservation BOOLEAN,
          insurance_letter BOOLEAN,
          special_requests TEXT,
          contact_email TEXT NOT NULL,
          contact_phone TEXT,
          travel_purpose TEXT NOT NULL,
          payment_id TEXT
        );

        CREATE TABLE IF NOT EXISTS booking_passengers (
          id SERIAL PRIMARY KEY,
          booking_id INTEGER NOT NULL REFERENCES bookings(id),
          passenger_id INTEGER NOT NULL REFERENCES passengers(id),
          UNIQUE(booking_id, passenger_id)
        );

        CREATE TABLE IF NOT EXISTS system_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          level TEXT NOT NULL,
          service TEXT NOT NULL,
          message TEXT NOT NULL
        );
      `);
      
      console.log('Database tables created successfully');
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}