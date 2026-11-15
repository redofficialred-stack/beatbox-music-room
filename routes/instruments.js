// Part 3: REST endpoints (Instruments CRUD + Search + Twist) -> Save as routes/instruments.js
const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { validateInstrument } = require('../middleware/validate');
const { topThreeInstruments } = require('../utils/topThree');

// GET /instruments/top - Twist: top 3 most loaned instruments.
// IMPORTANT: this route must be declared BEFORE '/:id', otherwise Express
// would treat the word "top" as an id.
router.get('/top', async (req, res, next) => {
  try {
    const rows = await topThreeInstruments();
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /instruments (supports ?family=Strings search)
router.get('/', async (req, res, next) => {
  try {
    const { family } = req.query;
    if (family !== undefined) {
      const rows = await all(
        'SELECT * FROM instruments WHERE LOWER(family) = LOWER(?)',
        [String(family).trim()]
      );
      return res.status(200).json(rows);
    }
    const instruments = await all('SELECT * FROM instruments');
    return res.status(200).json(instruments);
  } catch (err) {
    next(err);
  }
});

// GET /instruments/:id - Get one instrument
router.get('/:id', async (req, res, next) => {
  try {
    const instrument = await get('SELECT * FROM instruments WHERE id = ?', [req.params.id]);
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    return res.status(200).json(instrument);
  } catch (err) {
    next(err);
  }
});

// POST /instruments - Add an instrument
router.post('/', validateInstrument, async (req, res, next) => {
  try {
    const { name, family } = req.body;
    const result = await run(
      'INSERT INTO instruments (name, family) VALUES (?, ?)',
      [name.trim(), family.trim()]
    );
    const created = await get('SELECT * FROM instruments WHERE id = ?', [result.id]);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /instruments/:id - Update an instrument
router.put('/:id', validateInstrument, async (req, res, next) => {
  try {
    const { name, family } = req.body;
    const result = await run(
      'UPDATE instruments SET name = ?, family = ? WHERE id = ?',
      [name.trim(), family.trim(), req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    const updated = await get('SELECT * FROM instruments WHERE id = ?', [req.params.id]);
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /instruments/:id - Delete an instrument
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM instruments WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    return res.status(200).json({ message: 'Instrument deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
