import express from "express";
import adminController from "../controller/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", adminController.signup);
router.post("/login", adminController.login);

router.post("/get_blog", authMiddleware, adminController.getBlog);
router.post("/dashboard_info", authMiddleware, adminController.dashboardInfo);
router.post(
  "/get_all_categories",
  authMiddleware,
  adminController.getAllCategories
);
router.post("/create_blog", authMiddleware, adminController.createBlog);
router.post("/update_blog/:id", authMiddleware, adminController.updateBlog);
router.post("/delete_blog/:id", authMiddleware, adminController.deleteBlog);

export default router;
