/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
};

/**
 * Centralized API Error Handler
 * Standardizes errors as { "error": "message" }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';

  // Handle Mongoose Bad ObjectId (CastError) -> 404 per AGENTS.md rule 6
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum allowed size (5 MB)';
    }
  }

  if (statusCode === 500) {
    console.error(`[Error] 500 on ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({ error: message });
};

module.exports = {
  notFound,
  errorHandler,
};
