// Função para abrir o Lightbox/Overlay com Imagens ou Vídeos (Galeria de Artes)
function ampliarImagem(elemento) {
    if (!elemento) return;

    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = ''; // Limpa conteúdo anterior

    let midiaOriginal;

    // Se o elemento for o botão de expandir (Galeria de Artes)
    if (elemento.classList.contains('expand-btn')) {
        midiaOriginal = elemento.parentElement.querySelector('img, video');
    }
    // Se for a tag de favorito ou a própria imagem (Página de Gostos)
    else if (elemento.tagName === 'IMG' || elemento.tagName === 'VIDEO') {
        midiaOriginal = elemento;
    }

    if (midiaOriginal) {
        const clone = midiaOriginal.cloneNode(true);

        // Garante que a imagem seja visível mesmo se tiver a classe .mini-img
        clone.style.display = 'block';
        clone.classList.remove('mini-img');

        if (clone.tagName === 'VIDEO') {
            clone.controls = true;
            clone.autoplay = true;
        }
        conteudo.appendChild(clone);
        overlay.style.display = 'flex';
    }
}

// Função para ampliar o Card completo (Página de Gostos)
function ampliarCard(card) {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = '';

    const clone = card.cloneNode(true);
    clone.removeAttribute('onclick'); // Evita recursão ao clicar no clone
    
    conteudo.appendChild(clone);
    overlay.style.display = 'flex';
}

// Função para fechar qualquer sobreposição
function fecharAmpliacao() {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    overlay.style.display = 'none';
    conteudo.innerHTML = '';
}

// Lógica para os menus expansíveis (Toggle Bars) da página de Gostos
document.addEventListener('DOMContentLoaded', () => {
    const toggleBars = document.querySelectorAll('.toggle-bar');
    
    toggleBars.forEach(bar => {
        bar.addEventListener('click', () => {
            const gridId = bar.id.replace('toggle-', '') + '-grid';
            const grid = document.getElementById(gridId);
            const seta = bar.querySelector('.seta');

            if (grid) {
                grid.classList.toggle('active');
                // Rotaciona a seta
                if (grid.classList.contains('active')) {
                    seta.style.transform = 'rotate(180deg)';
                } else {
                    seta.style.transform = 'rotate(0deg)';
                }
            }
        });
    });

    // Menu Mobile (Hambúrguer)
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    if (mobileMenu && navList) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // Impede que o overlay feche ao clicar no conteúdo (imagem ou card)
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    if (conteudoExpandido) {
        conteudoExpandido.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});