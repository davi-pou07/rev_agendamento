
const User = require("../Database/User")

async function authAdm(req,res,next){
    if(req.session.user != undefined){
        var usuario = await User.findOne({where:{id:req.session.user,status:true,isAdmin:true}})
        if (usuario != undefined) {
            next()
        }else{
            res.redirect("/")   
        }
    }else{
        res.redirect("/user/login")
    }
}

module.exports = authAdm