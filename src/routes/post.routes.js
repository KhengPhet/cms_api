import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  increaseView,
} from "../controllers/post.controller.js";

const router = express.Router();
router.post("/", authMiddleware, upload.single("thumbnail"), createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, upload.single("thumbnail"), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/view", increaseView);

export default router;