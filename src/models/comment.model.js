import pool from "../config/db.js";

const CommentModel = {
  // GET ALL COMMENTS with user and post info
  async getAll() {
    try {
      const query = `
        SELECT 
          c.id,
          c.comment,
          c.status,
          c.created_at,
          u.id AS user_id,
          u.name AS author,
          u.thumbnail AS avatar,
          p.id AS post_id,
          p.title AS post_title,
          NULL as parent_id,
          'comment' as type
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        LEFT JOIN posts p ON c.post_id = p.id
        
        UNION ALL
        
        SELECT 
          r.id,
          r.reply as comment,
          'Approved' as status,
          r.created_at,
          u.id AS user_id,
          u.name AS author,
          u.thumbnail AS avatar,
          NULL as post_id,
          NULL as post_title,
          r.comment_id as parent_id,
          'reply' as type
        FROM replies r
        INNER JOIN users u ON r.user_id = u.id
        
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  },

  // GET COMMENTS BY POST with replies
  // async getByPost(post_id) {
  //   try {
  //     // Get all approved comments for the post
  //     const commentsQuery = `
  //       SELECT 
  //         c.id,
  //         c.comment,
  //         c.status,
  //         c.created_at,
  //         u.name AS author,
  //         u.thumbnail AS avatar,
  //         as parent_id,
  //         'comment' as type
  //       FROM comments c
  //       JOIN users u ON c.user_id = u.id
  //       WHERE c.post_id = $1 AND c.status = 'Approved'
  //       ORDER BY c.created_at DESC
  //     `;


  //     const commentsResult = await pool.query(commentsQuery, [post_id]);
  //     const comments = commentsResult.rows;

  //     // Get replies for these comments
  //     if (comments.length > 0) {
  //       const commentIds = comments.map(c => c.id);
  //       const repliesQuery = `
  //         SELECT 
  //           r.id,
  //           r.reply as comment,
  //           r.created_at,
  //           u.name AS author,
  //           u.thumbnail AS avatar,
  //           r.comment_id as parent_id,
  //           'reply' as type
  //         FROM replies r
  //         JOIN users u ON r.user_id = u.id
  //         WHERE r.comment_id = ANY($1::int[])
  //         ORDER BY r.created_at ASC
  //       `;

  //       const repliesResult = await pool.query(repliesQuery, [commentIds]);
  //       const replies = repliesResult.rows;

  //       // Attach replies to their parent comments
  //       comments.forEach(comment => {
  //         comment.replies = replies.filter(reply => reply.parent_id === comment.id);
  //       });
  //     }

  //     return comments;
  //   } catch (error) {
  //     console.error("Error in getByPost:", error);
  //     throw error;
  //   }
  // },
  // models/comment.model.js

  async getByPost(post_id) {
  try {
    // 1. get comments
    const commentsResult = await pool.query(
      `SELECT 
        c.id,
        c.comment,
        c.created_at,
        u.name AS author,
        u.thumbnail AS avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1 AND c.status = 'Approved'
      ORDER BY c.created_at DESC`,
      [post_id]
    );

    const comments = commentsResult.rows;

    // 2. get replies
    const repliesResult = await pool.query(
      `SELECT 
        r.id,
        r.reply AS comment,
        r.comment_id AS parent_id,
        r.created_at,
        u.name AS author,
        u.thumbnail AS avatar
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.comment_id IN (
        SELECT id FROM comments WHERE post_id = $1
      )
      ORDER BY r.created_at ASC`,
      [post_id]
    );

    const replies = repliesResult.rows;

    // 3. attach replies
    comments.forEach(comment => {
      comment.replies = replies.filter(
        r => r.parent_id === comment.id
      );
    });

    return comments;

  } catch (err) {
    console.error("🔥 ERROR getByPost:", err);
    throw err;
  }
},

  // async getByPost(post_id) {
  //   try {
  //     // Get all approved comments for the post (both top-level and replies)
  //     const result = await pool.query(
  //       `SELECT 
  //       c.id,
  //       c.comment,
  //       c.created_at,
  //       u.name AS author,
  //       u.thumbnail AS avatar
  //     FROM comments c
  //     JOIN users u ON c.user_id = u.id
  //     WHERE c.post_id = $1 AND c.status = 'Approved'
  //     ORDER BY COALESCE(c.parent_id, c.id), c.created_at ASC`,
  //       [post_id]
  //     );

  //     const allComments = result.rows;

  //     // Separate top-level comments and replies
  //     const topLevelComments = allComments.filter(c => !c.parent_id);
  //     const replies = allComments.filter(c => c.parent_id);

  //     // Attach replies to their parent comments
  //     topLevelComments.forEach(comment => {
  //       comment.replies = replies.filter(reply => reply.parent_id === comment.id);
  //     });

  //     return topLevelComments;
  //   } catch (err) {
  //     console.error("Error in getByPost:", err);
  //     throw err;
  //   }
  // },

  // CREATE NEW COMMENT (handles both comments and replies)
  async create({ comment, post_id, user_id, parent_id = null }) {
    try {
      console.log("Creating comment/reply with data:", { comment, post_id, user_id, parent_id });

      // If parent_id is provided, it's a reply
      if (parent_id) {
        console.log("Creating reply to comment:", parent_id);

        // First check if the parent comment exists
        const parentCheck = await pool.query(
          `SELECT id FROM comments WHERE id = $1`,
          [parent_id]
        );

        if (parentCheck.rows.length === 0) {
          throw new Error(`Parent comment with id ${parent_id} not found`);
        }

        console.log("Parent comment found, inserting reply...");

        // Insert into replies table
        const result = await pool.query(
          `INSERT INTO replies (reply, comment_id, user_id, created_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           RETURNING id, reply as comment, created_at`,
          [comment, parent_id, user_id]
        );

        console.log("Reply inserted, ID:", result.rows[0].id);

        // Get the created reply with user info
        const replyWithUser = await pool.query(
          `SELECT 
            r.id,
            r.reply as comment,
            r.created_at,
            u.name AS author,
            u.thumbnail AS avatar,
            r.comment_id as parent_id,
            'reply' as type
          FROM replies r
          JOIN users u ON r.user_id = u.id
          WHERE r.id = $1`,
          [result.rows[0].id]
        );

        return replyWithUser.rows[0];
      }
      // Otherwise, it's a top-level comment
      else {
        console.log("Creating top-level comment for post:", post_id);

        // Insert into comments table
        const result = await pool.query(
          `INSERT INTO comments (comment, post_id, user_id, status, created_at)
           VALUES ($1, $2, $3, 'Approved', CURRENT_TIMESTAMP)
           RETURNING id, comment, created_at`,
          [comment, post_id, user_id]
        );

        console.log("Comment inserted, ID:", result.rows[0].id);

        // Get the created comment with user info
        const commentWithUser = await pool.query(
          `SELECT 
            c.id,
            c.comment,
            c.status,
            c.created_at,
            u.name AS author,
            u.thumbnail AS avatar,
            NULL as parent_id,
            'comment' as type
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = $1`,
          [result.rows[0].id]
        );

        return commentWithUser.rows[0];
      }
    } catch (error) {
      console.error("Error in create method:", error);
      throw error;
    }
  },

  // async create({ comment, post_id, user_id, parent_id = null }) {
  //   try {
  //     console.log("Creating comment/reply with data:", { comment, post_id, user_id, parent_id });

  //     // Insert into comments table (same table for both comments and replies)
  //     const result = await pool.query(
  //       `INSERT INTO comments (comment, post_id, user_id, parent_id, status, created_at)
  //      VALUES ($1, $2, $3, $4, 'Approved', CURRENT_TIMESTAMP)
  //      RETURNING id, comment, created_at, parent_id`,
  //       [comment, post_id, user_id, parent_id]
  //     );

  //     console.log("Comment/Reply inserted, ID:", result.rows[0].id);

  //     // Get the created comment/reply with user info
  //     const commentWithUser = await pool.query(
  //       `SELECT 
  //       c.id,
  //       c.comment,
  //       c.status,
  //       c.created_at,
  //       c.parent_id,
  //       u.name AS author,
  //       u.thumbnail AS avatar
  //     FROM comments c
  //     JOIN users u ON c.user_id = u.id
  //     WHERE c.id = $1`,
  //       [result.rows[0].id]
  //     );

  //     return commentWithUser.rows[0];
  //   } catch (error) {
  //     console.error("Error in create method:", error);
  //     throw error;
  //   }
  // },

  // UPDATE COMMENT STATUS
  async updateStatus(id, status) {
    try {
      const query = `
        UPDATE comments 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateStatus:", error);
      throw error;
    }
  },

  // DELETE COMMENT (also deletes its replies)
  async delete(id) {
    try {
      // First delete replies associated with this comment
      await pool.query(`DELETE FROM replies WHERE comment_id = $1`, [id]);

      // Then delete the comment
      const query = `DELETE FROM comments WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  // DELETE REPLY
  async deleteReply(id) {
    try {
      const query = `DELETE FROM replies WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in deleteReply:", error);
      throw error;
    }
  },

  // GET COMMENT STATISTICS
  async getStats() {
    try {
      const commentsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'Approved') as approved,
          COUNT(*) FILTER (WHERE status = 'Pending') as pending,
          COUNT(*) FILTER (WHERE status = 'Spam') as spam,
          COUNT(*) as total
        FROM comments
      `;

      const commentsResult = await pool.query(commentsQuery);

      // Get reply count
      const repliesResult = await pool.query(`SELECT COUNT(*) as count FROM replies`);

      return {
        ...commentsResult.rows[0],
        replies: parseInt(repliesResult.rows[0].count)
      };
    } catch (error) {
      console.error("Error in getStats:", error);
      throw error;
    }
  },

  // APPROVE ALL PENDING COMMENTS
  async approveAll() {
    try {
      const query = `
        UPDATE comments 
        SET status = 'Approved', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'Pending'
        RETURNING id
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error in approveAll:", error);
      throw error;
    }
  }
};

export default CommentModel;