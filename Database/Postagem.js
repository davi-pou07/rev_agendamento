const Sequelize = require("sequelize")
const connection = require("./database")


const Postagem = connection.define('postagens',{
    titulo:{
        type:Sequelize.STRING,
        allowNull:false
    },
    post:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull:false
    },
    tipo:{
        type: Sequelize.INTEGER,
        allowNull:false  
    }

})

Postagem.sync({force: false }).then(()=>{
    console.log("Tabela Postagem criada")
})

module.exports = Postagem