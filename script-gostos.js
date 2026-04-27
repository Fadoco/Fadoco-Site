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
        console.error('Erro YouTube API:', error);
        musicasGrid.innerHTML = `<p style="color:#ff4b2b; grid-column: 1/-1; text-align:center; padding: 20px;">Falha na conexão YouTube.</p>`;
    } finally {
        isFetching = false;
        if (loadMoreBtn) loadMoreBtn.innerText = 'Carregar Mais Músicas';
    }
};

// --- CARREGAMENTO DE JSON LOCAL ---
const categoriasCarregadas = new Set();
const poolGlobalGostos = [];
const categoriasParaPrefetch = ['animes', 'jogos', 'filmes', 'series', 'desenhos'];

async function prefetchGostos() {
    const tagCloud = document.getElementById('tag-cloud');
    if (tagCloud) tagCloud.innerHTML = '<p style="color:var(--primary-neon); font-size:0.7rem; text-align:center; width:100%;">Sintonizando frequências das tags...</p>';

    for (const cat of categoriasParaPrefetch) {
        try {
            const response = await fetch(`./${cat}.json`);
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
        atualizarInterfaceTags();
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
        
        // Coleta tags diretamente dos dados para a nuvem global
        validTags.forEach(t => allUniqueTags.add(t));

        const favTag = (item.favorito && item.favorito.imagem && item.favorito.texto) ? `
            <div class="favorito-tag" onclick="event.stopPropagation(); ampliarImagem(this.querySelector('.mini-img'))">
                <span>Favorito: ${item.favorito.texto}</span>
                <img src="${item.favorito.imagem}" class="mini-img" onclick="event.stopPropagation(); ampliarImagem(this)">
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
        });
    }

    // Atualiza a interface da nuvem de tags
    atualizarInterfaceTags();
}

const allUniqueTags = new Set(); // Conjunto global para todas as tags

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
};

document.addEventListener('DOMContentLoaded', inicializarEventosGostos);