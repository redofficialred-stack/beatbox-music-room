// Part 5: Twist rule (Top three) -> Save as utils/topThree.js
const { all } = require('../db/database');

/**
 * GET /instruments/top
 * Returns the 3 instruments that appear in the most loans, with their counts.
 * Uses a JOIN (instruments + loans) and GROUP BY.
 * Ties are listed alphabetically. Instruments never loaned are not counted,
 * so if only 2 instruments were used the result has just 2 rows.
 */
async function topThreeInstruments() {
  return all(`
    SELECT
      i.id,
      i.name,
      i.family,
      COUNT(l.id) AS loan_count
    FROM instruments i
    INNER JOIN loans l ON l.instrument_id = i.id
    GROUP BY i.id, i.name, i.family
    ORDER BY loan_count DESC, i.name COLLATE NOCASE ASC
    LIMIT 3
  `);
}

module.exports = { topThreeInstruments };
