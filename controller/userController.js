const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')

const User = require("../Database/User")
const RecuperaSenha = require("../Database/RecuperaSenha")

const auth = require("../middlewares/auth")

const moment = require("moment")
const bcrypt = require("bcrypt")
const validator = require("validator")
const nodemailer = require("nodemailer")
const fs = require("fs")
const ejs = require('ejs')
const Empresa = require('../Database/Empresa')
const Corte = require('../Database/Corte')
const Reserva = require('../Database/Reserva')
const Funcionario = require('../Database/Funcionario')

var remetente = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'poudeyvis007@gmail.com',
        pass: '99965511pou'
    }
});

//==========================CADASTRO DE USUARIO==========================

router.get("/user/registrar", async (req, res) => {
    var erro = req.flash("erro")
    var nome = req.flash("nome")
    var email = req.flash("email")
    var foto = req.flash("foto")
    var numero = req.flash("numero")

    erro = (erro == undefined || erro.length == 0) ? undefined : erro
    nome = (nome == undefined || nome.length == 0) ? undefined : nome
    email = (email == undefined || email.length == 0) ? undefined : email
    foto = (foto == undefined || foto.length == 0) ? undefined : foto
    numero = (numero == undefined || numero.length == 0) ? undefined : numero
    var empresa = await Empresa.findOne()
    var cortes = await Corte.findAll({where:{status:true}})
    console.log(erro)

    res.render("user/registrar", { erro: erro, nome: nome, email: email, foto: foto, numero: numero,empresa:empresa,cortes:cortes })
})


router.post("/user/registrar", async (req, res) => {
    console.log('acessou')
    console.log(req.body)
    var { nome, email, senha, confirm, foto, numero } = req.body
    var erro = ''
    req.flash("nome", nome)
    req.flash("email", email)
    req.flash("foto", foto)
    req.flash("numero", numero)

    if (nome != '' && nome != undefined && email != '' && email != undefined && senha != '' && senha != undefined && numero != '' && numero != undefined) {
        email = email.toLowerCase()
        if (senha != confirm) {
            erro = 'Senhas não são iguais'
            req.flash('erro', erro)
            return res.redirect('/user/registrar')
        }

        if (validator.isEmail(email) != true) {
            erro = 'Email Inválido'
            req.flash('erro', erro)
            return res.redirect('/user/registrar')
        }

        if (validator.isMobilePhone(numero, 'pt-BR', false) != true) {
            erro = 'Celular Inválido'
            req.flash('erro', erro)
            return res.redirect('/user/registrar')
        }

        foto = (foto == '' || foto == undefined) ? '/img/user.jpg' : foto

        var userEncontrado = await User.findOne({ where: { [Op.or]: [{ email: email }, { numero: numero }] } })

        if (userEncontrado != undefined) {
            erro = `Ja temos um usuario com esses dados, gentileza efetue o login`
            req.flash("erro", erro)
            return res.redirect('/user/login')
        }

        var salt = bcrypt.genSaltSync(10)
        var hash = bcrypt.hashSync(senha, salt)
        
        var isAdmin = (await User.findOne({where:{status:true}}) != undefined)?false:true

        User.create({
            nome: nome,
            email: email,
            senha: hash,
            foto: foto,
            status: true,
            isAdmin: isAdmin,
            numero: numero
        }).then(user => {
            req.session.user = user.id
            if (req.session.agendamento != undefined) {
                var agendamento = req.session.agendamento
                res.redirect(`/agendamento?barberId=${agendamento.funcionarioId}&corteId=${agendamento.corteId}&data=${agendamento.data}`)
            } else {
                res.redirect("/")  
            }
        }).catch(err => {
            console.log(err)
            erro = `Ocorreu um erro ao criar um novo usuario \n${err}`
            req.flash('erro', erro)
            res.redirect("/user/registrar")
        })

    } else {
        erro = 'Dados importantes estão vazio, gentileza preencha todos os dados'
        req.flash('erro', erro)
        return res.redirect('/user/registrar')
    }
})

//==========================FIM CADASTRO DE USUARIO==========================

//==========================LOGIN DE USUARIO==========================


router.get("/user/login", (req, res) => {
    var erro = req.flash("erro")
    var email = req.flash("email")

    email = (email == undefined || email.length == 0) ? undefined : email
    erro = (erro == undefined || erro.length == 0) ? undefined : erro

    res.render("user/login", { email: email, erro: erro })
})


