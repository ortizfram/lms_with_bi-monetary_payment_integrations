const express = require("express");
const mongoose = require("mongoose");
const user_router = require("./routes/user-routes.js");
const course_router = require("./routes/course-routes.js");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT;
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

//!MIDDLEWARE
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));


//! routes
app.use("/api", user_router);
app.use("/api", course_router);


//! Connect
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(port);
    console.log("DB connected and listening to port " + port);
  })
  .catch((err) => {
    console.log(err);
  });
