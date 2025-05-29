import { AppError } from "../middlewares/errorHandler.js";
import pool from "../utils/database.js";

class PostController {
  constructor() {}
  static getAllPosts = async (req, res, next) => {
    try {
      const [posts] = await pool.query(`SELECT * FROM posts`);

      res.render("posts", {
        posts,
        user: req.user,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  static getCreatePost = (req, res) => {
    res.render("create-post", {
      user: req.user,
      error: null,
    });
  };
  static createPost = async (req, res, next) => {
    try {
      const { title, content, post_images } = req.body;
      const uploadedFiles = req.files;

      // Combine URLS and uploaded files
      const images = [];

      // Add URLs
      if (imageUrls && Array.isArray(imageUrls)) {
        images.push(...imageUrls);
      }

      // Add uploaded file paths
      if (uploadedFiles && Array.isArray(uploadedFiles)) {
        const filePaths = uploadedFiles.map(
          (file) => `/uploads/posts/${file.filename}`
        );
        images.push(...filePaths);
      }

      // Validate total number of Images
      if (images.length > 5) {
        throw new AppError("Maximum 5 images allowed", 400, "images");
      }

      const [post] = await pool.query(
        `INSERT INTO posts(user_id, title, content, post_images VALUES(? , ? , ? ,?)`,
        [req.user.id, title, content, JSON.stringify(images)]
      );

      res.status(201).json({
        success: true,
        message: "Post Created successfully",
        postId: post.insertId,
      });
    } catch (error) {
      next(error);
    }
  };
  static updatePost = async (req, res, next) => {
    try {
      const { id } = req.params;
      res.status(200).json({
        success: true,
        message: `Updating post ${id}`,
      });
    } catch (error) {
      next(error);
    }
  };
  static deletePost = async (req, res, next) => {
    try {
      const { id } = req.params;
      res.status(200).json({
        success: true,
        message: `Deleting  post ${id}`,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PostController;
