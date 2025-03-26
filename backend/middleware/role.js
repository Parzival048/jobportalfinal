// middleware/role.js
module.exports = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.role || !allowedRoles.includes(req.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };
  