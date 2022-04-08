const moment = require('moment')
const Funcionario = require("../Database/Funcionario")
const Horario = require("../Database/Horario")
const Reserva = require("../Database/Reserva")
const Corte = require("../Database/Corte")

async function gerarReservas(funcionarioId,data) {
    var lista = []
    var reservados = []

    if (funcionarioId == 0) {
        var horariosGeral = await Horario.findAll()
        var reservas = await Reserva.findAll({where:{status:true}})
    }else{
        var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
        var horariosGeral = await Horario.findAll({where:{funcionarioId:funcionario.id}})
        var reservas = await Reserva.findAll({where:{status:true,funcionarioId:funcionario.id}})
    }

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

            var minutos = moment(corte.tempo,'HH:mm').subtract(30,'minutes').minute()
            var horas = moment(corte.tempo,'HH:mm').subtract(30,'minutes').hour()
            //hora a mais
            reservados.push({
            hora:moment(reserva.hora,'HH:mm').add({'hours':horas,'minute':minutos}).format('HH:mm'),
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

module.exports = gerarReservas