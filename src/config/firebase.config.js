// const admin = require('firebase-admin');

// const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

// console.log('Firebase Admin SDK initialized successfully.');

// module.exports = { db };

const admin = require('firebase-admin');

// This now correctly uses the path from your .env file
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('Firebase Admin SDK initialized successfully.');

module.exports = { db };