import { DataTypes, Model } from "sequelize";
import db from "../config/db.js";
import Category from "./Category.js";
import Admin from "./Admin.js";

class Blogs extends Model {}

Blogs.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.TEXT,
    },
    categoty_id: {
      type: DataTypes.INTEGER,
    },
    likes: {
      type: DataTypes.INTEGER,
    },
    admin_id: {
      type: DataTypes.INTEGER,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db.DB,
    modelName: "Blogs",
    tableName: "blogs",
    timestamps: false,
  }
);

Blogs.belongsTo(Category, {
  foreignKey: "categoty_id", // fixed key name
  as: "category",
});
Blogs.belongsTo(Admin, {
  foreignKey: "admin_id", // fixed key name
  as: "admin",
});


export default Blogs;
