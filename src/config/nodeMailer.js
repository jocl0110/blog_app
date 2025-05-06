import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendVerificationEmail = async (userEmail, verificationToken) => {
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify/${verificationToken}`;

  const emailTemplate = {
    from: '"Blog App" <noreply@blogapp.com>',
    to: userEmail,
    subject: "Please verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify your email address</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(emailTemplate);
  } catch (error) {
    console.error("Verification email error:", error);
    throw error;
  }
};
export const sendResetPasswordEmail = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.APP_URL}/api/auth/reset-password/${resetToken}`;

  const emailTemplate = {
    from: '"Blog App" <noreply@blogapp.com>',
    to: userEmail,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} Blog App. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(emailTemplate);
  } catch (error) {
    console.error("Reset password email error", error);
    throw error;
  }
};

export default transporter;
