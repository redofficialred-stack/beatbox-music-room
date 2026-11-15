// Part 4: Validation and search -> Save as middleware/validate.js

const isBlank = (v) => !v || typeof v !== 'string' || v.trim() === '';
const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

function validateInstrument(req, res, next) {
  const { name, family } = req.body || {};
  if (isBlank(name)) {
    return res.status(400).json({
      error: 'Validation failed: "name" is required and must be a non-empty string'
    });
  }
  if (isBlank(family)) {
    return res.status(400).json({
      error: 'Validation failed: "family" is required and must be a non-empty string'
    });
  }
  next();
}

function validateMusician(req, res, next) {
  const { name } = req.body || {};
  if (isBlank(name)) {
    return res.status(400).json({
      error: 'Validation failed: "name" is required and must be a non-empty string'
    });
  }
  next();
}

function validateLoan(req, res, next) {
  const { musician_id, instrument_id, loan_date } = req.body || {};
  if (!musician_id || !isPositiveInt(musician_id)) {
    return res.status(400).json({
      error: 'Validation failed: "musician_id" is required and must be a valid integer'
    });
  }
  if (!instrument_id || !isPositiveInt(instrument_id)) {
    return res.status(400).json({
      error: 'Validation failed: "instrument_id" is required and must be a valid integer'
    });
  }
  // loan_date is optional (defaults to today) but must be YYYY-MM-DD if sent
  if (loan_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(loan_date))) {
    return res.status(400).json({
      error: 'Validation failed: "loan_date" must be in YYYY-MM-DD format (e.g. "2026-11-16")'
    });
  }
  next();
}

module.exports = { validateInstrument, validateMusician, validateLoan };
