const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')
const User = require("../Database/User")
const auth = require("../middlewares/auth")
const moment = require("moment")
const usuarioAdmin = require("../functions/usuarioAdmin")

//=============== USUARIOS =======================

router.get("/usuarios",auth,async(req,res)=>{
    var userId = req.session.user
    var usuario = await usuarioAdmin(userId)
    if (usuario != undefined) {
        var usuarios = await User.findAll()
        for (var index = 0; index < usuarios.length; index++) {
            usuarios[index].dataCri = moment(usuarios[index].createdAt).format("DD/MM/YYYY hh:mm")
            usuarios[index].dataLog = moment(usuarios[index].updatedAt).format("DD/MM/YYYY hh:mm")
        }
        res.render('admin/usuarios',{usuarios:usuarios})
    } else {
        res.redirect("/")
    }
})
//=============== FIM USUARIOS =======================


//=============== FUNCIONARIOS =======================


router.get("/funcionarios",auth,async(req,res)=>{
    var userId = req.session.user
    var usuario = await usuarioAdmin(userId)
    if (usuario != undefined) {
       
    } else {
        res.redirect("/")
    }
})

//=============== FIM FUNCIONARIOS =======================



module.exports = router