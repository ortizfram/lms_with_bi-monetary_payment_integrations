const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../utils/sendEmail");

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
  }
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists! Login Instead" });
  }

  //   encrypt password
  const hashedPass = bcrypt.hashSync(password);

  const adminEmails = [
    "ortizfranco48@gmail.com",
    "mg.marcela@hotmail.com",
    "buonavibraclub@gmail.com",
    "marzettimarcela@gmail.com",
  ];

  const isAdmin = adminEmails.includes(email);

  const user = new User({
    name,
    email,
    password: hashedPass,
    isAdmin,
  });

  try {
    await user.save(); //mongoose save doc
  } catch (err) {
    console.log(err);
  }

  return res.status(201).json({ message: user });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return new Error(err);
  }

  if (!existingUser) {
    return res.status(400).json({ message: "User not found. Signup Please" });
  }
  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid Email /Password" });
  }

  //   generate token
  const token = await jwt.sign(
    { id: existingUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "35s" }
  );

  console.log("Generated TOKEN\n", token);

  // check if cookie already exists
  if (req.cookies[`${existingUser._id}`]) {
    req.cookies[`${existingUser._id}`] = ""; //clear
  }

  // send token to cookie: cookie name: cookie val
  res.cookie(String(existingUser._id), token, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30),
    httpOnly: true, //security
    sameSite: "lax", //security
  });

  return res
    .status(200)
    .json({ message: "Successfully Logged In", user: existingUser, token }); // * you can get token sending it through Header authorization Bearer Token
};

const logout = async (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  //   verify token
  jwt.verify(String(prevToken), process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(400).jon({ message: "Invalid Token" });
    }
    //remove cookie
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";
    return res.status(200).json({ message: "Successfully Logged Out" });
  });
};

//user endpoint
const verifyToken = async (req, res, next) => {
  //* login sends the token in Header authorization Bearer Token, thenyou ask for it in auth header too copy paste from console to tokenBearer
  const cookies = req.headers.cookie;
  const token = cookies.split("=")[1];

  if (!token) {
    res.status(404).json({ message: "No Token Found" });
  }
  //   verify token
  jwt.verify(String(token), process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(400).jon({ message: "Invalid Token" });
    }
    // send id of user to middleware
    req.id = user.id;
  });
  next(); // after verification go to next middleware getUser
};

//so not cookie not'll be deleted after 30s
const refreshToken = async (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies ? cookies.split("=")[1] : null;
  
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  
  jwt.verify(prevToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }

    // Generate new token
    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Set the expiry time to a longer duration, e.g., 15 minutes
    });
    console.log("Regenerated TOKEN\n", newToken);

    // Update the existing token in the cookie with the new one
    res.cookie("token", newToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 15), // Expiry time set to 15 minutes
      httpOnly: true, // Security
      sameSite: "lax", // Security
    });

    req.id = user.id;
    next();
  });
};



const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password"); // all field minus password
  } catch (error) {
    return new Error(error);
  }

  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }

  return res.status(200).json({ user });
};

const forgot_password = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Create JWT token for password reset
    const payload = {
      email: existingUser.email,
      id: existingUser._id, // Assuming your user ID field is "_id"
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Generate reset password link
    const link = `${process.env.FRONTEND_URL}/reset-password/${existingUser._id}/${token}`;

    // Send reset password email
    await sendResetEmail(
      email,
      "Password Reset",
      "Sending Reset password Token using Node JS & Nodemailer",
      `<button><a href="${link}">Go to Reset Password</a></button>`
    );

    res
      .status(200)
      .json({ message: "Password reset email sent, check your mailbox.",data:{id:existingUser._id, token: token} });
  } catch (error) {
    console.error("Error sending Email for password reset:", error);
    res.status(500).json({ error: "Error sending reset email" });
  }
};

const reset_password = async (req, res, next) => {
  try {
    let { id, token } = req.params;
    console.log(`id${id},token${token}`);
    const { password, repeat_password } = req.body;

    // Fetch user by id
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(400).json({ message: "User id not found" });
    }

    await jwt.verify(String(token), process.env.JWT_SECRET);

    // Check if passwords match
    if (password !== repeat_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    existingUser.password = hashedPassword;
    await existingUser.save();

    console.log("\n\nPassword updated\n\n");

    // Send JSON response
    res.status(200).json({
      message:
        "Password updated successfully. Please login with your new password.",
      user: existingUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;
exports.forgot_password = forgot_password;
exports.reset_password = reset_password;