router.post("/user/login", async (req, res) => {
    var { email, senha } = req.body
    if (email != undefined && email != '' && senha != undefined && senha != '') {
        email = email.toLowerCase()
        var user = await User.findOne({ where: { email: email, status: true } })
        if (user != undefined) {
            req.flash('email', email)
            var correct = bcrypt.compareSync(senha, user.senha)
            if (correct) {
                req.session.user = user.id
                try {
                    console.log(moment().format())
                    console.log(user.id)
                    var up = await User.update({ "updatedAt": moment().format()},{ where: { id: user.id }})
                } catch (error) {
                    console.log(error)
                }
                if (req.session.agendamento != undefined) {
                    var agendamento = req.session.agendamento
                    res.redirect(`/agendamento?barberId=${agendamento.funcionarioId}&corteId=${agendamento.corteId}&data=${agendamento.data}`)
                } else {
                    res.redirect("/")  
                }
                
            } else {
                var erro = `Erro: Credenciais inválidas`
                req.flash("erro", erro)
                res.redirect("/user/login")
            }
        } else {
            var erro = `Erro: Usuario não encontrado!`
            req.flash("erro", erro)
            res.redirect("/user/login")
        }

    } else {
        req.flash('erro', "Dados vazios")
        res.redirect("/user/login")
    }

})

router.get("/user/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

//==========================FIM LOGIN DE USUARIO==========================


//==========================EDIÇAÕ DE USUARIO==========================

router.get("/user/editar", auth, async (req, res) => {
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0) ? undefined : erro
    var msm = req.flash('msm')
    msm = (msm == undefined || msm.length == 0) ? undefined : msm
    var usuarioId = req.session.user
    if (usuarioId != undefined) {
        var usuario = await User.findOne({ where: { id: usuarioId, status: true } })
        if (usuario != undefined) {
            var empresa = await Empresa.findOne()
            var cortes = await Corte.findAll({where:{status:true}})
            res.render("user/editar", {cortes:cortes, empresa:empresa,foto: usuario.foto, nome: usuario.nome, email: usuario.email, numero: usuario.numero, erro: erro, msm: msm })
        } else {
            req.flash('erro', "Erro ao identificar o usuario, realize login novamente")
            res.redirect("/user/login")
        }
    } else {
        req.flash('erro', "Sessão expirada")
        res.redirect("/user/login")
    }
})


router.post("/user/editar", auth, async (req, res) => {
    var { nome, email, numero, senhaAtual, senha, confirm, foto } = req.body
    var userId = req.session.user
    if (nome != '' && nome != undefined && email != '' && email != undefined && numero != '' && numero != undefined) {
        var user = await User.findByPk(userId)
        if (user != undefined) {
            email = email.toLowerCase()

            if (validator.isEmail(email) != true) {
                erro = 'Email Inválido'
                req.flash('erro', erro)
                return res.redirect('/user/editar')
            }

            if (validator.isMobilePhone(numero, 'pt-BR', false) != true) {
                erro = 'Celular Inválido'
                req.flash('erro', erro)
                return res.redirect('/user/editar')
            }

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
                        } else {
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
                            req.flash('msm', msm)
                            res.redirect("/user/editar")
                        })
                    } else {
                        console.log(usu.email, usu.login)
                        console.log(user.email, user.login)
                        res.json({ resp: "Ja existe um usuario com esses dados" })
                    }
                } else {
                    var erro = `Senhas incorreta`
                    req.flash('erro', erro)
                    res.redirect("/user/editar")
                }
            } else {
                var erro = `Senhas incorreta`
                req.flash('erro', erro)
                res.redirect("/user/editar")
            }
        } else {
            var erro = `Sessão expirada`
            req.flash('erro', erro)
            res.redirect("/user/login")
        }
    } else {
        var erro = `Informações obrigatórias não podem ficar vazias`
        req.flash('erro', erro)
        res.redirect("/user/editar")
    }
})

//==========================FIM EDIÇAÕ DE USUARIO==========================

//==========================LOG DE USUARIO==========================

router.get("/usuario/logado", async (req, res) => {
    var userId = req.session.user
    if (userId != undefined) {
        var user = await User.findOne({ where: { id: userId, status: true } })
        if (user != undefined) {
            res.json({ user: { id: user.id, nome: user.nome, foto: user.foto, isAdmin: user.isAdmin } })
        } else {
            res.json({ erro: "Usuario não identificado" })
        }
    } else {
        res.json({ erro: "Gentileza realize o login" })
    }
})

//==========================FIM LOG DE USUARIO==========================



//==========================ESQUECEU SENHA DE USUARIO==========================


router.get("/user/esqueceu", (req, res) => {
    var erro = req.flash("erro")
    erro = (erro == undefined || erro.length == 0) ? undefined : erro
    res.render("user/esqueceu", { erro: erro })
})



