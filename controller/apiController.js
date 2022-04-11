const express = require('express')
const router = express.Router()

const Sequelize = require('sequelize')
const { Op } = require('sequelize')

const User = require("../Database/User")
const Funcionario = require('../Database/Funcionario')
const Horario = require('../Database/Horario')
const Corte = require('../Database/Corte')
const Empresa = require('../Database/Empresa')
const Reserva = require('../Database/Reserva')

const auth = require("../middlewares/auth")
const moment = require("moment")

const usuarioAdmin = require("../functions/usuarioAdmin")
const gerarHorarios = require("../functions/gerarHorarios")
const gerarHorariosFuncionario = require("../functions/gerarHorariosFuncionario")
const gerarReservas = require("../functions/gerarReservas")
const verificaFuncionarioDisponivel = require("../functions/verificaFuncionarioDisponivel")
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

router.get("/horarios/listar",async(req,res)=>{
    var add = req.query.add
    var funcionarioId = req.query.funcionarioId
    funcionarioId = (funcionarioId == undefined || funcionarioId == 0)?0:funcionarioId
    add = (add == undefined || add == 0)?0:add
    var dias = ['Seg','Ter','Qua','Qui','Sex','Sab','Dom']
    var inicioSemana = moment().isoWeekday(1)
    var filtro = inicioSemana.add(add,'week')
    //console.log(filtro)
    
    var horariosFunc = await gerarHorariosFuncionario(funcionarioId,filtro)
    //console.log("horariosFunc")
    //console.log(horariosFunc)
    
    var empresa = await Empresa.findOne()
    var horarios = await gerarHorarios(empresa.as)
    var horariosReservados = await gerarReservas(funcionarioId,filtro)
    //console.log("horariosReservados?????????????????")
    //console.log(horariosReservados)
    var datas = []
    var x = 0
    while(x < 7){
        datas.push(`${dias[x]} ${filtro.isoWeekday(x+1).format('DD/MM')}`)
        x++
    }
    res.json({datas:datas,horarios:horarios,horariosFunc:horariosFunc,horariosReservados:horariosReservados})
})

router.post("/horario/agendar",async(req,res)=>{
    //ERROS = 1-RELOAD; 2-LOGIN; 3-SOMENTE MOSTRAR
    var dias = ['Seg','Ter','Qua','Qui','Sex','Sab','Dom']
    var {data,funcionarioId,corteId,add} = req.body
    var userId = req.session.user
    //Separa dia e hora
    var dia = data.split(' ')[0]
    var hora = data.split(" ")[1]

    //Valida dados vazios
    if (data == undefined || data == '' ||  corteId == undefined || corteId == 0) {
        return res.json({erroId:1,erro:"Dados inválidos, gentileza tente novamente!"})
    }

    //Valida Id funcionario e a semana selecionada
    funcionarioId = (funcionarioId == undefined || funcionarioId == 0)?0:funcionarioId
    add = (add == undefined || add <= 0)?0:add

    //Verifica se a data é anterior a atual
    var inicioSemana = moment().isoWeekday(1)
    var inicioSemanaSelecionada = inicioSemana.add(add,'week')
    var dataSelecionada = moment(inicioSemanaSelecionada).isoWeekday(parseInt(dia))

    if (dataSelecionada.isBefore(moment().format('YYYY-MM-DD'))) {
        return res.json({erroId:1,erro:'Data selecionada é anterior da data atual'})
    }else if (add == 0 && moment().isoWeekday() == dia && moment(hora,'HH:mm').isBefore(moment())){
        return res.json({erroId:1,erro:'Horario selecionado é anterior ao horario atual'})
    }

    //Verifica um funcionario disponivel no horario solicitado
    if (funcionarioId == 0) {
        var horariosGeral = await Horario.findAll({ where: { de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } } })
    }else{
        var func = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
        var horariosGeral = await Horario.findAll({where:{funcionarioId:func.id ,de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } }})
    }

    if (horariosGeral == undefined) {
        return res.json({erroId:1,erro:'Não foi encontrado nenhum funcionario disponivel para essa data'})
    } else {
        var funcionarioDisponivel = await verificaFuncionarioDisponivel(horariosGeral,hora)
    }
    var barber = ''
    for (let i = 0; i < funcionarioDisponivel.length; i++) {
        const funcId = funcionarioDisponivel[i];
        var exist = await Reserva.findOne({where:{data:dataSelecionada.format("DD/MM/YYYY"),status:true,funcionarioId:funcId,hora:hora}})
        if (exist == undefined) {
            barber = funcId
            i = funcionarioDisponivel.length
        }
    }
    if (barber != '') {
        if (userId == undefined) {
            data = `${dias[parseInt(data.split(' ')[0])-1]} ${dataSelecionada.format('DD/MM')}`
            req.session.agendamento = {data:data,funcionarioId:barber,corteId:corteId,add:add}
            return res.json({erroId:2,erro:'Você será redirecionado para realizar seu login'})
        }else{
            var usuario = await User.findByPk(userId)
            if (usuario != undefined && usuario.status == true) {
                if (usuario.isAdmin != true) {
                    var existReserva = await Reserva.findOne({where:{status:true,userId:usuario.id}})
                    if (existReserva != undefined) {
                        return res.json({erroId:3,erro:'Você ja tem uma reserva pendente. Verifique no seu cadastro!'})
                    }
                }
            } else {
                data = `${dias[parseInt(data.split(' ')[0])-1]} ${dataSelecionada.format('DD/MM')}`
                req.session.agendamento = {data:data,funcionarioId:barber,corteId:corteId,add:add}
                return res.json({erroId:2,erro:'Não foi possivel identificar usuario logado. Gentileza realize login novamente'})
            }
        }
        
        Reserva.create({
            corteId:corteId,
            data:dataSelecionada.format("DD/MM/YYYY"),
            hora:hora,
            funcionarioId:barber,
            status:true,
            userId:userId
        }).then(()=>{
            req.session.agendamento = 0
            res.json({resp:'Deu certo garoto'})
        }).catch(err =>{
            res.json({erro:'Ocorreu um erro ao salvar'})
        })

    } else {
        res.json({erro:'Esse horario ja está reservado'})
    }
    
})

