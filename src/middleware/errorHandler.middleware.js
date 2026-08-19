const errorHandler = (req, res, next) => {
    console.error("ERROR:", err.message);

    res.status(500).json({
        message: "Internal Server Error",
        error: err.message
    });
}

export default errorHandler;