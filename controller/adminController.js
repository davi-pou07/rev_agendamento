const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')

const User = require("../Database/User")
const Funcionario = require("../Database/Funcionario")
const Horario = require('../Database/Horario')
const Empresa = require('../Database/Empresa')


const authAdm = require("../middlewares/authAdm")

const moment = require("moment")
const validator = require("validator")

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


//=============== EMPRESA =======================

router.get("/empresa",authAdm,async(req,res)=>{
    try {
        var erro = req.flash('erro')
        console.log(erro)
        var msm = req.flash('msm')

        var logo = req.flash("logo")
        var ig = req.flash("ig")
        var nome = req.flash("nome")
        var whats = req.flash("whats")
        var facebook = req.flash("facebook")
        var descricao = req.flash("descricao")
        var email = req.flash("email")

        erro = (erro == undefined || erro.length == 0 )?undefined:erro
        msm = (msm == undefined || msm.length == 0 )?undefined:msm
        var empresa = await Empresa.findOne()

        if (empresa == null) {
            empresa = {}
            empresa.logo = (logo == undefined || logo.length == 0)?'/img/user.jpg':logo
            empresa.nome = (nome == undefined || nome.length == 0)?undefined:nome
            empresa.whats = (whats == undefined || whats.length == 0)?undefined:whats
            empresa.facebook = (facebook == undefined || facebook.length == 0)?undefined:facebook
            empresa.descricao = (descricao == undefined || descricao.length == 0)?undefined:descricao
            empresa.email = (email == undefined || email.length == 0)?undefined:email
            empresa.ig = (ig == undefined || ig.length == 0)?undefined:ig
        }
        res.render("admin/customizar/empresa",{empresa:empresa,erro:erro,msm:msm})
    } catch (error) {
        var msmErro = 'Ocorreu um erro:\n' + error
        req.flash("erro",msmErro)
        res.redirect('/admin')
    }
})

router.post("/empresa",authAdm,async(req,res)=>{
    var {logo,nome,whats,facebook,descricao,email,ig} = req.body

    req.flash("logo",logo)
    req.flash("nome",nome)
    req.flash("whats",whats)
    req.flash("facebook",facebook)
    req.flash("descricao",descricao)
    req.flash("email",email)
    req.flash("ig",ig)
    console.log(req.body)
    var erro = ''
    var msm = ''
    if (
        logo != '' && logo != undefined &&
        nome != '' && nome != undefined &&
        whats != '' && whats != undefined &&
        email != '' && email != undefined &&
        ig != '' && ig != undefined 
    ) {

        if (validator.isEmail(email) != true) {
            erro = 'Email Inválido'
            req.flash('erro', erro)
            return res.redirect('/admin/empresa')
        }

        if (validator.isMobilePhone(whats, 'pt-BR', false) != true) {
            erro = 'Celular Inválido'
            req.flash('erro', erro)
            return res.redirect('/admin/empresa')
        }

        var empresa = await Empresa.findOne()
        if (empresa == undefined) {
            Empresa.create({
                logo:logo,
                nome:nome,
                whats:whats,
                descricao:descricao,
                email:email,
                facebook:facebook,
                ig:ig
            }).then(()=>{
                msm = 'Atualizações realizada com sucesso'
                req.flash('msm',msm)
                res.redirect('/admin/empresa')
            }).catch(err =>{
                erro = `Ocorreu um erro ao salvar dados\n${err}`
                req.flash('erro',erro)
                res.redirect('/admin/empresa')
            })
        } else {
            Empresa.update({
                logo:logo,
                nome:nome,
                whats:whats,
                descricao:descricao,
                email:email,
                facebook:facebook,
                ig:ig
            },{where:{id:empresa.id}}).then(()=>{
                msm = 'Atualizações realizada com sucesso'
                req.flash('msm',msm)
                res.redirect('/admin/empresa')
            }).catch(err =>{
                erro = `Ocorreu um erro ao salvar dados\n${err}`
                req.flash('erro',erro)
                res.redirect('/admin/empresa')
            })
        }
    } else {
        erro = 'Dados inválidos, revise novamente as informações passada'
        req.flash('erro',erro)
        res.redirect('/admin/empresa')
    }
})


//=============== FIM EMPRESA =======================



module.exports = router