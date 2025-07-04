import { Op } from "sequelize";
import Admin from "../model/Admin.js";
import Blogs from "../model/Blogs.js";
import helper from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Category from "../model/Category.js";

const getTrendingBlog = async (req, res) => {
  try {
    // Find All Blogs for the Admin Which is created By Him/Her
    const data = await Blogs.findAll({
      where: {
        // admin_id: req.admin?.id,
        deleted_at: null,
      },
      order: [["created_at", "DESC"]],
      limit: 4,
      include: [
        { model: Category, as: "category" },
        { model: Admin, as: "admin" },
      ],
    });
    return res.send(helper.successResponseWithData("Blog Found!!", data));
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
const getBlog = async (req, res) => {
  try {
    const whereClause = { deleted_at: null };
    if (req.body?.id) {
      // let title = req.body.title.replaceAll("-", " ");
      whereClause.id = req.body?.id;
      const data = await Blogs.findOne({
        where: whereClause,
        include: [
          { model: Category, as: "category", attributes: ["id", "name"] },
          { model: Admin, as: "admin", attributes: ["id", "email", "name"] },
        ],
      });
      return res.send(helper.successResponseWithData("Blog Found!!", data));
    } else {
      if (req.body?.search) {
        whereClause.title = {
          [Op.like]: `%${req.body.search}%`,
        };
      }
      if (req.body?.category_id) {
        whereClause.categoty_id = req.body.category_id;
      }

      const data = await Blogs.findAll({
        where: whereClause,
        include: [
          { model: Category, as: "category", attributes: ["id", "name"] },
          { model: Admin, as: "admin", attributes: ["id", "email", "name"] },
        ],
      });
      return res.send(helper.successResponseWithData("Blog Found!!", data));
    }
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.findAll({
      where: {
        deleted_at: null,
      },
      raw: true,
    });

    return res.send(
      helper.successResponseWithData("Categories Found!!", allCategories)
    );
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
const likeBlog = async (req, res) => {
  try {
    const { id, isLiked } = req.body;
    const blog = await Blogs.findOne({ where: { id, deleted_at: null } });
    const newLikeCount =
      isLiked == 1 ? +blog.likes + 1 : Math.max(0, +blog.likes - 1);
    await Blogs.update({ likes: newLikeCount }, { where: { id } });

    return res.send(helper.successResponse("Like Updated!!"));
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
export default {
  getTrendingBlog,
  getBlog,
  getAllCategories,
  likeBlog,
};
