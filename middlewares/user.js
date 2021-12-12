const User = require("../model/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async(req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return next(new CustomError("You are not logged in", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});
//call this function in the routes to check if the user is logged in and is an admin or manager
exports.customRoles = (...roles)=>{
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("You are not authorized to access this resource", 403));
    }
    next();
  };
}
