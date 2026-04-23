document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('capitulos-menu');
    const resumeContainer = document.getElementById('resume-container');

    // Busca a história (caminho corrigido para o arquivo existente, relativo a light novel/personagem.js)
    fetch('../capitulos/historia.json')
        .then(response => response.json())
        .then(data => {
            const lastCapId = localStorage.getItem('fadoco_lightnovel_lastcap');
            if (lastCapId) {
                const lastCap = data.capitulos.find(c => c.id === parseInt(lastCapId));
                if (lastCap) {
                    const resumeBtn = document.createElement('a');
                    resumeBtn.href = `light novel/leitura.html?cap=${lastCap.id}`;
                    resumeBtn.className = 'btn-capitulo active resume-btn';
                    resumeBtn.setAttribute('data-tooltip', 'História do Personagem');
                    resumeBtn.innerText = `CONTINUAR LENDO: ${lastCap.titulo}`;
                    resumeContainer.appendChild(resumeBtn);
                }
            }

            data.capitulos.forEach((cap) => {
                const btn = document.createElement('a');
                btn.className = 'btn-capitulo';
                btn.href = `light novel/leitura.html?cap=${cap.id}`;
                btn.setAttribute('data-tooltip', 'História do Personagem');
                btn.innerText = `CAP. 0${cap.id}`;
                menuContainer.appendChild(btn);
            });
        });

    function aplicarReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));
    }
    aplicarReveal();
});