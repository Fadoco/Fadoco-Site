/**
 * STAR HUB - LÓGICA DE DADOS, PESQUISA E FAVORITOS
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTÃO DO MENU LATERAL (SIDEBAR) ---
    const btnMenu = document.getElementById('btn-menu');
    const btnFechar = document.getElementById('btn-fechar');
    const sideMenu = document.getElementById('side-menu');

    if (btnMenu && sideMenu) {
        btnMenu.addEventListener('click', () => {
            sideMenu.classList.add('active');
            document.body.classList.add('no-scroll');
            btnMenu.setAttribute('aria-expanded', 'true');
        });
    }

    if (btnFechar && sideMenu) {
        btnFechar.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (btnMenu) btnMenu.setAttribute('aria-expanded', 'false');
        });
    }

    // Fechar ao clicar fora do menu ou pressionar ESC para melhor UX
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('active')) {
            if (!sideMenu.contains(e.target) && !btnMenu.contains(e.target)) {
                btnFechar.click();
            }
        }
    });

    // --- 2. BOTÃO VOLTAR AO TOPO (BACK TO TOP) ---
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 3. BARRA DE PROGRESSO DE LEITURA ---
    window.updateProgressBar = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = document.querySelector(".progress-bar");
        if (bar) bar.style.width = scrolled + "%";
    };

    window.addEventListener('scroll', updateProgressBar);
});

// --- UTILITÁRIOS ---
// A função debounce foi movida para o script-gostos.js para evitar duplicidade.
// Este arquivo agora pode ser usado para lógicas globais compartilhadas.