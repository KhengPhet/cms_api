import express from "express";
import { createCategory, deleteCategory, getById, getCategories, updateCategory } from "../controllers/category.controller.js";
// import validateCategory from "../middleware/validateCategory.middleware.js";

const router = express.Router();

router.get("/" , getCategories);
router.get("/:id" , getById);

router.post("/"  , createCategory);
router.post("/:id" , updateCategory);

router.delete("/:id" , deleteCategory);

export default router;