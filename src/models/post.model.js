import conn from "../config/db.js";

const Post = {
  // CREATE
  async create(data) {
    const client = await conn.connect();
    try {
      await client.query("BEGIN");

      const {
        title,
        slug,
        body,
        excerpt,
        status,
        category_id,
        type,
        user_id,
        thumbnail,
        tags = [],
      } = data;

      const result = await client.query(
        `INSERT INTO posts
        (title, slug, body, excerpt, status, category_id, type, user_id, thumbnail)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [title, slug, body, excerpt, status, category_id, type, user_id, thumbnail]
      );

      const post = result.rows[0];

      // TAGS
      for (const tagName of tags) {
        const tagRes = await client.query(
          `INSERT INTO tags (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
           RETURNING id`,
          [tagName.toLowerCase()]
        );

        const tagId = tagRes.rows[0].id;

        await client.query(
          `INSERT INTO post_tags (post_id, tag_id)
           VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          [post.id, tagId]
        );
      }

      await client.query("COMMIT");
      return post;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // GET ALL (with comment count, admin - all statuses)
  async getAll() {
    const result = await conn.query(
      `SELECT 
        p.*,
        u.name AS author_name,
        u.thumbnail AS author_thumbnail,
        c.name AS category_name,
        (
        SELECT COUNT(*) 
        FROM comments cm
        WHERE cm.post_id = p.id AND cm.status = 'Approved'
      )
      +
      (
        SELECT COUNT(*) 
        FROM replies r
        WHERE r.comment_id IN (
          SELECT id FROM comments WHERE post_id = p.id
        )
      ) AS comment_count,
        COALESCE(
          (SELECT json_agg(t.name)
           FROM post_tags pt
           JOIN tags t ON pt.tag_id = t.id
           WHERE pt.post_id = p.id),
          '[]'::json
        ) AS tags

      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC`
    );

    return result.rows;
  },

  // GET PUBLISHED ONLY (public-facing)
  async getPublished() {
    const result = await conn.query(
      `SELECT 
        p.*,
        u.name AS author_name,
        u.thumbnail AS author_thumbnail,
        c.name AS category_name,
        (
        SELECT COUNT(*) 
        FROM comments cm
        WHERE cm.post_id = p.id AND cm.status = 'Approved'
      )
      +
      (
        SELECT COUNT(*) 
        FROM replies r
        WHERE r.comment_id IN (
          SELECT id FROM comments WHERE post_id = p.id
        )
      ) AS comment_count,
        COALESCE(
          (SELECT json_agg(t.name)
           FROM post_tags pt
           JOIN tags t ON pt.tag_id = t.id
           WHERE pt.post_id = p.id),
          '[]'::json
        ) AS tags

      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'Published'
      ORDER BY p.id DESC`
    );

    return result.rows;
  },

  // GET BY ID
  async getById(id) {
    const result = await conn.query(
      `SELECT 
        p.*,
        u.name AS author_name,
        u.thumbnail AS author_thumbnail,
        c.name AS category_name,
        (
          SELECT COUNT(*) 
          FROM comments cm
          WHERE cm.post_id = p.id AND cm.status = 'Approved'
        )
        +
        (
          SELECT COUNT(*) 
          FROM replies r
          WHERE r.comment_id IN (
            SELECT id FROM comments WHERE post_id = p.id
          )
        ) AS comment_count,

        COALESCE(
          (SELECT json_agg(t.name)
           FROM post_tags pt
           JOIN tags t ON pt.tag_id = t.id
           WHERE pt.post_id = p.id),
          '[]'::json
        ) AS tags

      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    );

    if (!result.rows.length) return null;

    const post = result.rows[0];

    return {
      ...post,
      author: post.author_name,
      category: post.category_name || "Uncategorized",
      tags: post.tags || [],
    };
  },

  // UPDATE
  async update(id, data) {
    const client = await conn.connect();
    try {
      await client.query("BEGIN");

      const {
        title,
        slug,
        body,
        excerpt,
        status,
        category_id,
        type,
        thumbnail,
        tags = [],
      } = data;

      const result = await client.query(
        `UPDATE posts SET
          title=$1,
          slug=$2,
          body=$3,
          excerpt=$4,
          status=$5,
          category_id=$6,
          type=$7,
          thumbnail=$8,
          updated_at=NOW()
        WHERE id=$9 RETURNING *`,
        [title, slug, body, excerpt, status, category_id, type, thumbnail, id]
      );

      // reset tags
      await client.query(`DELETE FROM post_tags WHERE post_id=$1`, [id]);

      for (const tagName of tags) {
        const tagRes = await client.query(
          `INSERT INTO tags (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
           RETURNING id`,
          [tagName.toLowerCase()]
        );

        const tagId = tagRes.rows[0].id;

        await client.query(
          `INSERT INTO post_tags (post_id, tag_id)
           VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          [id, tagId]
        );
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // DELETE
  async delete(id) {
    await conn.query(`DELETE FROM posts WHERE id=$1`, [id]);
    return true;
  },

  // ✅ INCREASE VIEW
  async increaseView(id) {
    const result = await conn.query(
      `UPDATE posts 
       SET views = views + 1 
       WHERE id = $1 
       RETURNING views`,
      [id]
    );

    return result.rows[0];
  },
};

export default Post;