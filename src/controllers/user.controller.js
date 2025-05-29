import { AppError } from "../middlewares/errorHandler.js";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../schemas/user.schema.js";
import { hashPassword } from "../utils/bcrypt.js";
import pool from "../utils/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateVerificationToken } from "../utils/emailVerification.js";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../config/nodeMailer.js";

class UserController {
  constructor() {}
  static registerUser = async (req, res) => {
    try {
      // Sanitize and validate  input data
      const validatedData = {
        ...userRegistrationSchema.parse(req.body),
        username: req.body.username.toLowerCase().trim(),
        email: req.body.email.toLowerCase().trim(),
      };

      // Check if the user already exists
      const [existingUser] = await pool.query(
        `SELECT username, email FROM users WHERE username = ? OR email = ?`,
        [validatedData.username, validatedData.email]
      );

      if (existingUser.length > 0) {
        throw new AppError(
          existingUser[0].email.toLowerCase() === validatedData.email
            ? "This email is already registered"
            : "This username is already taken",
          409,
          existingUser[0].email.toLowerCase() === validatedData.email
            ? "email"
            : "username"
        );
      }

      // Hash Password
      const password_hash = await hashPassword(validatedData.password);
      const defaultImage = "/images/default.png";

      const verificationToken = generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

      // Start Transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      try {
        const sql = `INSERT INTO users(username, email, password, first_name, last_name, profile_image, verification_token, verification_expires) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
          validatedData.username,
          validatedData.email,
          password_hash,
          validatedData.first_name,
          validatedData.last_name,
          validatedData.profile_image || defaultImage,
          verificationToken,
          verificationExpires,
        ];
        const [result] = await pool.query(sql, values);

        // Send Verification Email
        await sendVerificationEmail(validatedData.email, verificationToken);
        await connection.commit();

        res.status(201).json({
          success: true,
          message:
            "Registration Successful! Please check your email to verify your account",
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Registration error", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  };
  static verifyEmail = async (req, res, next) => {
    try {
      const { token } = req.params;

      const [user] = await pool.query(
        `SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()`,
        [token]
      );
      if (!user.length) {
        throw new AppError(
          "Invalid or expired verification token",
          400,
          "token"
        );
      }
      await pool.query(
        `UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id =?`,
        [user[0].id]
      );
      res.render("verification-success", {
        message: "Email verified successfully! You can now log in",
      });
    } catch (error) {
      next(error);
    }
  };
  static resendVerification = async (req, res, next) => {
    try {
      const { email } = req.body;

      const [user] = await pool.query(
        `SELECT * FROM users WHERE email = ? AND email_verified = FALSE`,
        [email]
      );
      if (!user.length) {
        throw new AppError("User not found or already verified", 400, "email");
      }

      const verificationToken = generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await pool.query(
        "UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?",
        [verificationToken, verificationExpires, user[0].id]
      );
      await sendVerificationEmail(email, verificationToken);

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      // Check if user exists

      const [user] = await pool.query(`SELECT * FROM users WHERE email =? `, [
        email,
      ]);

      if (!user.length) {
        throw new AppError(
          "If a user with this email exists, they will receive password reset instructions",
          404,
          "email"
        );
      }
      // Generate reset token
      const resetToken = generateVerificationToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await pool.query(
        `UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?`,
        [resetToken, resetExpires, user[0].id]
      );

      // Send reset email
      await sendResetPasswordEmail(email, resetToken);

      res.status(200).json({
        success: true,
        message:
          "If a user with this email exists, they will receive password reset instructions",
      });
    } catch (error) {
      next(error);
    }
  };
  static getResetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;

      const [user] = await pool.query(
        `SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()`,
        [token]
      );

      if (!user.length) {
        throw new AppError("Invalid or expired reset token", 400, "token");
      }

      res.render("reset-password", { token, error: null });
    } catch (error) {
      next(error);
    }
  };
  static resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        throw new AppError("Password do not match", 400, "password");
      }

      const [user] = await pool.query(
        `SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()`,
        [token]
      );

      if (!user.length) {
        throw new AppError("Invalid or expired token", 400, "token");
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Update password and clear reset token
      await pool.query(
        `UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?`,
        [hashedPassword, user[0].id]
      );

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  static loginUser = async (req, res, next) => {
    try {
      // Validate login data
      const validatedData = userLoginSchema.parse(req.body);

      // Check if user exists
      const [rows] = await pool.query(
        `SELECT * FROM users WHERE username = ?`,
        [validatedData.username]
      );

      const user = rows[0];
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Invalid Credentials",
        });
        return;
      }
      // Check If user is verified
      if (!user.email_verified) {
        throw new AppError(
          "Please verify your email before logging in",
          401,
          "email"
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(404).json({
          success: false,
          message: "Invalid Credentials",
        });
        return;
      }

      // Create JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      };

      // Set JWT in cookie
      res.cookie("token", token, cookieOptions);

      res.render("dashboard", {
        user,
      });
    } catch (error) {
      next(error);
    }
  };
  static logoutUser = async (req, res) => {
    try {
      // Clear the token cookie
      res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
      });
      res.render("login", { error: null });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging out",
        error: error.message,
      });
    }
  };

  // Update profile
  static updateProfile = async (req, res, next) => {};
}

export default UserController;
