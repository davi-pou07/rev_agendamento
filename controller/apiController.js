const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')
const User = require("../Database/User")
const auth = require("../middlewares/auth")
const moment = require("moment")
const usuarioAdmin = require("../functions/usuarioAdmin")
const Funcionario = require('../Database/Funcionario')
const Horario = require('../Database/Horario')
const Corte = require('../Database/Corte')

//================USUARIOS=====================

router.get('/usuario/:userId',async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var userId = req.params.userId
        try {
            if (userId != undefined) {
                var user = await User.findByPk(userId)
                if (user != undefined) {
                    res.json({user:{nome:user.nome,status:user.status,isAdmin:user.isAdmin}})
                } else {
                    res.json({erro:"Usuario não identificado"})
                }
            } else {
                res.json({erro:"Parametros invalidos"})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
                
    } else {
        res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})

router.post("/usuario",async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var {userId,status,isAdmin} = req.body
        try {
            if (userId != undefined) {
                var user = await User.findByPk(userId)
                if (user != undefined) {
                    User.update({
                        status:status,
                        isAdmin:isAdmin 
                    },{where:{id:user.id}}).then(()=>{
                        res.json({resp:"Atualização realizada com sucesso!"})
                    }).catch(err =>{
                        console.log(err)
                        res.json({erro:`Ocorreu um erro \n${err}`})
                    })
                } else {
                    res.json({erro:"Usuario não identificado"})
                }
            } else {
                res.json({erro:"Parametros invalidos"})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
    } else {
        res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})

//================FIM USUARIOS=====================

//================FUNCIONARIOS=====================



router.get('/funcionario/:funcionarioId',async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var funcionarioId = req.params.funcionarioId
        try {
            if (funcionarioId != undefined) {
                var funcionario = await Funcionario.findByPk(funcionarioId)
                if (funcionario != undefined) {
                    res.json({funcionario:{apelido:funcionario.apelido,status:funcionario.status,ig:funcionario.ig,id:funcionario.id}})
                } else {
                    res.json({erro:"Funcionario não identificado"})
                }
            } else {
                res.json({erro:"Parametros invalidos"})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
                
    } else {
        res.json({erro:`Nenhum Usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})



router.post("/funcionario/registrar",async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var {userId,apelido,ig} = req.body
        if (userId != undefined && userId != '' && apelido != undefined && apelido != '') {
            var exist = await Funcionario.findOne({where:{userId:userId}})
            if (exist == undefined) {
                Funcionario.create({
                    userId:userId,
                    apelido:apelido,
                    ig:ig,
                    status:true
                }).then(()=>{
                    res.json({resp:`Funcionario cadastrado com sucesso`}) 
                }).catch(err =>{
                    console.log(err)
                    res.json({erro:`Ocorreu um erro ao salvar, tente novamente`}) 
                })
            } else {
                res.json({erro:`Ja temos um funcionario cadastrado com esse usuario`}) 
            }
        } else {
            res.json({erro:`Informações vazias ou nula`}) 
        }
    } else {
        res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})

router.post("/funcionario",async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var {funcionarioId,status,ig,apelido} = req.body
        try {
            if (funcionarioId != undefined) {
                var funcionario = await Funcionario.findByPk(funcionarioId)
                if (funcionario != undefined) {
                    Funcionario.update({
                        status:status,
                        ig:ig,
                        apelido:apelido
                    },{where:{id:funcionario.id}}).then(()=>{
                        res.json({resp:"Atualização realizada com sucesso!"})
                    }).catch(err =>{
                        console.log(err)
                        res.json({erro:`Ocorreu um erro \n${err}`})
                    })
                } else {
                    res.json({erro:"Funcionario não identificado"})
                }
            } else {
                res.json({erro:"Parametros invalidos"})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
    } else {
        res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})

//================FIM FUNCIONARIOS=====================

//================HORARIO=====================
    router.post("/horario/adicionar",async(req,res)=>{
        if (await usuarioAdmin(req.session.user) != undefined) {
            var {de,ate,as,funcionarioId} = req.body
            if (de != '' && de != undefined && ate != '' && ate != undefined && as != '' && as != undefined && funcionarioId != '' && funcionarioId != undefined) {
                    var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
                    if (funcionario != undefined) {
                        var exist = await Horario.findOne({where:{funcionarioId:funcionario.id,de:de,ate:ate,as:as,status:true}})
                        if (exist == undefined) {
                            Horario.create({
                                funcionarioId:funcionario.id,
                                de:de,
                                ate:ate,
                                as:as,
                                status:true
                            }).then(()=>{
                                res.json({resp:"Foi adicionado um novo horario"})
                            }).catch(err =>{
                                res.json({erro:"Ocorreu um erro ao salvar, tente novamente"})
                            })
                        } else {
                            res.json({erro:"Horario ja cadastrado para esse funcionario"})
                        }
                    } else {
                        res.json({erro:"Funcionario não identificado ou status inativo"})
                    }
            } else {
                res.json({erro:`Dados inválidos`}) 
            }
        } else {
            res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
        }
    })

    router.post("/horario/remover",async(req,res)=>{
        if (await usuarioAdmin(req.session.user) != undefined) {
            var {horarioId,funcionarioId} = req.body
            if (funcionarioId != '' && funcionarioId != undefined && horarioId != '' && horarioId != undefined) {
                    var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
                    if (funcionario != undefined) {
                        var horario = await Horario.findOne({where:{funcionarioId:funcionario.id,id:horarioId}})
                        if (horario != undefined) {
                            Horario.destroy({where:{id:horario.id}}).then(()=>{
                                res.json({resp:"Horario foi removido"})
                            }).catch(err =>{
                                res.json({erro:"Ocorreu um erro ao deletar, tente novamente"})
                            })
                        } else {
                            res.json({erro:"Horario não foi identificado, recaregue a pagina e tente novamente"})
                        }
                    } else {
                        res.json({erro:"Funcionario não identificado ou status inativo"})
                    }
            } else {
                res.json({erro:`Dados inválidos`}) 
            }
        } else {
            res.json({erro:`Nenhum usuario logado, gentileza efetue o login e tente novamente`}) 
        }
    })
//================FIM HORARIO=====================

//================CORTE=====================
router.get('/corte/:corteId',async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var corteId = req.params.corteId
        try {
            if (corteId != undefined) {
                var corte = await Corte.findByPk(corteId)
                if (corte != undefined) {
                    res.json({corte:corte})
                } else {
                    res.json({erro:"Corte não identificado"})
                }
            } else {
                res.json({erro:"Parametros invalidos"})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
                
    } else {
        res.json({erro:`Nenhum Usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})

router.post('/corte/adicionar',async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var {nome,tempo,status,preco} = req.body
        try {
            if (nome != undefined && nome != '' && tempo != undefined && tempo != '' && status != undefined && status != '' && preco != undefined && preco != '') {
                Corte.create({
                    nome:nome,
                    tempo:tempo,
                    status:status,
                    preco:preco,
                }).then(()=>{
                    res.json({resp:'Corte adicionado com sucesso'})
                }).catch(err =>{
                    console.log(err)
                    res.json({erro:`Ocorreu um erro \n${err}`})
                })
            } else {
                res.json({erro:'Parametros inválidos'})
            }
        } catch (error) {
            console.log(error)
            res.json({erro:`Ocorreu um erro \n${error}`})
        }
                
    } else {
        res.json({erro:`Nenhum Usuario logado, gentileza efetue o login e tente novamente`}) 
    }
})
//================FIM CORTE=====================

module.exports = router