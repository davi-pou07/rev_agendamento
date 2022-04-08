const moment =  require("moment")
const Funcionario = require("../Database/Funcionario")

async function verificaFuncionarioDisponivel(horariosGeral,hora) {
    var funcionarioDisponivel = []
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
    return funcionarioDisponivel
}

module.exports = verificaFuncionarioDisponivel