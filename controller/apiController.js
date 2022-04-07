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
const Empresa = require('../Database/Empresa')
const Reserva = require('../Database/Reserva')

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

    async function gerarHorarios(hora) {
        var primeira = moment(hora.split("-")[0],'h:m')
        var ultima = moment(hora.split("-")[1],'h:m')
        var hora = primeira
        var x = true
        var horas =[]
        horas.push(primeira.format('HH:mm'))
        while (x) {
            if (hora.add(30,'minutes').isSameOrBefore(ultima)) {
                horas.push(hora.format('HH:mm'))
            } else {
                x=false
            }
        }
        return horas
    }

    async function gerarHorariosFuncionario(funcionarioId,data) {
        var lista = []
        if (funcionarioId == 0) {
            var horariosGeral = await Horario.findAll()
        }else{
            var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
            var horariosGeral = await Horario.findAll({where:{funcionarioId:funcionario.id}})
        }
        horariosGeral.forEach(hora =>{
            var horas = []
            var primeira = moment(hora.as.split("-")[0],'h:m')
            var ultima = moment(hora.as.split("-")[1],'h:m')
            var indHora = primeira
            var x = true
            horas.push(primeira.format('HH:mm'))
            while (x) {
                if (indHora.add(30,'minutes').isSameOrBefore(ultima)) {

                    horas.push(indHora.format('HH:mm'))
                } else {
                    x=false
                }
            }
            hora.de = (hora.de < moment().isoWeekday() && data.isBefore(moment()))?moment().isoWeekday():hora.de
            lista.push({range:`${hora.de}-${hora.ate}`,funcionarioId:hora.funcionarioId,horas:horas})
            
        })

        return lista
    }

    async function gerarReservas(funcionarioId,data) {
        var lista = []
        var reservados = []
        var funcionariosIds = []
        if (funcionarioId == 0) {
            var horariosGeral = await Horario.findAll()
        }else{
            var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
            var horariosGeral = await Horario.findAll({where:{funcionarioId:funcionario.id}})
        }
        var reservas = await Reserva.findAll({where:{status:true}})
        for (let index = 0; index < reservas.length; index++) {
            const reserva = reservas[index];
            var corte = await Corte.findByPk(reserva.corteId)
            var data = moment(reserva.data,'DD/MM/YYYY').format('YYYY-MM-DD')
            if (moment(data).isSameOrAfter(moment().format("YYYY-MM-DD"))) {
                reservados.push({
                    hora:reserva.hora,
                    dia: moment(reserva.data,'DD/MM/YYYY').isoWeekday(),
                    tempo:corte.tempo,
                    funcionarioId:reserva.funcionarioId
                })
            }
        }
        var remover = []
        for (let i = 0; i < reservados.length; i++) {
            const reserva = reservados[i];
            
            var x = 0
            while(x < horariosGeral.length){
                if(
                    horariosGeral[x].funcionarioId != reserva.funcionarioId &&
                    horariosGeral[x].de <= reserva.dia && horariosGeral[x].ate >= reserva.dia
                ){
                    if (reservados.find(r => r.funcionarioId == horariosGeral[x].funcionarioId && r.hora == reserva.hora && r.dia == reserva.dia) == undefined) {
                        remover.push(reserva)
                    }else{
                        console.log("Outro cara vai trabalhar tambem")
                    }
                }
                x++
            }
            
        }

        reservados.filter(reserva => {
            if (remover.find(r=> r == reserva) == undefined) {
                if (lista.find(l => l.hora == reserva.hora && l.dia == reserva.dia) == undefined) {
                    lista.push({
                        hora:reserva.hora,
                        dia:reserva.dia,
                        tempo:reserva.tempo
                    })

                }
            }
        })

        return lista
    }

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
    var {data,funcionarioId,corteId,add} = req.body

    var dia = data.split(' ')[0]
    var hora = data.split(" ")[1]
    console.log(hora)
    if (data == undefined || data == '' ||  corteId == undefined || corteId == 0) {
        return res.json({erro:"Dados inválidos, gentileza recarregue a pagina e tente novamente"})
    }

    funcionarioId = (funcionarioId == undefined || funcionarioId == 0)?0:funcionarioId
    add = (add == undefined || add <= 0)?0:add

    var inicioSemana = moment().isoWeekday(1)
    var inicioSemanaSelecionada = inicioSemana.add(add,'week')
    var dataSelecionada = moment(inicioSemanaSelecionada).isoWeekday(parseInt(dia))

    if (dataSelecionada.isBefore(moment().format('YYYY-MM-DD'))) {
        return res.json({erro:'Data selecionada é anterior da data atual'})
    }else if (add == 0 && moment().isoWeekday() == dia && moment(hora,'HH:mm').isBefore(moment())){
        return res.json({erro:'Horario selecionado é anterior ao horario atual'})
    }

    if (funcionarioId == 0) {
        var horariosGeral = await Horario.findAll({ where: { de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } } })
    }else{
        var func = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
        var horariosGeral = await Horario.findAll({where:{funcionarioId:func.id ,de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } }})
    }
    var funcionarioDisponivel = []
    if (horariosGeral == undefined) {
        return res.json({erro:'Não foi encontrado nenhum funcionario disponivel para essa data'})
    } else {
        for (let i = 0; i < horariosGeral.length; i++) {
            var horario = horariosGeral[i];
            var funcionario = await Funcionario.findOne({where:{id:horario.funcionarioId,status:true}})
            if (funcionario != undefined) {
                var horaProcurada = moment(hora,'HH:mm')
                var inicio = moment(horario.as.split('-')[0],'HH:mm')
                var fim = moment(horario.as.split('-')[1],'HH:mm')
                var condicao = true
                if (inicio.isSame(horaProcurada)) {
                    funcionarioDisponivel.push(funcionario.id)
                    condicao = false
                }
                var index = inicio
                while (condicao) {
                    if (index.add(30,'minutes').isSameOrBefore(fim)) {
                        if (index.isSame(horaProcurada)) {
                            funcionarioDisponivel.push(funcionario.id)
                            condicao = false
                        }
                    } else {
                        condicao=false
                    }
                }
            }
        }
    }
    var barber = ''
    for (let i = 0; i < funcionarioDisponivel.length; i++) {
        const funcionarioId = funcionarioDisponivel[i];
        var exist = await Reserva.findOne({where:{data:dataSelecionada.format("DD/MM/YYYY"),status:true,funcionarioId:funcionarioId,hora:hora}})
        if (exist == undefined) {
            barber = funcionarioId
            i = funcionarioDisponivel.length
        }
    }

    if (barber != '') {
        Reserva.create({
            corteId:corteId,
            data:dataSelecionada.format("DD/MM/YYYY"),
            hora:hora,
            funcionarioId:barber,
            status:true,
            userId:1
        }).then(()=>{
            res.json({erro:'Deu certo garoto'})
        })
    } else {
        res.json({erro:'Esse horario ja está reservado'})
    }
    

    // var userId = req.session.user
    // if (userId == undefined) {
    //     req.session.agendamento = {data:data,funcionarioId:funcionarioId,corteId:corteId,add:add}
    //     res.json({erroId:1,erro:'Você será redirecionado para realizar seu login'})
    // } else {
    //     var disponivel = await Horario.findOne({ where: { de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } } })
    // }
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