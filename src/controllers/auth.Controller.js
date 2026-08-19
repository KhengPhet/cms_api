import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const thumbnail = req.file ? req.file.filename : null;
    const user = await createUser(
      name,
      email.toLowerCase(),
      hash,
      "author",
      thumbnail
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ 
      message: "Registration error", 
      error: err.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ 
      message: "Login error", 
      error: err.message 
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);
    res.status(500).json({ 
      message: "Error fetching user", 
      error: err.message 
    });
  }
};