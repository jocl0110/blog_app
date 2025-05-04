import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.js";
import { registerLimiter } from "../middlewares/limiter.js";

const userRouter = Router();

// Registration
userRouter.post("/register", registerLimiter, UserController.registerUser);
userRouter.get("/verify/:token", UserController.verifyEmail);
userRouter.post("/resend-verification", UserController.resendVerification);
userRouter.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Login
userRouter.post("/login", UserController.loginUser);
userRouter.get("/login", (req, res) => {
  res.render("login", { error: null });
});

userRouter.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", { error: null, user: req.user });
});
userRouter.post("/logout", protect, UserController.logoutUser);
export default userRouter;
