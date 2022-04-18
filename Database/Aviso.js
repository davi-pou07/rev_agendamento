const Sequelize = require("sequelize")
const connection = require("./database")


const Aviso = connection.define('avisos',{
    titulo:{
        type:Sequelize.STRING,
        allowNull:false
    },
    mensagem:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    prazo:{
        type:Sequelize.STRING,
        allowNull:true
    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull:false
    }

})

Aviso.sync({force: false }).then(()=>{
    console.log("Tabela Aviso criada")
})

module.exports = Aviso