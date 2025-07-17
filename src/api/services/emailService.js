const sgMail = require('@sendgrid/mail');

let isSendGridInitialized = false;

// This function ensures the API key is only set once, when it's first needed.
const initializeSendGrid = () => {
  if (!isSendGridInitialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isSendGridInitialized = true;
  }
};

const sendOrderStatusUpdateEmail = async (customerEmail, customerName, orderId, newStatus) => {
  try {
    initializeSendGrid(); // Initialize on first use
    const msg = {
      to: customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `Your Order Status: #${orderId}`,
      html: `<p>Hi ${customerName},</p><p>The status of your order #${orderId} is now: <strong>${newStatus}</strong>.</p>`,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending email with SendGrid", error);
  }
};

module.exports = { sendOrderStatusUpdateEmail };