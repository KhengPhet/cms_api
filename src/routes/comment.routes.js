import express from "express";
import { 
    createComment, 
    deleteComment, 
    getComments, 
    getCommentsByPost,
    updateStatus,
    getCommentStats,
    approveAllComments
} from "../controllers/comments.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getComments);
router.get("/stats", getCommentStats);
router.get("/post/:postId", getCommentsByPost);

// Protected routes (require authentication)
router.post("/", authMiddleware, createComment);
router.put("/:id/status", authMiddleware, updateStatus);
router.delete("/:id", authMiddleware, deleteComment);
router.post("/approve-all", authMiddleware, approveAllComments);

export default router;