const { getAuth } = require('firebase-admin/auth');

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken; // Add user info to the request object
    next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).json({ message: 'Forbidden: Invalid token.' });
  }
};

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
  // This runs AFTER verifyToken, so req.user should exist
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Requires admin access.' });
  }
}

module.exports = { verifyToken, isAdmin };