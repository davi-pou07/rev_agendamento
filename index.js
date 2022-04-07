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
const PORT = 6060

const moment =  require('moment')
const authAdm = require("./middlewares/authAdm")

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
        var banners = await Banner.findAll({where:{status:true}})
        var postagens = await Postagem.findAll({where:{status:true}})
        var cortes = await Corte.findAll({where:{status:true},order: [['preco', 'asc']]})
        var empresa = await Empresa.findOne() 
    } catch (error) {
        console.log(error)
    }
   
   res.render("index",{banners:banners,postagens:postagens,cortes:cortes,empresa:empresa})
})

app.get("/agendamento", async(req, res) => {
    
    var {barberId,data,corteId} = req.query
    var dias = ['Seg','Ter','Qua','Qui','Sex','Sab','Dom']
    data = (data == undefined)? `${dias[parseInt(moment().isoWeekday())-1]} ${moment().format('DD/MM')}`:data

    var existFunc = await Funcionario.findByPk(barberId)
    barberId = (existFunc == undefined)?0:existFunc.id
    var existCort = await Corte.findByPk(corteId)
    corteId = (existCort == undefined)?0:existCort.id

    var cortes = await Corte.findAll({where:{status:true}})
    var barbers = await Funcionario.findAll({where:{status:true}})

    res.render("agendamento",{barbers:barbers,barberId:barberId,cortes:cortes,corteId:corteId,data:data})
 })

app.get("/admin",authAdm, async(req, res) => {
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    res.render("admin/index",{erro:erro})
 })

app.listen(PORT, () => {
    console.log("Servidor ligado")
})