const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("You are not authorized");
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret");
      req.user = decoded;
      
      next();
    } catch (error) {
      res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = auth;
