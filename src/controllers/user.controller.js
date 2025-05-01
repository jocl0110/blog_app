import {
  userLoginSchema,
  userRegistrationSchema,
} from "../schemas/user.schema.js";
import { hashPassword } from "../utils/bcrypt.js";
import pool from "../utils/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class UserController {
  constructor() {}
  static registerUser = async (req, res) => {
    try {
      // Validate data
      const validatedData = userRegistrationSchema.parse(req.body);

      console.log(validatedData);

      // Hash Password
      const password_hash = await hashPassword(validatedData.password);
      const defaultImage = "/images/default.png";
      const sql = `INSERT INTO users(username, email, password, first_name, last_name, profile_image) VALUES(?, ?, ?, ?, ?, ?)`;
      const values = [
        validatedData.username,
        validatedData.email,
        password_hash,
        validatedData.first_name,
        validatedData.last_name,
        validatedData.profile_image || defaultImage,
      ];

      const [rows] = await pool.query(sql, values);
      console.log(rows);

      // Send Email

      res.status(201).json({
        success: true,
        message: "New User Created Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error Registering user",
        error: error.message,
      });
    }
  };
  static loginUser = async (req, res) => {
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
      console.error("Login error", error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
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
      res.status(200).json({
        success: true,
        message: "logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging out",
        error: error.message,
      });
    }
  };
}

export default UserController;
