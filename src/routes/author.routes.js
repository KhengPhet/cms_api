import express from "express";
import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/author.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAuthors);
router.post("/", upload.single("thumbnail"), createAuthor);
router.put("/:id", upload.single("thumbnail"), updateAuthor);
router.delete("/:id", deleteAuthor);

export default router;