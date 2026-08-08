
export const errorHandler = (err,req,res,next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unique-index violation (e.g. two concurrent registrations, same email).
  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  // Mongoose schema validation, surfaced as a 400 rather than a 500.
  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export class AppError extends Error {
    statusCode;
    isOperational;
  
    constructor(message, statusCode = 500, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
      super(message, 404);
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message = "Conflict occurred") {
      super(message, 409);
    }
  }
  
  export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
      super(message, 400);
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
      super(message, 401);
    }
  }