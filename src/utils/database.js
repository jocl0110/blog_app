import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Flexing2133",
  database: process.env.DB_NAME || "blog_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
// Test database connection
