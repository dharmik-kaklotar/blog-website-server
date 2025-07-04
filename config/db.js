import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config();

const DB = new Sequelize({
    dialect: process.env.DB_DIRECTIAL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    database: process.env.DB_DATABASE_NAME,
    password: process.env.DB_PASSWORD,
    logging:false,
    // timezone: "+05:30"
})

export default {
    DB
}