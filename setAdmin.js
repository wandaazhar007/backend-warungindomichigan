// This is a one-time use script to grant admin privileges to a user.
const admin = require('firebase-admin');

// IMPORTANT: Make sure the path to your key file is correct
const serviceAccount = require('./src/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The email address of the user you want to make an admin
const adminEmail = "wandaazhar@gmail.com"; // <-- IMPORTANT: Change this to your admin email!

const setAdminClaim = async (email) => {
  try {
    console.log(`Fetching user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);

    // Check if the user already has the admin claim
    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`User ${email} is already an admin.`);
      return;
    }

    console.log(`Setting admin claim for user: ${user.uid}...`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`\n✅ Successfully made ${email} an admin.`);
    console.log("Log out and log back in to the admin dashboard for the changes to take effect.");

  } catch (error) {
    console.error("Error setting admin claim:", error.message);
  }
};

setAdminClaim(adminEmail).then(() => process.exit());