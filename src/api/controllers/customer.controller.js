const { getAuth } = require('firebase-admin/auth');

/**
 * Retrieves a paginated list of all users from Firebase Authentication.
 */
exports.getAllCustomers = async (req, res) => {
  try {
    // The listUsers method returns users in batches of 1000.
    // For now, we'll fetch the first batch. We can add pagination later.
    const userRecords = await getAuth().listUsers(1000);

    const customers = userRecords.users.map(user => {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        disabled: user.disabled
      };
    });

    res.status(200).json({
      message: "Customers fetched successfully",
      data: customers
    });

  } catch (error) {
    console.error("Error fetching customers: ", error);
    res.status(500).json({ message: 'Failed to fetch customers.', error: error.message });
  }
};