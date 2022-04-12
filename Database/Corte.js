const Sequelize = require("sequelize")
const connection = require("./database")


const Corte = connection.define('cortes',{
    nome:{
        type:Sequelize.STRING,
        allowNull:false
    },
    preco:{
        type:Sequelize.STRING,
        allowNull:false
    },
    tempo:{
        type: Sequelize.STRING,
        allowNull:false
    },
    descricao:{
        type:Sequelize.STRING,
        allowNull:false 
    },
    status:{
        type:Sequelize.BOOLEAN,
        allowNull:false 
    }

})

// Corte.sync({force: true }).then(()=>{
//     console.log("Tabela Corte criada")
// })

module.exports = Corte