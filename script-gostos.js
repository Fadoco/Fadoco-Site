/**
 * STAR HUB - LÓGICA ESPECÍFICA DA PÁGINA DE GOSTOS
 */

// --- CONFIGURAÇÃO DA API DO YOUTUBE ---
const YT_CONFIG = {
    KEY: 'AIzaSyDaPbh2ZDKB3Gq16K68V8xatYZ4ZTy2hlQ',
    PLAYLIST_ID: 'PLKQ_ZTvlL-M-XEn1Biw7iMalaIGxl3IBg',
    MAX_RESULTS: 50
};
let ytPlaylistLoaded = false;
let isFetching = false;
let youtubeNextPageToken = '';

window.carregarPlaylistYouTube = async function(pageToken = '') {
    const musicasGrid = document.getElementById('musicas-grid');
    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
    if (!musicasGrid || isFetching) return;
    isFetching = true;

    if (pageToken === '') {
        musicasGrid.innerHTML = `<p style="color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;">Sintonizando frequências do YouTube...</p>`;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerText = 'Carregando...';
    }

    try {
        const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
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
            card.className = `gostos-card ${isFavorited ? 'is-favorite' : ''}`;
            card.setAttribute('data-search', `${titulo} youtube musica`.toLowerCase());
            card.onclick = function() { ampliarCard(this); };
            card.innerHTML = `
                <div class="card-img-container"><img src="${capa}" alt="${titulo}" loading="lazy"></div>
                <h3>${titulo}</h3>
                <p>${(snippet.description || "").substring(0, 80)}...</p>
                <div class="tags-list" style="display: none;"><span class="tag">YouTube</span><span class="tag">Música</span></div>
                <span class="fav-toggle ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(event, this)">★</span>
            `;
            musicasGrid.appendChild(card);
        });

        youtubeNextPageToken = data.nextPageToken || '';
        if (loadMoreBtn) loadMoreBtn.style.display = youtubeNextPageToken ? 'block' : 'none';
        ytPlaylistLoaded = true;
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
        const response = await fetch(`${categoria}.json?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Erro ao carregar ${categoria}.json`);
        const data = await response.json();
        const lista = data[categoria] || [];
        renderizarCategoria(lista.map(item => ({...item, categoriaPai: categoria})), gridId);
        categoriasCarregadas.add(categoria);
        inicializarComponentesGostos();
    } catch (error) {
        grid.innerHTML = `<p style="color:#ff4b2b; grid-column: 1/-1; text-align:center;">Erro ao baixar dados.</p>`;
    }
};

function renderizarCategoria(lista, gridId) {
    const grid = document.getElementById(gridId);
    const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
    grid.innerHTML = lista.map(item => {
        const isFavorited = favorites.some(f => f.title === item.titulo);
        const validTags = (item.tags || []).filter(t => t.trim() !== "");
        const validTags = (item.tags || []).filter(t => t.trim() !== "");
        const searchStr = `${item.titulo} ${item.descricao} ${validTags.join(' ')} ${item.categoriaPai || ''}`.toLowerCase();
        
        const favTag = (item.favorito && item.favorito.imagem && item.favorito.texto) ? `
            <div class="favorito-tag" onclick="event.stopPropagation(); ampliarImagem(this.querySelector('img'))">
                <span>Favorito: ${item.favorito.texto}</span>
                <img src="${item.favorito.imagem}" class="mini-img">
            </div>` : '';

        return `
            <div class="gostos-card ${isFavorited ? 'is-favorite' : ''}" data-search="${searchStr}" onclick="ampliarCard(this)">
                <div class="card-img-container"><img src="${item.imagem}" alt="${item.titulo}"></div>
                <h3>${item.titulo}</h3>
                <p>${item.descricao}</p>
                <div class="tags-list">${validTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                ${favTag}
                <span class="fav-toggle ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(event, this)">★</span>
            </div>`;
    }).join('');
}

function inicializarComponentesGostos() {
    if (typeof renderFavorites === "function") renderFavorites();
    const tagCloudContainer = document.getElementById('tag-cloud');
    if (tagCloudContainer) {
        tagCloudContainer.innerHTML = '';
        const uniqueTags = [...new Set(Array.from(document.querySelectorAll('.gostos-grid.active .tag')).map(t => t.innerText))];
        uniqueTags.sort().forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-cloud-item';
            tagEl.innerText = tag;
            tagEl.onclick = () => {
                const input = document.getElementById('search-input');
                if (input) { input.value = tag.toLowerCase(); input.dispatchEvent(new Event('input')); }
            };
            tagCloudContainer.appendChild(tagEl);
        });
    }
}

// --- SISTEMA DE FILTROS E BUSCA ---
const inicializarEventosGostos = () => {
    const searchInput = document.getElementById('search-input');
    const applyFilters = () => {
        const term = searchInput?.value.toLowerCase().trim() || '';
        document.querySelectorAll('.gostos-card').forEach(card => {
            const matches = (card.getAttribute('data-search') || '').includes(term);
            card.style.display = matches ? 'flex' : 'none';
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
                    if (categoria === 'musicas') window.carregarPlaylistYouTube();
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
            if (cloud.classList.contains('active')) inicializarComponentesGostos();
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
};

document.addEventListener('DOMContentLoaded', inicializarEventosGostos);