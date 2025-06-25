const { getAuth } = require('firebase-admin/auth');

/**
 * Retrieves a paginated list of all users, with search filtering.
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const { searchTerm, nextPageToken } = req.query;
    const maxResults = 10; // Number of users to fetch per page

    // The listUsers method returns users in batches.
    const userRecords = await getAuth().listUsers(maxResults, nextPageToken);

    let customers = userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      disabled: user.disabled
    }));

    // Perform search filtering on the fetched batch
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      customers = customers.filter(customer => {
        const nameMatch = customer.displayName && customer.displayName.toLowerCase().includes(lowerCaseSearchTerm);
        const emailMatch = customer.email && customer.email.toLowerCase().includes(lowerCaseSearchTerm);
        return nameMatch || emailMatch;
      });
    }

    res.status(200).json({
      message: "Customers fetched successfully",
      data: {
        customers,
        // The pageToken for the next batch, or undefined if no more users.
        nextPageToken: userRecords.pageToken || null
      }
    });

  } catch (error) {
    console.error("Error fetching customers: ", error);
    res.status(500).json({ message: 'Failed to fetch customers.', error: error.message });
  }
};