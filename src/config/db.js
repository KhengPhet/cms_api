import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;
dotenv.config();

const conn = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "etec_cms",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123"
});

conn.query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch(err => console.log("DB Error:", err));

export default conn;