import { Op } from "sequelize";
import Admin from "../model/Admin.js";
import Blogs from "../model/Blogs.js";
import helper from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Category from "../model/Category.js";

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Added Basic Validatin
    if (!email || !password) {
      return res.send(helper.errorResponse("Required Feild Violation!!"));
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({ where: { email } });
    if (existingUser) {
      return res.send(helper.errorResponse("Email Already Exist!!"));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Admin.create({
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.send({ status: true, message: "Signup successful", token });
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Added Basic Validatin
    if (!email || !password) {
      return res.send(helper.errorResponse("Required Feild Violation!!"));
    }

    // Find user by email
    const existingUser = await Admin.findOne({ where: { email }, raw: true });
    if (!existingUser) {
      return res.send(helper.errorResponse("Email Not Exits!!"));
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.send(helper.errorResponse("Invalid email or password"));
    }

    // Generate token
    const token = jwt.sign(
      { id: existingUser.id, role: "admin" },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.send({ status: true, message: "Login successful", token });
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
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
    if (req.body?.title) {
      let title = req.body.title.replaceAll("-", " ");
      whereClause.title = title;
    }
    if (req.body?.search) {
      whereClause.title = {
        [Op.like]: `%${req.body.search}%`,
      };
    }
    if (req.body?.category_id) {
      whereClause.categoty_id = req.body.category_id;
    }
    console.log(whereClause);

    const data = await Blogs.findAll({
      where: whereClause,
      includes:[{
        
      }]
    });
    return res.send(helper.successResponseWithData("Blog Found!!", data));
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

    return res.send(
      helper.successResponse("Like Updated!!")
    );
  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
export default {
  signup,
  login,
  getTrendingBlog,
  getBlog,
  getAllCategories,
  likeBlog,
};
