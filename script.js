/**
 * STAR HUB - LÓGICA DE DADOS, PESQUISA E FAVORITOS
 */

// --- UTILITÁRIOS ---
window.debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};