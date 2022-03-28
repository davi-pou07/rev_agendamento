const User = require("../Database/User")

async function usuarioAdmin(userId) {
    if (userId != undefined) {
    
        var usuario = await User.findOne({where:{id:userId,status:true,isAdmin:true}})
        return usuario
        
    } else {
        return undefined
    }
}

module.exports =  usuarioAdmin