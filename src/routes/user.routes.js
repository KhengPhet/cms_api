import express from "express";
import auth from "../middleware/auth.middleware.js";
import { findUserById } from "../models/user.model.js";

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json(user);
});

export default router;