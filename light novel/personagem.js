// Gerenciamento da página do personagem e lista de capítulos
let listaCapitulos = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('capitulos/lista_capitulos.json');
        const data = await response.json();
        listaCapitulos = data.capitulos;
        
        renderizarResume();
        renderizarCapitulos();
    } catch (error) {
        console.error("Erro ao carregar lista de capítulos:", error);
    }
});

function renderizarResume() {
    const lastCapId = localStorage.getItem('starhub_last_chapter');
    const container = document.getElementById('resume-container');
    
    if (lastCapId !== null && container && listaCapitulos.length > 0) {
        const cap = listaCapitulos.find(c => c.id == lastCapId) || { titulo: `Registro #${lastCapId}` };
        container.innerHTML = `
            <a href="leitura.html?id=${lastCapId}" class="btn-voltar" style="border-color: var(--secondary-neon); color: var(--secondary-neon); background: rgba(138, 43, 226, 0.05);">
                ▶ RETOMAR SESSÃO: ${cap.titulo.toUpperCase()}
            </a>
        `;
    }
}

function renderizarCapitulos() {
    const menu = document.getElementById('capitulos-menu');
    if (!menu) return;

    menu.innerHTML = listaCapitulos.map(cap => `
        <a href="leitura.html?id=${cap.id}" class="btn-capitulo" data-tooltip="Acessar Dados">
            <div class="cap-info">
                <span class="cap-numero">REGISTRO #${cap.id}</span>
                <span class="cap-titulo">${cap.titulo}</span>
            </div>
            <span class="cap-status">DISPONÍVEL</span>
        </a>
    `).join('');
}