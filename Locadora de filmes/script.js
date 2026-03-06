const modalFilme = document.getElementById("modalFilme");
let filmes = JSON.parse(localStorage.getItem('filmes')) || [
    { 
        titulo: "Velozes e Furiosos 9", 
        genero: "Ação", 
        ano: 2021, 
        classificacao: "14+", 
        produtora: "Universal", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/21/04/14/19/06/3385237.jpg" 
    },
    { 
        titulo: "Minions", 
        genero: "Comédia", 
        ano: 2015, 
        classificacao: "Livre", 
        produtora: "Universal", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/14/11/04/14/07/517227.jpg" 
    },
    { 
        titulo: "Invocação do Mal", 
        genero: "Terror", 
        ano: 2013, 
        classificacao: "16+", 
        produtora: "Warner", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/210/166/21016629_2013062820083878.jpg" 
    },
    { 
        titulo: "Interestelar", 
        genero: "Ficção", 
        ano: 2014, 
        classificacao: "12+", 
        produtora: "Warner", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/14/10/31/20/39/476171.jpg" 
    },
    { 
        titulo: "O Lobo de Wall Street", 
        genero: "Drama", 
        ano: 2013, 
        classificacao: "18+", 
        produtora: "Paramount", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/13/12/30/18/11/111145.jpg" 
    },
    { 
        titulo: "Como Eu Era Antes de Você", 
        genero: "Romance", 
        ano: 2016, 
        classificacao: "14+", 
        produtora: "Warner", 
        capa: "https://br.web.img3.acsta.net/c_310_420/pictures/16/02/03/19/11/303307.jpg" 
    }
];
renderizarTabela()

function salvarDadosLocalmente() {
    localStorage.setItem("filmes", JSON.stringify(filmes))
}

function abrirModal() {
    document.getElementById("modalFilme").style.display = "block";
}

function fecharModal() {
    const excluirCampos = document.getElementById("modalFilme");
    excluirCampos.style.display = "none";
    limparCampos();
}

const cadFilme = document.getElementById("cadFilme");
cadFilme.addEventListener("submit", f => {

    f.preventDefault(); 

    const obj = {
        titulo: cadFilme.titulo.value,
        genero: cadFilme.genero.value,
        ano: cadFilme.ano.value,
        classificacao: cadFilme.classificacao.value,
        produtora: cadFilme.produtora.value,
        capa: cadFilme.capa.value
    }

    filmes.push(obj);
    salvarDadosLocalmente();
    renderizarTabela();
    fecharModal();
    cadFilme.reset();

});

function renderizarTabela() {
    const dados = document.getElementById("dados");
    dados.innerHTML = "";

    filmes.forEach((filme, exclu) => {
        dados.innerHTML += `
        <tr>
            <td>${filme.titulo}</td>
            <td>${filme.genero}</td>
            <td>${filme.ano}</td>
            <td>${filme.classificacao}</td>
            <td>${filme.produtora}</td>
            <td><img src="${filme.capa || ''}" width="50" height="70"></td>
            <td><button onclick="excluirFilme(${exclu})">Excluir</button></td>
        </tr>
        `;
    });
}

function excluirFilme(indice) {
    filmes.splice(indice, 1)
    salvarDadosLocalmente();
    renderizarTabela();
}

function filtrarPorGenero() {
    let genero = document.getElementById('genero').value;
    const dados = document.getElementById("dados");
    dados.innerHTML = "";
    
    if(genero === 'todos') {
        renderizarTabela();
    } else {
        let filtrados = filmes.filter(filme => filme.genero === genero);
        filtrados.forEach((filme, exclu) => {
            dados.innerHTML += `
            <tr>
                <td>${filme.titulo}</td>
                <td>${filme.genero}</td>
                <td>${filme.ano}</td>
                <td>${filme.classificacao}</td>
                <td>${filme.produtora}</td>
                <td><img src="${filme.capa || ''}" width="50" height="70"></td>
                <td><button onclick="excluirFilme(${exclu})">Excluir</button></td>
            </tr>
            `;
        });
    }
}

function limparCampos() {
    if(cadFilme) {
        cadFilme.reset();
    }
}