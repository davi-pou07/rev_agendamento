const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')
const User = require("../Database/User")
const auth = require("../middlewares/auth")

const moment = require("moment")
const bcrypt = require("bcrypt")
const validator = require("validator")


//==========================CADASTRO DE USUARIO==========================

router.get("/user/registrar",async(req,res)=>{
    var erro = req.flash("erro")
    var nome = req.flash("nome")
    var email = req.flash("email")
    var foto = req.flash("foto")
    var numero = req.flash("numero")

    erro = (erro == undefined || erro.length == 0) ? undefined:erro
    nome = (nome == undefined || nome.length == 0) ? undefined:nome
    email = (email == undefined || email.length == 0) ? undefined:email
    foto = (foto == undefined || foto.length == 0) ? undefined:foto
    numero = (numero == undefined || numero.length == 0) ? undefined:numero

    console.log(erro)

    res.render("user/registrar",{erro:erro,nome:nome,email:email,foto:foto,numero:numero})
})


router.post("/user/registrar",async(req,res)=>{
    console.log('acessou')
    console.log(req.body)
    var {nome,email,senha,confirm,foto,numero} = req.body
    var erro = ''
    req.flash("nome",nome)
    req.flash("email",email)
    req.flash("foto",foto)
    req.flash("numero",numero)

    if (nome != '' && nome != undefined && email != '' && email != undefined && senha != '' && senha != undefined && numero != '' && numero != undefined) {

        if(senha != confirm){
            erro = 'Senhas não são iguais'
            req.flash('erro',erro)
            return res.redirect('/user/registrar')
        }

        if (validator.isEmail(email) != true) {
            erro = 'Email Inválido'
            req.flash('erro',erro)
            return res.redirect('/user/registrar')
        }
    
        if (validator.isMobilePhone(numero, 'pt-BR', false) != true) {
            erro = 'Celular Inválido'
            req.flash('erro',erro)
            return res.redirect('/user/registrar')
        }

        foto = (foto == '' || foto == undefined) ? '/img/user.jpg':foto
        
        var userEncontrado = await User.findOne({where:{[Op.or]:[{email:email},{numero:numero}]}}) 

        if(userEncontrado != undefined){
            erro = `Ja temos um usuario com esses dados, gentileza efetue o login`
            req.flash("erro",erro)
            return res.redirect('/user/login')
        }

        var salt = bcrypt.genSaltSync(10)
        var hash = bcrypt.hashSync(senha, salt)

        User.create({
            nome:nome,
            email:email,
            senha:hash,
            foto:foto,
            status:true,
            isAdmin:false,
            numero:numero
        }).then(user=>{
            req.session.user = user.id
            res.redirect('/')
        }).catch(err =>{
            console.log(err)
            erro = `Ocorreu um erro ao criar um novo usuario \n${err}`
            req.flash('erro',erro)
            res.redirect("/user/registrar")
        })

    } else {
        erro = 'Dados importantes estão vazio, gentileza preencha todos os dados'
        req.flash('erro',erro)
        return res.redirect('/user/registrar')
    }
})

//==========================FIM CADASTRO DE USUARIO==========================

//==========================LOGIN DE USUARIO==========================


router.get("/user/login",(req,res)=>{
    var erro = req.flash("erro")
    var email = req.flash("email")

    email = (email == undefined || email.length == 0)?undefined:email
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    
    res.render("user/login",{email:email,erro:erro})
})


router.post("/user/login",async(req,res)=>{
    var {email, senha} = req.body
    if (email != undefined && email != '' && senha != undefined && senha != '') {
        var user = await User.findOne({where:{email: email,status:true}}) 
        if( user != undefined){
            req.flash('email',email)
            var correct = bcrypt.compareSync(senha, user.senha)
            if(correct){
                req.session.user = user.id 
                User.update({updatedAt:moment().format()},{where:{id:user.id}})
                res.redirect("/")
            }else{
                var erro = `Erro: Credenciais inválidas`
                req.flash("erro",erro)
                res.redirect("/user/login")
            }
        }else{
            var erro = `Erro: Usuario não encontrado!`
            req.flash("erro",erro)
            res.redirect("/user/login")
        }

    } else {
        req.flash('erro',"Dados vazios")
        res.redirect("/user/login")
    }
   
})

