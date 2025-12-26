const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get user by clerk_id
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { clerkId, name, email, avatar, bio } = req.body;
    const result = await pool.query(
      'INSERT INTO users (clerk_id, name, email, avatar, bio) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (clerk_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar, bio = EXCLUDED.bio RETURNING *',
      [clerkId, name, email, avatar, bio]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;