import express from "express"
import userController from "../controller/user.controller.js";

const router = express.Router();


router.post("/get_trending_blog", userController.getTrendingBlog);
router.post("/like_blog", userController.likeBlog);
router.post("/get_blog", userController.getBlog);
router.post(
  "/get_all_categories",
  userController.getAllCategories
);

export default router;