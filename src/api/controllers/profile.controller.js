const { db } = require('../../config/firebase.config.js');
const { getAuth } = require('firebase-admin/auth');

/**
 * Gets the profile information for the currently authenticated user.
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.uid; // From verifyToken middleware
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      // If a user has an auth record but no profile doc yet, return their auth info
      const authUser = await getAuth().getUser(userId);
      return res.status(200).json({
        data: {
          email: authUser.email,
          name: authUser.displayName
        }
      });
    }

    res.status(200).json({ data: doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

/**
 * Updates the profile information for the currently authenticated user.
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, shippingAddress } = req.body;

    // Update the user's display name in Firebase Auth
    await getAuth().updateUser(userId, { displayName: name });

    // Update the user's profile document in Firestore
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      name,
      shippingAddress
    }, { merge: true }); // 'merge: true' prevents overwriting other fields

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};