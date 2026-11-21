/* Presentation helper: a small tab that flips between the two design versions on the same page.
   Preview site only. It sits outside the page content, so the AmmoReady kits never include it. */
(function () {
  "use strict";
  var path = location.pathname, inEp = /\/epitaph\//.test(path);
  var file = path.split("/").pop() || "index.html";
  var root = inEp ? "../" : "";
  var other = inEp ? "../" + file : "epitaph/" + file;
  var bar = document.createElement("nav");
  bar.setAttribute("aria-label", "Design versions");
  bar.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:140;display:flex;align-items:center;gap:0;font:600 13px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;background:#111;color:#fff;border:1px solid rgba(255,255,255,.25);box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:calc(100vw - 24px)";
  var cell = "padding:9px 12px;color:#fff;text-decoration:none;white-space:nowrap";
  bar.innerHTML =
    '<a href="' + root + 'versions.html" style="' + cell + ';opacity:.7" title="Compare both versions">Versions</a>' +
    '<span style="' + cell + ';border-left:1px solid rgba(255,255,255,.25);background:#fff;color:#111">' + (inEp ? "The Epitaph" : "Current") + "</span>" +
    '<a href="' + other + location.hash + '" style="' + cell + ';border-left:1px solid rgba(255,255,255,.25)">Switch to ' + (inEp ? "Current" : "The Epitaph") + " &rarr;</a>";
  document.body.appendChild(bar);
})();
