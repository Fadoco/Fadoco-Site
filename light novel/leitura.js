document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const capId = parseInt(urlParams.get('cap'));
    const leitor = document.getElementById('conteudo-capitulo');
    const titulo = document.getElementById('cap-titulo');

    // Carrega os dados da pasta capítulos (subindo um nível)
    fetch('../capitulos/historia.json')
        .then(res => res.json())
        .then(data => {
            const capitulo = data.capitulos.find(c => c.id === capId);
            if (!capitulo) return;

            localStorage.setItem('fadoco_lightnovel_lastcap', capId);
            titulo.innerText = capitulo.titulo;
            leitor.innerHTML = capitulo.conteudo.map(p => `<p class="reveal-text">${p}</p>`).join('');

            const currentIndex = data.capitulos.findIndex(c => c.id === capId);
            const proximo = data.capitulos[currentIndex + 1];
            if (proximo) {
                const nav = document.querySelector('.btn-navegacao');
                const btnProximo = `<a href="leitura.html?cap=${proximo.id}" class="btn-voltar next-btn">PRÓXIMO CAPÍTULO →</a>`;
                nav.insertAdjacentHTML('afterbegin', btnProximo);
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('show');
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));
        })
        .catch(err => {
            console.error(err);
            if (titulo) titulo.innerText = "ERRO NA TRANSMISSÃO";
            if (leitor) leitor.innerHTML = "<p>Arquivo do capítulo não encontrado ou corrompido.</p>";
        });
});