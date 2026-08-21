import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;
dotenv.config();

let conn;

if (process.env.DATABASE_URL) {
  // Railway / any PaaS — full connection string.
  // SSL is required by Railway but must be OFF for plain-local Postgres URLs.
  const isLocal = /@localhost[:/]|@127\.0\.0\.1[:/]|\@host\.docker\.internal/.test(process.env.DATABASE_URL);
  conn = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
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
