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

export default transporter;
