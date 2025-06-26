const sgMail = require('@sendgrid/mail');

// Set the API key from your .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = process.env.SENDGRID_FROM_EMAIL;

/**
 * Sends an email notification when an order status is updated.
 * @param {string} customerEmail The recipient's email address.
 * @param {string} customerName The recipient's name.
 * @param {string} orderId The ID of the order.
 * @param {string} newStatus The new status of the order.
 */
const sendOrderStatusUpdateEmail = async (customerEmail, customerName, orderId, newStatus) => {
  const msg = {
    to: customerEmail,
    from: fromEmail, // Use your verified sender
    subject: `Your Order Status has been updated: #${orderId}`,
    html: `
      <p>Hi ${customerName},</p>
      <p>Good news! The status of your order #${orderId} has been updated to: <strong>${newStatus}</strong>.</p>
      <p>We will notify you again once your order has shipped.</p>
      <p>Thank you for your purchase!</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Order status update email sent successfully to ${customerEmail}`);
  } catch (error) {
    console.error("Error sending email with SendGrid", error);
    if (error.response) {
      console.error(error.response.body)
    }
  }
};

module.exports = { sendOrderStatusUpdateEmail };