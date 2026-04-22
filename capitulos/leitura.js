document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const capId = parseInt(urlParams.get('cap'));
    const leitor = document.getElementById('conteudo-capitulo');
    const titulo = document.getElementById('cap-titulo');

    // Primeiro carrega a lista para saber qual o próximo capítulo
    fetch('lista.json')
        .then(res => res.json())
        .then(data => {
            const currentIndex = data.capitulos.findIndex(c => c.id === capId);
            const proximo = data.capitulos[currentIndex + 1];
            if (proximo) {
                const nav = document.querySelector('.btn-navegacao');
                const btnProximo = `<a href="leitura.html?cap=${proximo.id}" class="btn-voltar next-btn">PRÓXIMO CAPÍTULO →</a>`;
                nav.insertAdjacentHTML('afterbegin', btnProximo);
            }
        });

    // Carrega o arquivo específico do capítulo
    fetch(`capitulo_${capId}.json`)
        .then(res => res.json())
        .then(capitulo => {
            localStorage.setItem('fadoco_lightnovel_lastcap', capId);
            titulo.innerText = capitulo.titulo;
            leitor.innerHTML = capitulo.conteudo.map(p => `<p class="reveal-text">${p}</p>`).join('');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('show');
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));
        })
        .catch(err => {
            titulo.innerText = "ERRO NA TRANSMISSÃO";
            leitor.innerHTML = "<p>Arquivo do capítulo não encontrado ou corrompido.</p>";
        });
});