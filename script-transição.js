/**
 * STAR HUB - SISTEMA DE CARREGAMENTO, TRANSIÇÃO E CORE UI
 */

// --- 1. GESTÃO DE OVERLAY E LIGHTBOX (CORE UI) ---
window.ampliarImagem = function(elemento) {
    if (!elemento) return;
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = '';

    let midiaOriginal = elemento.classList.contains('expand-btn') 
        ? elemento.parentElement.querySelector('img, video') 
        : (elemento.tagName === 'IMG' || elemento.tagName === 'VIDEO' ? elemento : null);

    if (midiaOriginal) {
        const clone = midiaOriginal.cloneNode(true);
        clone.style.display = 'block';
        clone.classList.remove('mini-img');

        // Esconde a mídia e remove o brilho inicial
        clone.style.opacity = '0';
        clone.style.transition = 'opacity 0.3s ease-in-out';

        if (clone.tagName === 'VIDEO') {
            clone.autoplay = true;
            // Só revela o vídeo e o neon quando o primeiro frame for carregado
            clone.onloadeddata = () => {
                clone.style.opacity = '1';
            };
        } else {
            // Para imagens, verifica se já está no cache ou aguarda o load
            if (clone.complete) {
                clone.style.opacity = '1';
            } else {
                clone.onload = () => { clone.style.opacity = '1'; };
            }
        }

        conteudo.appendChild(clone);
        overlay.style.display = 'flex';
    }
};

window.ampliarCard = function(elemento) {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = '';
    const card = elemento.closest('.gostos-card');
    const title = card.querySelector('h3')?.innerText.trim() || "";

    if (title === "Boku no Pico") {
        const video = document.createElement('video');
        video.src = 'img/esqueleto.mp4';
        video.autoplay = video.loop = true;
        video.className = 'boku-video';
        const text = document.createElement('div');
        text.className = 'shaking-text';
        text.innerText = 'Porque você clicou?';
        conteudo.append(video, text);
        conteudo.style.width = '100vw'; conteudo.style.height = '100vh';
        overlay.style.display = 'flex';
        return;
    }

    const clone = card.cloneNode(true);
    clone.removeAttribute('onclick');
    const imgContainer = clone.querySelector('.card-img-container');
    if (imgContainer) {
        imgContainer.style.cursor = 'zoom-in';
        imgContainer.onclick = (e) => { e.stopPropagation(); analisarImagem(imgContainer); };
    }
    conteudo.append(clone);
    conteudo.style.width = conteudo.style.height = '';
    overlay.style.display = 'flex';
};

window.analisarImagem = function(imageContainer) {
    const conteudo = document.getElementById('conteudo-expandido');
    const originalImg = imageContainer.querySelector('img');
    if (!originalImg) return;
    const clone = originalImg.cloneNode(true);
    clone.className = 'img-analise';
    conteudo.innerHTML = '';
    conteudo.appendChild(clone);
};

window.fecharAmpliacao = function() {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    overlay.style.display = 'none';
    if (conteudo) { conteudo.style.width = conteudo.style.height = ''; }
    conteudo.innerHTML = '';
};