router.get("/reserva/:reservaId",async(req,res)=>{
    var reservaId = req.params.reservaId
    var userId = req.session.user
    if (reservaId != undefined) {
        if (userId != undefined) {
            var user = await User.findOne({where:{id:userId,status:true}})
            if (user != undefined) {
                var reserva = await Reserva.findOne({where:{userId:user.id,id:reservaId}})
                if (reserva != undefined) {
                    var barber = await Funcionario.findByPk(reserva.funcionarioId)
                    if (barber != undefined) {
                        var corte = await Corte.findByPk(reserva.corteId)
                        if (corte != undefined) {
                            res.json({reserva:reserva,corte:corte,barber:barber,dataCri:moment(reserva.createdAt).format("DD/MM/YYYY HH:mm")})
                        } else {
                            res.json({erro:"Não foi possivel encontrar corte dessa reserva. Gentileza entre em contato em nossos canais de atendimento"})
                        }
                    } else {
                        res.json({erro:"Não foi possivel encontrar funcionario dessa reserva. Gentileza entre em contato em nossos canais de atendimento"})
                    }
                } else {
                    res.json({erro:"Não foi possivel identificar reserva realizada"})
                }
            } else {
                res.json({erro:"Sessão expirada. Faça o login e tente novamente"})
            }
        } else {
            res.json({erro:"Sessão expirada. Faça o login e tente novamente"})
        }
    } else {
        res.json({erro:"Parametros inválidos"})
    }
})


router.post("/reserva/cancelar",async(req,res)=>{
    var reservaId = req.body.reservaId
    var userId = req.session.user
    if (reservaId != undefined) {
        if (userId != undefined) {
            var user = await User.findOne({where:{status:true,id:userId}})
            if (user != undefined) {
                var reserva = await Reserva.findOne({where:{status:true,userId:user.id,id:reservaId}})
                if (reserva != undefined) {
                    Reserva.update({
                        status:false
                    },{where:{
                        id:reserva.id
                    }}).then(()=>{
                        res.json({resp:'Reserva cancelada'})
                    }).catch(err =>{
                        res.json({erro:"Ocorreu um erro ao cancelar, tente novamente"})
                    })
                } else {
                    res.json({erro:"Não foi possivel identificar reserva informada"})
                }                
            } else {
                res.json({erro:"Sessão expirada. Faça o login e tente novamente"})
            }
        } else {
            res.json({erro:"Sessão expirada. Faça o login e tente novamente"})
            
        }
    } else {
        res.json({erro:"Parametros inválidos"})
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
        var {nome,tempo,status,preco,descricao} = req.body
        if(preco.toString().includes(",")){
            preco = parseFloat(preco.toString().replace(/\./g,"").replace(",","."))
        }
        try {
            if (nome != undefined && nome != '' && descricao != undefined && descricao != '' && tempo != undefined && tempo != '' && status != undefined && status != '' && preco != undefined && preco != '') {
                Corte.create({
                    nome:nome,
                    tempo:tempo,
                    status:status,
                    preco:preco,
                    descricao:descricao
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

router.post('/corte/editar',async(req,res)=>{
    if (await usuarioAdmin(req.session.user) != undefined) {
        var {corteId,nome,tempo,status,preco,descricao} = req.body
        if(preco.toString().includes(",")){
            preco = parseFloat(preco.toString().replace(/\./g,"").replace(",","."))
        }
        try {
            if (nome != undefined && nome != '' && corteId != undefined && corteId != '' && descricao != undefined && descricao != '' && tempo != undefined && tempo != '' && status != undefined && status != '' && preco != undefined && preco != '') {
                var corte = await Corte.findByPk(corteId)
                if (corte != undefined) {
                    Corte.update({
                        nome:nome,
                        tempo:tempo,
                        status:status,
                        preco:preco,
                        descricao:descricao
                    },{where:{id:corteId}}).then(()=>{
                        res.json({resp:'Corte atualizado com sucesso'})
                    }).catch(err =>{
                        console.log(err)
                        res.json({erro:`Ocorreu um erro \n${err}`})
                    })
                } else {
                    res.json({erro:'Não foi possivel identificar o corte que deseja altera. Recarregue a pagina!'})
                }
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


//================EMPRESA=====================

router.get("/empresa",async(req,res)=>{
    console.log("aqui")
    try {
    var empresa = await Empresa.findOne()
    res.json({empresa:empresa})
    } catch (error) {
        console.log(error)
    }
})
//================FIM EMPRESA=====================

module.exports = router