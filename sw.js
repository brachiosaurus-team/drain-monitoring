// 빗물받이 모니터링 서비스워커: 휴대폰 홈 화면 앱(PWA)용.
// 화면 파일은 "네트워크 먼저": 새 버전을 올리면 바로 반영되고, 통신이 안 될 때만 저장본을 보여 준다.
// ThingSpeak 값·지도 타일은 저장하지 않는다(항상 최신 값이어야 함).
var CACHE = "drain-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var isShell = url.origin === self.location.origin || url.hostname === "cdnjs.cloudflare.com";
  if (!isShell) return;   // ThingSpeak·브이월드 등은 그대로 네트워크로
  e.respondWith(fetch(req).then(function(res){
    if (res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
    return res;
  }).catch(function(){
    return caches.match(req, {ignoreSearch:true}).then(function(r){ return r || caches.match("./index.html"); });
  }));
});
