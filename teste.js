require('dotenv').config()
const moment = require("moment")
const Horario = require("./Database/Horario")
const { Op } = require("sequelize")

// var hora = '15:00'
// var data = '30/03/2022'

// var dia = moment(data, 'DD/MM/YYYY').isoWeekday()

// async function name() {
//     var horarioFornec = await Horario.findAll({ where: { de: { [Op.lte]: dia }, ate: { [Op.gte]: dia } } })
//     horarioFornec.forEach(horaio => {
//         console.log("!!!!!!!!!!!!!!!!!!!")
//         console.log(horaio.as)
//         var primeira = moment(horaio.as.split("-")[0], 'HH:mm')
//         var ultima = moment(horaio.as.split("-")[1], 'HH:mm')
//         var x = true
//         var index = primeira
//         if (primeira.format('HH:mm') == hora) {
//             //Pesquisar se esta disponivel
//             x = false
//             console.log(primeira)
//         } else {
//             while (x) {
//                 if (index.add(30, 'm').isSameOrBefore(ultima)) {
//                     if (index.format('HH:mm') == hora) {
//                         var x = false
//                         //Pesquisa se ta disponivel
//                         console.log("==============")
//                         console.log(index.format('HH:mm'))
//                         console.log("==============")
//                     }else{
//                         console.log("Ainda nao")
//                         console.log(index.format('HH:mm'))
//                     }
//                 } else {
//                     x = false
//                 }
//             }
//         }
//     })
//     //console.log(dia)
//     //console.log(horarioFornec.find(hf => hf.de <= dia && hf.ate >= dia))
// }
// name()



var hora = '08:00-12:30'
var primeira = moment(hora.split("-")[0],'h:m')
var ultima = moment(hora.split("-")[1],'h:m')
var hora = primeira
var x = true
var horas =[]
horas.push(primeira.format('hh:mm'))
while (x) {
    if (hora.add(30,'minutes').isSameOrBefore(ultima)) {
        horas.push(hora.format('hh:mm'))
    } else {
        x=false
    }
}
console.log(horas)
var corte1 = {duracao:'01:30',hora:'08:30'}
var corte2 = {duracao:'01:00',hora:'11:30'}
if(horas.find(h => corte1.hora == h) != undefined){
    var h = horas.find(h => corte1.hora == h)
    var contagem = moment(h,'hh:mm').add(corte1.duracao,'hh:mm').format('hh:mm')
    var primeiroInd = horas.indexOf(corte1.hora)
    var ultimoInd = horas.indexOf(contagem)
    console.log(primeiroInd)
    console.log(ultimoInd)
    horas.splice(primeiroInd,ultimoInd)
    console.log(horas)
}else{
    console.log("horario indisponivel")
}

if(horas.find(h => corte2.hora == h) != undefined){
    var h = horas.find(h => corte2.hora == h)
    var contagem = moment(h,'hh:mm').add(corte2.duracao,'hh:mm').format('hh:mm')
    var primeiroInd = horas.indexOf(corte2.hora)
    var ultimoInd = horas.indexOf(contagem)
    console.log(primeiroInd)
    console.log(ultimoInd)
    horas.splice(primeiroInd,ultimoInd)
    console.log(horas)
}else{
    console.log("horario indisponivel")
}

