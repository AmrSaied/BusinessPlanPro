import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { 
  users, 
  flights, 
  passengers, 
  bookings, 
  airports, 
  bookingPassengers, 
  systemLogs,
  additionalServices,
  flightPricing
} from '@shared/schema';

// Create a PostgreSQL connection pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { 
  schema: { 
    users, 
    flights, 
    passengers, 
    bookings, 
    airports, 
    bookingPassengers, 
    systemLogs, 
    additionalServices,
    flightPricing 
  } 
});

// Initialize database (create tables if they don't exist)
// Helper function to create missing tables for prices and services
async function createMissingTables() {
  try {
    // Check if additional_services table exists
    const checkAdditionalServices = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'additional_services'
      );
    `);
    
    // Check if flight_pricing table exists
    const checkFlightPricing = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'flight_pricing'
      );
    `);
    
    if (!checkAdditionalServices.rows[0].exists) {
      console.log('Creating additional_services table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS additional_services (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          type TEXT NOT NULL,
          currency TEXT DEFAULT 'USD',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Insert default services
      await pool.query(`
        INSERT INTO additional_services (name, description, price, type, is_active)
        VALUES 
          ('Hotel Reservation', 'Includes a hotel reservation document for your trip', 2, 'hotel', true),
          ('Insurance Letter', 'Includes an insurance coverage letter', 2, 'insurance', true);
      `);
      console.log('Additional services table created and seeded');
    }
    
    if (!checkFlightPricing.rows[0].exists) {
      console.log('Creating flight_pricing table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS flight_pricing (
          id SERIAL PRIMARY KEY,
          origin_airport TEXT NOT NULL,
          destination_airport TEXT NOT NULL,
          base_price DOUBLE PRECISION NOT NULL,
          currency TEXT DEFAULT 'USD',
          travel_class TEXT DEFAULT 'economy',
          trip_type TEXT DEFAULT 'one-way',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Insert default pricing
      await pool.query(`
        INSERT INTO flight_pricing (origin_airport, destination_airport, base_price, travel_class, trip_type)
        VALUES 
          ('ANY', 'ANY', 100, 'economy', 'one-way'),
          ('ANY', 'ANY', 180, 'economy', 'round-trip'),
          ('ANY', 'ANY', 300, 'business', 'one-way'),
          ('ANY', 'ANY', 550, 'business', 'round-trip'),
          ('ANY', 'ANY', 850, 'first', 'one-way'),
          ('ANY', 'ANY', 1500, 'first', 'round-trip');
      `);
      console.log('Flight pricing table created and seeded');
    }
  } catch (error) {
    console.error('Error creating missing tables:', error);
  }
}

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
    
    // Check if new tables exist, create them if they don't
    await createMissingTables();

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
        
        CREATE TABLE IF NOT EXISTS additional_services (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          type TEXT NOT NULL,
          currency TEXT DEFAULT 'USD',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS flight_pricing (
          id SERIAL PRIMARY KEY,
          origin_airport TEXT NOT NULL,
          destination_airport TEXT NOT NULL,
          base_price DOUBLE PRECISION NOT NULL,
          currency TEXT DEFAULT 'USD',
          travel_class TEXT DEFAULT 'economy',
          trip_type TEXT DEFAULT 'one-way',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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