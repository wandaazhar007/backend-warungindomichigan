const { db } = require('../../config/firebase.config.js');

/**
 * Saves a new contact form submission to the database.
 */
exports.createContactSubmission = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Basic server-side validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required fields." });
    }

    const newSubmission = {
      name,
      email,
      phone: phone || '', // Phone is optional
      message,
      isRead: false, // A flag for the admin dashboard
      submittedAt: new Date(),
    };

    // Add the new submission to a 'contacts' collection
    await db.collection('contacts').add(newSubmission);

    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });

  } catch (error) {
    console.error("Error saving contact submission: ", error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};