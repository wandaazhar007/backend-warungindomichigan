const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All profile routes require the user to be logged in
router.use(verifyToken);

router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateMyProfile);

module.exports = router;