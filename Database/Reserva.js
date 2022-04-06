const Sequelize = require("sequelize")
const connection = require("./database")


const Reserva = connection.define('reservas',{
    corteId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    data:{
        type:Sequelize.STRING,
        allowNull:false
    },
    hora:{
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
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull:false
    }
})

// Reserva.sync({force: true }).then(()=>{
//     console.log("Tabela Reserva criada")
// })

module.exports = Reserva