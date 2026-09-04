// Lógica do sistema de leitura dinâmica
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let capId = parseInt(params.get('id'));
    if (isNaN(capId)) capId = 0;

    // Salva o progresso no navegador
    localStorage.setItem('starhub_last_chapter', capId);

    carregarConteudo(capId);
});

function aplicarInterferenciaLuz(texto, nivel = 'nivel-1') {
    const substituicoes = {
        'nivel-1': [
            ['ouvir', 'ouv\uFFFDr'],
            ['sim', 'S§m'],
            ['longe', 'l0nge']
        ],
        'nivel-2': [
            ['distorção', 'd¡storção'],
            ['grandes', 'gr@ndes'],
            ['você', 'v0cê'],
            ['pequeno', 'pequ3n0']
        ],
        'nivel-3': [
            ['técnicas', 'técni\uFFFDas'],
            ['entendi', 'entend¡'],
            ['você', 'v0cê'],
            ['disse', 'd§sse'],
            ['conexão', 'c0n3xã0']
        ]
    };

    const intensidade = ['nivel-1', 'nivel-2', 'nivel-3'].indexOf(nivel) + 1;
    let textoComInterferencia = texto;

    if (intensidade > 1) {
        const itens = substituicoes[nivel] || [];
        itens.forEach(([normal, corrompido]) => {
            const regex = new RegExp(normal, 'gi');
            if (Math.random() < 0.55) {
                textoComInterferencia = textoComInterferencia.replace(regex, corrompido);
            }
        });
    }

    if (intensidade >= 3) {
        const padrao = /([a-zA-ZÀ-ÿ]{3,})\s+([a-zA-ZÀ-ÿ]{3,})/g;
        textoComInterferencia = textoComInterferencia.replace(padrao, (match, a, b) => {
            return Math.random() < 0.25 ? `${a}${b}` : match;
        });
    }

    return textoComInterferencia;
}

function resolverNivelLuz(texto) {
    const valor = texto.toLowerCase();
    if (/§|@|0|¡|�|l0nge|d¡storção|técni|gr@ndes|v0cê|s§m|d§sse|c0n3xã0/.test(valor)) {
        return 'nivel-3';
    }
    if (/l0nge|d¡storção|gr@ndes|v0cê|pequ3n0|s§m/.test(valor)) {
        return 'nivel-2';
    }
    return 'nivel-1';
}

// Função para processar tags customizadas de formatação
function isLinhaSistema(linha) {
    const texto = linha.trim();
    return (
        /^\[\s*REGISTRO\s*\d+\s*\]$/.test(texto) ||
        /^\[\s*REGISTRO\s*ENCERRADO\s*\]$/.test(texto) ||
        /^REGISTRO\s*\d+$/.test(texto) ||
        /^REGISTRO\s*ENCERRADO$/.test(texto) ||
        /^PRESENÇA DESCONHECIDA(?: DETECTADA)?\.?$/.test(texto) ||
        /^STATUS:\s*(?:CONEXÃO ESTABELECIDA|FRACA)\.?$/.test(texto) ||
        /^ORIGEM:\s*DESCONHECIDA\.?$/.test(texto) ||
        /^DISTÂNCIA:\s*DESCONHECIDA\.?$/.test(texto) ||
        /^TENTANDO CONEXÃO\.?$/.test(texto) ||
        /^TENTANDO NOVAMENTE\.?$/.test(texto) ||
        /^CONEXÃO RECUSADA PELA PRESENÇA\.?$/.test(texto) ||
        /^\[ERRO(?: DETECTADO)?\]$/.test(texto) ||
        /^\[CONEXÃO ESTABELECIDA\]$/.test(texto) ||
        /^TRADUÇÃO INICIADA\.?$/.test(texto)
    );
}

function ehInicioRegistro(linha) {
    const texto = linha.trim();
    return /\[\s*REGISTRO\s*\d+\s*\]/i.test(texto) ||
        /PRESENÇA DESCONHECIDA DETECTADA|STATUS: CONEXÃO ESTABELECIDA|ORIGEM: DESCONHECIDA/i.test(texto);
}

function formatarRegistroBloco(linhas) {
    const linhasFormatadas = linhas
        .map((linha) => linha.trim())
        .filter(Boolean)
        .map((linha) => {
            const matchRegistro = linha.match(/\[\s*REGISTRO\s*(\d+)\s*\]/i);
            if (matchRegistro) {
                return `<strong>[REGISTRO ${matchRegistro[1]}]</strong>`;
            }

            if (/^\[?\s*REGISTRO\s*ENCERRADO\s*\]?$/.test(linha)) {
                return '<strong>[REGISTRO ENCERRADO]</strong>';
            }

            return linha;
        });

    return `<div class="registro-computador">${linhasFormatadas.join('<br>')}</div>`;
}

