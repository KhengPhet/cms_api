import pool from "../config/db.js";

// CREATE USER
export const createUser = async (name, email, password, role, thumbnail) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, thumbnail)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, thumbnail, created_at`,
    [name, email, password, role, thumbnail || null]
  );

  return result.rows[0];
};

// FIND BY EMAIL
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  return result.rows[0];
};

// FIND BY ID
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, thumbnail, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// UPDATE THUMBNAIL
export const updateUserThumbnail = async (id, thumbnail) => {
  const result = await pool.query(
    `UPDATE users
     SET thumbnail = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, thumbnail`,
    [thumbnail, id]
  );

  return result.rows[0];
};