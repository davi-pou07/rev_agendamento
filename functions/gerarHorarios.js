
const moment = require("moment")

async function gerarHorarios(hora) {
    var primeira = moment(hora.split("-")[0],'h:m')
    var ultima = moment(hora.split("-")[1],'h:m')
    var hora = primeira
    var condicao = true
    var horas =[]
    horas.push(primeira.format('HH:mm'))
    while (condicao) {
        if (hora.add(30,'minutes').isSameOrBefore(ultima)) {
            horas.push(hora.format('HH:mm'))
        } else {
            condicao=false
        }
    }
    return horas
}

module.exports = gerarHorarios