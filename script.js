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

function ampliarCard(elemento) {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    conteudo.innerHTML = '';

    const card = elemento.closest('.gostos-card');
    const h3 = card.querySelector('h3');
    const title = h3 ? h3.innerText.trim() : "";

    // --- LOGICA ESPECIAL: BOKU NO PICO ---
    if (title === "Boku no Pico") {
        const video = document.createElement('video');
        video.src = 'img/esqueleto.mp4';
        video.autoplay = true;
        video.loop = true;
        video.className = 'boku-video';
        
        const text = document.createElement('div');
        text.className = 'shaking-text';
        text.innerText = 'Porque você clicou?';

        conteudo.appendChild(video);
        conteudo.appendChild(text);
        
        // Ajusta o container para ocupar tudo no modo easter egg
        conteudo.style.width = '100vw';
        conteudo.style.height = '100vh';
        
        overlay.style.display = 'flex';
        return; // Interrompe aqui
    }

    // --- COMPORTAMENTO: ABRIR CARD DETALHADO ---
    const clone = card.cloneNode(true);
    clone.removeAttribute('onclick'); // Evita recursão

    // Tornar a imagem dentro do card expandido clicável para análise
    const imgContainer = clone.querySelector('.card-img-container');
    if (imgContainer) {
        imgContainer.style.cursor = 'zoom-in';
        imgContainer.onclick = function(e) {
            e.stopPropagation();
            analisarImagem(this);
        };
    }
    
    conteudo.appendChild(clone);
    conteudo.style.width = ''; // Reseta tamanho caso venha do modo easter egg
    conteudo.style.height = '';
    overlay.style.display = 'flex';
}

function analisarImagem(imageContainer) {
    const conteudo = document.getElementById('conteudo-expandido');
    const originalImg = imageContainer.querySelector('img');
    if (!originalImg) return;

    const clone = originalImg.cloneNode(true);
    clone.className = 'img-analise';
    conteudo.innerHTML = ''; // Remove o card para focar apenas na imagem
    conteudo.appendChild(clone);
}

function fecharAmpliacao() {
    const overlay = document.getElementById('overlay');
    const conteudo = document.getElementById('conteudo-expandido');
    overlay.style.display = 'none';
    
    // Reset de estilos caso venha do modo easter egg
    if (conteudo) {
        conteudo.style.width = '';
        conteudo.style.height = '';
        conteudo.style.position = '';
        conteudo.classList.remove('shaking-container');
    }
    conteudo.innerHTML = '';
}

// --- CONFIGURAÇÃO DA API DO YOUTUBE ---
const YT_API_KEY = 'AIzaSyDaPbh2ZDKB3Gq16K68V8xatYZ4ZTy2hlQ'; 
const PLAYLIST_ID = 'PLKQ_ZTvlL-M-XEn1Biw7iMalaIGxl3IBg';
let ytPlaylistLoaded = false; // Controle para carregar apenas uma vez

