/**
 * STAR HUB - SISTEMA DE CARREGAMENTO E TRANSIÇÃO
 */

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
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'loading-star';
        
        const size = Math.random() * 3 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = (Math.random() * 1.5) + 's'; // Estrelas aparecem mais rápido
        
        transitionOverlay.appendChild(star);
    }

    // --- 2. LÓGICA DE ESPERA (ACELERADA) ---
    const fecharLoading = () => {
        setTimeout(() => {
            transitionOverlay.classList.add('finished');
            // Pequeno delay para garantir que o overlay começou a sumir antes de revelar o fundo
            setTimeout(() => {
                document.body.classList.add('site-loaded');
            }, 100);
            setTimeout(() => transitionOverlay.remove(), 700); 
        }, 600); 
    };

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
});