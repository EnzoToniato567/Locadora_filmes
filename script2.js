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

function renderizarCards() {
    const dados = document.getElementById("cards-container");
    dados.innerHTML = "";

    filmes.forEach((filme, i) => {
        dados.innerHTML += `
        <div>
            <div>
                <img src="${filme.capa || ''}" width="200" height="250">
            </div>
            <div>
                <h3>${filme.titulo}</h3>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Ano:</strong> ${filme.ano}</p>
                <p><strong>Classificação:</strong> ${filme.classificacao}</p>
                <p><strong>Produtora:</strong> ${filme.produtora}</p>
            </div>
        </div>
        `;
    });
}

function filtrarPorGenero() {
    let genero = document.getElementById('genero').value;
    const dados = document.getElementById("cards-container");
    dados.innerHTML = "";
    
    if(genero === 'todos') {
        renderizarCards();
    } else {
        let filtrados = filmes.filter(filme => filme.genero === genero);
        filtrados.forEach((filme) => {
            dados.innerHTML += `
            <div>
                <div>
                    <img src="${filme.capa || ''}" width="200" height="250">
                </div>
                <div>
                    <h3>${filme.titulo}</h3>
                    <p><strong>Gênero:</strong> ${filme.genero}</p>
                    <p><strong>Ano:</strong> ${filme.ano}</p>
                    <p><strong>Classificação:</strong> ${filme.classificacao}</p>
                    <p><strong>Produtora:</strong> ${filme.produtora}</p>
                </div>
            </div>
            `;
        });
    }
}