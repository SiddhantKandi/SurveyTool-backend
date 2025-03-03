//Error handler
const errorHandler = (err, req, res, next) => {
    // Default values if the error doesn't have them
    const statusCode = err.statusCode || 500;
    const data = err.data || null;
    const message = err.message || "Internal Server Error";
    const success = false; // Set to false for errors
    const error = err.error || []; // Default error is an empty array
    
    // Send JSON response with error details
    res.status(statusCode).json({
      success,
      data,
      message,
      error,
    });
  };
  
  export { errorHandler };
  