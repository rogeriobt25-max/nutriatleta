// Service Worker do NutriAtleta
// Estratégia: NETWORK-FIRST — sempre tenta buscar a versão mais nova na internet
// primeiro; só usa a cópia salva (cache) se o usuário estiver offline.
// Isso garante que qualquer atualização do site chega pra quem já instalou o app,
// sem precisar desinstalar nada.

const CACHE_NAME = 'nutriatleta-cache-v3'; // ⚠️ Aumente esse número a cada atualização importante
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // ativa a nova versão imediatamente, sem esperar todas as abas fecharem
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // assume o controle das páginas já abertas na hora
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Deu certo buscar na internet: usa a resposta fresca e atualiza o cache
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // sem internet: usa o que tiver salvo
  );
});