router.post("/user/esqueceu", async (req, res) => {
    var email = req.body.email
    var erro = ''
    if (email != undefined && email != '') {
        email = email.toLowerCase()
        if (validator.isEmail(email) != true) {
            erro = 'Email Inválido'
            req.flash('erro', erro)
            return res.redirect('/user/esqueceu')
        }

        var user = await User.findOne({ where: { email: email, status: true } })
        if (user != undefined) {
            var recuperaSenha = await RecuperaSenha.findOne({ where: { userId: user.id, [Op.or]: [{ status: true }, { aprovado: true }] } })
            console.log(recuperaSenha)
            if (recuperaSenha != undefined) {
                RecuperaSenha.update({ status: false, aprovado: false, updatedAt: moment().format() }, { where: { id: recuperaSenha.id } })
            }
            var idUnica = Math.floor(Math.random() * 9999)
            while (idUnica.toString().length < 4) {
                idUnica = '0' + idUnica
            }

            try {
                var rec = await RecuperaSenha.create({
                    userId: user.id,
                    status: true,
                    uniqid: idUnica.toString(),
                    aprovado: false
                })
            } catch (error) {
                console.log(error)
                erro = 'Ocorreu um erro no processo de gerar um novo codigo, gentileza tente novamente. Caso o erro persista entre em contato no nosso Whatsapp'
                req.flash('erro', erro)
                return res.redirect("/user/esqueceu")
            }
            var date = moment().format("YYYYMMDD")
            try {
                var html = await ejs.renderFile("public/html/envioEmail.ejs", { idUnica: idUnica, nome: user.nome })
                var create = await fs.writeFileSync(`public/html/${date}.html`, html)
                var htmlstream = await fs.createReadStream(`public/html/${date}.html`);

                var envio = await remetente.sendMail({
                    to: user.email, // list of receivers
                    subject: "Codigo verificação alteração de senha!! ✔", // Subject line
                    //text: `Olá, seu codigo para validação é ${codigo}`, // plain text body
                    html: htmlstream, // html body
                }, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email enviado com sucesso");
                        req.flash('msm', 'Email enviado com sucesso')
                    }
                })

                req.session.email = user.email
                res.redirect("/user/codigo")

            } catch (err) {
                console.log("==========")
                console.log(err)
                fs.unlinkSync(`public/html/${date}.html`)
                erro = `Ocorreu um erro ao encaminhar o e-mail, se o erro persistir entre em contato no nosso Whatsapp`
                req.flash('erro', erro)
                return res.redirect("/user/esqueceu")
            }
        } else {
            erro = 'Não foi identificado nenhum usuario com esse endereço de email, por gentileza realize o seu cadastro'
            req.flash('erro', erro)
            res.redirect("/user/esqueceu")
        }
    } else {
        erro = 'Email vazio'
        req.flash('erro', erro)
        res.redirect("/user/esqueceu")
    }
})


router.get("/user/codigo", async (req, res) => {
    var erro = req.flash("erro")
    erro = (erro == undefined || erro.length == 0) ? undefined : erro

    var email = req.session.email
    if (email != undefined) {
        var user = await User.findOne({ where: { email: email, status: true } })
        if (user != undefined) {
            var recuperaSenha = await RecuperaSenha.findOne({ where: { userId: user.id, status: true } })
            if (recuperaSenha != undefined) {
                res.render("user/codigo", { user: { email: user.email }, erro: erro })
            } else {
                var erro = 'Necessario encaminhar email novamente'
                req.flash('erro', erro)
                res.redirect("/user/esqueceu")
            }
        } else {
            var erro = 'Necessario encaminhar email novamente'
            req.flash('erro', erro)
            res.redirect("/user/esqueceu")
        }

    } else {
        var erro = 'Necessario encaminhar email novamente'
        req.flash('erro', erro)
        res.redirect("/user/esqueceu")
    }
})

