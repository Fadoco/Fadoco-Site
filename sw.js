const CACHE_NAME = 'star-hub-v2';
const ASSETS = [
  './',
  './index.html',
  './gostos.html',
  './style.css',
  './global.css',
  './script.js',
  './script-transição.js',
  './dados.json',
  './img/logo-app.jpg' // Removi o background com espaços para evitar erro de cache
];

// Instalação e Cache Inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpeza de Caches Antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Estratégia Cache First (Tenta cache, se não tiver, busca na rede)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});