const express = require('express')
const router = express.Router()

const sequelize = require('../Database/database')

const { Op , QueryTypes} = require('sequelize')
const User = require("../Database/User")
const Funcionario = require("../Database/Funcionario")
const Horario = require('../Database/Horario')
const Empresa = require('../Database/Empresa')


const authAdm = require("../middlewares/authAdm")

const moment = require("moment")
const validator = require("validator")
const Banner = require('../Database/Banner')
const Postagem = require('../Database/Postagem')
const Corte = require('../Database/Corte')
const Reserva = require('../Database/Reserva')
const Aviso = require('../Database/Aviso')

//=============== USUARIOS =======================

router.get("/usuarios",authAdm,async(req,res)=>{
    try {
        var usuarios = await User.findAll()
        for (var index = 0; index < usuarios.length; index++) {
            usuarios[index].dataCri = moment(usuarios[index].createdAt).format("DD/MM/YYYY HH:mm")
            usuarios[index].dataLog = moment(usuarios[index].updatedAt).format("DD/MM/YYYY HH:mm")
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
            funcionarios[index].dataCri = moment(funcionarios[index].createdAt).format("DD/MM/YYYY HH:mm")
            funcionarios[index].dataLog = moment(funcionarios[index].updatedAt).format("DD/MM/YYYY HH:mm")
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
            var erro = `Parametros inv??lidos`
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
        var endereco = req.flash("endereco")
        var de = req.flash("de")
        var ate = req.flash("ate")
        var as = req.flash("as")

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
            empresa.endereco = (endereco == undefined || endereco.length == 0)?undefined:endereco
            empresa.de = (de == undefined || de.length == 0)?undefined:de
            empresa.ate = (ate == undefined || ate.length == 0)?undefined:ate
            empresa.as = (as == undefined || as.length == 0)?undefined:as
        }
        res.render("admin/customizar/empresa",{empresa:empresa,erro:erro,msm:msm})
    } catch (error) {
        var msmErro = 'Ocorreu um erro:\n' + error
        req.flash("erro",msmErro)
        res.redirect('/admin')
    }
})

router.post("/empresa",authAdm,async(req,res)=>{
    var {logo,nome,whats,facebook,descricao,email,ig,endereco,de,ate,as} = req.body

    req.flash("logo",logo)
    req.flash("nome",nome)
    req.flash("whats",whats)
    req.flash("facebook",facebook)
    req.flash("descricao",descricao)
    req.flash("email",email)
    req.flash("ig",ig)
    req.flash("endereco",endereco)
    req.flash("de",de)
    req.flash("ate",ate)
    req.flash("as",as)
    var erro = ''
    var msm = ''
    if (
        logo != '' && logo != undefined &&
        nome != '' && nome != undefined &&
        whats != '' && whats != undefined &&
        email != '' && email != undefined &&
        ig != '' && ig != undefined &&
        de != '' && de != undefined &&
        ate != '' && ate != undefined &&
        as != '' && as != undefined &&
        endereco != '' && endereco != undefined 
    ) {

        if (validator.isEmail(email) != true) {
            erro = 'Email Inv??lido'
            req.flash('erro', erro)
            return res.redirect('/admin/empresa')
        }

        if (validator.isMobilePhone(whats, 'pt-BR', false) != true) {
            erro = 'Celular Inv??lido'
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
                endereco:endereco,
                de:de,
                ate:ate,
                as:as,
                ig:ig
            }).then(()=>{
                msm = 'Atualiza????es realizada com sucesso'
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
                de:de,
                ate:ate,
                as:as,
                endereco:endereco,
                ig:ig
            },{where:{id:empresa.id}}).then(()=>{
                msm = 'Atualiza????es realizada com sucesso'
                req.flash('msm',msm)
                res.redirect('/admin/empresa')
            }).catch(err =>{
                erro = `Ocorreu um erro ao salvar dados\n${err}`
                req.flash('erro',erro)
                res.redirect('/admin/empresa')
            })
        }
    } else {
        erro = 'Dados inv??lidos, revise novamente as informa????es passada'
        req.flash('erro',erro)
        res.redirect('/admin/empresa')
    }
})


//=============== FIM EMPRESA =======================


//=============BANNERS========================
router.get("/banners",authAdm,async(req,res)=>{
    var erro = req.flash("erro")
    erro =(erro == undefined || erro.length == 0)?undefined:erro
    var banners = await Banner.findAll()
    for (let index = 0; index < banners.length; index++) {
        var banner = banners[index];
        banner.dataCri = moment(banner.createdAt).format("DD/MM/YYYY HH:mm")
    }
    res.render("admin/customizar/banners",{banners:banners,erro:erro})
})

