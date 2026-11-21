/* JEM service worker. App files work offline; data requests to other sites (Apps Script, Drive) are never cached. */
var VERSION='jem-20261121135254';
var SHELL=["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-32.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "fonts/cormorant-garamond-latin-600-normal.woff2", "fonts/cormorant-garamond-latin-700-normal.woff2", "fonts/figtree-latin-400-normal.woff2", "fonts/figtree-latin-500-normal.woff2", "fonts/figtree-latin-600-normal.woff2", "fonts/figtree-latin-700-normal.woff2"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('jem-')===0&&k!==VERSION;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  var isPage=r.mode==='navigate'||u.pathname.slice(-1)==='/'||/index\.html$/.test(u.pathname);
  if(isPage){ /* network first so a new version is picked up as soon as there is internet */
    e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(VERSION).then(function(c){c.put('index.html',cp);});return res;}).catch(function(){return caches.match('index.html').then(function(m){return m||caches.match('./');});}));
    return;
  }
  e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(VERSION).then(function(c){c.put(r,cp);});}return res;});}));
});
