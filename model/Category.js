import { DataTypes, Model } from "sequelize";
import db from "../config/db.js";

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "Category",
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
