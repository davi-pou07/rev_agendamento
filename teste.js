const moment = require("moment")
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

