const nodemailer = require('nodemailer');

// Create transporter using GoDaddy SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
      user: process.env.EMAIL_USER || 'info@navigatorclothing.in',
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Reusable footer component
const getFooter = () => `
  <tr>
    <td style="padding: 40px; background-color: #000; text-align: center;">
      <p style="margin: 0 0 15px; font-size: 18px; font-weight: 700; letter-spacing: 6px; color: #fff;">NAVIGATOR</p>
      <p style="margin: 0 0 25px; font-size: 12px; color: rgba(255,255,255,0.5);">Premium Men's Fashion</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://instagram.com/navigatorclothing" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" style="width: 16px; height: 16px; vertical-align: middle; opacity: 0.8;">
            </a>
            <a href="https://facebook.com/navigatorclothing" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/174/174848.png" alt="Facebook" style="width: 16px; height: 16px; vertical-align: middle; opacity: 0.8;">
            </a>
          </td>
        </tr>
      </table>
      <div style="margin: 25px 0; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);"></div>
      <p style="margin: 0 0 10px; font-size: 11px; color: rgba(255,255,255,0.4);">
        7-day returns • Store credit only • No cash refunds
      </p>
      <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.8;">
        Questions? Email us at info@navigatorclothing.in<br>
        © ${new Date().getFullYear()} Navigator Clothing. All rights reserved.
      </p>
    </td>
  </tr>
`;