router.get("/banners/adicionar",authAdm,async(req,res)=>{
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    var bannerId = req.query.bannerId
    if (bannerId != undefined) {
        var banner = await Banner.findByPk(bannerId)
        if (banner != undefined) {
            res.render("admin/customizar/banners-adicionar",{banner:banner,erro:erro})
        } else {
            req.flash('erro','N??o foi possivel identificar banner informado')
            res.redirect("/admin/banners")
        }
    } else {
        res.render("admin/customizar/banners-adicionar",{banner:undefined,erro:erro})
    }
})

router.post("/banners/adicionar",authAdm,async(req,res)=>{
    var {titulo,imagem,imagemMobile,status,bannerId} = req.body
    var erro = ''
    if (titulo != undefined && titulo != '' && status != undefined && status != '' ) {

        if (imagem == '' && imagemMobile == '') {
            erro = `Informar ao menos um das duas imagens`
            req.flash('erro',erro)
            if (bannerId != "" && bannerId != undefined) {
                return res.redirect("/admin/banners/adicionar?bannerId="+bannerId)
            } else {
                return res.redirect('/admin/banners/adicionar')
            }
        }

        if (bannerId != "" && bannerId != undefined) {
            try {
                var banner = await Banner.findByPk(bannerId)
            } catch (err) {
                erro = `Ocorreu um erro ao atualizar banner\n${err}`
                req.flash('erro',erro)
                return res.redirect('/admin/banners/adicionar')
            }
            if (banner != undefined) {
                Banner.update({
                    titulo:titulo,
                    foto:imagem,
                    fotoMobile:imagemMobile,
                    status:status
                },{where:{
                    id:banner.id
                }}).then(()=>{
                    res.redirect("/admin/banners")
                }).catch(err =>{
                    erro = `Ocorreu um erro ao atualizar banner\n${err}`
                    req.flash('erro',erro)
                    res.redirect("/admin/banners/adicionar?bannerId="+bannerId)
                })
            } else {
                req.flash('erro','N??o foi possivel identificar banner informado')
                res.redirect("/admin/banners")
            }
        } else {
            Banner.create({
                titulo:titulo,
                foto:imagem,
                fotoMobile:imagemMobile,
                status:status
            }).then(()=>{
                res.redirect("/admin/banners")
            }).catch(err =>{
                erro = `Ocorreu um erro ao adicionar banner\n${err}`
                req.flash('erro',erro)
                res.redirect("/admin/banners/adicionar")
            })
        }
    } else {
        erro = 'Dados inv??lidos ou vazio'
        req.flash('erro',erro)
        res.redirect("/admin/banners/adicionar")
    }
})

//=============FIM BANNERS========================

//=============POSTAGENS========================

router.get("/postagens",authAdm,async(req,res)=>{
    var erro = req.flash("erro")
    erro =(erro == undefined || erro.length == 0)?undefined:erro
    var postagens = await Postagem.findAll()
    for (let index = 0; index < postagens.length; index++) {
        var post = postagens[index];
        post.dataCri = moment(post.createdAt).format("DD/MM/YYYY HH:mm")
    }
    res.render("admin/customizar/postagens",{postagens:postagens,erro:erro})
})

router.get("/postagens/adicionar",authAdm,async(req,res)=>{
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    var postId = req.query.postId
    if (postId != undefined) {
        var post = await Postagem.findByPk(postId)
        if (post != undefined) {
            res.render("admin/customizar/postagens-adicionar",{post:post,erro:erro})
        } else {
            req.flash('erro','N??o foi possivel identificar postagem informada')
            res.redirect("/admin/postagens")
        }
    } else {
        res.render("admin/customizar/postagens-adicionar",{post:undefined,erro:erro})
    }
})

router.post("/postagens/adicionar",authAdm,async(req,res)=>{
    var {titulo,post,status,postId,tipo} = req.body
    var erro = ''
    if (titulo != undefined && titulo != '' && post != undefined && post != '' &&  tipo != undefined && tipo != '' && status != undefined && status != '' ) {
        if (postId != "" && postId != undefined) {
            try {
                var postagem = await Postagem.findByPk(postId)
            } catch (err) {
                erro = `Ocorreu um erro ao atualizar Postagem\n${err}`
                req.flash('erro',erro)
                return res.redirect('/admin/postagens/adicionar')
            }
            if (postagem != undefined) {
                Postagem.update({
                    titulo:titulo,
                    post:post,
                    tipo:tipo,
                    status:status
                },{where:{
                    id:postagem.id
                }}).then(()=>{
                    res.redirect("/admin/postagens")
                }).catch(err =>{
                    erro = `Ocorreu um erro ao atualizar Postagem\n${err}`
                    req.flash('erro',erro)
                    res.redirect("/admin/postagens/adicionar")
                })
            } else {
                req.flash('erro','N??o foi possivel identificar Postagem informada')
                res.redirect("/admin/postagens")
            }
        } else {
            Postagem.create({
                titulo:titulo,
                post:post,
                tipo:tipo,
                status:status
            }).then(()=>{
                res.redirect("/admin/postagens")
            }).catch(err =>{
                erro = `Ocorreu um erro ao adicionar Postagem\n${err}`
                req.flash('erro',erro)
                res.redirect("/admin/postagens/adicionar")
            })
        }
    } else {
        erro = 'Dados inv??lidos ou vazio'
        req.flash('erro',erro)
        res.redirect("/admin/postagens/adicionar")
    }
})


