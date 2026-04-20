/**
 * STAR HUB - LÓGICA ESPECÍFICA DA PÁGINA DE GOSTOS
 */

// --- FUNÇÕES UTILITÁRIAS ---
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// --- CONFIGURAÇÃO DA API DO YOUTUBE ---
const YT_CONFIG = {
    KEY: 'AIzaSyDaPbh2ZDKB3Gq16K68V8xatYZ4ZTy2hlQ',
    PLAYLIST_ID: 'PLKQ_ZTvlL-M-XEn1Biw7iMalaIGxl3IBg',
    MAX_RESULTS: 50
};
let ytPlaylistLoaded = false;
let isFetching = false;
let youtubeNextPageToken = '';

// Função global para filtrar por tag
window.filterByTag = (tag) => {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = tag.toLowerCase();
        input.dispatchEvent(new Event('input'));
        if (typeof fecharFavoritos === 'function') fecharFavoritos();
        if (typeof fecharAmpliacao === 'function') fecharAmpliacao();
    }
};

window.carregarPlaylistYouTube = async function(pageToken = '') {
    const musicasGrid = document.getElementById('musicas-grid');
    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
    if (!musicasGrid || isFetching || (pageToken === '' && ytPlaylistLoaded)) return;
    isFetching = true;

    if (pageToken === '') {
        musicasGrid.innerHTML = `<p style="color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;">Sintonizando frequências do YouTube...</p>`;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerText = 'Carregando...';
    }

    try {
        // Acesso seguro ao localStorage para evitar erros em navegadores mobile restritos
        let favorites = [];
        try {
            const stored = localStorage.getItem('user-favorites');
            if (stored) favorites = JSON.parse(stored);
        } catch (e) { console.warn("Acesso ao localStorage limitado."); }

        const params = new URLSearchParams({
            part: 'snippet',
            maxResults: YT_CONFIG.MAX_RESULTS,
            playlistId: YT_CONFIG.PLAYLIST_ID,
            key: YT_CONFIG.KEY,
            pageToken: pageToken
        });
        
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();
        if (pageToken === '') musicasGrid.innerHTML = '';

        data.items?.forEach(item => {
            const snippet = item.snippet;
            const titulo = snippet.title;
            if (titulo === "Deleted video" || titulo === "Private video" || !snippet.thumbnails) return;

            const capa = snippet.thumbnails.medium?.url || 'img/mp3.jpg';
            const isFavorited = favorites.some(f => f.title === titulo);
            
            const card = document.createElement('div');
            card.className = `gostos-card card-musicas reveal-section ${isFavorited ? 'is-favorite' : ''}`;
            card.setAttribute('data-search', `${titulo} youtube musica`.toLowerCase());
            card.setAttribute('data-tooltip', 'Ver Detalhes');
            card.onclick = function() { ampliarCard(this); };
            card.innerHTML = `
                <div class="card-img-container"><img src="${capa}" alt="${titulo}" loading="lazy"></div>
                <h3>${titulo}</h3>
                <p>${(snippet.description || "").substring(0, 160)}...</p>
                <div class="tags-list">
                    <span class="tag" onclick="event.stopPropagation(); filterByTag('YouTube')">YouTube</span>
                    <span class="tag" onclick="event.stopPropagation(); filterByTag('Música')">Música</span>
                </div>
                <span class="fav-toggle ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(event, this)" data-tooltip="Favoritar">★</span>
            `;
            musicasGrid.appendChild(card);

            // Ativa o efeito de reveal para o novo card do YouTube
            if (window.revealObserver) {
                window.revealObserver.observe(card);
            }
        });

        youtubeNextPageToken = data.nextPageToken || '';
        // Só exibe o botão se houver próxima página E a seção estiver aberta (ativa)
        if (loadMoreBtn) {
            const isGridActive = musicasGrid.classList.contains('active');
            loadMoreBtn.style.display = (youtubeNextPageToken && isGridActive) ? 'block' : 'none';
        }
        ytPlaylistLoaded = true;
        inicializarComponentesGostos();
    } catch (error) {
        console.error('Erro YouTube API:', error);
        musicasGrid.innerHTML = `<p style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 20px;">Falha na conexão YouTube.</p>`;
    } finally {
        isFetching = false;
        if (loadMoreBtn) loadMoreBtn.innerText = 'Carregar Mais Músicas';
    }
};

