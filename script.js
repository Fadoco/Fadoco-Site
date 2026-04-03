/**
 * STAR HUB - LOGICA DE INTERATIVIDADE
 */

// --- 1. GESTÃO DE OVERLAY E LIGHTBOX ---
function ampliarImagem(elemento) {
    if (!elemento) return;

    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = ''; // Limpa conteúdo anterior

    let midiaOriginal;

    if (elemento.classList.contains('expand-btn')) {
        midiaOriginal = elemento.parentElement.querySelector('img, video');
    }
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

function ampliarCard(card) {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = '';

    const clone = card.cloneNode(true);
    clone.removeAttribute('onclick'); // Evita recursão ao clicar no clone
    
    conteudo.appendChild(clone);
    overlay.style.display = 'flex';
}

function fecharAmpliacao() {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    overlay.style.display = 'none';
    conteudo.innerHTML = '';
}

// --- 2. INICIALIZAÇÃO DE EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- TRANSIÇÃO DE HIPERESPAÇO (Opção 10) ---
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'hyperspace-overlay';
    document.body.appendChild(transitionOverlay);

    // Função para criar as linhas de salto
    const createJumpLines = () => {
        for(let i=0; i<20; i++) {
            const line = document.createElement('div');
            line.className = 'jump-line';
            line.style.left = Math.random() * 100 + 'vw';
            line.style.animationDelay = Math.random() * 0.5 + 's';
            transitionOverlay.appendChild(line);
        }
    };

    // Revela a página suavemente ao entrar (Fade-out do overlay)
    setTimeout(() => {
        transitionOverlay.style.opacity = '0';
    }, 300);

    // Intercepta cliques em links para o efeito de saída
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hash && link.target !== "_blank") {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const destination = link.href;
                transitionOverlay.innerHTML = ''; // Limpa linhas antigas
                createJumpLines(); // Adiciona novas linhas
                transitionOverlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = destination;
                }, 500);
            });
        }
    });
    
    // --- BARRA DE PROGRESSO ---
    const body = document.body;
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    document.body.prepend(progressContainer);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
    
    // --- MENU LATERAL (SIDEBAR) ---
    const btnMenu = document.getElementById('btn-menu');
    const btnFechar = document.getElementById('btn-fechar');
    const sideMenu = document.getElementById('side-menu');

    if (btnMenu && sideMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('active');
        });
    }

    if (btnFechar && sideMenu) {
        btnFechar.addEventListener('click', () => {
            sideMenu.classList.remove('active');
        });
    }

    // --- GRIDS EXPANSÍVEIS (TOGGLE BARS) ---
    const toggleBars = document.querySelectorAll('.toggle-bar');
    toggleBars.forEach(bar => {
        bar.addEventListener('click', () => {
            const gridId = bar.id.replace('toggle-', '') + '-grid';
            const grid = document.getElementById(gridId);
            const seta = bar.querySelector('.seta');

            if (grid) {
                grid.classList.toggle('active');
                if (grid.classList.contains('active')) {
                    seta.style.transform = 'rotate(180deg)';
                } else {
                    seta.style.transform = 'rotate(0deg)';
                }
            }
        });
    });

    // --- MENU MOBILE ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    if (mobileMenu && navList) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // --- COMPORTAMENTO DO OVERLAY ---
    const conteudoExpandido = document.getElementById('conteudo-expandido');
    if (conteudoExpandido) {
        conteudoExpandido.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // --- BOTÃO VOLTAR AO TOPO ---
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- SISTEMA DE BUSCA E FILTROS OTIMIZADO ---
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeDecade = 'all';

    const applyFilters = () => {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('.gostos-card');
        const containers = document.querySelectorAll('.toggle-container');

        cards.forEach(card => {
            const h3 = card.querySelector('h3');
            if (!h3) return;
            const title = h3.innerText.toLowerCase();
            const desc = card.querySelector('p')?.innerText.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.innerText.toLowerCase()).join(' ');
            const year = parseInt(card.getAttribute('data-year')) || 0;

            const matchesSearch = title.includes(term) || desc.includes(term) || tags.includes(term);
            let matchesDecade = activeDecade === 'all';
            if (!matchesDecade) {
                const startYear = parseInt(activeDecade);
                matchesDecade = year >= startYear && year < startYear + 10;
            }

            card.style.display = (matchesSearch && matchesDecade) ? 'flex' : 'none';
        });

        containers.forEach(container => {
            const grid = container.querySelector('.gostos-grid');
            if (!grid) return;
            const hasVisible = Array.from(grid.querySelectorAll('.gostos-card')).some(c => c.style.display !== 'none');

            if (term !== '' || activeDecade !== 'all') {
                container.style.display = hasVisible ? 'block' : 'none';
                if (hasVisible) {
                    grid.classList.add('active');
                    const seta = container.querySelector('.seta');
                    if (seta) seta.style.transform = 'rotate(180deg)';
                }
            } else {
                container.style.display = 'block';
            }
        });

        if (activeDecade !== 'all') checkAchievement('time-traveler');
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeDecade = btn.getAttribute('data-decade');
            applyFilters();
        });
    });

    // --- SISTEMA DE TROCA DE TEMAS (ENERGIA DO HUB) ---
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    const applyTheme = (primary, secondary) => {
        document.documentElement.style.setProperty('--primary-neon', primary);
        document.documentElement.style.setProperty('--secondary-neon', secondary);
        // Atualiza o shadow glow também para combinar
        document.documentElement.style.setProperty('--text-shadow-glow', `0 0 10px ${primary}cc`);
        
        // Salva no localStorage
        localStorage.setItem('hub-primary', primary);
        localStorage.setItem('hub-secondary', secondary);
    };

    // Carregar tema salvo ao iniciar
    const savedPrimary = localStorage.getItem('hub-primary');
    const savedSecondary = localStorage.getItem('hub-secondary');
    if (savedPrimary && savedSecondary) {
        applyTheme(savedPrimary, savedSecondary);
        themeBtns.forEach(btn => {
            if (btn.getAttribute('data-primary') === savedPrimary) btn.classList.add('active');
        });
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove classe ativa de todos
            themeBtns.forEach(b => b.classList.remove('active'));
            // Adiciona no clicado
            btn.classList.add('active');
            
            const primary = btn.getAttribute('data-primary');
            const secondary = btn.getAttribute('data-secondary');
            
            applyTheme(primary, secondary);
        });
    });

    // --- SISTEMA DE FAVORITOS COMPLETO ---
    const btnFavoritos = document.getElementById('btn-favoritos');
    const favOverlay = document.getElementById('favorites-overlay');
    const favGrid = document.getElementById('favorites-grid');

    let toastTimeout;

    // Função de Notificação (Toast)
    const showNotification = (message) => {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }

        clearTimeout(toastTimeout); // Limpa o tempo anterior se o usuário clicar rápido
        toast.innerText = message;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // --- SISTEMA DE CONQUISTAS ---
    window.checkAchievement = (id) => {
        let unlocked = JSON.parse(localStorage.getItem('unlocked-achievements') || '[]');
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem('unlocked-achievements', JSON.stringify(unlocked));
            showNotification(`🏆 Conquista Desbloqueada!`);
            updateAchievementUI();
        }
    };

    window.updateAchievementUI = () => {
        const unlocked = JSON.parse(localStorage.getItem('unlocked-achievements') || '[]');
        unlocked.forEach(id => {
            const el = document.querySelector(`[data-achievement="${id}"]`);
            if (el) el.classList.add('unlocked');
        });
    };

    // Função para atualizar o contador visual da estrela
    const updateFavCounter = () => {
        const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
        const counter = document.getElementById('fav-counter');
        if (counter) {
            counter.innerText = favorites.length;
        }
    };

    // Função para renderizar os favoritos salvos
    const renderFavorites = () => {
        const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
        favGrid.innerHTML = favorites.length ? '' : '<p style="color:white; grid-column: 1/-1; text-align:center;">Você ainda não favoritou nada na sua jornada estelar.</p>';
        
        favorites.forEach(fav => {
            const card = document.createElement('div');
            card.className = 'gostos-card';
            card.innerHTML = fav.content;
            
            // Torna o card clicável para expandir, como na página normal
            card.onclick = function() { ampliarCard(this); };
            
            favGrid.appendChild(card);
        });

        // Atualiza as estrelas nos cards da página principal
        document.querySelectorAll('.gostos-card').forEach(card => {
            const title = card.querySelector('h3')?.innerText;
            const star = card.querySelector('.fav-toggle');
            if (star && favorites.some(f => f.title === title)) {
                star.classList.add('active');
            } else if (star) {
                star.classList.remove('active');
            }
        });

        updateFavCounter();
    };

    // Toggle Favorito
    window.toggleFavorite = (e, btn) => {
        e.stopPropagation();
        const card = btn.closest('.gostos-card');
        const title = card.querySelector('h3').innerText;
        let favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');

        if (favorites.some(f => f.title === title)) {
            favorites = favorites.filter(f => f.title !== title);
            btn.classList.remove('active');
            showNotification(`Removido: ${title}`);
        } else {
            // Salva o HTML interno para reconstruir o card na tela de favoritos
            favorites.push({ title, content: card.innerHTML });
            btn.classList.add('active');
            showNotification(`Favoritado: ${title}`);
        }

        localStorage.setItem('user-favorites', JSON.stringify(favorites));
        renderFavorites();
        updateFavCounter();
    };

    // --- FILTRO POR TAG ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) {
            const tagText = e.target.innerText.toLowerCase();
            searchInput.value = tagText;
            searchInput.dispatchEvent(new Event('input')); // Dispara a busca
        }
    });

    if (btnFavoritos) {
        btnFavoritos.addEventListener('click', () => {
            renderFavorites();
            favOverlay.style.display = 'flex';
        });
    }

    // --- LÓGICA DE FECHAR AO CLICAR FORA ---
    document.addEventListener('click', (e) => {
        // Fechar Sidebar
        const sideMenu = document.getElementById('side-menu');
        const btnMenu = document.getElementById('btn-menu');
        if (sideMenu && sideMenu.classList.contains('active')) {
            if (!sideMenu.contains(e.target) && !btnMenu.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        }

        // Fechar Favoritos
        if (favOverlay && (favOverlay.style.display === 'flex' || getComputedStyle(favOverlay).display === 'flex')) {
            const favContainer = document.querySelector('.fav-content');
            if (!favContainer.contains(e.target) && !btnFavoritos.contains(e.target)) {
                favOverlay.style.display = 'none';
            }
        }
    });

    // Tornando a função de fechar acessível ao HTML
    window.fecharFavoritos = () => {
        if (favOverlay) {
            favOverlay.style.display = 'none';
        }
    };

    // --- GERADOR DE RECOMENDAÇÃO ALEATÓRIA ---
    const btnRandom = document.getElementById('btn-random');
    if (btnRandom) {
        btnRandom.addEventListener('click', () => {
            const cards = document.querySelectorAll('.gostos-card');
            if (cards.length > 0) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                const selectedCard = cards[randomIndex];
                
                ampliarCard(selectedCard);
            }
        });
    }

    // --- NUVEM DE TAGS DINÂMICA (Opção 9) ---
    const tagCloudContainer = document.getElementById('tag-cloud');
    const btnTagsToggle = document.getElementById('btn-tags-toggle');

    if (btnTagsToggle && tagCloudContainer) {
        btnTagsToggle.addEventListener('click', () => {
            tagCloudContainer.classList.toggle('active');
        });
    }

    if (tagCloudContainer) {
        const allTags = Array.from(document.querySelectorAll('.gostos-card .tag')).map(t => t.innerText);
        const uniqueTags = [...new Set(allTags)];
        
        uniqueTags.sort().forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-cloud-item';
            tagEl.innerText = tag;
            tagEl.onclick = () => {
                searchInput.value = tag.toLowerCase();
                searchInput.dispatchEvent(new Event('input'));
            };
            tagCloudContainer.appendChild(tagEl);
        });
    }

    // --- COMPARTILHAMENTO DIRETO (Opção 6) ---
    window.copyShareLink = (title) => {
        const url = window.location.href.split('#')[0];
        const shareUrl = `${url}?search=${encodeURIComponent(title)}`;
        navigator.clipboard.writeText(shareUrl);
        showNotification("Link de acesso direto copiado!");
    };

    // Verifica se há uma busca na URL ao carregar
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        setTimeout(() => searchInput.dispatchEvent(new Event('input')), 500);
    }

    // Inicializa as estrelas nos cards existentes
    document.querySelectorAll('.gostos-card').forEach(card => {
        const title = card.querySelector('h3').innerText;
        
        // Injeta ícone de compartilhamento
        const shareIcon = document.createElement('span');
        shareIcon.className = 'share-btn';
        shareIcon.innerHTML = '🔗';
        shareIcon.title = "Copiar link direto";
        shareIcon.onclick = (e) => { e.stopPropagation(); copyShareLink(title); };
        card.style.position = 'relative';
        card.appendChild(shareIcon);

        if (!card.querySelector('.fav-toggle')) {
            const star = document.createElement('span');
            star.className = 'fav-toggle';
            star.innerHTML = '★';
            star.setAttribute('onclick', 'toggleFavorite(event, this)');
            card.style.position = 'relative';
            card.appendChild(star);
        }
    });
    
    renderFavorites();
    updateAchievementUI();
});