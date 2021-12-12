const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateUserDetails,
    adminDeleteUser,
} = require("../controllers/userController");

const { isLoggedIn ,customRoles} = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:resetPasswordToken").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails);
router.route("/password/update").put(isLoggedIn,changePassword);
router.route("/userdashboard/update").put(isLoggedIn,updateUserDetails);


//Admin Routes
router.route("/admin/users").get(isLoggedIn,customRoles('admin'),adminAllUsers);
router.route("/admin/user/:userId")
    .get(isLoggedIn,customRoles('admin'),adminGetOneUser)
    .put(isLoggedIn,customRoles('admin'),adminUpdateUserDetails)
    .delete(isLoggedIn,customRoles('admin'),adminDeleteUser);

//Manager Routes
router.route("/manager/users").get(isLoggedIn,customRoles('manager'),managerAllUsers);


module.exports = router;
