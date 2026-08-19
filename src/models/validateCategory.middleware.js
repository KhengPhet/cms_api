const validateCategory = (req, res, next) => {
    const { name, slug } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({
      message: "Slug must be lowercase and no special characters"
    });
  }

  next();
}

export default validateCategory;