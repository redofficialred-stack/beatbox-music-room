// Part 3: REST endpoints (Musicians) -> Save as routes/musicians.js
const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { validateMusician } = require('../middleware/validate');

// GET /musicians - Get all musicians
router.get('/', async (req, res, next) => {
  try {
    const musicians = await all('SELECT * FROM musicians');
    return res.status(200).json(musicians);
  } catch (err) {
    next(err);
  }
});

// GET /musicians/:id - Get one musician
router.get('/:id', async (req, res, next) => {
  try {
    const musician = await get('SELECT * FROM musicians WHERE id = ?', [req.params.id]);
    if (!musician) {
      return res.status(404).json({ error: 'Musician not found' });
    }
    return res.status(200).json(musician);
  } catch (err) {
    next(err);
  }
});

// POST /musicians - Add a musician
router.post('/', validateMusician, async (req, res, next) => {
  try {
    const { name, email = null, phone = null } = req.body;
    const result = await run(
      'INSERT INTO musicians (name, email, phone) VALUES (?, ?, ?)',
      [name.trim(), email, phone]
    );
    const created = await get('SELECT * FROM musicians WHERE id = ?', [result.id]);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
