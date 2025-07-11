const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// POST /api/contact - Anyone can submit the contact form
router.post('/', contactController.createContactSubmission);

module.exports = router;