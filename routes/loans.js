// Part 3: REST endpoints (Loans + Join endpoint) -> Save as routes/loans.js
const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { validateLoan } = require('../middleware/validate');

const LOAN_JOIN = `
  SELECT
    l.id,
    l.loan_date,
    l.return_date,
    m.id AS musician_id,
    m.name AS musician_name,
    i.id AS instrument_id,
    i.name AS instrument_name,
    i.family
  FROM loans l
  INNER JOIN musicians m ON l.musician_id = m.id
  INNER JOIN instruments i ON l.instrument_id = i.id
`;

// JOIN ENDPOINT: GET /loans - Loans with musician name and instrument name
router.get('/', async (req, res, next) => {
  try {
    const rows = await all(`${LOAN_JOIN} ORDER BY l.loan_date, l.id`);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /loans - Lend an instrument to a musician
router.post('/', validateLoan, async (req, res, next) => {
  try {
    const { musician_id, instrument_id, loan_date } = req.body;

    const musician = await get('SELECT id FROM musicians WHERE id = ?', [musician_id]);
    if (!musician) {
      return res.status(404).json({ error: 'Musician not found' });
    }
    const instrument = await get('SELECT id FROM instruments WHERE id = ?', [instrument_id]);
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    const date = loan_date ? String(loan_date) : new Date().toISOString().slice(0, 10);
    const result = await run(
      'INSERT INTO loans (musician_id, instrument_id, loan_date) VALUES (?, ?, ?)',
      [musician_id, instrument_id, date]
    );
    const created = await get(`${LOAN_JOIN} WHERE l.id = ?`, [result.id]);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /loans/:id/return - Mark an instrument as returned (fixes "do not come back")
router.put('/:id/return', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await run(
      'UPDATE loans SET return_date = ? WHERE id = ? AND return_date IS NULL',
      [today, req.params.id]
    );
    if (result.changes === 0) {
      const exists = await get('SELECT id FROM loans WHERE id = ?', [req.params.id]);
      if (!exists) {
        return res.status(404).json({ error: 'Loan not found' });
      }
      return res.status(400).json({ error: 'This instrument has already been returned' });
    }
    const updated = await get(`${LOAN_JOIN} WHERE l.id = ?`, [req.params.id]);
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /loans/:id - Remove a loan record
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM loans WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    return res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
