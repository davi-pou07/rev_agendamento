function usuarioLogado() {
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

      var isAdmin = document.getElementById("isAdmin")
      if (usuario.isAdmin == true) {
        isAdmin.classList.remove("d-none")
        isAdmin.innerHTML ='<a class="dropdown-item" href="/admin">Administração</a>'
      } else {
        isAdmin.classList.add("d-none")
        isAdmin.innerHTML =''
      }
    } else {
      divLogin.classList.remove('d-none')
      divPerfil.classList.add("d-none")
    }
  })
  empresa()
}

function empresa() {
  axios.get("/api/empresa").then(resp =>{
    document.getElementById("logo").src = resp.data.empresa.logo
    document.getElementById("whats").href = `https://api.whatsapp.com/send?phone=+550${resp.data.empresa.whats}&text=Tenho uma duvida!`
  })
}

function toBase64() {
  var filesSelected = document.getElementById("fileFoto").files;
  if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
      var fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
          var srcData = fileLoadedEvent.target.result; // <--- data: base64
          var base64 = document.getElementById("fotoBase64").value = srcData
          var foto = document.getElementById("foto").src = srcData
      }
      fileReader.readAsDataURL(fileToLoad);
  }
}