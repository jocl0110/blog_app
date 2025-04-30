const errorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Unexpected Server Error",
    error: err.message,
  });
};
