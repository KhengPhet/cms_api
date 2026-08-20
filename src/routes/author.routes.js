import express from "express";
import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/author.controller.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAuthors);
router.post("/", authMiddleware, upload.single("thumbnail"), createAuthor);
router.put("/:id", authMiddleware, upload.single("thumbnail"), updateAuthor);
router.delete("/:id", authMiddleware, deleteAuthor);

export default router;