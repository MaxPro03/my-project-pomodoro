if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const t=e=>n(e,o),d={module:{uri:o},exports:c,require:t};i[o]=Promise.all(s.map((e=>d[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-7369c0e1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-27e97409.js",revision:null},{url:"assets/index-68c97592.css",revision:null},{url:"index.html",revision:"68ff708539de70decc1034b2c5e85e78"},{url:"registerSW.js",revision:"51b1e99909c5ea42077041d980571e32"},{url:"favicon.ico",revision:"fdb5881e72656b22eeb16e197c74fa93"},{url:"apple-touch-icon.png",revision:"b3f6cbd6efadf954e65ac4b4a0f051da"},{url:"apelsini_icon.svg",revision:"a43db71374649965d5c3fe9ab42146a9"},{url:"android-chrome-192x192.png",revision:"455e41acedb6be6544bc9b6a80daa8e9"},{url:"android-chrome-512x512.png",revision:"9134d69149293079b947cb8ae0d045e3"},{url:"manifest.webmanifest",revision:"0037b38574e5ce14409c31d2cef87066"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));