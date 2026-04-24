document.addEventListener('DOMContentLoaded', () => {
    const menuCapitulos = document.getElementById('capitulos-menu');
    const resumeContainer = document.getElementById('resume-container');

    // Função para carregar a lista de capítulos do JSON
    async function carregarMenu() {
        try {
            const response = await fetch('capitulos/lista_capitulos.json');
            if (!response.ok) throw new Error('Não foi possível carregar a lista de capítulos.');
            
            const data = await response.json();
            renderizarMenu(data.capitulos);
            verificarProgresso(data.capitulos);
        } catch (error) {
            console.error('Erro:', error);
            menuCapitulos.innerHTML = `<p style="color: var(--primary-neon); text-align: center; grid-column: 1/-1;">Erro ao sintonizar capítulos. Tente novamente mais tarde.</p>`;
        }
    }

    function renderizarMenu(capitulos) {
        menuCapitulos.innerHTML = '';
        capitulos.forEach(cap => {
            const link = document.createElement('a');
            link.href = `leitura.html?id=${cap.id}`;
            link.className = 'btn-capitulo reveal-section'; 
            link.innerHTML = `
                <div class="cap-info">
                    <span class="cap-numero">REGISTRO ${cap.id}</span>
                    <h3 class="cap-titulo">${cap.titulo}</h3>
                </div>
                <div class="cap-status">INICIAR TRANSMISSÃO</div>
            `;
            menuCapitulos.appendChild(link);
            
            // Integração com o Scroll Reveal do script-transição.js
            if (window.revealObserver) window.revealObserver.observe(link);
        });
    }

    function verificarProgresso(capitulos) {
        const ultimoCapId = localStorage.getItem('starhub_ultimo_capitulo');
        if (ultimoCapId !== null) {
            const cap = capitulos.find(c => c.id == ultimoCapId);
            if (cap) {
                resumeContainer.innerHTML = `
                    <a href="leitura.html?id=${cap.id}" class="btn-voltar" style="background: rgba(0, 212, 255, 0.1); border-color: var(--primary-neon);">
                        CONTINUAR TRANSMISSÃO: ${cap.titulo}
                    </a>`;
            }
        }
    }

    carregarMenu();
});