function usuarioLogado() {
  console.log("REALIZANDO CONSULTA")
  var divLogin = document.getElementById("divLogin")
  var divPerfil = document.getElementById("divPerfil")
  axios.get("/usuario/logado").then(resp =>{
    if (resp.data.erro == undefined) {
      var usuario = resp.data.user
      document.getElementById("imgCli").src = (usuario.foto != undefined)?usuario.foto:'/img/user.jpg'
      var nome = usuario.nome.split(" ")
      nome = `${nome[0]} (${usuario.id})`
      document.getElementById("userNome").innerHTML = nome
      divLogin.classList.add('d-none')
      divPerfil.classList.remove("d-none")
    } else {
      divLogin.classList.remove('d-none')
      divPerfil.classList.add("d-none")
    }
  })
}