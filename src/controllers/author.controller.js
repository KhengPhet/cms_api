import Author from "../models/author.model.js";
import { createUser, updateUserThumbnail } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getAuthors = async (req, res) => {
  try {
    const data = await Author.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAuthor = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await Author.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ role must match DB
    const validRole = role?.toLowerCase() || "author";

    const user = await createUser(
      name,
      email,
      hashedPassword,
      validRole,
      null
    );

    // ✅ create author row
    await Author.upsert(user.id, "");

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    const id = req.params.id;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const biography = req.body.biography || "";

    // ✅ ALWAYS upsert biography
    await Author.upsert(id, biography);

    // ✅ thumbnail
    if (req.file) {
      await updateUserThumbnail(id, req.file.filename);
    }

    res.json({
      success: true,
      message: "Author updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    await Author.delete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};