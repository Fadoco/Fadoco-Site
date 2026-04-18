/**
 * STAR HUB - SISTEMA DE FAVORITOS, CONQUISTAS E NOTIFICAÇÕES
 */

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
    favGrid.innerHTML = favorites.length ? '' : '<p style="color:white; grid-column: 1/-1; text-align:center;">Você ainda não favoritou nada na sua jornada estelar.</p>';

    favorites.forEach(fav => {
        const card = document.createElement('div');
        // Adiciona a classe da categoria salva para manter o estilo neon
        card.className = `gostos-card ${fav.categoryClass || ''}`;
        card.style.position = 'relative';

        const tagsHtml = fav.tags ? fav.tags.map(t => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${t}')">${t}</span>`).join('') : '';
        
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${fav.img}" alt="${fav.title}">
            </div>
            <h3>${fav.title}</h3>
            <p>${fav.desc}</p>
            <div class="tags-list" style="display: flex;">${tagsHtml}</div>
        `;

        // Correção da imagem secundária (favorito) dentro do overlay de favoritos
        if (fav.favoritoTag) {
            const favTagDiv = document.createElement('div');
            favTagDiv.className = 'favorito-tag';
            favTagDiv.style.display = 'flex';
            favTagDiv.onclick = (e) => { e.stopPropagation(); ampliarImagem(favTagDiv.querySelector('img')); };
            favTagDiv.innerHTML = fav.favoritoTag;
            card.appendChild(favTagDiv);
        }

        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-fav-btn';
        removeBtn.innerHTML = '&times;';
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
    } else {
        if (!card) return; // Segurança: só adiciona se houver contexto do card
        
        const favData = {
            title: title,
            desc: card.querySelector('p')?.innerText || '',
            img: card.querySelector('.card-img-container img')?.src || '',
            tags: Array.from(card.querySelectorAll('.tag')).map(t => t.innerText),
            favoritoTag: card.querySelector('.favorito-tag')?.innerHTML || null,
            categoryClass: Array.from(card.classList).find(c => c.startsWith('card-')) // Salva a categoria
        };
        favorites.push(favData);
        showNotification(`Favoritado: ${title}`);
    }

    safeLocalStorage.set('user-favorites', JSON.stringify(favorites));
    renderFavorites();
};