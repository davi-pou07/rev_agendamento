const moment = require('moment')
const Funcionario = require("../Database/Funcionario")
const Horario = require("../Database/Horario")
const {Op} = require("sequelize")

async function gerarHorariosFuncionario(funcionarioId,data) {
    var lista = []
    if (funcionarioId == 0) {
        var funcionarios = await Funcionario.findAll({where:{status:true}})
        var funcionariosIds = []
        for (let index = 0; index < funcionarios.length; index++) {
            const funcionario = funcionarios[index];
            funcionariosIds.push(funcionario.id)
        }
        var horariosGeral = await Horario.findAll({where:{funcionarioId:{[Op.in]:funcionariosIds}}})
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
module.exports = gerarHorariosFuncionario