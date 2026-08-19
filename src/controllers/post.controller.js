import Post from "../models/post.model.js";

// CREATE
export const createPost = async (req, res) => {
  try {
    let thumbnail = null;
    if (req.file) {
      thumbnail = `/uploads/posts/${req.file.filename}`;
    }

    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    let tags = [];
    try {
      tags = typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags || [];
    } catch {
      tags = [];
    }

    const post = await Post.create({
      title: req.body.title,
      slug,
      body: req.body.body,
      excerpt: req.body.excerpt,
      status: req.body.status || "Draft",
      category_id: req.body.category_id,
      type: req.body.type,
      user_id: req.user?.id,
      thumbnail,
      tags,
    });

    res.json({ success: true, post });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ALL
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.getAll();

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      body: p.body,
      excerpt: p.excerpt,
      status: p.status,
      category_id: p.category_id,
      type: p.type,
      category: p.category_name || "Uncategorized",
      author: p.author_name || "Unknown",
      author_thumbnail: p.author_thumbnail,
      thumbnail: p.thumbnail,
      tags: p.tags || [],
      views: p.views || 0,
      comment_count: p.comment_count || 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    res.json({ 
      success: true, 
      posts: formatted,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET BY ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.getById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({ success: true, post });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE
export const updatePost = async (req, res) => {
  try {
    let thumbnail = req.body.thumbnail;
    if (req.file) {
      thumbnail = `/uploads/posts/${req.file.filename}`;
    }

    let tags = [];
    try {
      tags = typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags || [];
    } catch {
      tags = [];
    }

    const updated = await Post.update(req.params.id, {
      title: req.body.title,
      slug: req.body.slug,
      body: req.body.body,
      excerpt: req.body.excerpt,
      status: req.body.status,
      category_id: req.body.category_id,
      type: req.body.type,
      thumbnail,
      tags,
    });

    res.json({ success: true, post: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
// DELETE
export const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// INCREASE VIEW
export const increaseView = async (req, res) => {
  try {
    const post = await Post.increaseView(req.params.id);

    res.json({
      success: true,
      views: post.views
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  