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

// Railway/Vercel run the app behind a reverse proxy — trust X-Forwarded-* headers
// so req.ip and express-rate-limit work correctly.
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0"; // bind all interfaces (required on Railway)

// CORS — parse comma-separated origins, allow Vercel/Railway/localhost
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [];

const allowedOrigins = [
  ...envOrigins,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://cms-frontend-tgji.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any *.vercel.app domain (preview deploys get unique subdomains)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);

    // Allow any *.up.railway.app domain
    if (/\.up\.railway\.app$/.test(origin)) return callback(null, true);

    // Allow configured origins (localhost, env overrides)
    if (allowedOrigins.includes(origin)) return callback(null, true);

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
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
// app.use("/api/posts", postRoutes);
console.log("Loading post routes...");
app.use("/api/posts", postRoutes);
console.log("Post routes loaded successfully");
app.use("/api/comments", commentRoutes);

// health check — test this first when debugging
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// root — quick browser check that the API is alive
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "etec_cms_api",
    endpoints: ["/health", "/api/posts", "/api/categories", "/api/authors"]
  });
});

// debug endpoint — shows DB connection status (remove in production if desired)
app.get("/api/debug", async (req, res) => {
  try {
    const conn = (await import("./config/db.js")).default;
    const result = await conn.query("SELECT COUNT(*) FROM posts");
    res.json({
      status: "ok",
      database: "connected",
      postsCount: parseInt(result.rows[0].count),
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
        CORS_ORIGIN: process.env.CORS_ORIGIN || "NOT SET (using defaults)",
        NODE_ENV: process.env.NODE_ENV || "NOT SET",
      }
    });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", error: err.message });
  }
});

// error handler
app.use(errorHandler);

// server — bind 0.0.0.0 so Railway's proxy can reach the app
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`CORS origins: ${allowedOrigins.join(", ")}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "SET (Railway)" : "NOT SET (using local vars)"}`);
});