// --- CARREGAMENTO DE JSON LOCAL ---
const categoriasCarregadas = new Set();

window.carregarCategoriaJSON = async function(categoria) {
    const gridId = `${categoria}-grid`;
    const grid = document.getElementById(gridId);
    if (!grid || categoriasCarregadas.has(categoria)) return;

    const loadingMsg = document.createElement('p');
    loadingMsg.style.cssText = "color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;";
    loadingMsg.innerText = `Sincronizando dados de ${categoria}...`;
    grid.appendChild(loadingMsg);

    try {
        const response = await fetch(`./${categoria}.json`);
        if (!response.ok) throw new Error(`Erro ao carregar ${categoria}.json`);
        const data = await response.json();
        const lista = data[categoria] || [];
        renderizarCategoria(lista.map(item => ({...item, categoriaPai: categoria})), gridId);
        categoriasCarregadas.add(categoria);
        inicializarComponentesGostos();
    } catch (error) {
        console.error(`Erro detalhado na categoria [${categoria}]:`, error);
        
        let mensagemCustom = "Erro ao carregar dados.";
        if (window.location.protocol === 'file:') {
            mensagemCustom = "O navegador bloqueia arquivos locais por segurança. Use a extensão 'Live Server' no VS Code para abrir o site.";
        } else if (error instanceof SyntaxError) {
            mensagemCustom = `Erro de digitação no arquivo ${categoria}.json (verifique vírgulas ou aspas).`;
        }

        grid.innerHTML = `
            <div style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 30px; background: rgba(255,0,0,0.05); border-radius: 15px; border: 1px dashed #ff4b2b; margin: 20px 0;">
                <p style="font-family: 'Orbitron', sans-serif; font-size: 0.8rem; margin-bottom: 5px;">${mensagemCustom}</p>
                <p style="font-size: 0.6rem; opacity: 0.7;">Detalhe: ${error.message}</p>
            </div>`;
    }
};

