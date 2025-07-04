import { DataTypes, Model } from "sequelize";
import db from "../config/db.js";

class Admin extends Model {}

Admin.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE
    },
    updated_at: {
        type: DataTypes.DATE
    },
    deleted_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize: db.DB,
    modelName: "Admin",
    tableName: "admin",
    timestamps: false
})

export default Admin