const { verifyToken, refreshToken, getUser } = require("../controllers/user-controller");

// Middleware for verifying token and refreshing if necessary
const authMiddleware = (req, res, next) => {
  // Verify token
  verifyToken(req, res, () => {
    // If token is valid, move to the next middleware
    // If token is expired, refresh token
    refreshToken(req, res, () => {
      // If token is successfully refreshed, move to the next middleware
      // Retrieve user information
      getUser(req, res, () => {
        // If user information is retrieved successfully, move to the next middleware
        next();
      });
    });
  });
};

module.exports = authMiddleware;
