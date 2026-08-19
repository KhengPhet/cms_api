import { create, getAll, remove, update, getById as getByIdModel } from "../models/category.model.js";

// get all
export const getCategories = async (req, res, next) => {
    try {
        const data = await getAll();
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// get one
export const getById = async (req, res, next) => {
    try {
        const data = await getByIdModel(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(data);
    } catch (error) {
        next(error);
    }
};

// create
export const createCategory = async (req, res, next) => {
    try {
        const data = await create(req.body);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// update
export const updateCategory = async (req, res, next) => {
    try {
        const data = await update(req.params.id, req.body);

        if (!data) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(data);
    } catch (error) {
        next(error);
    }
};

// delete
export const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({
      message: "Deleted successfully",
      data: deleted
    });

  } catch (error) {
    next(error);
  }
};