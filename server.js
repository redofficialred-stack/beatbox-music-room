// Part 1: Server and routes -> Save as server.js (project root)
const express = require('express');
const musiciansRouter = require('./routes/musicians');
const instrumentsRouter = require('./routes/instruments');
const loansRouter = require('./routes/loans');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BeatBox Music Room API',
    endpoints: ['/musicians', '/instruments', '/loans']
  });
});

// Mount resource routes
app.use('/musicians', musiciansRouter);
app.use('/instruments', instrumentsRouter);
app.use('/loans', loansRouter);

// Handle unknown routes (404)
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler (500). Also catches bad JSON bodies.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`BeatBox Music Room server running on http://localhost:${PORT}`);
});
