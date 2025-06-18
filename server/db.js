/**
 * Database connection and configuration
 * PostgreSQL database setup for Interactive Astronomy Pictionary
 */

const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Database initialization
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) NOT NULL,
        score INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        current_team_index INTEGER DEFAULT 0,
        current_card JSONB,
        timer_seconds INTEGER DEFAULT 60,
        game_state JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS card_history (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        card_category VARCHAR(100) NOT NULL,
        card_word VARCHAR(100) NOT NULL,
        result VARCHAR(20) NOT NULL, -- 'success', 'skip', 'timeout'
        time_taken INTEGER, -- seconds
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        total_cards_drawn INTEGER DEFAULT 0,
        successful_guesses INTEGER DEFAULT 0,
        skipped_cards INTEGER DEFAULT 0,
        average_time DECIMAL(5,2),
        category_stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_game_id ON teams(game_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
      CREATE INDEX IF NOT EXISTS idx_card_history_game_id ON card_history(game_id);
      CREATE INDEX IF NOT EXISTS idx_card_history_team_id ON card_history(team_id);
      CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON game_stats(game_id);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase
};