const express = require("express");
const multer = require("multer");
const path = require("path");
const { create_course } = require("../controllers/courses-controller");
const { verifyToken } = require("../controllers/user-controller");


const router = express.Router();

//? multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.mimetype.startsWith("video") ? "videos" : "imgs";
    cb(null, path.join(__dirname, "src", "uploads", uploadPath));
  },
  filename: function (req, file, cb) {
    const prefix = file.mimetype.startsWith("video") ? "video" : "image";
    cb(null, prefix + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

//! routes

// course create
router.post(
  "/course/create",
  verifyToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  create_course
);

module.exports = router;
