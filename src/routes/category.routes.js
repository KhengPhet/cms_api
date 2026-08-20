import express from "express";
import { createCategory, deleteCategory, getById, getCategories, updateCategory } from "../controllers/category.controller.js";
import validateCategory from "../middleware/validateCategory.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/" , getCategories);
router.get("/:id" , getById);

router.post("/"  , authMiddleware, validateCategory, createCategory);
router.put("/:id" , authMiddleware, validateCategory, updateCategory);

router.delete("/:id" , authMiddleware, deleteCategory);

export default router;