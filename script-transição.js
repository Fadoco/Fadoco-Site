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
    const isInSubfolder = path.includes('/capitulos/') || path.includes('/light novel/') || path.includes('\\capitulos\\') || path.includes('\\light novel\\');
    const prefix = isInSubfolder ? '../' : '';

    // Como você moveu o vídeo para a pasta 'capitulos', o caminho muda:
    const videoSrc = isInSubfolder ? '../capitulos/personagem%20de%20carregamento.mp4' : 'capitulos/personagem%20de%20carregamento.mp4';

    // --- CORREÇÃO AUTOMÁTICA DE CAMINHOS PARA CAPÍTULOS ---
    const ajustarCaminhosMídia = () => {
        document.querySelectorAll('img, video, source').forEach(el => {
            const src = el.getAttribute('src');
            if (!src) return;

            // Se for o vídeo de carregamento (agora na pasta capítulos)
            if (src.includes('personagem de carregamento')) {
                el.setAttribute('src', videoSrc);
                if (el.tagName === 'SOURCE') el.parentElement.load();
                if (el.tagName === 'VIDEO') el.load();
            } 
            // Se forem as imagens (que continuam na pasta img)
            else if (src.startsWith('img/') || src.startsWith('./img/')) {
                let nomeArquivo = src.replace('./', '');
                let novoCaminho = prefix + nomeArquivo.replace(/ /g, '%20');
                el.setAttribute('src', novoCaminho);
                if (el.tagName === 'SOURCE') el.parentElement.load();
                if (el.tagName === 'VIDEO') el.load();
            }
        });
    };

    // Executa o ajuste de caminhos para garantir que tudo seja encontrado
    ajustarCaminhosMídia();

    // Se não existir no HTML, cria dinamicamente (fallback)
    if (!transitionOverlay) {
        transitionOverlay = document.createElement('div');
        transitionOverlay.id = 'hyperspace';
        transitionOverlay.className = 'hyperspace-overlay';
        transitionOverlay.innerHTML = `
            <div class="scanlines"></div>
            <div class="noise"></div>
            <video class="loading-video" autoplay loop muted playsinline style="background: #000;">
                <source src="${videoSrc}" type="video/mp4">
            </video>
            <div class="loading-content">
                <p class="loading-text">Sincronizando Arquivos</p>
                <div class="dots-container"><span class="dots"></span></div>
            </div>
        `;
        document.body.prepend(transitionOverlay);
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
                updateProgressBar(); // Garante o cálculo inicial da barra

                // Força a revelação das seções que já estão visíveis no viewport assim que o loading acaba
                document.querySelectorAll('.reveal-section').forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.85) { // 0.85 para alinhar com o threshold de 15%
                        section.classList.add('revealed');
                        if (window.revealObserver) window.revealObserver.unobserve(section);
                    }
                });
            }, 100);
            setTimeout(() => transitionOverlay.remove(), 700); 
        }, 1500); 
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

    // Delegação de eventos para suportar elementos dinâmicos
    document.body.addEventListener('mouseenter', (e) => {
        // Ignora se for um dispositivo touch para evitar balões "presos"
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const el = e.target.closest('[data-tooltip]');
        if (!el) return;
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

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.closest('[data-tooltip]')) tooltip.style.opacity = '0';
    }, true);

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
                    transitionOverlay.classList.remove('finished');
                    setTimeout(() => {
                        window.location.href = destination;
                    }, 600);
                }
            });
        }
    });
});
      