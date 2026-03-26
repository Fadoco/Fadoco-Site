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