require('dotenv').config()

const express = require("express")
const app = express()

const session = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require('express-flash')
const bodyParser = require("body-parser")

const User = require("./Database/User")
const RecuperaSenha = require("./Database/RecuperaSenha")
const Funcionario = require("./Database/Funcionario")
const Horario = require("./Database/Horario")
const Empresa = require("./Database/Empresa")
const Banner = require("./Database/Banner")
const Postagem = require("./Database/Postagem")
const Corte = require("./Database/Corte")
const Reserva = require("./Database/Reserva")

const userController = require("./controller/userController")
const adminController = require("./controller/adminController")
const apiController = require("./controller/apiController")
//databases
const path = require('path')
const PORT = process.env.PORT ||6060

const moment =  require('moment')
const authAdm = require("./middlewares/authAdm")
const auth = require('./middlewares/auth')

app.use(cookieParser("asdfasfdasfaz"))
app.use(session({
    secret: "sdfsdfsdfgdfgfgh",
    resave:false,
    saveUninitialized:true,
    cookie: { maxAge: 7200000 }
}))
app.use(flash())

const usuarioAdmin = require("./functions/usuarioAdmin")

//usar o EJS como view engine | renderizador de html
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//Carregamento de arquivos estaticos no express
app.use(express.static(path.join(__dirname, 'public')))
//Carregamento do bodyPerser
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }))
app.use(bodyParser.json({ limit: '50mb' }))

app.use("/",userController)


app.use("/admin",adminController)
app.use("/api",apiController)

app.get("/", async(req, res) => {
    try {
        var existUser = await User.findOne()
        if (existUser != undefined) {
            var empresa = await Empresa.findOne() 
            if (empresa != undefined) {
                var banners = await Banner.findAll({where:{status:true}})
                var postagens = await Postagem.findAll({where:{status:true}})
                var cortes = await Corte.findAll({where:{status:true},order: [['preco', 'asc']]})
                var barbers = await Funcionario.findAll({where:{status:true}})
                for (let index = 0; index < barbers.length; index++) {
                    var usuario = await User.findByPk(barbers[index].userId)
                    barbers[index].foto = usuario.foto
                }
                res.render("index",{banners:banners,postagens:postagens,cortes:cortes,empresa:empresa,barbers:barbers})
            } else {
                res.redirect("/admin/empresa")
            }
        } else {
            res.redirect("/user/registrar")
        }
    } catch (error) {
        console.log(error)
    }
})

app.get("/agendamento", async(req, res) => {
    
    var {barberId,data,corteId} = req.query
    var dias = ['Seg','Ter','Qua','Qui','Sex','Sab','Dom']
    data = (data == undefined || data == 0)? `${dias[parseInt(moment().isoWeekday())-1]} ${moment().format('DD/MM')}`:data

    var dataFilt = moment(data.split(' ')[1],'DD/MM').isoWeekday(1)
    var before = moment().add(3,'week')
    if (before.isBefore(dataFilt)) {
        data = `${dias[parseInt(moment().isoWeekday())-1]} ${moment().format('DD/MM')}`
    }
    var f = true
    var add = 0
    while (f) {
        var inicioSemana = moment().isoWeekday(1)
        var filtro = inicioSemana.add(add,'w')
        if (dataFilt.isBefore(filtro) == false && add < 4) {
            console.log("mais um???")
            if (filtro.format('DD/MM/YYYY') == dataFilt.format('DD/MM/YYYY')) {
                f = false
            }else{
                add = add + 1
            }
        } else {
            console.log("mais um")
            f = false
        }
    }


    var existFunc = await Funcionario.findByPk(barberId)
    barberId = (existFunc == undefined)?0:existFunc.id
    var existCort = await Corte.findByPk(corteId)
    corteId = (existCort == undefined)?0:existCort.id

    var cortes = await Corte.findAll({where:{status:true}})
    var barbers = await Funcionario.findAll({where:{status:true}})
    for (let index = 0; index < barbers.length; index++) {
        var usuario = await User.findByPk(barbers[index].userId)
        barbers[index].foto = usuario.foto
    }
    res.render("agendamento",{barbers:barbers,barberId:barberId,cortes:cortes,corteId:corteId,data:data,add:add})
 })

 app.get("/sucesso",auth,(req,res)=>{
     res.render("sucesso")
 })

app.get("/admin",authAdm, async(req, res) => {
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    res.render("admin/index",{erro:erro})
 })



setInterval(async function () {
    var hoje = moment()
    var reservas = await Reserva.findAll({where:{status:true}})
    reservas.forEach(async reserva =>{
        var dataAgend = moment(reserva.data,'DD/MM/YYYY')
        dataAgend.set('hour',parseInt(reserva.hora.split(':')[0]))
        dataAgend.set('minute',parseInt(reserva.hora.split(':')[1]))
        
        if(moment(hoje).isAfter(dataAgend)){
            var update = await Reserva.update({status:false},{where:{id:reserva.id}})
            console.log(`Atualizado reserva ${reserva.id}`)
        }
    })
  }, 900000);




app.listen(PORT, () => {
    console.log("Servidor ligado")
})