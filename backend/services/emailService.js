/**
 * Transactional Security Email Notification Service
 * Renders HTML email templates and logs outputs for local sandboxing.
 */

// Shared premium HTML email layout layout wrapper
const wrapHtmlLayout = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #0e8fe3; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 32px; line-height: 1.6; font-size: 14px; }
    .button-container { text-align: center; margin: 24px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0e8fe3; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; }
    .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-t: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>StayMate</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} StayMate Inc. Sector 62, Noida, India.</p>
      <p>This is an automated security alert. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

import nodemailer from 'nodemailer';

// Initialize SMTP Transporter if configured
const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter = null;
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for port 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('📧 [Email Status] SMTP Transporter configured. Real emails will be dispatched.');
} else {
  console.log('📧 [Email Status] Running in Sandbox mode. Transactional emails will be logged to server console.');
  console.log(`   [Email Config Status] SMTP_HOST: ${process.env.SMTP_HOST ? 'PRESENT' : 'MISSING'}, SMTP_USER: ${process.env.SMTP_USER ? 'PRESENT' : 'MISSING'}, SMTP_PASS: ${process.env.SMTP_PASS ? 'PRESENT' : 'MISSING'}`);
}

export const emailService = {
  /**
   * Helper dispatching simulated email outputs
   */
  sendMail: async ({ to, subject, html }) => {
    if (transporter) {
      try {
        const mailOptions = {
          from: `"${process.env.EMAIL_FROM_NAME || 'StayMate'}" <${process.env.EMAIL_FROM || 'no-reply@staymate.com'}>`,
          to,
          subject,
          html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 [SMTP Mail Sent] MessageId: ${info.messageId} to ${to}`);
        return true;
      } catch (err) {
        console.error('❌ [SMTP Mail Failed] Sending failed, falling back to console log. Error:', err.message);
      }
    }

    console.log('\n======================================================');
    console.log('✉️ [SECURITY API EMAIL DISPATCHED (SANDBOX)]');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------------------------------');
    // Print a clean plain text excerpt of the HTML body
    const plainTextExcerpt = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 300);
    console.log(`${plainTextExcerpt}...`);
    console.log('======================================================\n');
    return true;
  },


  sendWelcomeEmail: async (user) => {
    const html = wrapHtmlLayout(
      'Welcome to StayMate!',
      `<h2>Hi ${user.name},</h2>
       <p>We are absolutely thrilled to welcome you to the StayMate community! Your account is created successfully.</p>
       <p>Begin matching roommates and searching verified properties today.</p>
       <div class="button-container">
         <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" class="button">Go to Profile Dashboard</a>
       </div>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Welcome to StayMate!', html });
  },

  sendVerificationEmail: async (user, token) => {
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const html = wrapHtmlLayout(
      'Verify Your Email Address',
      `<h2>Hello ${user.name},</h2>
       <p>Please click the button below to verify your email address and activate your StayMate listing account:</p>
       <div class="button-container">
         <a href="${link}" class="button">Activate Account</a>
       </div>
       <p>If the button doesn't work, copy and paste this link into your browser: <br>${link}</p>
       <p>This link expires in 24 hours.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Verify Your Email Address', html });
  },

  sendPasswordChangedEmail: async (user) => {
    const html = wrapHtmlLayout(
      'Password Changed Alert',
      `<h2>Hi ${user.name},</h2>
       <p>This is a security confirmation that the password associated with your StayMate account has been changed.</p>
       <p>All other active device sessions have been automatically logged out for safety.</p>
       <p>If you did not request this update, contact our security response team immediately.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Security Notice: Password Updated', html });
  },

  sendPasswordResetEmail: async (user, token) => {
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const html = wrapHtmlLayout(
      'Reset Your Password',
      `<h2>Hello ${user.name},</h2>
       <p>We received a request to reset the password for your StayMate account. Click the link below to configure a new password:</p>
       <div class="button-container">
         <a href="${link}" class="button">Reset Password</a>
       </div>
       <p>If you did not request this, please ignore this warning. Your current password remains safe.</p>
       <p>This link expires in 15 minutes.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Reset Your Password', html });
  },

  sendNewDeviceLoginEmail: async (user, deviceDetails) => {
    const html = wrapHtmlLayout(
      'New Device Login Notification',
      `<h2>Security Notice</h2>
       <p>Hi ${user.name}, a new login session was detected on your account:</p>
       <ul>
         <li><strong>Operating System:</strong> ${deviceDetails.operatingSystem}</li>
         <li><strong>Browser:</strong> ${deviceDetails.browser}</li>
         <li><strong>IP Address:</strong> ${deviceDetails.ipAddress}</li>
         <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
       </ul>
       <p>If this was you, no action is required. If you do not recognize this device, manage your sessions in settings and revoke it immediately.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Security Alert: New Device Login', html });
  },

  sendLockoutEmail: async (user) => {
    const html = wrapHtmlLayout(
      'Account Temporarily Locked',
      `<h2>Security Alert</h2>
       <p>Hello ${user.name || 'User'},</p>
       <p>Your StayMate account has been temporarily locked due to 5 consecutive failed login attempts.</p>
       <p><strong>Lockout Duration:</strong> 15 minutes.</p>
       <p>Your account will automatically unlock after this duration. If you did not trigger these requests, please verify your credentials or contact security support.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Security Alert: Account Locked', html });
  },

  sendAccountUnlockedEmail: async (user) => {
     const html = wrapHtmlLayout(
       'Account Unlocked Alert',
       `<h2>Welcome Back</h2>
        <p>Hi ${user.name}, your account lockout has expired, and you can now log in successfully with your credentials.</p>`
     );
     return emailService.sendMail({ to: user.email, subject: 'Security Update: Account Unlocked', html });
  },

  sendLogoutAllDevicesEmail: async (user) => {
    const html = wrapHtmlLayout(
      'All Sessions Revoked',
      `<h2>Security Alert</h2>
       <p>Hi ${user.name}, you have successfully requested to log out of all active devices.</p>
       <p>All active authentication sessions associated with your account have been terminated.</p>`
    );
    return emailService.sendMail({ to: user.email, subject: 'Security Notice: All Sessions Terminated', html });
  },

  sendAccountDeletionEmail: async (user) => {
    const html = wrapHtmlLayout(
      'Account Deletion Confirmation',
      `<h2>Account Terminated</h2>
       <p>Hello,</p>
       <p>This is a confirmation that your StayMate account has been deleted permanently and all associated personal information scrubbed in accordance with GDPR regulations.</p>
       <p>We are sad to see you go! Thank you for using StayMate.</p>`
    );
    return emailService.sendMail({ to: user.email || 'user@staymate.com', subject: 'Account Deletion Confirmed', html });
  },

  sendEmailChangedEmail: async (user, oldEmail) => {
    const html = wrapHtmlLayout(
      'Email Address Changed Notification',
      `<h2>Security Alert</h2>
       <p>Hello ${user.name},</p>
       <p>The email address associated with your StayMate account was updated from <strong>${oldEmail}</strong> to <strong>${user.email}</strong>.</p>
       <p>If you did not authorize this change, contact our support team immediately.</p>`
    );
    return emailService.sendMail({ to: oldEmail, subject: 'Security Notice: Email Changed', html });
  }
};

export default emailService;
