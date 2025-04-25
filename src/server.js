import express from "express";
import "dotenv/config";

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Middlewares
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    title: "Blog App",
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running at port ${process.env.PORT}`)
);