async function carregarPlaylistYouTube() {
    const musicasGrid = document.getElementById('musicas-grid');
    if (!musicasGrid) return;

    // Mensagem de feedback visual enquanto carrega
    musicasGrid.innerHTML = `<p style="color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;">Sintonizando frequências do YouTube...</p>`;

    try {
        let nextPageToken = '';
        let isFirstBatch = true;
        const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');

        do {
            const params = new URLSearchParams({
                part: 'snippet',
                maxResults: 50,
                playlistId: PLAYLIST_ID,
                key: YT_API_KEY,
                pageToken: nextPageToken
            });
            
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Limpa o "Carregando..." apenas na primeira resposta positiva
            if (isFirstBatch) {
                musicasGrid.innerHTML = '';
                isFirstBatch = false;
            }

            if (!data.items || data.items.length === 0) {
                if (musicasGrid.innerHTML === '') {
                    musicasGrid.innerHTML = `<p style="color:white; grid-column: 1/-1; text-align:center;">Nenhuma música encontrada nesta playlist pública.</p>`;
                }
                break;
            }

            data.items.forEach(item => {
                const snippet = item.snippet;
                const titulo = snippet.title;
                const thumbnail = snippet.thumbnails;
                
                // Filtro robusto: Ignora vídeos deletados, privados ou sem miniatura (comum em vídeos bloqueados)
                if (
                    titulo === "Deleted video" || 
                    titulo === "Private video" || 
                    titulo === "Vídeo excluído" || 
                    titulo === "Vídeo privado" ||
                    !thumbnail
                ) return;

                const descricao = snippet.description.substring(0, 100) + '...';
                const capa = thumbnail.high ? thumbnail.high.url : (thumbnail.default ? thumbnail.default.url : 'img/mp3.jpg');

                const card = document.createElement('div');
                card.className = 'gostos-card';
                card.onclick = function() { ampliarCard(this); };

                card.innerHTML = `
                    <div class="card-img-container">
                        <img src="${capa}" alt="${titulo}">
                    </div>
                    <h3>${titulo}</h3>
                    <p>${descricao}</p>
                    <div class="tags-list" style="display: none;">
                        <span class="tag">YouTube</span>
                        <span class="tag">Música</span>
                        <span class="tag">Playlist</span>
                        <span class="tag">Destaque</span>
                        <span class="tag">Vibe</span>
                        <span class="tag">Neon</span>
                    </div>
                `;

                const star = document.createElement('span');
                star.className = 'fav-toggle';
                star.innerHTML = '★';
                star.onclick = (e) => toggleFavorite(e, star);
                
                if (favorites.some(f => f.title === titulo)) star.classList.add('active');

                card.appendChild(star);
                musicasGrid.appendChild(card);
            });

            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        ytPlaylistLoaded = true; // Só marca como carregado se o loop terminar com sucesso

    } catch (error) {
        console.error('Erro YouTube API:', error);
        ytPlaylistLoaded = false; // Permite tentar carregar de novo ao clicar na barra
        
        let mensagemErro = `Falha na conexão estelar: ${error.message}`;
        
        if (error.message.includes('referer')) {
            mensagemErro = "Acesso Negado: Verifique as restrições de URL no Google Cloud Console (Referer).";
        } else if (error.message.includes('quota')) {
            mensagemErro = "Cota Esgotada: O limite diário de buscas no YouTube foi atingido.";
        }

        musicasGrid.innerHTML = `<p style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 20px;">
            ${mensagemErro}<br>
            <button onclick="carregarPlaylistYouTube()" style="background:none; border:1px solid #ff4b2b; color:#ff4b2b; cursor:pointer; margin-top:10px; padding:5px 10px; border-radius:5px;">Tentar Reconectar</button>
        </p>`;
    }
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
                // Carrega a playlist apenas quando abrir a seção pela primeira vez
                if (bar.id === 'toggle-musicas' && !ytPlaylistLoaded) {
                    carregarPlaylistYouTube();
                }

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

        backToTopBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique feche overlays abertos
            const isFavOpen = favOverlay && getComputedStyle(favOverlay).display === 'flex';
            if (isFavOpen) {
                favOverlay.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Adiciona o fechamento ao clicar no fundo do overlay (clicar fora)
    const overlayPrincipal = document.getElementById('overlay');
    if (overlayPrincipal) {
        overlayPrincipal.addEventListener('click', fecharAmpliacao);
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

    // Utilitário para localStorage seguro
    const safeLocalStorage = {
        get: (key) => {
            try { return localStorage.getItem(key); } 
            catch (e) { console.warn("Acesso ao localStorage negado:", e); return null; }
        },
        set: (key, value) => {
            try { localStorage.setItem(key, value); } 
            catch (e) { console.warn("Erro ao salvar no localStorage:", e); }
        }
    };

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
        let unlocked = JSON.parse(safeLocalStorage.get('unlocked-achievements') || '[]');
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            safeLocalStorage.set('unlocked-achievements', JSON.stringify(unlocked));
            showNotification(`🏆 Conquista Desbloqueada!`);
            updateAchievementUI();
        }
    };

    window.updateAchievementUI = () => {
        const unlocked = JSON.parse(safeLocalStorage.get('unlocked-achievements') || '[]');
        unlocked.forEach(id => {
            const el = document.querySelector(`[data-achievement="${id}"]`);
            if (el) el.classList.add('unlocked');
        });
    };

    // Função para atualizar o contador visual da estrela
    const updateFavCounter = () => {
        const favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');
        const counter = document.getElementById('fav-counter');
        if (counter) {
            counter.innerText = favorites.length;
        }
    };

    // Função para renderizar os favoritos salvos
    const renderFavorites = () => {
        if (!favGrid) return;
        const favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');
        favGrid.innerHTML = favorites.length ? '' : '<p style="color:white; grid-column: 1/-1; text-align:center;">Você ainda não favoritou nada na sua jornada estelar.</p>';

        favorites.forEach(fav => {
            const card = document.createElement('div');
            card.className = 'gostos-card';
            card.style.position = 'relative';

            // Reconstrói o HTML a partir dos dados salvos (mais estável)
            const tagsHtml = fav.tags ? fav.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
            
            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${fav.img}" alt="${fav.title}">
                </div>
                <h3>${fav.title}</h3>
                <p>${fav.desc}</p>
                <div class="tags-list" style="display: flex;">${tagsHtml}</div>
            `;

            if (fav.favoritoTag) {
                card.innerHTML += `<div class="favorito-tag" style="display: flex;">${fav.favoritoTag}</div>`;
            }

            // Botão de remover elegante
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-fav-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover dos favoritos';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(e, null, fav.title);
            };
            card.appendChild(removeBtn);
            
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
    window.toggleFavorite = (e, btn, directTitle = null) => {
        if (e) e.stopPropagation();
        
        let title;
        let card;
        if (directTitle) {
            title = directTitle;
        } else {
            card = btn.closest('.gostos-card');
            title = card.querySelector('h3')?.innerText;
        }

        if (!title) return;
        let favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');

        if (favorites.some(f => f.title === title)) {
            favorites = favorites.filter(f => f.title !== title);
            if (btn) btn.classList.remove('active');
            showNotification(`Removido: ${title}`);
        } else {
            // Salva apenas os DADOS necessários, não o HTML
            const favData = {
                title: title,
                desc: card.querySelector('p')?.innerText || '',
                img: card.querySelector('.card-img-container img')?.src || '',
                tags: Array.from(card.querySelectorAll('.tag')).map(t => t.innerText),
                favoritoTag: card.querySelector('.favorito-tag')?.innerHTML || null
            };

            favorites.push(favData);
            btn.classList.add('active');
            showNotification(`Favoritado: ${title}`);
        }

        safeLocalStorage.set('user-favorites', JSON.stringify(favorites));
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
        if (favOverlay && btnFavoritos && (favOverlay.style.display === 'flex' || getComputedStyle(favOverlay).display === 'flex')) {
            const favContainer = document.querySelector('.fav-content');
            
            // Verifica se o clique não foi no container, nem no botão de abrir, nem no botão de voltar ao topo
            const isBackToTopClick = backToTopBtn && backToTopBtn.contains(e.target);
            
            if (!favContainer.contains(e.target) && !btnFavoritos.contains(e.target) && !isBackToTopClick) {
                favOverlay.style.display = 'none';
            }
        }
    });

    // Tornando a função de fechar acessível ao HTML
    window.fecharFavoritos = () => {
        if (favOverlay) {
            favOverlay.style.display = 'none';
            // Re-avalia o botão para a janela principal ao fechar
            if (window.scrollY > 400) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
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

    // Verifica se há uma busca na URL ao carregar
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        setTimeout(() => searchInput.dispatchEvent(new Event('input')), 500);
    }

    // Inicializa as estrelas nos cards existentes
    document.querySelectorAll('.gostos-card').forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;

        card.style.position = 'relative';

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