router.get("/user/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

//==========================FIM LOGIN DE USUARIO==========================


//==========================EDIÇAÕ DE USUARIO==========================

router.get("/user/editar",auth,async(req,res)=>{
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    var msm = req.flash('msm')
    msm = (msm == undefined || msm.length == 0)?undefined:msm
    var usuarioId = req.session.user
    if (usuarioId != undefined) {
        var usuario = await User.findOne({where:{id:usuarioId,status:true}})
        if (usuario != undefined) {
            res.render("user/editar",{foto:usuario.foto,nome:usuario.nome,email:usuario.email,numero:usuario.numero,erro:erro,msm:msm})
        } else {
            req.flash('erro',"Erro ao identificar o usuario, realize login novamente")
            res.redirect("/user/login")
        }
    } else {
        req.flash('erro',"Sessão expirada")
        res.redirect("/user/login")
    }
})


router.post("/user/editar",auth,async(req, res) => {
    var {nome,email,numero,senhaAtual,senha,confirm,foto} = req.body
    var userId = req.session.user
    if (nome != '' && nome != undefined && email != '' && email != undefined && numero != '' && numero != undefined) {
        var user = await User.findByPk(userId)
        if (user != undefined) {
            if (senha == '' && confirm == '' && senhaAtual == '') {
                senhaAtual = undefined
                var correct = true
            } else {
                var correct = bcrypt.compareSync(senhaAtual, user.senha)
            }
            if (correct) {
                if (senha == confirm && senha != senhaAtual) {
                    var usu = await User.findOne({ where: { [Op.or]: [{ numero: numero }, { email: email }] } })
                    if (usu == undefined || usu.id == user.id) {

                        if (senha != '') {
                            var salt = bcrypt.genSaltSync(10)
                            var hash = bcrypt.hashSync(senha, salt)
                        }else{
                            var hash = user.senha
                        }

                        User.update({
                            nome: nome,
                            email: email,
                            numero: numero,
                            senha: hash,
                            foto: foto
                        }, { where: { id: user.id } }).then(() => {
                            var msm = 'Atualizações realizada com sucesso'
                            req.flash('msm',msm)
                            res.redirect("/user/editar")
                        })
                    } else {
                        console.log(usu.email, usu.login)
                        console.log(user.email, user.login)
                        res.json({ resp: "Ja existe um usuario com esses dados" })
                    }
                } else {
                    var erro = `Senhas incorreta`
                    req.flash('erro',erro)
                    res.redirect("/user/editar")
                }
            } else {
                var erro = `Senhas incorreta`
                req.flash('erro',erro)
                res.redirect("/user/editar")
            }
        } else {
            var erro = `Sessão expirada`
            req.flash('erro',erro)
            res.redirect("/user/login")
        }
    } else {
        var erro = `Informações obrigatórias não podem ficar vazias`
        req.flash('erro',erro)
        res.redirect("/user/editar")
    }
})

//==========================FIM EDIÇAÕ DE USUARIO==========================

//==========================LOG DE USUARIO==========================

router.get("/usuario/logado",async(req,res)=>{
    var userId = req.session.user
    if (userId != undefined) {
        var user = await User.findOne({where:{id:userId,status:true}})
        if (user != undefined) {
            res.json({user:{id:user.id,nome:user.nome,foto:user.foto}})
        } else {
            res.json({erro:"Usuario não identificado"})
        }
    } else {
        res.json({erro:"Gentileza realize o login"})
    }
})

//==========================FIM LOG DE USUARIO==========================

module.exports = router