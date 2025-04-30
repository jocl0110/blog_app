import express from "express";
import "dotenv/config";
import pool from "./utils/database.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Static files
app.use(express.static("src/public"));

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    title: "Blog App",
  });
});
app.use("/api/auth", userRouter);

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
