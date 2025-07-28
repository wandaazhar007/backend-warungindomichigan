const { sendWelcomeEmail, sendGoogleSignInEmail } = require('../services/emailService');
const { db } = require('../../config/firebase.config.js');

// This function will be called by the frontend after a user signs up.
exports.postSignUp = async (req, res) => {
  const { email, name, uid } = req.body;
  if (!email || !name || !uid) {
    return res.status(400).send('Missing user information.');
  }

  try {
    // Optional: Save user to a 'users' collection in Firestore
    await db.collection('users').doc(uid).set({ name, email, createdAt: new Date() });

    // Send the welcome email
    await sendWelcomeEmail(email, name);
    res.status(200).send('User processed and welcome email sent.');
  } catch (error) {
    res.status(500).send('Error processing user signup.');
  }
};

// This function will be called by the frontend after a Google sign-in.
exports.postGoogleSignIn = async (req, res) => {
  const { email, name, uid } = req.body;
  if (!email || !name || !uid) {
    return res.status(400).send('Missing user information.');
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    // Check if the user is new to send the email only once
    if (!doc.exists) {
      await userRef.set({ name, email, createdAt: new Date() });
      await sendGoogleSignInEmail(email, name);
      res.status(200).send('New user processed and welcome email sent.');
    } else {
      res.status(200).send('Existing user signed in.');
    }
  } catch (error) {
    res.status(500).send('Error processing Google sign-in.');
  }
};