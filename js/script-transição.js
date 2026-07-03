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
    document.body.classList.remove('no-scroll');
    if (conteudo) { conteudo.style.width = conteudo.style.height = ''; }
    conteudo.innerHTML = '';
};

window.fecharFavoritos = function() {
    const favOverlay = document.getElementById('favorites-overlay');
    if (favOverlay) favOverlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    window.dispatchEvent(new Event('scroll')); // Atualiza botão back-to-top
};
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTÃO DA TELA DE LOADING ---
    let transitionOverlay = document.getElementById('hyperspace');
    
    // Detecta se a página está na pasta 'capitulos'
    const path = window.location.pathname.toLowerCase();
    const isInSubfolder = path.includes('/light-novel/') || path.includes('\\light-novel\\');

    // O vídeo de carregamento está sempre na pasta img na raiz do site
    const videoSrc = isInSubfolder ? '../img/personagem-carregamento.mp4' : 'img/personagem-carregamento.mp4';

    if (!transitionOverlay) {
        transitionOverlay = document.createElement('div');
        transitionOverlay.id = 'hyperspace';
        transitionOverlay.className = 'hyperspace-overlay';
        transitionOverlay.innerHTML = `
            <video class="loading-video" autoplay loop muted playsinline style="background: #000; display: block;">
                <source src="${videoSrc}" type="video/mp4">
            </video>
            <div class="loading-content">
                <p class="loading-text">Sintonizando com o universo</p>
                <div class="dots-container"><span class="dots"></span></div>
            </div>
        `;
        document.body.prepend(transitionOverlay);
    } else {
        // Se já existir, apenas atualiza o vídeo se necessário, sem apagar scanlines/noise
        const existingVideo = transitionOverlay.querySelector('video source');
        if (existingVideo && !existingVideo.src.includes(videoSrc)) {
            existingVideo.src = videoSrc;
            const videoTag = transitionOverlay.querySelector('video');
            if (videoTag) videoTag.load();
        }
    }

    // Garante que o vídeo tente tocar e carregar corretamente
    const vid = transitionOverlay.querySelector('video');
    if (vid) {
        vid.load();
        vid.play().catch(e => console.warn("Autoplay bloqueado ou erro no vídeo:", e));
    }

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
                // Verifica se a função existe antes de chamar para não travar o script
                if (typeof updateProgressBar === 'function') updateProgressBar(); 

                // Força a revelação das seções que já estão visíveis no viewport assim que o loading acaba
                document.querySelectorAll('.reveal-section').forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.85) { // 0.85 para alinhar com o threshold de 15%
                        section.classList.add('revealed');
                        if (window.revealObserver) window.revealObserver.unobserve(section);
                    }
                });
            }, 100);
            // Mantemos no DOM para transições de saída, apenas escondemos
        }, 800); 
    };

    // --- 4. SISTEMA DE SCROLL REVEAL ---
    window.revealObserver = new IntersectionObserver((entries) => {
        if (!document.body.classList.contains('site-loaded')) return; // Impede a revelação antes do loading acabar
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                window.revealObserver.unobserve(entry.target); // Para de observar após revelar
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-section').forEach(section => window.revealObserver.observe(section));

    // --- 5. HUD DYNAMIC TOOLTIPS ---
    const tooltip = document.createElement('div');
    tooltip.className = 'hud-tooltip';
    document.body.appendChild(tooltip);

    let currentElement = null;

    // Delegação de eventos para suportar elementos dinâmicos
    document.body.addEventListener('mouseover', (e) => {
        // Ignora se for um dispositivo touch para evitar balões "presos"
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const el = e.target.closest('[data-tooltip]');
        if (!el) return;
        
        currentElement = el;
        tooltip.innerText = el.getAttribute('data-tooltip');
        tooltip.style.opacity = '1';
    }, true);

    document.body.addEventListener('mousemove', (e) => {
        if (tooltip.style.opacity === '0') return;
        let x = e.clientX + 15;
        let y = e.clientY - 35;

        const tooltipWidth = tooltip.offsetWidth;
        if (x + tooltipWidth > window.innerWidth - 10) {
            x = e.clientX - tooltipWidth - 15;
        }
        if (y < 10) {
            y = e.clientY + 25;
        }
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }, true);

    document.body.addEventListener('mouseout', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el && currentElement === el) {
            tooltip.style.opacity = '0';
            currentElement = null;
        }
    }, true);

    // --- ATUALIZAÇÃO DO ANO NO RODAPÉ ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- FECHAR OVERLAY AO CLICAR NO FUNDO ---
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharAmpliacao();
        });
    }

    // Se a página já carregou (cache), fecha. Senão, espera o evento 'load'.
    if (document.readyState === 'complete') {
        fecharLoading();
    } else {
        window.addEventListener('load', fecharLoading);
        // Fallback de segurança: Fecha o loading após 5 segundos mesmo que o evento 'load' não dispare
        setTimeout(fecharLoading, 5000);
    }

    // --- 3. TRANSIÇÃO AO CLICAR EM LINKS ---
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.hostname === window.location.hostname && !link.hash && link.target !== "_blank") {
            const destination = link.href;
            
            // Evita disparar se for o link da própria página ou possuir evento onclick
            if (destination !== window.location.href && !link.hasAttribute('onclick')) {
                e.preventDefault();
                transitionOverlay.classList.remove('finished');
                setTimeout(() => {
                    window.location.href = destination;
                }, 600);
            }
        }
    });
});
      