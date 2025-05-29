import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.js";
import { registerLimiter } from "../middlewares/limiter.js";
import { uploadUserImage } from "../middlewares/upload.js";

const userRouter = Router();

// Registration
userRouter.post("/register", registerLimiter, UserController.registerUser);
userRouter.get("/verify/:token", UserController.verifyEmail);
userRouter.post("/resend-verification", UserController.resendVerification);
userRouter.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Password Reset Routes
userRouter.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    error: null,
  });
});
userRouter.post("/forgot-password", UserController.forgotPassword);
userRouter.get("/reset-password/:token", UserController.getResetPassword);
userRouter.post("/reset-password/:token", UserController.resetPassword);

// Login
userRouter.post("/login", UserController.loginUser);
userRouter.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Update User
userRouter.get("/profile", async (req, res) => {
  res.render("update-profile", {
    user: req.user,
  });
});
userRouter.put(
  "/profile",
  protect,
  uploadUserImage,
  UserController.updateProfile
);

userRouter.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", { error: null, user: req.user });
});
userRouter.post("/logout", protect, UserController.logoutUser);
export default userRouter;
