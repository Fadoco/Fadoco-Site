/**
 * STAR HUB - LÓGICA DE DADOS, PESQUISA E FAVORITOS
 */

// --- UTILITÁRIOS ---
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// --- CONFIGURAÇÃO DA API DO YOUTUBE ---
const YT_CONFIG = {
    KEY: 'AIzaSyDaPbh2ZDKB3Gq16K68V8xatYZ4ZTy2hlQ',
    PLAYLIST_ID: 'PLKQ_ZTvlL-M-XEn1Biw7iMalaIGxl3IBg',
    MAX_RESULTS: 50
};
let ytPlaylistLoaded = false; // Controle para carregar apenas uma vez
let isFetching = false; // Evita múltiplas requisições simultâneas
let youtubeNextPageToken = ''; // Armazena o token da próxima página do YouTube

window.carregarPlaylistYouTube = async function(pageToken = '') {
    const musicasGrid = document.getElementById('musicas-grid');
    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
    if (!musicasGrid || isFetching) return;
    isFetching = true;

    // Mensagem de feedback visual enquanto carrega
    if (pageToken === '') { // Apenas na carga inicial ou se a grade estiver vazia
        musicasGrid.innerHTML = `<p style="color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;">Sintonizando frequências do YouTube...</p>`;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerText = 'Carregando...'; // Indica que está carregando mais
    }

    try {
        const favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');

        const params = new URLSearchParams({
            part: 'snippet',
            maxResults: YT_CONFIG.MAX_RESULTS,
            playlistId: YT_CONFIG.PLAYLIST_ID,
            key: YT_CONFIG.KEY,
            pageToken: pageToken // Usa o token da página para carregar a próxima parte
        });
        
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (pageToken === '') { // Limpa a grade apenas na carga inicial
            musicasGrid.innerHTML = '';
        }

        if (!data.items || data.items.length === 0) {
            if (musicasGrid.innerHTML === '') musicasGrid.innerHTML = `<p style="color:white; grid-column: 1/-1; text-align:center;">Nenhuma música encontrada.</p>`;
            isFetching = false;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none'; // Esconde o botão se não há itens
            return;
        }

        data.items.forEach(item => {
            const snippet = item.snippet;
            const titulo = snippet.title;
            const thumbnail = snippet.thumbnails;
            
            if (titulo === "Deleted video" || titulo === "Private video" || !thumbnail) return;

            const descCompleta = snippet.description || "";
            const descricaoMostrada = descCompleta.substring(0, 80) + '...';
            const capa = thumbnail.medium ? thumbnail.medium.url : (thumbnail.default ? thumbnail.default.url : 'img/mp3.jpg');
            const searchStr = `${titulo} youtube musica`.toLowerCase();

            const isFavorited = favorites.some(f => f.title === titulo);
            const card = document.createElement('div');
            card.className = `gostos-card ${isFavorited ? 'is-favorite' : ''}`;
            card.setAttribute('data-search', searchStr);
            card.onclick = function() { ampliarCard(this); };

            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${capa}" alt="${titulo}" loading="lazy">
                </div>
                <h3>${titulo}</h3>
                <p>${descricaoMostrada}</p>
                <div class="tags-list" style="display: none;">
                    <span class="tag">YouTube</span>
                    <span class="tag">Música</span>
                </div>
            `;

            const star = document.createElement('span');
            star.className = 'fav-toggle';
            star.innerHTML = '★';
            star.onclick = (e) => toggleFavorite(e, star);

            if (isFavorited) star.classList.add('active');

            card.appendChild(star);
            musicasGrid.appendChild(card);
        });

        // SALVA O TOKEN PARA A PRÓXIMA PÁGINA E ATUALIZA O BOTÃO
        youtubeNextPageToken = data.nextPageToken || '';
        if (loadMoreBtn) {
            if (youtubeNextPageToken) {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.innerText = 'Carregar Mais Músicas';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }

        ytPlaylistLoaded = true; // Só marca como carregado se o loop terminar com sucesso
        isFetching = false;

    } catch (error) {
        console.error('Erro YouTube API:', error);
        ytPlaylistLoaded = false; // Permite tentar carregar de novo ao clicar na barra
        isFetching = false;
        
        let mensagemErro = `Falha na conexão estelar: ${error.message}`;
        
        if (error.message.includes('API key not valid') || error.message.includes('key expired')) {
            mensagemErro = "Chave de API Inválida ou Expirada: O GitHub pode ter desativado sua chave por segurança.";
        } else if (error.message.includes('referer') || error.message.includes('RefererNotAllowed')) {
            mensagemErro = `Acesso Negado (Referer): O domínio ${window.location.hostname} não está autorizado no Google Cloud.`;
        } else if (error.message.includes('quota')) {
            mensagemErro = "Cota Esgotada: O limite diário de buscas no YouTube foi atingido.";
        }

        musicasGrid.innerHTML = ''; // Limpa o loading e mostra o erro
        musicasGrid.innerHTML = `<p style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 20px;">
            ${mensagemErro}<br>
            <button onclick="carregarPlaylistYouTube()" style="background:none; border:1px solid #ff4b2b; color:#ff4b2b; cursor:pointer; margin-top:10px; padding:5px 10px; border-radius:5px;">Tentar Reconectar</button>
        </p>`;
    }
}

// --- CARREGAMENTO DE DADOS LOCAIS (JSON) ---
async function carregarDadosLocais() {
    try {
        const response = await fetch('dados.json?v=' + Date.now()); // Evita cache
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo dados.json');
        const data = await response.json();
        
        // Renderiza todas as categorias presentes no JSON automaticamente
        Object.keys(data).forEach(categoria => {
            const gridId = `${categoria}-grid`;
            // Adiciona o nome da categoria como tag oculta para facilitar a busca
            const listaComCategoria = (data[categoria] || []).map(item => ({...item, categoriaPai: categoria}));
            if (document.getElementById(gridId)) {
                renderizarCategoria(listaComCategoria, gridId);
            }
        });

        inicializarComponentesDinamicos();
    } catch (error) {
        console.error("Erro ao carregar dados locais:", error);
    }
}

function renderizarCategoria(lista, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid || !lista) return;

    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('user-favorites') || '[]');
    } catch (e) {
        console.warn("Erro ao carregar favoritos, resetando...");
        favorites = [];
    }

    grid.innerHTML = lista.map(item => {
        const tags = item.tags || [];
        const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
        
        // Prepara o texto de busca antecipadamente para performance
        const searchStr = `${item.titulo} ${item.descricao} ${tags.join(' ')} ${item.categoriaPai || ''}`.toLowerCase();
        
        const favHtml = (item.favorito && item.favorito.imagem) ? `
            <div class="favorito-tag" onclick="event.stopPropagation(); ampliarImagem(this.querySelector('img'))">
                <span>Favorito: ${item.favorito.texto} <strong>Clique para ver</strong></span>
                <img src="${item.favorito.imagem}" alt="${item.favorito.texto || 'Favorito'}" class="mini-img">
            </div>` : '';

        const isFavorited = favorites.some(f => f.title === item.titulo);
        const activeClass = isFavorited ? 'active' : '';
        const cardFavoriteClass = isFavorited ? 'is-favorite' : '';

        return `
            <div class="gostos-card ${cardFavoriteClass}" 
                 ${item.ano ? `data-year="${item.ano}"` : ''} 
                 data-search="${searchStr}" 
                 onclick="ampliarCard(this)"
                 style="position: relative;">
                <div class="card-img-container">
                    <img src="${item.imagem}" alt="${item.titulo}">
                </div>
                <h3>${item.titulo}</h3>
                <p>${item.descricao}</p>
                <div class="tags-list">${tagsHtml}</div>
                ${favHtml}
                <span class="fav-toggle ${activeClass}" onclick="toggleFavorite(event, this)">★</span>
            </div>
        `;
    }).join('');
}

function inicializarComponentesDinamicos() {
    // Chama funções que dependem dos cards estarem no DOM
    if (typeof renderFavorites === "function") renderFavorites();
    
    // --- NUVEM DE TAGS DINÂMICA ---
    const searchInput = document.getElementById('search-input');
    const tagCloudContainer = document.getElementById('tag-cloud');

    if (tagCloudContainer) {
        const allTags = Array.from(document.querySelectorAll('.gostos-card .tag')).map(t => t.innerText);
        const uniqueTags = [...new Set(allTags)];
        
        uniqueTags.sort().forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-cloud-item';
            tagEl.innerText = tag;
            tagEl.onclick = () => {
                if (searchInput) {
                    searchInput.value = tag.toLowerCase();
                    searchInput.dispatchEvent(new Event('input'));
                }
            };
            tagCloudContainer.appendChild(tagEl);
        });
    }
}

// --- 2. INICIALIZAÇÃO DE EVENTOS ---
const inicializarApp = () => {
    carregarDadosLocais();

    // --- SISTEMA DE BUSCA E FILTROS OTIMIZADO ---
    const searchInput = document.getElementById('search-input');
    let activeDecade = 'all';

    const applyFilters = () => {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('.gostos-card');
        const containers = document.querySelectorAll('.toggle-container');

        cards.forEach(card => {
            // Busca ultra rápida usando o atributo data-search pré-calculado
            const content = card.getAttribute('data-search') || '';
            const year = parseInt(card.getAttribute('data-year')) || 0;
            const matchesSearch = content.includes(term);
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

    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    const btnFavoritos = document.getElementById('btn-favoritos');
    const favOverlay = document.getElementById('favorites-overlay');
    
    if (btnFavoritos) {
        btnFavoritos.addEventListener('click', () => {
            renderFavorites();
            if (favOverlay) favOverlay.style.display = 'flex';
        });
    }


    

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

    // --- BOTÃO CARREGAR MAIS MÚSICAS ---
    const btnCarregarMaisMusicas = document.getElementById('btn-carregar-mais-musicas');
    if (btnCarregarMaisMusicas) {
        btnCarregarMaisMusicas.addEventListener('click', () => {
            if (youtubeNextPageToken) {
                carregarPlaylistYouTube(youtubeNextPageToken);
            }
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
};

document.addEventListener('DOMContentLoaded', inicializarApp);