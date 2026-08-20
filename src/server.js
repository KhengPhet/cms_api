import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import category from "./routes/category.routes.js";
import authorRoutes from "./routes/author.routes.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

import path from "path";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// upload image
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// router
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", category);
app.use("/api/authors", authorRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// error handler
app.use(errorHandler);

// server
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
