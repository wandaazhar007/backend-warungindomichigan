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

/**
 * Sends a welcome email to a new user who signed up with email/password.
 * @param {string} userEmail The new user's email.
 * @param {string} userName The new user's name.
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  initializeSendGrid();
  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Welcome to WarungIndoMichigan!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Hello ${userName},</h2>
        <p>Thank you for creating an account with WarungIndoMichigan! We're thrilled to have you.</p>
        <p>You can now browse our full selection of authentic Indonesian products, manage your orders, and enjoy a seamless checkout experience.</p>
        <p>Happy shopping!</p>
        <p>Best,</p>
        <p>The WarungIndoMichigan Team</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

/**
 * Sends a welcome email to a user who signed in with Google for the first time.
 * @param {string} userEmail The user's email.
 * @param {string} userName The user's name.
 */
const sendGoogleSignInEmail = async (userEmail, userName) => {
  initializeSendGrid();
  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Welcome to WarungIndoMichigan!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Hello ${userName},</h2>
        <p>We've successfully linked your Google account to WarungIndoMichigan. Welcome aboard!</p>
        <p>You can now browse our full selection of authentic Indonesian products, manage your orders, and enjoy a seamless checkout experience.</p>
        <p>Happy shopping!</p>
        <p>Best,</p>
        <p>The WarungIndoMichigan Team</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending Google sign-in email:", error);
  }
};

module.exports = { sendOrderStatusUpdateEmail, sendWelcomeEmail, sendGoogleSignInEmail };