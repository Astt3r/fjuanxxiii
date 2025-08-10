// Middleware para logging de requests
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Interceptar la respuesta para loggear el status
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
};

module.exports = logger;
