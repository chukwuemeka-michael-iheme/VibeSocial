const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all posts for feed
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name, u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { clerkId, content, image } = req.body;
    // Get user id from clerk_id
    const userResult = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      'INSERT INTO posts (user_id, content, image) VALUES ($1, $2, $3) RETURNING *',
      [userId, content, image]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by user
router.get('/user/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const userResult = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;