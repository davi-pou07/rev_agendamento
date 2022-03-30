const Sequelize = require("sequelize")
const connection = require("./database")


const Horario = connection.define('horarios',{
    de:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    ate:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    as:{
        type: Sequelize.STRING,
        allowNull:false
    },
    funcionarioId:{
        type: Sequelize.INTEGER,
        allowNull:false
    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull:false
    }

})

// Horario.sync({alter: true }).then(()=>{
//     console.log("Tabela Horario criada")
// })

module.exports = Horario