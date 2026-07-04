/**
 * STAR HUB - LÓGICA ESPECÍFICA DA PÁGINA DE GOSTOS
 */

// --- FUNÇÕES UTILITÁRIAS ---
/**
 * Debounce function to delay function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
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

// --- ARMAZENAMENTO SEGURO EM LOCALSTORAGE ---
/**
 * Safe localStorage accessor with error handling
 */
const safeStorageGostos = {
    get: (key) => {
        try { 
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) { 
            console.warn(`Erro ao ler localStorage (${key}):`, e.message);
            return null;
        }
    },
    set: (key, data) => {
        try { 
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) { 
            if (e.name === 'QuotaExceededError') {
                console.error('localStorage cheio - limpe alguns dados', e);
                alert('⚠️ Espaço de armazenamento cheio! Limpe alguns favoritos.');
            } else {
                console.warn(`Erro ao salvar localStorage (${key}):`, e.message);
            }
            return false;
        }
    }
};

// --- SEGURANÇA: SANITIZAÇÃO E VALIDAÇÃO ---
/**
 * Validar schema de dados JSON
 * @param {Object} data - Objeto a validar
 * @param {Array<string>} requiredFields - Campos obrigatórios
 * @returns {boolean} true se válido
 */
const validateJSONSchema = (data, requiredFields = []) => {
    if (!data || typeof data !== 'object') return false;
    return requiredFields.every(field => field in data && data[field] !== undefined);
};

/**
 * Sanitizar lista de tags para evitar injeção em onclick
 * @param {Array<string>} tags - Lista de tags
 * @returns {Array<string>} Tags sanitizadas
 */
const sanitizeTags = (tags) => {
    return (Array.isArray(tags) ? tags : [])
        .filter(t => typeof t === 'string' && t.length > 0 && t.length <= 50)
        .map(t => t.replace(/[^a-zA-Z0-9\s\-]/g, '').trim())
        .filter(t => t.length > 0);
};

// --- CONFIGURAÇÃO DA API DO YOUTUBE ---
// Chamada direta à API do YouTube (chave visível no código)
const YT_CONFIG = {
    PLAYLIST_ID: 'PLKQ_ZTvlL-M-XEn1Biw7iMalaIGxl3IBg',
    MAX_RESULTS: 50,
    API_KEY: 'AIzaSyDpd3zy6K0MXW-UUhKwmRPcJfvCF-Yq0fg', // ⚠️ Chave pública para YouTube Data API
    API_URL: 'https://www.googleapis.com/youtube/v3/playlistItems'
};
let ytPlaylistLoaded = false;
let isFetching = false;
let youtubeNextPageToken = '';

/**
 * Filtrar cards por tag ao clicar
 * @param {string} tag - Tag para filtrar
 */
window.filterByTag = (tag) => {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = tag.toLowerCase();
        input.dispatchEvent(new Event('input'));
        if (typeof fecharFavoritos === 'function') fecharFavoritos();
        if (typeof fecharAmpliacao === 'function') fecharAmpliacao();
    }
};

/**
 * Carregar playlist do YouTube com paginação
 * @param {string} pageToken - Token de página para paginação
 */
