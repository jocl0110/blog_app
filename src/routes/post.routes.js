import { Router } from "express";
import PostController from "../controllers/post.controller.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
const postRouter = Router();

postRouter.get("/", PostController.getAllPosts);

//! Create a Post
// Get From
postRouter.get(
  "/create",
  protect,
  upload.array("imageFiles[]"),
  PostController.getCreatePost
);
// Create Post route
postRouter.post("/create", protect, PostController.createPost);
postRouter.put("/:id", PostController.updatePost);
postRouter.delete("/:id", PostController.deletePost);

export default postRouter;
