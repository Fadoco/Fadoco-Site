/**
 * STAR HUB - SISTEMA DE FAVORITOS, CONQUISTAS E NOTIFICAÇÕES
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnFavoritos = document.getElementById('btn-favoritos');
    const favOverlay = document.getElementById('favorites-overlay');

    if (btnFavoritos && favOverlay) {
        btnFavoritos.addEventListener('click', () => {
            renderFavorites();
            favOverlay.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });
    }
    updateFavCounter();
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

// Sanitizar HTML - escapa tags perigosas
const sanitizeHTML = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// --- 1. NOTIFICAÇÕES (TOAST) ---
let toastTimeout;
window.showNotification = (message) => {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    clearTimeout(toastTimeout);
    toast.innerText = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// --- 2. SISTEMA DE CONQUISTAS ---
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

// --- 3. GESTÃO DE FAVORITOS ---
window.updateFavCounter = () => {
    const favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');
    const counter = document.getElementById('fav-counter');
    if (counter) {
        counter.innerText = favorites.length;
    }
};

window.renderFavorites = () => {
    const favGrid = document.getElementById('favorites-grid');
    if (!favGrid) return;
    
    const favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');
    favGrid.innerHTML = '';
    
    if (favorites.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color:white; grid-column: 1/-1; text-align:center;';
        emptyMsg.textContent = 'Você ainda não favoritou nada na sua jornada estelar.';
        favGrid.appendChild(emptyMsg);
        return;
    }

    favorites.forEach(fav => {
        const card = document.createElement('div');
        card.className = `gostos-card ${fav.categoryClass || ''}`;
        card.style.position = 'relative';

        // Criar container da imagem de forma segura
        const imgContainer = document.createElement('div');
        imgContainer.className = 'card-img-container';
        const img = document.createElement('img');
        img.src = typeof fav.img === 'string' && fav.img.length > 0 ? fav.img : 'img/default.jpg';
        img.alt = typeof fav.title === 'string' ? fav.title : 'Item';
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        // Título de forma segura
        const title = document.createElement('h3');
        title.textContent = typeof fav.title === 'string' ? fav.title : 'Sem título';
        card.appendChild(title);

        // Descrição de forma segura
        const desc = document.createElement('p');
        desc.textContent = typeof fav.desc === 'string' ? fav.desc : 'Sem descrição';
        card.appendChild(desc);

        // Tags de forma segura
        if (Array.isArray(fav.tags) && fav.tags.length > 0) {
            const tagsList = document.createElement('div');
            tagsList.className = 'tags-list';
            tagsList.style.display = 'flex';

            fav.tags.forEach(tag => {
                if (typeof tag === 'string' && tag.length > 0) {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'tag';
                    tagSpan.textContent = tag;
                    tagSpan.onclick = (e) => {
                        e.stopPropagation();
                        filterByTag(tag);
                    };
                    tagsList.appendChild(tagSpan);
                }
            });

            card.appendChild(tagsList);
        }

        // Favorito tag (imagem secundária) de forma segura
        if (fav.favoritoTag && typeof fav.favoritoTag === 'string' && fav.favoritoTag.length > 0) {
            const favTagDiv = document.createElement('div');
            favTagDiv.className = 'favorito-tag';
            favTagDiv.style.display = 'flex';
            favTagDiv.textContent = fav.favoritoTag;
            favTagDiv.onclick = (e) => {
                e.stopPropagation();
                const miniImg = favTagDiv.querySelector('.mini-img');
                if (miniImg) ampliarImagem(miniImg);
            };
            card.appendChild(favTagDiv);
        }

        // Botão de remover
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-fav-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remover dos favoritos';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(e, null, fav.title);
        };
        card.appendChild(removeBtn);
        
        card.onclick = function() { ampliarCard(this); };
        favGrid.appendChild(card);
    });

    document.querySelectorAll('.gostos-card').forEach(card => {
        const title = card.querySelector('h3')?.innerText;
        const star = card.querySelector('.fav-toggle');
        if (star && favorites.some(f => f.title === title)) {
            star.classList.add('active');
            card.classList.add('is-favorite');
        } else if (star) {
            star.classList.remove('active');
            card.classList.remove('is-favorite');
        }
    });

    updateFavCounter();
};

window.toggleFavorite = (e, btn, directTitle = null) => {
    if (e) e.stopPropagation();
    
    let title, card;
    if (directTitle) {
        title = directTitle;
        card = null;
    } else {
        card = btn ? btn.closest('.gostos-card') : null;
        title = card.querySelector('h3')?.innerText;
    }

    if (!title) return;
    let favorites = JSON.parse(safeLocalStorage.get('user-favorites') || '[]');

    if (favorites.some(f => f.title === title)) {
        favorites = favorites.filter(f => f.title !== title);
        showNotification(`Removido: ${title}`);
        if (btn) btn.classList.remove('active');
        if (card) card.classList.remove('is-favorite');
    } else {
        if (!card) return; // Segurança: só adiciona se houver contexto do card
        
        const favData = {
            title: title,
            desc: card.querySelector('p')?.innerText || '',
            img: card.querySelector('.card-img-container img')?.src || '',
            tags: Array.from(card.querySelectorAll('.tag')).map(t => t.innerText),
            categoryClass: Array.from(card.classList).find(c => c.startsWith('card-')),
            favoritoTag: card.querySelector('.favorito-tag')?.innerHTML || null
        };

        favorites.push(favData);
        showNotification(`Adicionado aos Tesouros: ${title}`);
        if (btn) btn.classList.add('active');
        if (card) card.classList.add('is-favorite');
    }

    safeLocalStorage.set('user-favorites', JSON.stringify(favorites));
    updateFavCounter();
    if (document.getElementById('favorites-overlay')?.style.display === 'flex') {
        renderFavorites();
    }
};