function formatarConteudo(texto) {
    if (texto.includes('REGISTRO') && texto.includes('REGISTRO ENCERRADO')) {
        const registro = texto
            .replace(/\[\s*REGISTRO\s*\d+\s*\]/g, (match) => `<strong>${match}</strong>`)
            .replace(/\[\s*REGISTRO ENCERRADO\s*\]/g, '<strong>[REGISTRO ENCERRADO]</strong>')
            .replace(/REGISTRO\s*\d+/g, (match) => `<strong>${match}</strong>`)
            .replace(/REGISTRO ENCERRADO/g, '<strong>REGISTRO ENCERRADO</strong>')
            .replace(/\n/g, '<br>');
        return `<div class="registro-computador">${registro}</div>`;
    }

    const sistemaKeywords = [
        '[ERRO DETECTADO]',
        '[ERRO]',
        'PRESENÇA DESCONHECIDA',
        'DISTÂNCIA: DESCONHECIDA',
        'TENTANDO CONEXÃO',
        'TENTANDO NOVAMENTE',
        'CONEXÃO RECUSADA PELA PRESENÇA',
        '[CONEXÃO ESTABELECIDA]',
        'STATUS: FRACA',
        'TRADUÇÃO INICIADA',
        'PRESENÇA DESCONHECIDA DETECTADA',
        'STATUS: CONEXÃO ESTABELECIDA',
        'ORIGEM: DESCONHECIDA'
    ];

    const textoLimpo = texto.trim();
    const ehSistema = sistemaKeywords.some(chave => textoLimpo.includes(chave));
    if (ehSistema) {
        const sistema = textoLimpo
            .replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')
            .replace(/(PRESENÇA DESCONHECIDA\.)/gi, '<strong>$1</strong>')
            .replace(/(DISTÂNCIA: DESCONHECIDA\.)/gi, '<strong>$1</strong>')
            .replace(/(TENTANDO CONEXÃO\.)/gi, '<strong>$1</strong>')
            .replace(/(TENTANDO NOVAMENTE\.)/gi, '<strong>$1</strong>')
            .replace(/(CONEXÃO RECUSADA PELA PRESENÇA\.)/gi, '<strong>$1</strong>')
            .replace(/(STATUS: FRACA)/gi, '<strong>$1</strong>')
            .replace(/(TRADUÇÃO INICIADA\.)/gi, '<strong>$1</strong>');

        return `<div class="sistema-terminal">${sistema}</div>`;
    }

    const tagLuz = texto.match(/\[LUZ(?:\s+nivel="([^"]+)")?\](.*?)\[\/LUZ\]/i);
    if (tagLuz) {
        const nivel = tagLuz[1] ? tagLuz[1].toLowerCase().replace(/\s+/g, '-') : resolverNivelLuz(tagLuz[2]);
        const fala = aplicarInterferenciaLuz(tagLuz[2], nivel);
        return `<span class="fala-luz ${nivel}">${fala}</span>`;
    }

    // Fala da luz azul: comunicação distante e instável
    if (texto.includes('*') && (texto.includes('—') || texto.includes('-'))) {
        const fala = texto
            .replace(/^\*\s*[—-]\s*/, '')
            .replace(/^\*\s*:/, '')
            .trim();

        const nivel = resolverNivelLuz(fala);
        const falaDistorcida = aplicarInterferenciaLuz(fala, nivel);
        return `<span class="fala-luz ${nivel}">${falaDistorcida}</span>`;
    }

    // Processa tags [QUOTE]...[/QUOTE]
    texto = texto.replace(/\[QUOTE\](.*?)\[\/QUOTE\]/g, '<span class="quote-inline">$1</span>');
    
    // Processa tags [NOME]...[/NOME]
    texto = texto.replace(/\[NOME\](.*?)\[\/NOME\]/g, '<span class="transcendental-name">$1</span>');
    
    // Processa tags [FALA]...[/FALA]
    texto = texto.replace(/\[FALA\](.*?)\[\/FALA\]/g, '<span class="fala-vinculo">$1</span>');
    
    // Processa tags [AVISO]...[/AVISO]
    texto = texto.replace(/\[AVISO\](.*?)\[\/AVISO\]/g, '<span class="aviso-narracao">$1</span>');
    
    // Converte quebras de linha internas em <br>
    texto = texto.replace(/\n/g, '<br>');
    
    return texto;
}

async function carregarConteudo(id) {
    const container = document.getElementById('conteudo-capitulo');
    const titulo = document.getElementById('cap-titulo');
    if (!container) return;

    try {
        const response = await fetch(`capitulos/capitulo_${id}.json`);
        if (!response.ok) throw new Error("Capítulo não localizado no servidor.");

        const data = await response.json();
        titulo.innerText = data.titulo;

        const blocos = [];
        let i = 0;

        while (i < data.conteudo.length) {
            const atual = data.conteudo[i];

            if (ehInicioRegistro(atual)) {
                const grupo = [];
                while (i < data.conteudo.length) {
                    const linha = data.conteudo[i];
                    grupo.push(linha);
                    i++;
                    if (/REGISTRO\s*ENCERRADO/i.test(linha)) break;
                }
                blocos.push(formatarRegistroBloco(grupo));
                continue;
            }

            const formatado = formatarConteudo(atual);
            if (formatado.includes('registro-computador') || formatado.includes('sistema-terminal')) {
                blocos.push(formatado);
            } else {
                blocos.push(`<p>${formatado}</p>`);
            }
            i++;
        }

        container.innerHTML = blocos.join('');
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