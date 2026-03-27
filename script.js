



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

// Fechar ao apertar a tecla "Esc"
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") fecharAmpliacao();
});



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
}