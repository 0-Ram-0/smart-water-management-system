const jwt = require('jsonwebtoken');

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// User Roles
const ROLES = {
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  CITIZEN: 'citizen'
};

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role 
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRE 
    }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.query.token || 
                req.body.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Access denied.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.user = decoded;
  next();
};

// Middleware to check role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  ROLES,
  generateToken,
  verifyToken,
  authenticate,
  authorize
};
