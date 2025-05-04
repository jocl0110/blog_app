class AppError extends Error {
  constructor(message, statusCode, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error 🔥:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle specific error types
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "Invalid input data",
      error: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      status: "conflict",
      message: "This record already exists",
      field: err.field || "unknown",
    });
  }

  // Default error response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    field: err.field,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

export { AppError, errorHandler };
