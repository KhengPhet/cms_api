import { readFileSync } from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env or Railway Variables.");
  process.exit(1);
}

const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);

const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

const files = [
  "database/migrations/001_create_tables.sql",
  "database/seeds/001_seed_data.sql",
];

for (const file of files) {
  const sql = readFileSync(path.join(process.cwd(), file), "utf8");
  try {
    await pool.query(sql);
    console.log(`OK      ${file}`);
  } catch (err) {
    console.error(`FAILED  ${file}: ${err.message}`);
    process.exitCode = 1;
  }
}

await pool.end();
console.log(process.exitCode ? "Migration finished with errors." : "Migration complete.");