// Email templates
const templates = {
  orderConfirmation: (data, isGuest = false) => {
    const order = data.order || data;
    const name = data.name || order.shippingAddress?.fullName || 'Customer';
    const firstName = name.split(' ')[0];
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return {
      subject: `Your Navigator Order #${orderNumber}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <a href="https://navigatorclothing.in" style="text-decoration: none;">
                <span style="font-size: 26px; font-weight: 700; letter-spacing: 8px; color: #000000;">NAVIGATOR</span>
              </a>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 60px 40px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);">
              <div style="width: 70px; height: 70px; margin: 0 auto 25px; border: 2px solid #000; border-radius: 50%;">
                <span style="font-size: 32px; line-height: 66px; display: block;">✓</span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 400; color: #000000; letter-spacing: 0.5px;">
                Thank You, ${firstName}
              </h1>
              <p style="margin: 0; font-size: 15px; color: #666666;">
                Your order has been confirmed
              </p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
                <tr>
                  <td style="padding: 18px 20px; text-align: center; border-right: 1px solid #eee; width: 33.33%;">
                    <p style="margin: 0 0 4px; font-size: 10px; color: #999; letter-spacing: 1.5px; text-transform: uppercase;">Order</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">#${orderNumber}</p>
                  </td>
                  <td style="padding: 18px 20px; text-align: center; border-right: 1px solid #eee; width: 33.33%;">
                    <p style="margin: 0 0 4px; font-size: 10px; color: #999; letter-spacing: 1.5px; text-transform: uppercase;">Date</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">${orderDate}</p>
                  </td>
                  <td style="padding: 18px 20px; text-align: center; width: 33.33%;">
                    <p style="margin: 0 0 4px; font-size: 10px; color: #999; letter-spacing: 1.5px; text-transform: uppercase;">Total</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">₹${Math.round(order.totalAmount).toLocaleString('en-IN')}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 11px; font-weight: 600; color: #999; letter-spacing: 2px; text-transform: uppercase;">
                Your Items
              </p>
              
              ${order.items.map(item => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="100" style="vertical-align: top;">
                    <img src="${item.image || 'https://via.placeholder.com/100x120/f5f5f5/999?text=N'}" 
                         alt="${item.name}" 
                         style="width: 100px; height: 120px; object-fit: cover; display: block; background-color: #f5f5f5;">
                  </td>
                  <td style="vertical-align: top; padding-left: 20px;">
                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 500; color: #000;">${item.name}</p>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Size: ${item.size}</p>
                    <p style="margin: 0 0 15px; font-size: 13px; color: #888;">Qty: ${item.quantity}</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </td>
                </tr>
              </table>
              `).join('')}
              
              <!-- Divider -->
              <div style="height: 1px; background-color: #eee; margin: 25px 0;"></div>
              
              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #666;">Subtotal</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #000; text-align: right;">₹${Math.round(order.itemsTotal).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #666;">Shipping</td>
                  <td style="padding: 6px 0; font-size: 14px; color: ${order.shippingPrice === 0 ? '#16a34a' : '#000'}; text-align: right; font-weight: ${order.shippingPrice === 0 ? '500' : '400'};">
                    ${order.shippingPrice === 0 ? 'Free' : '₹' + order.shippingPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #666;">Tax (GST)</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #000; text-align: right;">₹${Math.round(order.taxPrice).toLocaleString('en-IN')}</td>
                </tr>
              </table>
              
              <div style="height: 2px; background-color: #000; margin: 15px 0;"></div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 16px; font-weight: 600; color: #000;">Total</td>
                  <td style="font-size: 20px; font-weight: 700; color: #000; text-align: right;">₹${Math.round(order.totalAmount).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 12px; font-size: 10px; font-weight: 600; color: #999; letter-spacing: 2px; text-transform: uppercase;">
                      Delivering To
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.7;">
                      <strong>${order.shippingAddress.fullName}</strong><br>
                      ${order.shippingAddress.street}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                      <span style="color: #888;">Tel: ${order.shippingAddress.phone}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 50px; text-align: center;">
              <a href="https://navigatorclothing.in/profile" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 16px 50px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-decoration: none; text-transform: uppercase;">
                Track Your Order
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          ${getFooter()}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };
  },

  orderShipped: (data) => {
    const order = data.order || data;
    const name = order.shippingAddress?.fullName || 'Customer';
    const firstName = name.split(' ')[0];
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    
    return {
      subject: `Your Order #${orderNumber} is On Its Way`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <a href="https://navigatorclothing.in" style="text-decoration: none;">
                <span style="font-size: 26px; font-weight: 700; letter-spacing: 8px; color: #000000;">NAVIGATOR</span>
              </a>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
              <div style="width: 70px; height: 70px; margin: 0 auto 25px; background: rgba(255,255,255,0.15); border-radius: 50%;">
                <span style="font-size: 32px; line-height: 70px; display: block;">📦</span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 400; color: #ffffff; letter-spacing: 0.5px;">
                Your Order is On Its Way
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.8);">
                Get ready, ${firstName}!
              </p>
            </td>
          </tr>
          
          <!-- Progress -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #000; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #fff; font-size: 14px;">✓</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #000; letter-spacing: 1px;">CONFIRMED</p>
                  </td>
                  <td style="width: 16.66%; padding-bottom: 30px;"><div style="height: 2px; background-color: #000;"></div></td>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #fff; font-size: 14px;">✓</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #2563eb; letter-spacing: 1px;">SHIPPED</p>
                  </td>
                  <td style="width: 16.66%; padding-bottom: 30px;"><div style="height: 2px; background-color: #ddd;"></div></td>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #eee; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #999; font-size: 14px;">3</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px;">DELIVERED</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 10px; font-weight: 600; color: #999; letter-spacing: 1.5px; text-transform: uppercase; text-align: center;">
                Order #${orderNumber}
              </p>
            </td>
          </tr>
          
          <!-- Shipping -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 12px; font-size: 10px; font-weight: 600; color: #999; letter-spacing: 2px; text-transform: uppercase;">
                      Delivering To
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.7;">
                      <strong>${order.shippingAddress.fullName}</strong><br>
                      ${order.shippingAddress.street}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 50px; text-align: center;">
              <a href="https://navigatorclothing.in/profile" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 16px 50px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-decoration: none; text-transform: uppercase;">
                Track Package
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          ${getFooter()}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };
  },

  orderDelivered: (data) => {
    const order = data.order || data;
    const name = order.shippingAddress?.fullName || 'Customer';
    const firstName = name.split(' ')[0];
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    
    return {
      subject: `Delivered! Your Order #${orderNumber} Has Arrived`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <a href="https://navigatorclothing.in" style="text-decoration: none;">
                <span style="font-size: 26px; font-weight: 700; letter-spacing: 8px; color: #000000;">NAVIGATOR</span>
              </a>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #065f46 0%, #10b981 100%);">
              <div style="width: 70px; height: 70px; margin: 0 auto 25px; background: rgba(255,255,255,0.15); border-radius: 50%;">
                <span style="font-size: 32px; line-height: 70px; display: block;">✓</span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 400; color: #ffffff; letter-spacing: 0.5px;">
                Your Order Has Arrived
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.8);">
                We hope you love it, ${firstName}!
              </p>
            </td>
          </tr>
          
          <!-- Progress -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #fff; font-size: 14px;">✓</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #10b981; letter-spacing: 1px;">CONFIRMED</p>
                  </td>
                  <td style="width: 16.66%; padding-bottom: 30px;"><div style="height: 2px; background-color: #10b981;"></div></td>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #fff; font-size: 14px;">✓</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #10b981; letter-spacing: 1px;">SHIPPED</p>
                  </td>
                  <td style="width: 16.66%; padding-bottom: 30px;"><div style="height: 2px; background-color: #10b981;"></div></td>
                  <td style="text-align: center; width: 33.33%;">
                    <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 50%; margin: 0 auto 10px; line-height: 40px; color: #fff; font-size: 14px;">✓</div>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; color: #10b981; letter-spacing: 1px;">DELIVERED</p>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 15px; color: #065f46; font-weight: 500;">
                  Order #${orderNumber} has been successfully delivered!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 50px; text-align: center;">
              <p style="margin: 0 0 25px; font-size: 14px; color: #666;">
                Thank you for shopping with Navigator
              </p>
              <a href="https://navigatorclothing.in/shop" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 16px 50px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-decoration: none; text-transform: uppercase;">
                Shop Again
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          ${getFooter()}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };
  },

  welcomeEmail: (data) => {
    const user = data.user || data;
    const name = user.name || 'there';
    const firstName = name.split(' ')[0];
    
    return {
      subject: `Welcome to Navigator, ${firstName}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Navigator</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f8f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <a href="https://navigatorclothing.in" style="text-decoration: none;">
                <span style="font-size: 26px; font-weight: 700; letter-spacing: 8px; color: #000000;">NAVIGATOR</span>
              </a>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td style="padding: 80px 40px; text-align: center; background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);">
              <h1 style="margin: 0 0 15px; font-size: 36px; font-weight: 300; color: #ffffff; letter-spacing: 2px;">
                Welcome, ${firstName}
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.6);">
                You're now part of the Navigator journey
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <p style="margin: 0 0 35px; font-size: 16px; color: #444; line-height: 1.7; max-width: 420px; margin-left: auto; margin-right: auto;">
                Thank you for creating an account with us. Discover premium fashion, curated just for you.
              </p>
              <a href="https://navigatorclothing.in/shop" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 16px 50px; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-decoration: none; text-transform: uppercase;">
                Start Shopping
              </a>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 50px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
                <tr>
                  <td style="padding: 30px 20px; text-align: center; width: 33.33%;">
                    <p style="margin: 0 0 8px; font-size: 22px;">🚚</p>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #000; letter-spacing: 1px;">FREE SHIPPING</p>
                    <p style="margin: 0; font-size: 11px; color: #888;">Over ₹2,999</p>
                  </td>
                  <td style="padding: 30px 20px; text-align: center; width: 33.33%;">
                    <p style="margin: 0 0 8px; font-size: 22px;">↩️</p>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #000; letter-spacing: 1px;">7-DAY RETURNS</p>
                    <p style="margin: 0; font-size: 11px; color: #888;">Store credit</p>
                  </td>
                  <td style="padding: 30px 20px; text-align: center; width: 33.33%;">
                    <p style="margin: 0 0 8px; font-size: 22px;">🔒</p>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #000; letter-spacing: 1px;">SECURE</p>
                    <p style="margin: 0; font-size: 11px; color: #888;">Safe checkout</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          ${getFooter()}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };
  },

  // Admin notification for new orders
  adminOrderNotification: (data) => {
    const order = data.order || data;
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    
    return {
      subject: `New Order #${orderNumber} - ₹${Math.round(order.totalAmount).toLocaleString('en-IN')}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 25px; text-align: center;">
        <p style="margin: 0 0 10px; font-size: 16px; font-weight: 700; letter-spacing: 3px; color: #fff;">NAVIGATOR</p>
        <span style="display: inline-block; background: #22c55e; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600;">NEW ORDER</span>
      </td>
    </tr>
    
    <!-- Order Summary -->
    <tr>
      <td style="padding: 25px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9f9f9; border-radius: 8px;">
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
              <span style="color: #666; font-size: 13px;">Order</span>
              <span style="float: right; font-weight: 600;">#${orderNumber}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
              <span style="color: #666; font-size: 13px;">Date</span>
              <span style="float: right;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
              <span style="color: #666; font-size: 13px;">Payment</span>
              <span style="float: right;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
              <span style="color: #666; font-size: 13px;">Status</span>
              <span style="float: right; color: ${order.isPaid ? '#22c55e' : '#f59e0b'}; font-weight: 500;">${order.isPaid ? 'Paid' : 'Pending'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px;">
              <span style="color: #666; font-size: 13px;">Total</span>
              <span style="float: right; font-size: 18px; font-weight: 700;">₹${Math.round(order.totalAmount).toLocaleString('en-IN')}</span>
            </td>
          </tr>
        </table>
        
        <!-- Items -->
        <p style="margin: 25px 0 15px; font-size: 11px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">Items (${order.items.length})</p>
        ${order.items.map(item => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
          <tr>
            <td width="60">
              <img src="${item.image || 'https://via.placeholder.com/60x75'}" alt="${item.name}" style="width: 60px; height: 75px; object-fit: cover; background: #f5f5f5;">
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <p style="margin: 0 0 4px; font-weight: 500;">${item.name}</p>
              <p style="margin: 0; font-size: 12px; color: #888;">Size: ${item.size} | Qty: ${item.quantity} | ₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </td>
          </tr>
        </table>
        `).join('')}
        
        <!-- Customer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f9ff; border-radius: 8px; margin-top: 20px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 10px; font-size: 11px; font-weight: 600; color: #0369a1; letter-spacing: 1px; text-transform: uppercase;">Customer</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                Tel: ${order.shippingAddress.phone}
              </p>
            </td>
          </tr>
        </table>
        
        <!-- CTA -->
        <div style="text-align: center; margin-top: 25px;">
          <a href="https://navigatorclothing.in/admin/orders" style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-decoration: none; text-transform: uppercase;">
            View in Dashboard
          </a>
        </div>
      </td>
    </tr>
    
  </table>
</body>
</html>
      `
    };
  }
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    console.log(`[EMAIL] Attempting to send "${template}" email to: ${to}`);
    console.log(`[EMAIL] Config - Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}, Pass: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('[EMAIL] Service not configured. Skipping email to:', to);
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    // Verify transporter connection
    console.log('[EMAIL] Verifying SMTP connection...');
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
    
    const emailTemplate = templates[template](data);

    const mailOptions = {
      from: `"Navigator" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    console.log(`[EMAIL] Sending email with subject: ${emailTemplate.subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error.message);
    console.error('[EMAIL] Full error:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification for new orders
const sendAdminOrderNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (!adminEmail) {
      console.log('Admin email not configured.');
      return { success: false, message: 'Admin email not configured' };
    }

    const result = await sendEmail(adminEmail, 'adminOrderNotification', { order });
    console.log('Admin notification sent for order:', order._id);
    return result;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendAdminOrderNotification,
  templates
};
