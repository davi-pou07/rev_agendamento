
function auth(req,res,next){
    req.session.user = 1
    if(req.session.user != undefined){
        next()
    }else{
        res.redirect("/user/login")
    }
}

module.exports = auth