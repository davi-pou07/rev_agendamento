const Sequelize = require("sequelize")
const connection = require("./database")


const User = connection.define('user',{
    nome:{
        type:Sequelize.STRING,
        allowNull:false
    },
    status:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    },
    senha:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isAdmin:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    },
    numero: {
        type: Sequelize.STRING,
        allowNull:false
    },
    foto:{
        type: Sequelize.TEXT,
        allowNull:true
    }

})

User.sync({alter: true }).then(()=>{
    console.log("Tabela User criada")
})

module.exports = User