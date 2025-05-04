import express from "express";
import "dotenv/config";
import pool from "./utils/database.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Static files
app.use(express.static("src/public"));

// Middlewares
app.use(cookieParser());
app.use(checkAuth);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    title: "Blog App",
    user: req.user,
  });
});
app.use("/api/auth", userRouter);
app.use("/api/posts", postRouter);
app.use(errorHandler);

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

app.listen(process.env.PORT, () =>
  console.log(`Server running at port ${process.env.PORT}`)
);
