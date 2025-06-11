const express = require('express');
const cors = require('cors');
const apiRoutes = require('./api/routes/index.js');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the E-Commerce API!',
    version: '1.0.0'
  });
});

app.use('/api', apiRoutes);

// Basic Error Handler (to be improved later)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;