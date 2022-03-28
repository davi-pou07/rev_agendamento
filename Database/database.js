const Sequelize = require("sequelize");

// const DB_USER = process.env.DB_USER
// const DB_HOST = process.env.DB_HOST
// const DB_PASSWORD = process.env.DB_PASSWORD
// const DB_NAME = process.env.DB_NAME

const connection = new Sequelize('rev_agendamento', 'postgres', "dh*80335", {
    host: 'localhost',
    dialect: 'postgres',
    timezone: "-03:00",
    logging: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})
module.exports = connection;