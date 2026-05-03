const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER_EMAIL,
    pass: process.env.EMAIL_SENDER_APP_PASS,
  },
});

const sendInviteEmail = async (email, workspaceName, inviteLink) => {
  const mailOptions = {
    from: '"TeamHub" <no-reply@teamhub.com>',
    to: email,
    subject: `You've been invited to join ${workspaceName} on TeamHub`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
        <h2 style="color: #1e1b4b;">Welcome to TeamHub!</h2>
        <p>You've been invited to collaborate on <strong>${workspaceName}</strong>.</p>
        <p>Click the button below to accept the invitation and get started:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Accept Invitation</a>
        <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendInviteEmail,
};
