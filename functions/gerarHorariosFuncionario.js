const moment = require('moment')
const Funcionario = require("../Database/Funcionario")
const Horario = require("../Database/Horario")
const {Op} = require("sequelize")

async function gerarHorariosFuncionario(funcionarioId,data) {
    var iso = data.isoWeekday()
    var lista = []
    if (funcionarioId == 0) {
        var funcionarios = await Funcionario.findAll({where:{status:true}})
        var funcionariosIds = []
        for (let index = 0; index < funcionarios.length; index++) {
            const funcionario = funcionarios[index];
            funcionariosIds.push(funcionario.id)
        }
        var horariosGeral = await Horario.findAll({
            where:{
                funcionarioId:{[Op.in]:funcionariosIds}, 
                de:{[Op.lte]:iso},
                ate:{[Op.gte]:iso}
            }
        })
    }else{
        var funcionario = await Funcionario.findOne({where:{id:funcionarioId,status:true}})
        var horariosGeral = await Horario.findAll({where:
            {
                funcionarioId:funcionario.id,
                de:{[Op.lte]:iso},
                ate:{[Op.gte]:iso}
            }
        })
    }
    horariosGeral.forEach(hora =>{
        var horas = []
        var primeira = moment(hora.as.split("-")[0],'h:m')
        var ultima = moment(hora.as.split("-")[1],'h:m')
        var indHora = primeira
        var x = true
        var minute = 0
        do{
            if (indHora.add(minute,'minutes').isSameOrBefore(ultima)) {
                if (data.isAfter(moment(),'day')) {
                    horas.push(indHora.format('HH:mm'))
                }else if (indHora.isAfter(moment(),'hour')  ) {
                    horas.push(indHora.format('HH:mm'))
                }
            } else {
                x=false
            }
            minute = 30
        }while(x)
        //hora.de = (hora.de < moment().isoWeekday() && data.isBefore(moment()))?moment().isoWeekday():hora.de
        lista.push({funcionarioId:hora.funcionarioId,horas:horas})
        
    })
    console.log(lista)
    return lista
    
}
module.exports = gerarHorariosFuncionario