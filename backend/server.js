const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/user-routes.js");
const cookieParser = require("cookie-parser")
const cors= require("cors")
const port = process.env.PORT;
const app = express();
app.use(cors({credentials:true, origin:"http://localhost:3000"}))
app.use(cookieParser())
app.use(express.json());
app.use("/api", router);
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(port);
    console.log("DB connected and listening to port " + port);
  })
  .catch((err) => {
    console.log(err);
  });
