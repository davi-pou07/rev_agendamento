const Sequelize = require("sequelize")
const connection = require("./database")


const Banner = connection.define('banners',{
    titulo:{
        type:Sequelize.STRING,
        allowNull:false
    },
    foto:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    fotoMobile:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull:false
    }

})

Banner.sync({force: false }).then(()=>{
    console.log("Tabela Banner criada")
})

module.exports = Banner