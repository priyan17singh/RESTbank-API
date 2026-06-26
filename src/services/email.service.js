require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend BMS" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent successfully. ID: %s', info.messageId);
    return info; // Return info to allow handling the result upstream
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail, name) {
  const subject = "🎉 Welcome to Backend BMS";

  const text = `
Hello ${name},

Thank you for joining Backend BMS.

Your account has been successfully created and you're ready to start using our platform.

Best Regards,
Backend BMS Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);">

    <div style="background:#2563eb;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">Backend BMS</h1>
      <p style="color:#dbeafe;margin-top:10px;">
        Authentication & User Management System
      </p>
    </div>

    <div style="padding:40px;">

      <h2 style="color:#111827;">
        Welcome, ${name} 👋
      </h2>

      <p style="color:#4b5563;line-height:1.7;">
        Thank you for joining <strong>Backend BMS</strong>.
        Your account has been successfully created.
      </p>

      <p style="color:#4b5563;line-height:1.7;">
        We're excited to have you on board. You can now explore all the features available on the platform.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a
          href="http://localhost:3000"
          style="
            background:#2563eb;
            color:white;
            text-decoration:none;
            padding:12px 24px;
            border-radius:8px;
            display:inline-block;
            font-weight:bold;
          "
        >
          Get Started
        </a>
      </div>

      <div style="background:#f8fafc;padding:20px;border-radius:8px;">
        <h3 style="margin-top:0;">What's Next?</h3>
        <ul style="color:#4b5563;line-height:1.8;">
          <li>Complete your profile</li>
          <li>Explore platform features</li>
          <li>Keep your account secure</li>
          <li>Contact support if needed</li>
        </ul>
      </div>

      <p style="margin-top:30px;color:#4b5563;">
        If you did not create this account, please contact support immediately.
      </p>

      <p>
        Best Regards,<br>
        <strong>Backend BMS Team</strong>
      </p>

    </div>

    <div style="background:#f9fafb;padding:20px;text-align:center;color:#6b7280;font-size:13px;">
      © ${new Date().getFullYear()} Backend BMS. All Rights Reserved.
    </div>

  </div>

</body>
</html>
`;

  await sendEmail(userEmail, subject, text, html);
}



async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "✅ Transaction Successful";

  const text = `
Hello ${name},

Your transaction has been completed successfully.

Amount: ₹${amount}
Recipient Account: ${toAccount}

Thank you for using Backend Ledger.

Best Regards,
Backend Ledger Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);">

    <div style="background:#16a34a;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">Transaction Successful ✅</h1>
    </div>

    <div style="padding:35px;">

      <h2>Hello ${name},</h2>

      <p>Your transaction has been processed successfully.</p>

      <div style="background:#f8fafc;padding:20px;border-radius:8px;border-left:5px solid #16a34a;">
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Recipient Account:</strong> ${toAccount}</p>
        <p><strong>Status:</strong> Successful</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="margin-top:20px;">
        The transfer has been completed and recorded successfully.
      </p>

      <p>
        Best Regards,<br>
        <strong>Backend Ledger Team</strong>
      </p>

    </div>

    <div style="background:#f9fafb;padding:15px;text-align:center;color:#6b7280;font-size:13px;">
      This is an automated transaction notification.
    </div>

  </div>

</body>
</html>
`;

  await sendEmail(userEmail, subject, text, html);
}

// Transaction Failure Email
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "❌ Transaction Failed";

  const text = `
Hello ${name},

Unfortunately, your transaction could not be completed.

Amount: ₹${amount}
Recipient Account: ${toAccount}

Please try again later.

Best Regards,
Backend Ledger Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);">

    <div style="background:#dc2626;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;">Transaction Failed ❌</h1>
    </div>

    <div style="padding:35px;">

      <h2>Hello ${name},</h2>

      <p>We were unable to process your transaction.</p>

      <div style="background:#fef2f2;padding:20px;border-radius:8px;border-left:5px solid #dc2626;">
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Recipient Account:</strong> ${toAccount}</p>
        <p><strong>Status:</strong> Failed</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="margin-top:20px;">
        This may be due to insufficient balance, an invalid account number, or a temporary system issue.
      </p>

      <p>
        Please try again later. If the issue persists, contact support.
      </p>

      <p>
        Best Regards,<br>
        <strong>Backend Ledger Team</strong>
      </p>

    </div>

    <div style="background:#f9fafb;padding:15px;text-align:center;color:#6b7280;font-size:13px;">
      This is an automated transaction notification.
    </div>

  </div>

</body>
</html>
`;

  await sendEmail(userEmail, subject, text, html);
}

// Export all email functions
module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};


// module.exports = {sendRegistrationEmail, sendTransactionFailureEmail};