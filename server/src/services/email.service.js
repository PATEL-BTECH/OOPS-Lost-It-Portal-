/**
 * Email Notification Service with Nodemailer
 * Campus Lost & Found Portal
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailPass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  } else {
    // Development fallback mock transporter (logs email to console)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 [Mock Email Service Notification]');
        console.log(`   To: ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        console.log(`   Preview: ${mailOptions.text ? mailOptions.text.substring(0, 120) : 'HTML email'}`);
        return { messageId: `mock-${Date.now()}` };
      }
    };
  }

  return transporter;
};

/**
 * Send an email notification when a high-confidence smart match is found
 */
const sendMatchEmail = async ({ toEmail, recipientName, lostItemName, foundItemName, score, link }) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: `"GSFC University Lost & Found Portal" <${process.env.EMAIL_USER || 'no-reply@gsfcuniversity.ac.in'}>`,
      to: toEmail,
      subject: `🎯 Potential Match Found (${score}% Match): ${lostItemName}`,
      text: `Hello ${recipientName},\n\nA potential match (${score}% similarity) has been detected for your lost item "${lostItemName}" with a newly reported item "${foundItemName}".\n\nView details: ${config.clientUrl}${link}\n\nGSFC Campus Lost & Found Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background-color: #7c3aed; padding: 15px 20px; border-radius: 8px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0;">GSFC Campus Lost & Found</h2>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Smart Matching Alert</p>
          </div>
          <div style="padding: 20px 0;">
            <p>Hello <strong>${recipientName}</strong>,</p>
            <p>Our rule-based matching engine has discovered a potential match for your reported lost item!</p>
            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0 0 5px;"><strong>Your Lost Item:</strong> ${lostItemName}</p>
              <p style="margin: 0 0 5px;"><strong>Reported Found Item:</strong> ${foundItemName}</p>
              <p style="margin: 0; color: #6d28d9; font-weight: bold;">Similarity Score: ${score}% Match</p>
            </div>
            <p style="font-size: 13px; color: #64748b;">
              Note: This suggestion does not confirm ownership. Please review the item details and submit a claim with your proof of ownership.
            </p>
            <div style="text-align: center; margin-top: 25px;">
              <a href="${config.clientUrl}${link}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Inspect Potential Match
              </a>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            GSFC University Property Recovery System • Automatic System Notification
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.warn('[Email Warning] Failed to send match notification email:', error.message);
    return false;
  }
};

module.exports = {
  sendMatchEmail
};
