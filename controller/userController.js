const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')
const User = require("../Database/User")
const auth = require("../middlewares/auth")

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

//==========================FIM LOGIN DE USUARIO==========================


//==========================EDIÇAÕ DE USUARIO==========================

router.get("/user/edicao",auth,async(req,res)=>{
    var usuarioId = req.session.user
    if (usuarioId != undefined) {
        var usuario = await User.findByPk(usuarioId)
        if (usuario != undefined) {
            //Aqui
        } else {
            req.flash('erro',"Erro ao identificar o usuario, realize login novamente")
            res.redirect("/user/login")
        }
    } else {
        req.flash('erro',"Sessão expirada")
        res.redirect("/user/login")
    }
})

//==========================FIM EDIÇAÕ DE USUARIO==========================

module.exports = router