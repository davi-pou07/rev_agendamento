require('dotenv').config()

const express = require("express")
const app = express()

const session = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require('express-flash')
const bodyParser = require("body-parser")

const User = require("./Database/User")

const userController = require("./controller/userController")

//databases
const path = require('path')
const PORT = process.env.PORT || 6060

app.use(cookieParser("asdfasfdasfaz"))
app.use(session({
    secret: "sdfsdfsdfgdfgfgh",
    resave:false,
    saveUninitialized:true,
    cookie: { maxAge: 7200000 }
}))
app.use(flash())


//usar o EJS como view engine | renderizador de html
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//Carregamento de arquivos estaticos no express
app.use(express.static(path.join(__dirname, 'public')))
//Carregamento do bodyPerser
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }))
app.use(bodyParser.json({ limit: '50mb' }))

app.use("/",userController)

app.get("/", async(req, res) => {
   res.render("index")
})

app.listen(PORT, () => {
    console.log("Servidor ligado")
})