function renderizarCategoria(lista, gridId) {
    const currentTags = new Set(); // Para coletar tags desta renderização
    const grid = document.getElementById(gridId);
    
    let favorites = [];
    try {
        const stored = localStorage.getItem('user-favorites');
        if (stored) favorites = JSON.parse(stored);
    } catch (e) { favorites = []; }

    grid.innerHTML = lista.map(item => {
        const isFavorited = Array.isArray(favorites) && favorites.some(f => f.title === item.titulo);
        const validTags = (item.tags || []).filter(t => t.trim() !== "");
        const searchStr = `${item.titulo || ''} ${item.descricao || ''} ${validTags.join(' ')} ${item.categoriaPai || ''}`.toLowerCase();
        
        const favTag = (item.favorito && item.favorito.imagem && item.favorito.texto) ? `
            <div class="favorito-tag" onclick="event.stopPropagation(); ampliarImagem(this.querySelector('img'))">
                <span>Favorito: ${item.favorito.texto}</span>
                <img src="${item.favorito.imagem}" class="mini-img">
            </div>` : '';

        return `
            <div class="gostos-card reveal-section card-${item.categoriaPai} ${isFavorited ? 'is-favorite' : ''}" data-search="${searchStr}" data-tooltip="Ver Detalhes" onclick="ampliarCard(this)">
                <div class="card-img-container"><img src="${item.imagem}" alt="${item.titulo}"></div>
                <h3>${item.titulo}</h3>
                <p>${item.descricao}</p>
                <div class="tags-list">${validTags.map(t => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${t}')">${t}</span>`).join('')}</div>
                ${favTag}
                <span class="fav-toggle ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(event, this)" data-tooltip="Salvar nos Tesouros">★</span>
            </div>`;
    }).join('');

    // Observa os novos cards para o efeito de Scroll Reveal
    // E coleta as tags para a nuvem
    if (window.revealObserver) {
        grid.querySelectorAll('.reveal-section').forEach(el => {
            window.revealObserver.observe(el);
            el.querySelectorAll('.tag').forEach(tagEl => currentTags.add(tagEl.innerText));
        });
    }

    // Atualiza a nuvem de tags após cada renderização de categoria
    inicializarComponentesGostos(currentTags);
}

const allUniqueTags = new Set(); // Conjunto global para todas as tags

function inicializarComponentesGostos(newTags = new Set()) {
    const tagCloudContainer = document.getElementById('tag-cloud');
    if (tagCloudContainer) {
        newTags.forEach(tag => allUniqueTags.add(tag)); // Adiciona novas tags ao conjunto global

        const fragment = document.createDocumentFragment();
        Array.from(allUniqueTags).sort().forEach(tag => { // Usa o conjunto global e o ordena
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-cloud-item';
            tagEl.innerText = tag;
            tagEl.onclick = () => filterByTag(tag);
            fragment.appendChild(tagEl);
        });
        
        tagCloudContainer.innerHTML = '';
        tagCloudContainer.appendChild(fragment);
    }
}

// --- SISTEMA DE FILTROS E BUSCA ---
const inicializarEventosGostos = () => {
    const searchInput = document.getElementById('search-input');
    const applyFilters = () => {
        const term = searchInput?.value.toLowerCase().trim() || '';
        document.querySelectorAll('.gostos-card').forEach(card => {
            const matches = (card.getAttribute('data-search') || '').includes(term);
            card.style.display = matches ? '' : 'none'; // Usa o valor padrão do CSS (grid)
        });

        document.querySelectorAll('.toggle-container').forEach(container => {
            const grid = container.querySelector('.gostos-grid');
            const hasVisible = Array.from(grid?.querySelectorAll('.gostos-card') || []).some(c => c.style.display !== 'none');
            if (term !== '') {
                container.style.display = hasVisible ? 'block' : 'none';
                if (hasVisible) grid.classList.add('active');
            } else {
                container.style.display = 'block';
            }
        });
    };

    if (searchInput && typeof window.debounce === 'function') {
        searchInput.addEventListener('input', window.debounce(applyFilters, 300));
    }

    // Toggle das barras de categoria
    document.querySelectorAll('.toggle-bar').forEach(bar => {
        bar.onclick = () => {
            const categoria = bar.id.replace('toggle-', '');
            const grid = document.getElementById(`${categoria}-grid`);
            const seta = bar.querySelector('.seta');
            if (grid) {
                const isActive = grid.classList.toggle('active');
                if (seta) seta.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
                if (isActive) {
                    if (categoria === 'musicas') {
                        window.carregarPlaylistYouTube();
                        const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
                        if (loadMoreBtn && youtubeNextPageToken) loadMoreBtn.style.display = 'block';
                    }
                    else window.carregarCategoriaJSON(categoria);
                } else if (categoria === 'musicas') {
                    // Esconde o botão se a seção de músicas for fechada
                    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                }
            }
        };
    });

    // Botão Aleatório
    document.getElementById('btn-random')?.addEventListener('click', () => {
        const cards = Array.from(document.querySelectorAll('.gostos-card')).filter(c => c.style.display !== 'none');
        if (cards.length) ampliarCard(cards[Math.floor(Math.random() * cards.length)]);
    });

    // Botão Tags
    document.getElementById('btn-tags-toggle')?.addEventListener('click', () => {
        const cloud = document.getElementById('tag-cloud');
        if (cloud) {
            cloud.classList.toggle('active');
            if (cloud.classList.contains('active')) inicializarComponentesGostos(); // Re-renderiza a nuvem com todas as tags coletadas
        }
    });

    // Botão Carregar Mais Músicas
    document.getElementById('btn-carregar-mais-musicas')?.addEventListener('click', () => {
        if (youtubeNextPageToken) window.carregarPlaylistYouTube(youtubeNextPageToken);
    });

    // Botão Favoritos
    document.getElementById('btn-favoritos')?.addEventListener('click', () => {
        if (typeof renderFavorites === "function") renderFavorites();
        document.getElementById('favorites-overlay').style.display = 'flex';
    });

    // Busca via URL
    const urlSearch = new URLSearchParams(window.location.search).get('search');
    if (urlSearch && searchInput) {
        searchInput.value = urlSearch;
        setTimeout(() => searchInput.dispatchEvent(new Event('input')), 600);
    }
    
    if (typeof updateFavCounter === 'function') updateFavCounter();

    // Pre-carrega os dados silenciosamente para que as tags e a busca funcionem desde o início
    ['animes', 'jogos', 'filmes', 'series', 'desenhos'].forEach(cat => window.carregarCategoriaJSON(cat));
    window.carregarPlaylistYouTube();
};

document.addEventListener('DOMContentLoaded', inicializarEventosGostos);