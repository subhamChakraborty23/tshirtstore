const User = require("../model/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

//signup
exports.signup = BigPromise(async (req, res, next) => {
  let result;
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    // console.log(result);
  }
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return next(new CustomError("Please fill all the fields", 400));
  }

  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }
  const newUser = new User({
    email,
    password,
    name,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  await newUser.save();
  let message = "User created successfully";
  cookieToken(message, newUser, res);
});

//login
exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new CustomError("Please fill all the fields [email and password]", 400)
    );
  }
  //get user from db
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  //compare password
  const isMatch = await user.isValidatedPassword(password);
  if (!isMatch) {
    return next(new CustomError("Invalid password", 400));
  }
  //generate token
  let message = "User logged in successfully";
  cookieToken(message, user, res);
});

//logout
exports.logout = BigPromise((req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

//forgot password
exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Please fill all the fields", 400));
  }
  //get user from db
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  //generate token
  const forgotPasswordToken = user.getForgotPasswordToken();
  user.save({ validateBeforeSave: false });
  //send email
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotPasswordToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${url}`;
  try {
    await mailHelper({
      email: user.email,
      subject: "T-STORE : Reset Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new CustomError("Email could not be sent due to : " + error.message, 500)
    );
  }
});

//reset password
exports.resetPassword = BigPromise(async (req, res, next) => {
  const resetPasswordToken = req.params.resetPasswordToken;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new CustomError("Invalid token or is Expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new CustomError("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.encryptedToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  //send token
  let message = "Password reset successfully";
  cookieToken(message, user, res);
});
//get user details
exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});
//change password
exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("+password");
  const isMatch = await user.isValidatedPassword(req.body.oldPassword);
  if (!isMatch) {
    return next(new CustomError("Invalid password", 400));
  }
  user.password = req.body.newPassword; //update password
  await user.save();
  //send token
  let message = "Password changed successfully";
  cookieToken(message, user, res);
});

//update user details
exports.updateUserDetails = BigPromise(async (req, res, next) => {
  if (!req.name || !req.email) {
    return next(new CustomError("Please fill all the fields", 400));
  }
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files.photo !== undefined) {
    const user = await User.findById(req.user._id);
    const imageId = user.photo.id;
    //delete old image
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const file = req.files.photo;
    //upload new image
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//admin get all users
exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});

//admin get a user
exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if(!user) {
    return next(new CustomError("User does not exist", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//admin update user
exports.adminUpdateUserDetails = BigPromise(async (req, res, next) => {
  if (!req.name || !req.email || !req.role) {
    return next(new CustomError("Please fill all the fields", 400));
  }
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,//in the ui a dropdown will be good for setting user role
  };

  if (req.files.photo !== undefined) {
    const user = await User.findById(req.params.userId);
    const imageId = user.photo.id;
    //delete old image
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const file = req.files.photo;
    //upload new image
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.params.userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});
//admin delete user
exports.adminDeleteUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if(!user) {
    return next(new CustomError("User does not exist", 400));
  }
  const imageId = user.photo.id;
  //delete old image
  const resp = await cloudinary.v2.uploader.destroy(imageId);
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
//manager get all users
exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    users,
  });
});
