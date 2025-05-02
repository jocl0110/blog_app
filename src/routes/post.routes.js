import { Router } from "express";
import pool from "../utils/database.js";

const postRouter = Router();

postRouter.get("", async (req, res) => {
  const [posts] = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC"
  );

  const formattedPosts = posts.map((post) => {
    let images = [];
    if (post.post_images) {
      try {
        // If it's a string, try to parse it as JSON
        images =
          typeof post.post_images === "string"
            ? JSON.parse(post.post_images)
            : post.post_images;

        // Ensure images is always an array
        images = Array.isArray(images) ? images : [images];
      } catch (error) {
        console.error("Error parsing post images:", error);
        images = [post.post_images]; // Fallback to single image
      }
    }

    return {
      ...post,
      post_images: images,
    };
  });
  console.log("Formatted posts:", JSON.stringify(formattedPosts, null, 2));
  res.render("posts", {
    posts: formattedPosts || [],
    user: req.user,
  });
});

export default postRouter;
