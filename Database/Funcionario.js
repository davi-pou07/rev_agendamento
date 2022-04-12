const Sequelize = require("sequelize")
const connection = require("./database")


const Funcionario = connection.define('funcionarios',{
    apelido:{
        type:Sequelize.STRING,
        allowNull:false
    },
    status:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    },
    ig:{
        type: Sequelize.STRING,
        allowNull:true
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull:false
    }

})

Funcionario.sync({force: false }).then(()=>{
    console.log("Tabela Funcionario criada")
})

module.exports = Funcionario