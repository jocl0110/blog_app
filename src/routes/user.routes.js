import { Router } from "express";

const userRouter = Router();

userRouter.get("/register", (req, res) => {
  res.render("register", {
    title: "Blog App/Register",
  });
});

export default userRouter;
