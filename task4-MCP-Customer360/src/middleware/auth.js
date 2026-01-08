
const API_KEYS = new Set([
  process.env.API_KEY || "demo-api-key-12345",
  "telco-agent-key-67890"
]);

function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ // 401 Unauthorized
      error: "Unauthorized",
      message: "API key is required. Provide it in X-API-Key header or apiKey query parameter."
    });
  }
  
  if (!API_KEYS.has(apiKey)) {
    return res.status(403).json({ // 403 Forbidden
      error: "Forbidden",
      message: "Invalid API key."
    });
  };
  
  next();
}

module.exports = { authenticateApiKey };