window.carregarPlaylistYouTube = async function(pageToken = '') {
    const musicasGrid = document.getElementById('musicas-grid');
    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
    if (!musicasGrid || isFetching || (pageToken === '' && ytPlaylistLoaded)) return;
    
    isFetching = true;

    if (pageToken === '') {
        musicasGrid.innerHTML = `<p style="color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;">Sintonizando frequências do YouTube...</p>`;
    } else if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '⏳ Carregando...';
        loadMoreBtn.disabled = true;
    }

    let url;
    try {
        // Acesso seguro ao localStorage
        const favorites = safeStorageGostos.get('user-favorites') || [];

        // Chamar YouTube API diretamente
        const params = new URLSearchParams({
            key: YT_CONFIG.API_KEY,
            playlistId: YT_CONFIG.PLAYLIST_ID,
            part: 'snippet,contentDetails',
            maxResults: YT_CONFIG.MAX_RESULTS,
            pageToken: pageToken
        });
        
        url = `${YT_CONFIG.API_URL}?${params.toString()}`;
        console.log('📡 Chamando YouTube API:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (pageToken === '') musicasGrid.innerHTML = '';

        data.items?.forEach(item => {
            const snippet = item.snippet;
            const titulo = snippet.title;
            if (titulo === "Deleted video" || titulo === "Private video" || !snippet.thumbnails) return;

            const capa = snippet.thumbnails.medium?.url || 'img/mp3.jpg';
            const isFavorited = favorites.some(f => f.title === titulo);
            
            // Adiciona ao pool global para que o botão Random (Sorteio) funcione com músicas
            poolGlobalGostos.push({
                titulo: titulo,
                descricao: snippet.description || "",
                imagem: capa,
                tags: ['YouTube', 'Música'],
                categoriaPai: 'musicas'
            });

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
        atualizarInterfaceTags();
    } catch (error) {
        console.error('❌ Erro ao carregar YouTube API:', error);
        if (url) console.error('URL chamada:', url);
        console.error('Detalhes:', error.message);
        
        // Mostrar erro específico para o usuário
        if (!ytPlaylistLoaded) {
            musicasGrid.innerHTML = `
                <p style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 20px;">
                    ⚠️ Erro ao carregar playlist do YouTube<br>
                    <small style="font-size: 0.9em; opacity: 0.8;">${error.message}</small>
                </p>
            `;
        }
    } finally {
        isFetching = false;
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '📡 Carregar Mais Músicas';
            loadMoreBtn.disabled = false;
        }
    }
};

// --- CARREGAMENTO DE JSON LOCAL ---
const categoriasCarregadas = new Set();
const poolGlobalGostos = [];
const categoriasParaPrefetch = ['animes', 'jogos', 'filmes', 'series', 'desenhos'];

/**
 * Prefetch todos os JSONs de gostos para alimentar tags e sorteio
 */
async function prefetchGostos() {
    const tagCloud = document.getElementById('tag-cloud');
    if (tagCloud) tagCloud.innerHTML = '<p style="color:var(--primary-neon); font-size:0.7rem; text-align:center; width:100%;">Sintonizando frequências das tags...</p>';

    for (const cat of categoriasParaPrefetch) {
        try {
            const response = await fetch(`./pagina-gostos/${cat}.json`);
            if (!response.ok) continue;
            const data = await response.json();
            const lista = data[cat] || [];
            lista.forEach(item => {
                const itemCompleto = { ...item, categoriaPai: cat };
                poolGlobalGostos.push(itemCompleto);
                (item.tags || []).forEach(t => allUniqueTags.add(t));
            });
        } catch (e) {
            console.warn(`Erro no prefetch da categoria ${cat}:`, e);
        }
    }
    atualizarInterfaceTags();
    
    // Sincroniza a primeira leva de músicas do YouTube para o pool de sorteio
    carregarPlaylistYouTube();
}

/**
 * Carregar dados de categoria em JSON
 * @param {string} categoria - Nome da categoria (animes, jogos, filmes, series, desenhos)
 */
/**
 * Carregar dados de categoria em JSON
 * @param {string} categoria - Nome da categoria (animes, jogos, filmes, series, desenhos)
 */
window.carregarCategoriaJSON = async function(categoria) {
    const gridId = `${categoria}-grid`;
    const grid = document.getElementById(gridId);
    if (!grid || categoriasCarregadas.has(categoria)) return;

    const loadingMsg = document.createElement('p');
    loadingMsg.style.cssText = "color:var(--primary-neon); grid-column: 1/-1; text-align:center; padding: 20px;";
    loadingMsg.innerText = `Sincronizando dados de ${categoria}...`;
    grid.appendChild(loadingMsg);

    try {
        const response = await fetch(`./pagina-gostos/${categoria}.json`);
        if (!response.ok) throw new Error(`Erro ao carregar pagina gostos/${categoria}.json`);
        const data = await response.json();
        
        // VALIDAÇÃO DE SCHEMA
        if (!validateJSONSchema(data, [categoria])) {
            throw new Error(`Schema inválido: arquivo deve conter propriedade '${categoria}'`);
        }
        
        const lista = data[categoria] || [];
        if (!Array.isArray(lista)) {
            throw new Error(`Schema inválido: '${categoria}' deve ser um array`);
        }
        
        // Validar cada item tem os campos obrigatórios
        const listaNormalizada = lista.filter(item => {
            return validateJSONSchema(item, ['titulo', 'descricao', 'imagem', 'tags']);
        });
        
        renderizarCategoria(listaNormalizada.map(item => ({...item, categoriaPai: categoria})), gridId);
        categoriasCarregadas.add(categoria);
        atualizarInterfaceTags();
    } catch (error) {
        console.error(`Erro detalhado na categoria [${categoria}]:`, error);
        
        let mensagemCustom = "Erro ao carregar dados.";
        if (window.location.protocol === 'file:') {
            mensagemCustom = "O navegador bloqueia arquivos locais por segurança. Use a extensão 'Live Server' no VS Code para abrir o site.";
        } else if (error instanceof SyntaxError) {
            mensagemCustom = `Erro de digitação no arquivo pagina-gostos/${categoria}.json (verifique vírgulas ou aspas).`;
        }

        grid.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 30px; background: rgba(255,0,0,0.05); border-radius: 15px; border: 1px dashed #ff4b2b; margin: 20px 0;";
        errorDiv.innerHTML = `
            <p style="font-family: 'Orbitron', sans-serif; font-size: 0.8rem; margin-bottom: 5px;">${sanitizeHTML(mensagemCustom)}</p>
            <p style="font-size: 0.6rem; opacity: 0.7;">Detalhe: ${sanitizeHTML(error.message)}</p>
        `;
        grid.appendChild(errorDiv);
    }
};

function renderizarCategoria(lista, gridId) {
    /**
     * Renderizar itens de uma categoria no grid
     * @param {Array} lista - Lista de itens da categoria
     * @param {string} gridId - ID do elemento grid para renderizar
     */
    const grid = document.getElementById(gridId);
    
    let favorites = [];
    try {
        const stored = localStorage.getItem('user-favorites');
        if (stored) favorites = JSON.parse(stored);
    } catch (e) { favorites = []; }

    grid.innerHTML = '';
    
    lista.forEach(item => {
        // SANITIZAR DADOS ANTES DE USAR
        const titulo = sanitizeHTML(item.titulo || 'Sem título');
        const descricao = sanitizeHTML(item.descricao || 'Sem descrição');
        const imagem = (typeof item.imagem === 'string' && item.imagem.length > 0) ? item.imagem : 'img/default.jpg';
        const validTags = sanitizeTags(item.tags);
        
        const isFavorited = Array.isArray(favorites) && favorites.some(f => f.title === item.titulo);
        const searchStr = `${item.titulo || ''} ${item.descricao || ''} ${validTags.join(' ')} ${item.categoriaPai || ''}`.toLowerCase();
        
        // Coleta tags para a nuvem global
        validTags.forEach(t => allUniqueTags.add(t));

        // Criar elementos SEM innerHTML para evitar XSS
        const card = document.createElement('div');
        card.className = `gostos-card reveal-section card-${item.categoriaPai || ''} ${isFavorited ? 'is-favorite' : ''}`;
        card.setAttribute('data-search', searchStr);
        card.setAttribute('data-tooltip', 'Ver Detalhes');
        card.onclick = function() { ampliarCard(this); };
        
        // Imagem
        const imgContainer = document.createElement('div');
        imgContainer.className = 'card-img-container';
        const img = document.createElement('img');
        img.src = imagem;
        img.alt = '';
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        
        // Título
        const h3 = document.createElement('h3');
        h3.textContent = titulo;
        card.appendChild(h3);
        
        // Descrição
        const p = document.createElement('p');
        p.textContent = descricao;
        card.appendChild(p);
        
        // Tags
        const tagsList = document.createElement('div');
        tagsList.className = 'tags-list';
        validTags.forEach(t => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = t;
            tagSpan.onclick = (e) => { e.stopPropagation(); filterByTag(t); };
            tagsList.appendChild(tagSpan);
        });
        card.appendChild(tagsList);
        
        // Favorito tag (se existir)
        if (item.favorito && item.favorito.texto && item.favorito.imagem) {
            const favTag = document.createElement('div');
            favTag.className = 'favorito-tag';
            favTag.onclick = (e) => { e.stopPropagation(); ampliarImagem(favTag.querySelector('.mini-img')); };
            
            const favSpan = document.createElement('span');
            favSpan.textContent = `Favorito: ${item.favorito.texto}`;
            favTag.appendChild(favSpan);
            
            const favImg = document.createElement('img');
            favImg.src = item.favorito.imagem;
            favImg.className = 'mini-img';
            favImg.onclick = (e) => { e.stopPropagation(); ampliarImagem(favImg); };
            favTag.appendChild(favImg);
            
            card.appendChild(favTag);
        }
        
        // Toggle favorito
        const favToggle = document.createElement('span');
        favToggle.className = `fav-toggle ${isFavorited ? 'active' : ''}`;
        favToggle.textContent = '★';
        favToggle.setAttribute('data-tooltip', 'Salvar nos Tesouros');
        favToggle.onclick = (e) => toggleFavorite(e, favToggle);
        card.appendChild(favToggle);
        
        grid.appendChild(card);
        
        // Observar para scroll reveal
        if (window.revealObserver) {
            window.revealObserver.observe(card);
        }
    });

    // Atualiza a interface da nuvem de tags
    atualizarInterfaceTags();
}

