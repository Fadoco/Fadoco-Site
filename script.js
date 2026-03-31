
<<<<<<< HEAD



function ampliarImagem(botao) {
    // Pega o caminho da imagem que está dentro do mesmo card do botão
    const srcImagem = botao.parentElement.querySelector('img').src;
    const overlay = document.getElementById('overlay');
    const imgAmpliada = document.getElementById('img-ampliada');

    imgAmpliada.src = srcImagem;
    overlay.style.display = 'flex';
}

function fecharAmpliacao() {
    document.getElementById('overlay').style.display = 'none';
}

=======
>>>>>>> 3aa7b9b (tentativa numero 3)
// Fechar ao apertar a tecla "Esc"
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") fecharAmpliacao();
});
<<<<<<< HEAD



=======
>>>>>>> 3aa7b9b (tentativa numero 3)
function ampliarImagem(botao) {
    const card = botao.parentElement;
    const midiaOriginal = card.querySelector('img, video');
    const overlay = document.getElementById('overlay');
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    
    conteudoExpandido.innerHTML = ''; 

    let clone;
    if (midiaOriginal.tagName === 'VIDEO') {
        clone = document.createElement('video');
        clone.src = midiaOriginal.src;
        clone.autoplay = true;
        clone.controls = true;
        clone.loop = true;
    } else {
        clone = document.createElement('img');
        clone.src = midiaOriginal.src;
    }

    conteudoExpandido.appendChild(clone);
    overlay.style.display = 'flex';
}

function fecharAmpliacao() {
    const overlay = document.getElementById('overlay');
    document.getElementById('conteudo-expandido').innerHTML = '';
    overlay.style.display = 'none';
<<<<<<< HEAD
=======
}

// Lógica Genérica para mostrar/esconder seções (Jogos, Animes, Músicas, etc.)
document.querySelectorAll('.toggle-bar').forEach(bar => {
    bar.addEventListener('click', () => {
        // Encontra a grid que está logo após a barra clicada
        const grid = bar.nextElementSibling;
        
        if (grid && grid.classList.contains('gostos-grid')) {
            grid.classList.toggle('active');
            
            // Rotaciona a seta
            const seta = bar.querySelector('.seta');
            if (seta) {
                seta.style.transform = grid.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    });
});

function ampliarCard(card) {
    const overlay = document.getElementById('overlay');
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    
    conteudoExpandido.innerHTML = ''; 
    const clone = card.cloneNode(true);
    clone.removeAttribute('onclick'); // Evita que o clique no card aberto tente abrir outro
    
    conteudoExpandido.appendChild(clone);
    overlay.style.display = 'flex';
>>>>>>> 3aa7b9b (tentativa numero 3)
}