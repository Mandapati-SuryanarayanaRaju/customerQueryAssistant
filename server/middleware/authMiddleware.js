const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure you load environment variables

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ FIXED: use .env variable
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden - Invalid or expired token' });
  }
};

module.exports = verifyToken;
