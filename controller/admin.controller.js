import Admin from "../model/Admin.js";
import Blogs from "../model/Blogs.js";
import helper from "../utils/helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import { col, fn, literal } from "sequelize";
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
const getBlog = async (req, res) => {
  try {
    if (req.body?.id) {
      // find single blog for the admin
      const data = await Blogs.findOne({
        where: {
          id: req.body.id,
          admin_id: req.admin?.id,
        },
      });
      return res.send(helper.successResponseWithData("Blog Found!!", data));
    } else {
      // Find All Blogs for the Admin Which is created By Him/Her
      const data = await Blogs.findAll({
        where: {
          admin_id: req.admin?.id,
        },
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
const dashboardInfo = async (req, res) => {
  try {
    // Find All Blogs for the Admin Which is created By Him/Her

    const blogStats = await Blogs.findAll({
      where: {
        admin_id: req.admin?.id,
      },
      attributes: [
        [fn("COUNT", col("id")), "totalBlog"],
        [
          fn("SUM", literal("CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END")),
          "totalSuccessCount",
        ],
        [
          fn(
            "SUM",
            literal("CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END")
          ),
          "totalDeletedCount",
        ],
        [fn("SUM", col("likes")), "totalLikes"],
      ],
      raw: true,
    });
    // const { totalBlog, totalSuccessCount, totalDeletedCount } = blogStats[0];
    const recentBlogs = await Blogs.findAll({
      where: {
        admin_id: req.admin?.id,
      },
      order: [["created_at", "DESC"]],
      limit: 4,
      raw: true,
    });

    return res.send(
      helper.successResponseWithData("Blog Found!!", {
        dashboardOverview: blogStats[0],
        recentBlogs,
      })
    );
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

// MIME type maps
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB

const createBlog = async (req, res) => {
  try {
    const { title, description, categoty_id } = req.body;

    //Added Basic Validations
    if (!title || !description || !categoty_id) {
      return res.send(helper.errorResponse("Required Feild Violation!!"));
    }
    // Check For Is File Uploaded Or directly Media URL Uploaded
    if (!req.files && !req.body.media) {
      return res.send(helper.errorResponse("No file uploaded"));
    }
    let mediaURL = "";
    if (req.files?.media) {
      const file = req.files.media;
      const mimeType = file.mimetype;
      const fileSize = file.size;
      const isImage = IMAGE_TYPES.includes(mimeType);
      const isVideo = VIDEO_TYPES.includes(mimeType);

      if (!isImage && !isVideo) {
        fs.unlinkSync(file.tempFilePath); // cleanup
        return res.send(helper.errorResponse("Unsupported file type"));
      }
      // Validate size
      if (
        (isImage && fileSize > MAX_IMAGE_SIZE) ||
        (isVideo && fileSize > MAX_VIDEO_SIZE)
      ) {
        fs.unlinkSync(file.tempFilePath); // cleanup
        return res.send(
          helper.errorResponse(
            `File too large. Max size: ${
              isImage ? "3MB (image)" : "20MB (video)"
            }`
          )
        );
      }
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: "auto", // for images, videos, etc.
          folder: "uploads",
        });

        fs.unlinkSync(file.tempFilePath); // cleanup
        mediaURL = result.secure_url;
      } catch (error) {
        console.log("Error", error);
      }
    } else {
      mediaURL = req.body.media;
    }

    await Blogs.create({
      title: title,
      description: description,
      media_url: mediaURL,
      categoty_id: categoty_id,
      likes: 0,
      admin_id: req.admin?.id,
    });
    return res.send(helper.successResponse("Blog Added Successfully!!"));

  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
const updateBlog = async (req, res) => {
  try {
    const { title, description,categoty_id } = req.body;

    //Added Basic Validations
    if (!title || !description || !categoty_id) {
      return res.send(helper.errorResponse("Required Feild Violation!!"));
    }
    // Check For Is File Uploaded Or directly Media URL Uploaded
    if (!req.files && !req.body.media) {
      return res.send(helper.errorResponse("No file uploaded"));
    }

    const getBlog = await Blogs.findOne({
      where: {
        id: req.params.id,
        deleted_at: null,
      },
    });
    if (!getBlog) {
      return res.send(helper.errorResponse("Blog Not Found!!"));
    }

    // check The Admin Can Update His/Her Own Blog Only!!
    if (getBlog && getBlog?.admin_id != req.admin?.id) {
      return res.send(
        helper.errorResponse(
          "You Can't Update This Bloge as this Blogs Belons To Another User"
        )
      );
    }

    let mediaURL = getBlog?.media_url;
    if (req.files?.media) {
      const file = req.files.media;
      const mimeType = file.mimetype;
      const fileSize = file.size;
      const isImage = IMAGE_TYPES.includes(mimeType);
      const isVideo = VIDEO_TYPES.includes(mimeType);

      if (!isImage && !isVideo) {
        fs.unlinkSync(file.tempFilePath); // cleanup
        return res.send(helper.errorResponse("Unsupported file type"));
      }
      // Validate size
      if (
        (isImage && fileSize > MAX_IMAGE_SIZE) ||
        (isVideo && fileSize > MAX_VIDEO_SIZE)
      ) {
        fs.unlinkSync(file.tempFilePath); // cleanup
        return res.send(
          helper.errorResponse(
            `File too large. Max size: ${
              isImage ? "3MB (image)" : "20MB (video)"
            }`
          )
        );
      }
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          resource_type: "auto", // for images, videos, etc.
          folder: "uploads",
        });

        fs.unlinkSync(file.tempFilePath); // cleanup
        mediaURL = result.secure_url;
      } catch (error) {
        console.log("Error", error);
      }
    } else {
      mediaURL = req.body.media;
    }

    await Blogs.update(
      {
        title: title,
        description: description,
        media_url: mediaURL,
        categoty_id:categoty_id
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    return res.send(helper.successResponse("Blog Added Successfully!!"));

  } catch (error) {
    console.log("Error", error);
    return res.send(
      helper.internalServerResponse("Internal Server Error", error?.message)
    );
  }
};
const deleteBlog = async (req, res) => {
  try {
    //Added Basic Validations

    const getBlog = await Blogs.findOne({
      where: {
        id: req.params.id,
        admin_id: req.admin?.id,
        deleted_at: null,
      },
      raw: true,
    });

    // Delet Resource From cloudinary while deleting Record!!
    let publicId = helper.extractPublicIdFromUrl(getBlog.media_url);
    if (publicId) {
      const resourceType = helper.getResourceTypeFromUrl(getBlog.media_url);
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    }

    await Blogs.update(
      {
        deleted_at: Date.now(),
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    return res.send(helper.successResponse("Blog Added Successfully!!"));
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
  dashboardInfo,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllCategories,
};
