import CommentModel from "../models/comment.model.js";

// GET ALL COMMENTS
export const getComments = async (req, res) => {
  try {
    const data = await CommentModel.getAll();

    // Organize comments with their replies
    const comments = data.filter(item => !item.parent_id);
    const replies = data.filter(item => item.parent_id);

    // Attach replies to their parent comments
    comments.forEach(comment => {
      comment.replies = replies.filter(reply => reply.parent_id === comment.id);
    });

    res.status(200).json({
      success: true,
      data: comments,
      message: "Comments fetched successfully"
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message
    });
  }
};

// GET COMMENTS BY POST
// export const getCommentsByPost = async (req, res) => {
//   try {
//     const { post_id } = req.params;

//     if (!post_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Post ID is required"
//       });
//     }

//     const data = await CommentModel.getByPost(post_id);

//     const comments = data.filter(item => item.parent_id === null);
//     const replies = data.filter(item => item.parent_id !== null);

//     comments.forEach(comment => {
//       comment.replies = replies.filter(
//         reply => reply.parent_id === comment.id
//       );
//     });

//     res.json({
//       success: true,
//       data: comments,
//     });
//   } catch (err) {
//     console.error("Error in getCommentsByPost:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch comments",
//       error: err.message
//     });
//   }
// };
export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const data = await CommentModel.getByPost(postId);

    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};




// CREATE COMMENT (supports both comments and replies)
// export const createComment = async (req, res) => {
//   try {
//     const { comment, post_id, parent_id } = req.body;

//     console.log("Create comment request:", { comment, post_id, parent_id, user: req.user });

//     // Validate user authentication
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - Please login to comment",
//       });
//     }

//     // Validate input
//     if (!comment || !comment.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Comment text is required",
//       });
//     }

//     // For top-level comments, post_id is required
//     if (!parent_id && !post_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Post ID is required for comments",
//       });
//     }

//     // For replies, parent_id is required
//     if (parent_id && !parent_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Parent comment ID is required for replies",
//       });
//     }

//     // Create comment/reply
//     const newComment = await CommentModel.create({
//       comment: comment.trim(),
//       post_id: parent_id ? null : parseInt(post_id),
//       user_id: req.user.id,
//       parent_id: parent_id || null,
//     });

//     const message = parent_id
//       ? "Reply posted successfully"
//       : "Comment posted successfully (awaiting approval)";

//     res.status(201).json({
//       success: true,
//       data: newComment,
//       message: message
//     });
//   } catch (err) {
//     console.error("Error in createComment:", err);
//     console.error("Error stack:", err.stack);

//     res.status(500).json({
//       success: false,
//       message: err.message || "Failed to post comment",
//       error: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

export const createComment = async (req, res) => {
  try {
    const { comment, post_id, parent_id } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let newData;

    // 👉 REPLY
    if (parent_id) {
      newData = await CommentModel.create({
        comment,
        parent_id,
        user_id: req.user.id,
      });
    }
    // 👉 COMMENT
    else {
      newData = await CommentModel.create({
        comment,
        post_id,
        user_id: req.user.id,
      });
    }

    res.status(201).json({
      success: true,
      data: newData,
    });

  } catch (err) {
    console.error("🔥 CREATE ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE COMMENT STATUS
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required"
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Spam'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Pending, Approved, or Spam"
      });
    }

    const updatedComment = await CommentModel.updateStatus(id, status);

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedComment,
      message: `Comment ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment status",
      error: error.message
    });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'comment' or 'reply'

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required"
      });
    }

    let deletedItem;
    if (type === 'reply') {
      deletedItem = await CommentModel.deleteReply(id);
    } else {
      deletedItem = await CommentModel.delete(id);
    }

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `${type === 'reply' ? 'Reply' : 'Comment'} deleted successfully`
    });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete",
      error: error.message
    });
  }
};

// GET COMMENT STATISTICS
export const getCommentStats = async (req, res) => {
  try {
    const stats = await CommentModel.getStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: "Statistics fetched successfully"
    });
  } catch (error) {
    console.error("Error in getCommentStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};

// APPROVE ALL PENDING COMMENTS
export const approveAllComments = async (req, res) => {
  try {
    const approved = await CommentModel.approveAll();

    res.status(200).json({
      success: true,
      data: approved,
      message: `${approved.length} comments approved successfully`
    });
  } catch (error) {
    console.error("Error in approveAllComments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve comments",
      error: error.message
    });
  }
};