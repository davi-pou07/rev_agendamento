const Sequelize = require("sequelize");

const DB_USER = process.env.DB_USER
const DB_HOST = process.env.DB_HOST
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const DB_DIALECT = process.env.DB_DIALECT

const connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD , {
    host: DB_HOST,
    dialect: DB_DIALECT,
    //timezone: "-03:00",
    logging: console.log,
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false
    //     }
    // }
})
module.exports = connection;