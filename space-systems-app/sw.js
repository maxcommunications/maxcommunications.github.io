/* 公式アプリ（Web版）のサービスワーカー。
   ホーム画面への追加を可能にし、静的ファイルをキャッシュしてオフラインでも起動できるようにする。 */
const CACHE = "ss-app-v1";
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && /\.(js|css|png|jpg|jpeg|webp|svg|ico|ttf|woff2?)(\?|$)/.test(req.url)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match(new URL("index.html", self.registration.scope).href) : undefined))),
  );
});
