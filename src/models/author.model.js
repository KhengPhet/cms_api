import conn from "../config/db.js";

const Author = {
  async getAll() {
    const result = await conn.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.thumbnail,
        a.biography,
        u.post_count AS posts,
        u.created_at
      FROM users u
      LEFT JOIN authors a ON u.id = a.user_id
    `);

    return result.rows;
  },

  async getById(id) {
    const result = await conn.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.thumbnail,
        a.biography,
        u.post_count AS posts,
        u.created_at
      FROM users u
      LEFT JOIN authors a ON u.id = a.user_id
      WHERE u.id = $1
      `,
      [id]
    );

    return result.rows[0];
  },

  async getByEmail(email) {
    const result = await conn.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },

  // async upsert(user_id, biography) {
  //   const check = await conn.query(
  //     "SELECT * FROM authors WHERE user_id = $1",
  //     [user_id]
  //   );

  //   if (check.rows.length === 0) {
  //     const result = await conn.query(
  //       `INSERT INTO authors (user_id, biography)
  //      VALUES ($1, $2)
  //      RETURNING *`,
  //       [user_id, biography]
  //     );
  //     return result.rows[0];
  //   } else {
  //     const result = await conn.query(
  //       `UPDATE authors
  //      SET biography = $1
  //      WHERE user_id = $2
  //      RETURNING *`,
  //       [biography, user_id]
  //     );
  //     return result.rows[0];
  //   }
  // },

  async upsert(user_id, biography) {
    const result = await conn.query(
      `
    INSERT INTO authors (user_id, biography)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET biography = EXCLUDED.biography
    RETURNING *
    `,
      [user_id, biography]
    );

    return result.rows[0];
  },
  async delete(user_id) {
    await conn.query("DELETE FROM authors WHERE user_id = $1", [user_id]);
    await conn.query("DELETE FROM users WHERE id = $1", [user_id]);
  },
};

export default Author;