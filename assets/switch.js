/* Presentation helper: a small tab that flips between the design versions on the same page.
   Preview site only. It sits outside the page content, so the AmmoReady kits never include it. */
(function () {
  "use strict";
  var path = location.pathname;
  var here = /\/epitaph\//.test(path) ? "epitaph" : /\/hybrid\//.test(path) ? "hybrid" : "current";
  var file = path.split("/").pop() || "index.html";
  var root = here === "current" ? "" : "../";
  var V = [["current", "Current", ""], ["epitaph", "The Epitaph", "epitaph/"], ["hybrid", "Combined", "hybrid/"]];
  var bar = document.createElement("nav");
  bar.setAttribute("aria-label", "Design versions");
  bar.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:140;display:flex;align-items:center;gap:0;font:600 13px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;background:#111;color:#fff;border:1px solid rgba(255,255,255,.25);box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:calc(100vw - 24px);overflow-x:auto";
  var cell = "padding:9px 11px;color:#fff;text-decoration:none;white-space:nowrap;border-left:1px solid rgba(255,255,255,.25)";
  bar.innerHTML = '<a href="' + root + 'versions.html" style="' + cell + ';border-left:0;opacity:.7" title="Compare the versions">Versions</a>' +
    V.map(function (v) {
      return v[0] === here
        ? '<span aria-current="page" style="' + cell + ';background:#fff;color:#111">' + v[1] + "</span>"
        : '<a href="' + root + v[2] + file + location.hash + '" style="' + cell + '">' + v[1] + "</a>";
    }).join("");
  document.body.appendChild(bar);
})();
