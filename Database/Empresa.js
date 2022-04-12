const Sequelize = require("sequelize")
const connection = require("./database")


const Empresa = connection.define('empresas',{
    nome:{
        type:Sequelize.STRING,
        allowNull:false
    },
    logo:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    whats:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type: Sequelize.STRING,
        allowNull:false
    },
    ig:{
        type: Sequelize.STRING,
        allowNull:false
    },
    facebook:{
        type: Sequelize.STRING,
        allowNull:true
    },
    descricao:{
        type: Sequelize.TEXT,
        allowNull:true
    },
    endereco:{
        type: Sequelize.STRING,
        allowNull:false
    },
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
    }

})

Empresa.sync({force: true }).then(()=>{
    console.log("Tabela Empresa criada")
})

module.exports = Empresa