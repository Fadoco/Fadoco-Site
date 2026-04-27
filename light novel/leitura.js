// Lógica do sistema de leitura dinâmica
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let capId = parseInt(params.get('id'));
    if (isNaN(capId)) capId = 0;

    // Salva o progresso no navegador
    localStorage.setItem('starhub_last_chapter', capId);

    carregarConteudo(capId);
});

async function carregarConteudo(id) {
    const container = document.getElementById('conteudo-capitulo');
    const titulo = document.getElementById('cap-titulo');
    if (!container) return;

    try {
        const response = await fetch(`capitulos/capitulo_${id}.json`);
        if (!response.ok) throw new Error("Capítulo não localizado no servidor.");

        const data = await response.json();
        titulo.innerText = data.titulo;
        container.innerHTML = data.conteudo.map(p => `<p>${p}</p>`).join('');

        gerarNavegacao(id);
    } catch (err) {
        container.innerHTML = `<p style="text-align:center; color:var(--primary-neon); padding: 40px;">SINAL PERDIDO: ${err.message}</p>`;
    }
}

async function gerarNavegacao(currentId) {
    // Garante que não duplique a navegação se carregar de novo
    const existingNav = document.getElementById('nav-leitura');
    if (existingNav) existingNav.remove();

    const main = document.querySelector('.container-leitura');
    const nav = document.createElement('div');
    nav.id = 'nav-leitura';
    nav.className = 'nav-leitura-container';

    // Tenta verificar se o próximo capítulo existe (baseado em arquivo)
    const nextId = currentId + 1;
    
    try {
        const checkNext = await fetch(`capitulos/capitulo_${nextId}.json`, { method: 'HEAD' });
        if (checkNext.ok) {
            const btnNext = document.createElement('a');
            btnNext.href = `leitura.html?id=${nextId}`;
            btnNext.className = 'btn-voltar'; // Usa a classe que já tem hover bom
            btnNext.innerText = 'PRÓXIMO REGISTRO →';
            nav.appendChild(btnNext);
        }
    } catch (e) { /* Próximo capítulo não existe */ }

    const btnFinish = document.createElement('a');
    btnFinish.href = 'personagem.html';
    btnFinish.className = 'btn-concluir';
    btnFinish.innerText = '— FINALIZAR SESSÃO E ARQUIVAR DADOS —';

    nav.appendChild(btnFinish);
    main.appendChild(nav);
    
    // Reinicia o scroll reveal para os novos elementos
    if (window.revealObserver) window.revealObserver.observe(nav);
}