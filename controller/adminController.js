const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')

const User = require("../Database/User")
const Funcionario = require("../Database/Funcionario")
const Horario = require('../Database/Horario')


const authAdm = require("../middlewares/authAdm")
const moment = require("moment")

//=============== USUARIOS =======================

router.get("/usuarios",authAdm,async(req,res)=>{
    try {
        var usuarios = await User.findAll()
        for (var index = 0; index < usuarios.length; index++) {
            usuarios[index].dataCri = moment(usuarios[index].createdAt).format("DD/MM/YYYY hh:mm")
            usuarios[index].dataLog = moment(usuarios[index].updatedAt).format("DD/MM/YYYY hh:mm")
        }
        res.render('admin/user/usuarios',{usuarios:usuarios})
    } catch (error) {
        console.log(error)
        var erro = `Ocorreu um erro\n\n${error}`
        req.flash("erro",erro)
        res.redirect("/admin")
    }
    
})
//=============== FIM USUARIOS =======================


//=============== FUNCIONARIOS =======================


router.get("/funcionarios",authAdm,async(req,res)=>{
    try {
        var funcionarios = await Funcionario.findAll()
        var funcionarioIds = []

        for (var index = 0; index < funcionarios.length; index++) {
            funcionarioIds.push(funcionarios[index].id)
            funcionarios[index].dataCri = moment(funcionarios[index].createdAt).format("DD/MM/YYYY hh:mm")
            funcionarios[index].dataLog = moment(funcionarios[index].updatedAt).format("DD/MM/YYYY hh:mm")
        }

        var users = await User.findAll({
            where:{
                isAdmin:true,
                status:true,
                id:{ [Op.notIn]: funcionarioIds}
            }})

        var usuarios = []
        for (var index = 0; index < users.length; index++) {
            usuarios.push({
                nome:users[index].nome.split(' ')[0],
                id:users[index].id
            })
        }

        res.render('admin/funcionario/funcionarios',{funcionarios:funcionarios,usuarios:usuarios})

    } catch (error) {
        console.log(error)
        var erro = `Ocorreu um erro\n\n${error}`
        req.flash("erro",erro)
        res.redirect("/admin")
    }
})


router.get("/funcionario/horarios/:funcionarioId",authAdm,async(req,res)=>{
    try {
        var funcionarioId = req.params.funcionarioId
        var erro = req.flash(erro)
        erro =(erro == undefined || erro.length == 0)?undefined:erro
        if (funcionarioId != undefined && !isNaN(funcionarioId)) {
            var funcionario =await Funcionario.findOne({where:{id:funcionarioId,status:true}})
            if (funcionario != undefined) {

                var horarios = await Horario.findAll({where:{funcionarioId:funcionario.id}})

                res.render('admin/funcionario/horarios',{erro:erro,funcionario:funcionario,horarios:horarios})
            } else {
                var erro = `Funcionario com status inativo ou inexistente`
                req.flash("erro",erro)
                res.redirect("/admin/funcionarios")
            }
        } else {
            var erro = `Parametros inválidos`
            req.flash("erro",erro)
            res.redirect("/admin/funcionarios")
        }
    } catch (error) {
        console.log(error)
        var erro = `Ocorreu um erro\n\n${error}`
        req.flash("erro",erro)
        res.redirect("/admin")
    }
})


//=============== FIM FUNCIONARIOS =======================



module.exports = router