import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/register", UserController.registerUser);
userRouter.get("/dashboard", UserController.getAllUsers);

export default userRouter;
