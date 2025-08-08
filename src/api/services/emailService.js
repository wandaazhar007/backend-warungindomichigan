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


/**
 * Sends an order confirmation email to the customer.
 * @param {object} orderData The complete order object.
 */
const sendOrderConfirmationEmail = async (orderData) => {
  initializeSendGrid();
  const itemsHtml = orderData.items.map(item => `<li>${item.quantity}x ${item.name} - $${(item.price / 100).toFixed(2)}</li>`).join('');
  const msg = {
    to: orderData.customerDetails.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Your WarungIndoMichigan Order Confirmation (#${orderData.id.substring(0, 8)})`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Thank You for Your Order!</h2>
        <p>Hi ${orderData.customerDetails.name}, we've received your order and are getting it ready.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
          <h3>Order Summary</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Shipping:</strong> $${(orderData.shippingCost / 100).toFixed(2)}</p>
          <p><strong>Total:</strong> $${(orderData.totalAmount / 100).toFixed(2)}</p>
        </div>
        <p>We will notify you again once your order has shipped.</p>
      </div>`,
  };
  try {
    await sgMail.send(msg);
    console.log(`✅ Order confirmation email sent to ${orderData.customerDetails.email}`);
  } catch (error) { console.error("Error sending order confirmation email:", error); }
};

module.exports = { sendOrderStatusUpdateEmail, sendWelcomeEmail, sendGoogleSignInEmail, sendOrderConfirmationEmail };