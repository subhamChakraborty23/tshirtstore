const express = require("express");
const {
  addProduct,
  getAllProduct,
  adminGetAllProduct,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productController");
const router = express.Router();
const { isLoggedIn, customRoles } = require("../middlewares/user");

//user routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRoles("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRoles("admin"), adminGetAllProduct);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRoles("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRoles("admin"), adminDeleteOneProduct);

module.exports = router;