const allUniqueTags = new Set(); // Conjunto global para todas as tags

/**
 * Atualizar interface de nuvem de tags com todas as tags únicas
 */
function atualizarInterfaceTags() {
    const tagCloudContainer = document.getElementById('tag-cloud');
    if (!tagCloudContainer || allUniqueTags.size === 0) return;

    const fragment = document.createDocumentFragment();
    Array.from(allUniqueTags).sort().forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-cloud-item';
        tagEl.innerText = tag;
        tagEl.onclick = () => filterByTag(tag);
        fragment.appendChild(tagEl);
    });
    
    tagCloudContainer.innerHTML = '';
    tagCloudContainer.appendChild(fragment);
}

// --- SISTEMA DE FILTROS E BUSCA ---
const inicializarEventosGostos = () => {
    const searchInput = document.getElementById('search-input');
    
    // --- 1. LÓGICA DE EXPANSÃO DE CATEGORIAS ---
    document.querySelectorAll('.toggle-bar').forEach(bar => {
        bar.addEventListener('click', () => {
            const categoria = bar.id.replace('toggle-', '');
            const grid = document.getElementById(`${categoria}-grid`);
            const seta = bar.querySelector('.seta');
            const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
            
            if (!grid) return;

            const isOpening = !grid.classList.contains('active');
            
            if (isOpening) {
                grid.classList.add('active');
                if (seta) seta.style.transform = 'rotate(180deg)';
                
                // Carrega os dados se ainda não foram carregados
                if (categoria === 'musicas') {
                    carregarPlaylistYouTube();
                    // Se já estiver carregado e houver próxima página, garante que o botão apareça
                    if (ytPlaylistLoaded && youtubeNextPageToken && loadMoreBtn) {
                        loadMoreBtn.style.display = 'block';
                    }
                } else {
                    carregarCategoriaJSON(categoria);
                }
            } else {
                grid.classList.remove('active');
                if (seta) seta.style.transform = 'rotate(0deg)';
                // Esconde o botão ao fechar a categoria
                if (categoria === 'musicas' && loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
        });
    });

    // --- 2. LÓGICA DO BOTÃO RANDOM (SORTEIO) ---
    const btnRandom = document.getElementById('btn-random');
    if (btnRandom) {
        btnRandom.addEventListener('click', () => {
            if (poolGlobalGostos.length > 0) {
                const randomItem = poolGlobalGostos[Math.floor(Math.random() * poolGlobalGostos.length)];
                
                // Cria um elemento temporário para o ampliarCard processar
                const tempCard = document.createElement('div');
                tempCard.className = `gostos-card card-${randomItem.categoriaPai}`;
                const validTags = (randomItem.tags || []).filter(t => t.trim() !== "");
                
                tempCard.innerHTML = `
                    <div class="card-img-container"><img src="${randomItem.imagem}" alt="${randomItem.titulo}"></div>
                    <h3>${randomItem.titulo}</h3>
                    <p>${randomItem.descricao}</p>
                    <div class="tags-list">${validTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                `;
                
                // Adiciona informações de favorito se existirem para o modal expandido
                if (randomItem.favorito) {
                    const favTag = document.createElement('div');
                    favTag.className = 'favorito-tag';
                    favTag.style.display = 'flex';
                    favTag.setAttribute('onclick', "event.stopPropagation(); ampliarImagem(this.querySelector('.mini-img'))");
                    favTag.innerHTML = `
                        <span>Favorito: ${randomItem.favorito.texto}</span>
                        <img src="${randomItem.favorito.imagem}" class="mini-img" onclick="event.stopPropagation(); ampliarImagem(this)">
                    `;
                    tempCard.appendChild(favTag);
                }

                ampliarCard(tempCard);
            } else {
                showNotification("Aguarde a sincronização dos dados estelares...");
            }
        });
    }

    // --- 3. LÓGICA DE EXIBIR/ESCONDER NUVEM DE TAGS ---
    const btnTags = document.getElementById('btn-tags-toggle');
    const tagCloud = document.getElementById('tag-cloud');
    if (btnTags && tagCloud) {
        btnTags.addEventListener('click', () => {
            tagCloud.classList.toggle('active');
            btnTags.classList.toggle('active');
        });
    }

    // --- 4. LÓGICA DO BOTÃO CARREGAR MAIS (YOUTUBE) ---
    const loadMoreBtn = document.getElementById('btn-carregar-mais-musicas');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (youtubeNextPageToken && !isFetching) {
                carregarPlaylistYouTube(youtubeNextPageToken);
            }
        });
    }

    const applyFilters = () => {
        const term = searchInput?.value.toLowerCase().trim() || '';
        let globalVisibleCount = 0;

        document.querySelectorAll('.gostos-card').forEach(card => {
            const matches = (card.getAttribute('data-search') || '').includes(term);
            card.style.display = matches ? '' : 'none'; // Usa o valor padrão do CSS (grid)
            if (matches) globalVisibleCount++;
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

        // Gerencia a mensagem de "Nenhum resultado"
        let emptyMsg = document.getElementById('search-empty-msg');
        if (globalVisibleCount === 0 && term !== '') {
            if (!emptyMsg) {
                emptyMsg = document.createElement('p');
                emptyMsg.id = 'search-empty-msg';
                emptyMsg.className = 'search-empty-msg';
                emptyMsg.innerText = 'Nenhum tesouro encontrado nestas coordenadas.';
                document.querySelector('.gostos-secao').appendChild(emptyMsg);
            }
        } else if (emptyMsg) {
            emptyMsg.remove();
        }
    };

    searchInput?.addEventListener('input', debounce(applyFilters, 300));

    // Inicia a coleta de dados de todos os JSONs para alimentar as tags e o sorteio
    prefetchGostos();
    
    // Carrega automaticamente a primeira categoria (Jogos) para melhor UX
    setTimeout(() => {
        carregarCategoriaJSON('jogos');
        const jogosGrid = document.getElementById('jogos-grid');
        if (jogosGrid) jogosGrid.classList.add('active');
        const toggleJogos = document.getElementById('toggle-jogos');
        if (toggleJogos) {
            const seta = toggleJogos.querySelector('.seta');
            if (seta) seta.style.transform = 'rotate(180deg)';
        }
    }, 500);
};

document.addEventListener('DOMContentLoaded', inicializarEventosGostos);