window.fecharFavoritos = function() {
    const favOverlay = document.getElementById('favorites-overlay');
    if (favOverlay) favOverlay.style.display = 'none';
    window.dispatchEvent(new Event('scroll')); // Atualiza botão back-to-top
};
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CRIAÇÃO DA TELA DE LOADING ---
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'hyperspace-overlay';
    
    // Injeta o vídeo do personagem e o texto com os pontos animados
    transitionOverlay.innerHTML = `
        <div class="scanlines"></div>
        <div class="noise"></div>
        <video class="loading-video" autoplay loop muted playsinline preload="auto" poster="img/personagem-poster.jpg" style="background: #000;">
            <source src="img/personagem de carregamento.webm" type="video/webm">
            <source src="img/personagem de carregamento.mp4" type="video/mp4">
        </video>
        <div class="loading-content">
            <p class="loading-text">Carregando Universo</p>
            <div class="dots-container"><span class="dots"></span></div>
        </div>
    `;
    document.body.prepend(transitionOverlay);

    // --- GATILHO PARA O EFEITO DE SURGIR (FADE-IN) ---
    requestAnimationFrame(() => {
        transitionOverlay.classList.add('active');
    });

    // --- CRIAR ESTRELAS NO LOADING ---
    const isMobile = window.innerWidth <= 768;
    const starCount = isMobile ? 20 : 50; // Performance: Menos estrelas no mobile
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'loading-star';
        
        const size = Math.random() * 3 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        star.style.animationDelay = (Math.random() * 1) + 's'; 
        
        fragment.appendChild(star);
    }
    transitionOverlay.appendChild(fragment);

    // --- 2. LÓGICA DE ESPERA (ACELERADA) ---
    const fecharLoading = () => {
        setTimeout(() => {
            transitionOverlay.classList.add('finished');
            // Pequeno delay para garantir que o overlay começou a sumir antes de revelar o fundo
            setTimeout(() => {
                document.body.classList.add('site-loaded');
                updateProgressBar(); // Garante o cálculo inicial da barra
            }, 100);
            setTimeout(() => transitionOverlay.remove(), 700); 
        }, 600); 
    };

    // --- ATUALIZAÇÃO DO ANO NO RODAPÉ ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Se a página já carregou (cache), fecha. Senão, espera o evento 'load'.
    if (document.readyState === 'complete') {
        fecharLoading();
    } else {
        window.addEventListener('load', fecharLoading);
        // Fallback de segurança: Fecha o loading após 5 segundos mesmo que o evento 'load' não dispare
        setTimeout(fecharLoading, 5000);
    }

    // --- 3. TRANSIÇÃO AO CLICAR EM LINKS ---
    document.querySelectorAll('a').forEach(link => {
        // Aplica apenas em links internos que não abrem em nova aba
        if (link.hostname === window.location.hostname && !link.hash && link.target !== "_blank") {
            link.addEventListener('click', (e) => {
                const destination = link.href;
                
                // Se o link for para uma página diferente, mostra o overlay de saída
                if (destination !== window.location.href) {
                    e.preventDefault();
                    const exitOverlay = document.createElement('div');
                    exitOverlay.className = 'hyperspace-overlay';
                    document.body.appendChild(exitOverlay);
                    
                    requestAnimationFrame(() => {
                        exitOverlay.classList.add('active');
                    });

                    setTimeout(() => {
                        window.location.href = destination;
                    }, 500); // Reduzido de 600ms para 500ms
                }
            });
        }
    });

    // --- EVENTOS DE UI (SIDEBAR & SCROLL) ---
    const btnMenu = document.getElementById('btn-menu');
    const sideMenu = document.getElementById('side-menu');
    const btnFechar = document.getElementById('btn-fechar');
    const backToTopBtn = document.getElementById('back-to-top');
    const overlayPrincipal = document.getElementById('overlay');

    if (btnMenu) btnMenu.onclick = () => sideMenu?.classList.add('active');
    if (btnFechar) btnFechar.onclick = () => sideMenu?.classList.remove('active');
    if (overlayPrincipal) overlayPrincipal.onclick = fecharAmpliacao;

    /**
     * NOTA: Os event listeners dos botões de 'Gostos' (toggle-bar, btn-tags-toggle, etc)
     * foram movidos para o script-gostos.js para melhor organização.
     */

    function updateProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = height > 0 ? (winScroll / height) * 100 + "%" : "0%";
    }

    window.addEventListener('scroll', () => {
        if (backToTopBtn) {
            window.scrollY > 400 ? backToTopBtn.classList.add('show') : backToTopBtn.classList.remove('show');
        }
        updateProgressBar();
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.onclick = (e) => {
            e.stopPropagation();
            const favOverlay = document.getElementById('favorites-overlay');
            (favOverlay && getComputedStyle(favOverlay).display === 'flex') 
                ? favOverlay.scrollTo({ top: 0, behavior: 'smooth' }) 
                : window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // --- FECHAMENTO GLOBAL AO CLICAR FORA ---
    document.addEventListener('click', (e) => {
        // Fechar Sidebar
        if (sideMenu?.classList.contains('active') && !sideMenu.contains(e.target) && !btnMenu?.contains(e.target)) {
            sideMenu.classList.remove('active');
        }

        // Fechar Favoritos
        const favOverlay = document.getElementById('favorites-overlay');
        const btnFavoritos = document.getElementById('btn-favoritos');
        const favContent = document.querySelector('.fav-content');
        
        if (favOverlay && getComputedStyle(favOverlay).display === 'flex') {
            if (!favContent?.contains(e.target) && !btnFavoritos?.contains(e.target) && !e.target.closest('#back-to-top')) {
                fecharFavoritos();
            }
        }
    });
});