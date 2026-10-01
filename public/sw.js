const CACHE = 'lifeos-static-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lifeos-static-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  // Never cache authenticated HTML, RSC, auth requests, or user data.
  if(event.request.mode==='navigate') {event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));return;}
  if(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/icons/'))event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}));
});
self.addEventListener('sync',event=>{if(event.tag==='lifeos-sync')event.waitUntil(self.clients.matchAll().then(clients=>clients.forEach(client=>client.postMessage({type:'lifeos-sync'}))));});
