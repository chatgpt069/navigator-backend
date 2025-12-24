const nodemailer = require('nodemailer');

// Create transporter using environment variables
const createTransporter = () => {
  // Using Gmail - you'll need to set up App Password
  // Or use a service like SendGrid, Mailgun, etc.
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password for Gmail
    },
  });
};

// Email templates
const templates = {
  orderConfirmation: (order, isGuest = false) => ({
    subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #eee; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000; }
          .order-info { background: #f9f9f9; padding: 20px; margin: 30px 0; }
          .order-number { font-size: 14px; color: #666; margin-bottom: 5px; }
          .order-status { font-size: 24px; font-weight: bold; color: #000; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { text-align: left; padding: 12px 0; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .items-table td { padding: 15px 0; border-bottom: 1px solid #eee; }
          .item-image { width: 60px; height: 80px; object-fit: cover; }
          .item-name { font-weight: 500; }
          .item-details { font-size: 12px; color: #666; margin-top: 5px; }
          .totals { margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .totals-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 15px; margin-top: 10px; }
          .shipping-info { margin-top: 30px; padding: 20px; background: #f9f9f9; }
          .shipping-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
          .footer { text-align: center; padding-top: 30px; margin-top: 30px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 14px; letter-spacing: 1px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NAVIGATOR</div>
          </div>
          
          <div class="order-info">
            <div class="order-number">Order #${order._id.toString().slice(-8).toUpperCase()}</div>
            <div class="order-status">Thank you for your order!</div>
            <p style="margin: 15px 0 0; color: #666;">We've received your order and will begin processing it soon.</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th colspan="2">Item</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="width: 80px;">
                    <img src="${item.image || 'https://via.placeholder.com/60x80'}" alt="${item.name}" class="item-image" />
                  </td>
                  <td>
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">Size: ${item.size} | Qty: ${item.quantity}</div>
                  </td>
                  <td style="text-align: right; font-weight: 500;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>₹${Math.round(order.itemsTotal).toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>Tax (GST)</span>
              <span>₹${Math.round(order.taxPrice).toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>Shipping</span>
              <span>${order.shippingPrice === 0 ? 'FREE' : '₹' + order.shippingPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row total">
              <span>Total</span>
              <span>₹${Math.round(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="shipping-info">
            <div class="shipping-title">Shipping Address</div>
            <p style="margin: 0;">
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@navigator.com</p>
            <p>&copy; ${new Date().getFullYear()} Navigator. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderShipped: (order) => ({
    subject: `Your Order Has Shipped - #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; padding-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000; }
          .status-box { background: #f0fdf4; border: 1px solid #86efac; padding: 30px; text-align: center; margin: 30px 0; }
          .status-icon { font-size: 40px; margin-bottom: 15px; }
          .status-text { font-size: 20px; font-weight: bold; color: #166534; }
          .footer { text-align: center; padding-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NAVIGATOR</div>
          </div>
          
          <div class="status-box">
            <div class="status-icon">📦</div>
            <div class="status-text">Your order is on its way!</div>
            <p style="margin: 15px 0 0; color: #666;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
          </div>

          <p>Hi ${order.shippingAddress.fullName},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0;">
            <strong>Shipping Address:</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
          </div>

          <div class="footer">
            <p>Thank you for shopping with Navigator!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderDelivered: (order) => ({
    subject: `Order Delivered - #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; padding-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000; }
          .status-box { background: #f0fdf4; border: 1px solid #86efac; padding: 30px; text-align: center; margin: 30px 0; }
          .footer { text-align: center; padding-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NAVIGATOR</div>
          </div>
          
          <div class="status-box">
            <div style="font-size: 40px; margin-bottom: 15px;">✅</div>
            <div style="font-size: 20px; font-weight: bold; color: #166534;">Your order has been delivered!</div>
          </div>

          <p>Hi ${order.shippingAddress.fullName},</p>
          <p>Your order #${order._id.toString().slice(-8).toUpperCase()} has been delivered. We hope you love your new items!</p>
          
          <p style="margin-top: 30px;">Thank you for shopping with Navigator. We'd love to hear your feedback!</p>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Navigator. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to Navigator! 🧭',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #eee; }
          .logo { font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #000; }
          .welcome-text { font-size: 28px; font-weight: bold; text-align: center; margin: 40px 0 20px; }
          .btn { display: inline-block; background: #000; color: #fff; padding: 15px 40px; text-decoration: none; font-size: 14px; letter-spacing: 1px; }
          .features { margin: 40px 0; }
          .feature { display: flex; align-items: center; margin: 20px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .footer { text-align: center; padding-top: 30px; margin-top: 30px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NAVIGATOR</div>
          </div>
          
          <div class="welcome-text">Welcome, ${user.name}!</div>
          
          <p style="text-align: center; color: #666;">Thank you for joining Navigator. Get ready to discover amazing fashion!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" class="btn">START SHOPPING</a>
          </div>

          <div class="features">
            <div class="feature">
              <span class="feature-icon">🚚</span>
              <span>Free shipping on orders over ₹2,999</span>
            </div>
            <div class="feature">
              <span class="feature-icon">↩️</span>
              <span>30-day easy returns</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔒</span>
              <span>Secure payments</span>
            </div>
          </div>

          <div class="footer">
            <p>Follow us for the latest updates</p>
            <p>&copy; ${new Date().getFullYear()} Navigator. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping email to:', to);
      console.log('Template:', template);
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const emailTemplate = templates[template](data);

    const mailOptions = {
      from: `"Navigator" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  templates
};
