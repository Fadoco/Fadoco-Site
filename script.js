const video = document.getElementById('bgVideo');
    video.playbackRate = 0.6;



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
    console.log("Botão clicado!"); // Aparecerá no console (F12) se funcionar
    const card = botao.parentElement;
    const midiaOriginal = card.querySelector('img, video');
    const overlay = document.getElementById('overlay');
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    
    if (!overlay || !conteudoExpandido) {
        console.error("Erro: Elementos do overlay não encontrados no HTML!");
        return;
    }

    conteudoExpandido.innerHTML = ''; 

    if (midiaOriginal.tagName === 'VIDEO') {
        const videoClone = document.createElement('video');
        videoClone.src = midiaOriginal.src;
        videoClone.autoplay = true;
        videoClone.controls = true;
        videoClone.loop = true;
        conteudoExpandido.appendChild(videoClone);
    } else {
        const imgClone = document.createElement('img');
        imgClone.src = midiaOriginal.src;
        conteudoExpandido.appendChild(imgClone);
    }

    overlay.style.display = 'flex';
}

function fecharAmpliacao() {
    const overlay = document.getElementById('overlay');
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    overlay.style.display = 'none';
    conteudoExpandido.innerHTML = '';
}

// Fecha com a tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") fecharAmpliacao();
});