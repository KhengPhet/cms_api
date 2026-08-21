import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();

const conn = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// Test connection
conn.connect()
.then(async client => {

    console.log("Database connected");


    const result = await client.query(`
        SELECT 
            current_database() AS database,
            current_schema() AS schema
    `);


    console.log("DATABASE INFO:", result.rows[0]);


    // check posts table
    const table = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema='public'
            AND table_name='posts'
        );
    `);


    console.log(
        "POSTS TABLE EXISTS:",
        table.rows[0].exists
    );


    client.release();

})
.catch(err => {
    console.error(
        "Database Error:",
        err.message
    );
});


export default conn;