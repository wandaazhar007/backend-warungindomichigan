const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect routes to ensure they are called by a valid, authenticated user
router.post('/post-signup', verifyToken, authController.postSignUp);
router.post('/post-google-signin', verifyToken, authController.postGoogleSignIn);

module.exports = router;