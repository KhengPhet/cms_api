import express from "express";
import auth from "../middleware/auth.middleware.js";
import { findUserById } from "../models/user.model.js";

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;