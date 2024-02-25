const express = require("express");
const { signup, login, verifyToken, getUser, refreshToken, logout } = require("../controllers/user-controller");

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.get("/user", verifyToken, getUser) //next middleware
//! verify token
//* to keep user logged in after 30s as well
//! refresh token
router.get("/refresh", refreshToken, verifyToken, getUser)
router.post("/logout", verifyToken, logout)

module.exports = router;