//=============FIM POSTAGENS========================


//=============CORTES========================
router.get("/cortes",authAdm,async(req,res)=>{
    var erro = req.flash("erro")
    erro =(erro == undefined || erro.length == 0)?undefined:erro
    var cortes = await Corte.findAll()
    for (let index = 0; index < cortes.length; index++) {
        var corte = cortes[index];
        corte.dataCri = moment(corte.createdAt).format("DD/MM/YYYY HH:mm")
    }
    res.render("admin/cortes/cortes",{cortes:cortes,erro:erro})
})
//=============FIM CORTES========================

//=============RESERVAS========================

router.get("/reservas",authAdm,async(req,res)=>{
    //filtro 0 = pendentes, 1 = todos, 2 = finalizados , 3 = administrativos
    var {barberId,filtro,hoje} =req.query
    hoje = (hoje == 'true')? true:false
    var barber =  (barberId == undefined)?undefined:await Funcionario.findByPk(barberId)

    var adminIds = `(0`
    var users = await User.findAll({where:{isAdmin:true}})
    users.forEach(user =>{
        adminIds += `,${user.id}`
        //adminIds.push(user.id)
    })
    adminIds += ')'

    var dataAtual = moment().format("DD/MM/YYYY")
    var whereData = (hoje == true)?`AND data = '${dataAtual}'`:``

    filtro = (filtro == undefined && barberId != undefined)?0:parseInt(filtro)
    switch (filtro) {
        case 0:
            var reservas = await sequelize.query(`select * from reservas where status = true and "funcionarioId" = ${barberId} AND "userId" not in ${adminIds} ${whereData}`,{ type: QueryTypes.SELECT })
            //var reservas = await Reserva.findAll({where:{status:true,funcionarioId:barberId,userId:{[Op.notIn]:adminIds}}})
            break;
        case 1:
            var reservas = await  sequelize.query(`select * from reservas where "funcionarioId" = ${barberId} ${whereData}`,{ type: QueryTypes.SELECT })
            //var reservas = await Reserva.findAll({where:{funcionarioId:barberId}})
            break;
        case 2:
            var reservas = await  sequelize.query(`select * from reservas where status = false AND "funcionarioId" = ${barberId} AND "userId" not in ${adminIds} ${whereData}`,{ type: QueryTypes.SELECT })
            //var reservas = await Reserva.findAll({where:{status:false,funcionarioId:barberId,userId:{[Op.notIn]:adminIds}}})
            break;
        case 3:
            var reservas = await  sequelize.query(`select * from reservas where "funcionarioId" = ${barberId} AND "userId" in ${adminIds} ${whereData}`,{ type: QueryTypes.SELECT })
            //var reservas = await Reserva.findAll({where:{funcionarioId:barberId,userId:{[Op.in]:adminIds}}})
            break;
        default:
            var reservas =  undefined
            break;
    }

    if(reservas != undefined){
        for (let index = 0; index < reservas.length; index++) {
            var reserva = reservas[index];
            reserva.dataCri = moment(reserva.createdAt).format("DD/MM/YYYY HH:mm")
    
            var user = await User.findByPk(reserva.userId)
            reserva.user = `${user.nome.split(' ')[0]} (${user.id})`
    
            var corte = await Corte.findByPk(reserva.corteId)
            reserva.corte = corte.nome
        }
    }
    
    var funcionarios = await Funcionario.findAll()
   
    res.render("admin/reservas/reservas",{barber:barber,reservas:reservas,funcionarios:funcionarios,filtro:filtro,hoje:hoje})
})

//=============FIM RESERVAS========================

//=============FIM RESERVAS========================
router.get("/avisos",authAdm,async(req,res)=>{
    var erro = req.flash("erro")
    erro =(erro == undefined || erro.length == 0)?undefined:erro
    var avisos = await Aviso.findAll()
    for (let index = 0; index < avisos.length; index++) {
        var aviso = avisos[index];
        aviso.prazo = moment(aviso.prazo).format("DD/MM/YYYY")
        aviso.dataCri = moment(aviso.createdAt).format("DD/MM/YYYY HH:mm")
    }
    res.render("admin/avisos/avisos",{avisos:avisos,erro:erro})
})
//=============FIM RESERVAS========================



module.exports = router