/**
 * Request logging middleware
 */
export const logger = (req, res, next) => {
  const start = Date.now();
  
  // Generate request ID for tracking
  req.requestId = generateRequestId();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    user: req.user?.uid
  });

  // Log response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    console.log(`[${new Date().toISOString()}] Response sent`, {
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.uid
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}