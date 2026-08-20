import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;
dotenv.config();

let conn;

if (process.env.DATABASE_URL) {
  // Railway / any PaaS — full connection string with SSL
  conn = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Local development — individual env vars
  conn = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || process.env.DB_NAME || "etec_cms",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123"
  });
}

conn.query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch(err => console.error("DB Error:", err));

export default conn;
