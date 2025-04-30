import pool from "../utils/database.js";

class UserController {
  constructor() {}
  static registerUser = async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        first_name,
        last_name,
        profile_image,
      } = req.body;
      const userProfileImage =
        profile_image ||
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

      const [result] = await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, profile_image) VALUES(?, ?, ?, ?, ?, ?)`,
        [username, email, password, first_name, last_name, userProfileImage]
      );
      res.status(200).json({
        success: true,
        message: "Hello From Register User",
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
  static getAllUsers = async (req, res) => {
    const [users] = await pool.query(`SELECT * FROM users`);
    res.render("dashboard", {
      users: users,
    });
  };
}

export default UserController;
