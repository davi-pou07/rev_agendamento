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

const userController = require("./controller/userController")
const adminController = require("./controller/adminController")
const apiController = require("./controller/apiController")
//databases
const path = require('path')
const PORT = process.env.PORT || 6060

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
   res.render("index")
})

app.get("/admin",authAdm, async(req, res) => {
    var erro = req.flash('erro')
    erro = (erro == undefined || erro.length == 0)?undefined:erro
    res.render("admin/index",{erro:erro})
 })

app.listen(PORT, () => {
    console.log("Servidor ligado")
})