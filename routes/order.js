const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  admingetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRoles } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);

//admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRoles("admin"), admingetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRoles("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRoles("admin"), adminDeleteOrder);

module.exports = router;
