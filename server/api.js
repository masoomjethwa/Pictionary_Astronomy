/**
 * API endpoints for Interactive Astronomy Pictionary
 * RESTful API for game management with PostgreSQL backend
 */

const express = require('express');
const { pool } = require('./db');
const router = express.Router();

// Games endpoints
router.get('/games', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, 
             COUNT(t.id) as team_count,
             gs.current_team_index,
             gs.timer_seconds
      FROM games g
      LEFT JOIN teams t ON g.id = t.game_id
      LEFT JOIN game_sessions gs ON g.id = gs.game_id
      WHERE g.status = 'active'
      GROUP BY g.id, gs.current_team_index, gs.timer_seconds
      ORDER BY g.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

router.get('/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // Get game details with teams and session info
    const gameResult = await pool.query(`
      SELECT g.*, gs.current_team_index, gs.current_card, gs.timer_seconds, gs.game_state
      FROM games g
      LEFT JOIN game_sessions gs ON g.id = gs.game_id
      WHERE g.id = $1
    `, [gameId]);
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = gameResult.rows[0];
    
    // Get teams for this game
    const teamsResult = await pool.query(`
      SELECT * FROM teams WHERE game_id = $1 ORDER BY id
    `, [gameId]);
    
    game.teams = teamsResult.rows;
    
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

router.post('/games', async (req, res) => {
  try {
    const { name, settings = {} } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Game name is required' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create game
      const gameResult = await client.query(`
        INSERT INTO games (name, settings)
        VALUES ($1, $2)
        RETURNING *
      `, [name.trim(), JSON.stringify(settings)]);
      
      const game = gameResult.rows[0];
      
      // Create initial game session
      await client.query(`
        INSERT INTO game_sessions (game_id, current_team_index, timer_seconds)
        VALUES ($1, 0, 60)
      `, [game.id]);
      
      // Create initial game stats
      await client.query(`
        INSERT INTO game_stats (game_id)
        VALUES ($1)
      `, [game.id]);
      
      await client.query('COMMIT');
      
      res.status(201).json(game);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

router.put('/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const updates = req.body;
    
    const allowedFields = ['name', 'status', 'settings'];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(key === 'settings' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(gameId);
    
    const result = await pool.query(`
      UPDATE games 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Teams endpoints
router.get('/teams', async (req, res) => {
  try {
    const { game_id } = req.query;
    
    let query = 'SELECT * FROM teams';
    let values = [];
    
    if (game_id) {
      query += ' WHERE game_id = $1';
      values.push(game_id);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

router.post('/teams', async (req, res) => {
  try {
    const { game_id, name, color, stats = {} } = req.body;
    
    if (!game_id || !name || !color) {
      return res.status(400).json({ error: 'game_id, name, and color are required' });
    }
    
    // Check if team name already exists in this game
    const existingTeam = await pool.query(`
      SELECT id FROM teams WHERE game_id = $1 AND name = $2
    `, [game_id, name.trim()]);
    
    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: 'Team name already exists in this game' });
    }
    
    const result = await pool.query(`
      INSERT INTO teams (game_id, name, color, stats)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [game_id, name.trim(), color, JSON.stringify(stats)]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.put('/teams/:id', async (req, res) => {
  try {
    const teamId = req.params.id;
    const updates = req.body;
    
    const allowedFields = ['name', 'color', 'score', 'position', 'stats'];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(key === 'stats' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(teamId);
    
    const result = await pool.query(`
      UPDATE teams 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Game session endpoints
router.get('/sessions/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    const result = await pool.query(`
      SELECT * FROM game_sessions WHERE game_id = $1
    `, [gameId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({ error: 'Failed to fetch game session' });
  }
});

router.put('/sessions/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const { current_team_index, current_card, timer_seconds, game_state } = req.body;
    
    const result = await pool.query(`
      UPDATE game_sessions 
      SET current_team_index = COALESCE($1, current_team_index),
          current_card = COALESCE($2, current_card),
          timer_seconds = COALESCE($3, timer_seconds),
          game_state = COALESCE($4, game_state),
          updated_at = CURRENT_TIMESTAMP
      WHERE game_id = $5
      RETURNING *
    `, [
      current_team_index,
      current_card ? JSON.stringify(current_card) : null,
      timer_seconds,
      game_state ? JSON.stringify(game_state) : null,
      gameId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating game session:', error);
    res.status(500).json({ error: 'Failed to update game session' });
  }
});

// Card history endpoints
router.post('/card-history', async (req, res) => {
  try {
    const { game_id, team_id, card_category, card_word, result, time_taken } = req.body;
    
    if (!game_id || !team_id || !card_category || !card_word || !result) {
      return res.status(400).json({ 
        error: 'game_id, team_id, card_category, card_word, and result are required' 
      });
    }
    
    const historyResult = await pool.query(`
      INSERT INTO card_history (game_id, team_id, card_category, card_word, result, time_taken)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [game_id, team_id, card_category, card_word, result, time_taken]);
    
    // Update game stats
    await pool.query(`
      UPDATE game_stats 
      SET total_cards_drawn = total_cards_drawn + 1,
          successful_guesses = successful_guesses + CASE WHEN $1 = 'success' THEN 1 ELSE 0 END,
          skipped_cards = skipped_cards + CASE WHEN $1 = 'skip' THEN 1 ELSE 0 END,
          updated_at = CURRENT_TIMESTAMP
      WHERE game_id = $2
    `, [result, game_id]);
    
    res.status(201).json(historyResult.rows[0]);
  } catch (error) {
    console.error('Error recording card history:', error);
    res.status(500).json({ error: 'Failed to record card history' });
  }
});

router.get('/card-history/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    const result = await pool.query(`
      SELECT ch.*, t.name as team_name, t.color as team_color
      FROM card_history ch
      JOIN teams t ON ch.team_id = t.id
      WHERE ch.game_id = $1
      ORDER BY ch.created_at DESC
    `, [gameId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching card history:', error);
    res.status(500).json({ error: 'Failed to fetch card history' });
  }
});

// Game statistics endpoints
router.get('/stats/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    const result = await pool.query(`
      SELECT gs.*,
             (SELECT COUNT(*) FROM teams WHERE game_id = $1) as total_teams,
             (SELECT AVG(score) FROM teams WHERE game_id = $1) as average_score
      FROM game_stats gs
      WHERE gs.game_id = $1
    `, [gameId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game statistics not found' });
    }
    
    // Get category breakdown
    const categoryStats = await pool.query(`
      SELECT card_category, 
             COUNT(*) as total,
             COUNT(CASE WHEN result = 'success' THEN 1 END) as successful,
             COUNT(CASE WHEN result = 'skip' THEN 1 END) as skipped,
             AVG(time_taken) as avg_time
      FROM card_history
      WHERE game_id = $1
      GROUP BY card_category
    `, [gameId]);
    
    const stats = result.rows[0];
    stats.category_breakdown = categoryStats.rows;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching game statistics:', error);
    res.status(500).json({ error: 'Failed to fetch game statistics' });
  }
});

module.exports = router;