router.post("/user/codigo", async (req, res) => {
    var codigo = req.body.codigo
    var email = req.session.email
    var erro = ''
    if (codigo != undefined && codigo != '') {
        try {
            var user = await User.findOne({ where: { email: email, status: true } })
            if (user != undefined) {
                var recuperaSenha = await RecuperaSenha.findOne({ where: { userId: user.id, uniqid: codigo, status: true } })
                if (recuperaSenha != undefined) {
                    RecuperaSenha.update({ aprovado: true, updatedAt: moment().format() }, { where: { id: recuperaSenha.id } }).then(() => {
                        req.session.email = user.email
                        res.redirect(`/user/alterar/`)
                    }).catch(err => {
                        console.log(err)
                        erro = "Ocorreu um erro ao consultar codigo, tente novamente. \nCaso o erro perista entre em contato no nosso Whatsapp"
                        req.flash('erro', erro)
                        res.redirect('/user/codigo')
                    })
                } else {
                    erro = "codigo inválido"
                    req.flash('erro', erro)
                    res.redirect('/user/codigo')
                }

            } else {
                var erro = 'Necessario encaminhar email novamente'
                req.flash('erro', erro)
                res.redirect("/user/esqueceu")
            }
        } catch (error) {
            console.log(error)
            erro = "Ocorreu um erro ao inserir o codigo, tente novamente"
            req.flash('erro', erro)
            res.redirect('/user/codigo')
        }
    } else {
        erro = "Codigo inválido ou inexistente"
        req.flash('erro', erro)
        res.redirect('/user/codigo')
    }
})


router.get("/user/alterar/", async (req, res) => {
    var erro = req.flash("erro")
    erro = (erro == undefined || erro.length == 0) ? undefined : erro
    var email = req.session.email
    if (email != undefined) {
        var user = await User.findOne({ where: { email: email, status: true } })
        if (user != undefined) {
            var recuperaSenha = await RecuperaSenha.findOne({ where: { userId: user.id, aprovado: true } })
            if (recuperaSenha != undefined) {
                RecuperaSenha.update({ status: false, updatedAt: moment().format() }, { where: { id: recuperaSenha.id } }).then(() => {
                    res.render("user/alterar", { erro: erro })
                })
            } else {
                var erro = 'Necessario encaminhar email novamente'
                req.flash('erro', erro)
                res.redirect("/user/esqueceu")
            }
        } else {
            erro = "Erro ao identificar seu usuario"
            req.flash('erro', erro)
            res.redirect('/user/esqueceu')
        }
    } else {
        erro = "Erro ao identificar seu usuario"
        req.flash('erro', erro)
        res.redirect('/user/esqueceu')
    }
})

router.post("/user/alterar/", async (req, res) => {
    var erro = ''
    var { senha, confirm } = req.body
    var email = req.session.email
    if (email != undefined) {
        if (senha == confirm && senha != '') {
            var user = await User.findOne({ where: { email: email, status: true } })
            if (user != undefined) {
                var recuperaSenha = await RecuperaSenha.findOne({ where: { userId: user.id, aprovado: true } })
                if (recuperaSenha != undefined) {
                    var salt = bcrypt.genSaltSync(10)
                    var hash = bcrypt.hashSync(senha, salt)
                    User.update({
                        senha: hash,
                        updatedAt: moment().format()
                    }, { where: { id: user.id } }).then(async () => {
                        var up = await RecuperaSenha.update({ aprovado: false, status: false }, { where: { id: recuperaSenha.id } })
                        req.session.user = user.id
                        res.redirect("/")
                    }).catch(err => {
                        console.log(err)
                        erro = "Ocorreu um erro, tente novamente"
                        req.flash('erro', erro)
                        res.redirect("/user/alterar/")
                    })
                } else {
                    erro = "Sem autorização para alterar, gentileza encaminhar email novamente"
                    req.flash('erro', erro)
                    res.redirect('/user/esqueceu')
                }
            } else {
                erro = "Erro ao identificar seu usuario"
                req.flash('erro', erro)
                res.redirect('/user/esqueceu')
            }
        } else {
            erro = "Senhas inválida"
            req.flash('erro', erro)
            res.redirect("/user/alterar/")
        }
    } else {
        erro = "Erro ao identificar seu usuario"
        req.flash('erro', erro)
        res.redirect('/user/esqueceu')
    }
})
//==========================FIM ESQUECEU SENHA DE USUARIO==========================


//===========================RESERVAS=========================
router.get("/user/reservas",auth,async(req,res)=>{
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0) ? undefined : erro

    var userId = req.session.user

    var usuario = await User.findOne({where:{id:userId,status:true}})
    if (usuario != undefined) {
        var reservas = await Reserva.findAll({where:{userId:usuario.id},order:[["createdAt",'DESC']]})
        for (let index = 0; index < reservas.length; index++) {
            var reserva = reservas[index];
            var funcionario = await Funcionario.findByPk(reserva.funcionarioId)
            var user = await User.findByPk(funcionario.userId)
            reserva.foto = user.foto
            reserva.apelido = funcionario.apelido
            reserva.ig = funcionario.ig
        }
        res.render("user/reservas",{reservas:reservas,erro:erro})
    } else {
        var erro = 'Sessão expirada'
        req.flash('erro',erro)
        res.redirect('/user/login')
    }
})
//==========================FIM RESERVAS==========================



module.exports = router