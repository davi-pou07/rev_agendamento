require('dotenv').config()

const express = require("express")
const app = express()

const session = require("express-session")
const bodyParser = require("body-parser")
const moment = require('moment');
const { Op } = require("sequelize");

//databases
const path = require('path')
const PORT = process.env.PORT || 8080

app.use(session({
    secret: "sdfsdfsdfgdfgfgh",
    cookie: { maxAge: 3600000 }
}))


//usar o EJS como view engine | renderizador de html
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//Carregamento de arquivos estaticos no express
app.use(express.static(path.join(__dirname, 'public')))
//Carregamento do bodyPerser
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }))
app.use(bodyParser.json({ limit: '50mb' }))

app.get("/", async(req, res) => {
   res.render("index")
})

app.listen(PORT, () => {
    console.log("Servidor ligado")
})