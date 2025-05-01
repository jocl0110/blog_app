import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);
userRouter.get("/login", (req, res) => {
  res.render("login", { error: null });
});
userRouter.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", { error: null, user: req.user });
});
userRouter.post("/logout", protect, UserController.logoutUser);
export default userRouter;
