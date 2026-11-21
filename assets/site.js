/* Tombstone Gunsmith site engine.
   Reads everything from /content/*.json (edited through Pages CMS) and builds each page.
   No editing needed here. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const PAGE = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Only allow normal links: web, email, phone, same-site paths and in-page anchors. Anything else (javascript:, data:) becomes "#".
  const safeUrl = (u) => { const s = String(u == null ? "" : u).trim(); return /^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|[\w.-]+\.html(#[\w-]*)?$|[\w-]+(\/[\w.-]+)*$)/i.test(s) && !/^\s*(javascript|data|vbscript):/i.test(s) ? s : "#"; };
  const fix = (src) => { const s = String(src || "").replace(/^\//, ""); return /^(https:\/\/|images\/)/i.test(s) && !/["'<>]/.test(s) ? s : ""; };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg>';
  const slot = (label) => `<div class="slot" role="img" aria-label="${esc(label)}"></div>`;
  const TSmiss = function (img) { const d = document.createElement("div"); d.innerHTML = slot(img.alt || "Photo"); img.replaceWith(d.firstChild); };
  // One listener catches every broken image, so no inline code is needed in the page (keeps the security policy strict)
  document.addEventListener("error", (e) => { const img = e.target; if (!img || img.tagName !== "IMG") return; if (img.dataset.logo) TSlogo(img, img.dataset.logo === "dark"); else TSmiss(img); }, true);
  let TSlogo = () => {};
  const pic = (src, label, cls = "", eager) =>
    `<div class="ph ${cls}">${src ? `<img src="${esc(fix(src))}" alt="${esc(label)}" ${eager ? "" : 'loading="lazy"'} >` : slot(label)}</div>`;
  const ARR = '<span class="arr">&rarr;</span>';
  const btn = (text, href, cls = "", ext) => `<a class="btn ${cls}" href="${esc(safeUrl(href))}"${ext ? ' target="_blank" rel="noopener"' : ""}><span>${esc(text)}</span></a>`;
  const rv = () => "";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const FILES = ["settings", "home", "custom-shop", "services", "available", "firearms", "gear", "gallery", "videos", "about"];
  Promise.all(FILES.map((f) => fetch("content/" + f + ".json", { cache: "no-cache" }).then((r) => r.json()).catch(() => null)))
    .then((res) => {
      const D = {};
      FILES.forEach((f, i) => (D[f.replace("-", "_")] = res[i]));
      // Items show up on the site only once they have a real photo (or a real video link)
      const has = (x) => !!fix(x);
      D.available = (D.available || []).filter((a) => has((a.photos || [])[0]));
      D.firearms = (D.firearms || []).filter((f) => has(f.photo));
      D.gear = (D.gear || []).filter((g) => has(g.photo));
      D.gallery = (D.gallery || []).filter((g) => has(g.photo));
      D.videos = (D.videos || []).filter((v) => /(youtu\.be\/|v=|shorts\/|instagram|tiktok|facebook)/.test(v.link || ""));
      build(D);
    });

  function build(D) {
    const S = D.settings || {};
    const store = (S.store_url || "").replace(/\/$/, "");
    const sl = (path) => (store ? store + path : "shop.html");

    /* ---------- header ---------- */
    const textLogo = (dark) => `<svg class="mk" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 44V18Q10 6 24 6t14 12v26z" fill="none" stroke="${dark ? "#0c0c0c" : "#fff"}" stroke-width="3"/><path d="M24 14v20M17 21h14" stroke="#8f1d17" stroke-width="3.4"/></svg><span class="wm"><b style="${dark ? "color:#0c0c0c" : ""}">TOMBSTONE</b><i>GUNSMITH</i></span>`;
    TSlogo = (img, dark) => { const s = document.createElement("span"); s.style.display = "contents"; s.innerHTML = textLogo(dark); img.replaceWith(s); };
    const logo = (dark) => S.logo ? `<img src="${esc(fix(S.logo))}" alt="${esc(S.business_name)} logo" data-logo="${dark ? "dark" : "light"}"><span class="wm"><b style="${dark ? "color:#0c0c0c" : ""}">TOMBSTONE</b><i>GUNSMITH</i></span>` : textLogo(dark);
    const promoItems = [
      esc(S.promo_message || ""),
      `Build queue: ${esc(S.queue_weeks)}`,
      `<a href="available.html">Shop finished builds ready to ship</a>`,
      "Authorized Nighthawk Custom and Korth dealer"
    ].filter(Boolean).map((t) => `<span>${t}</span>`).join("");
    const H = D.home || {};
    const av = D.available || [];
    const mega = (items) => `<div class="mega"><div class="wrap">${items.map(([t, h, p]) => `<a href="${esc(safeUrl(h))}">${pic(p, t)}${esc(t)}</a>`).join("")}</div></div>`;
    const navItems = [
      ["custom-shop", "Custom Shop", "custom-shop.html", mega([["Custom 1911", "custom-shop.html#platforms", (D.custom_shop?.platforms || [])[0]?.photo], ["Custom 2011", "custom-shop.html#platforms", (D.custom_shop?.platforms || [])[1]?.photo], ["IOS Optic System", "custom-shop.html#ios", D.custom_shop?.ios_photo], ["Available Now", "available.html", av[0]?.photos?.[0]], ["Project Gallery", "gallery.html", (D.gallery || [])[0]?.photo]])],
      ["firearms", "Firearms", "firearms.html", mega([["Nighthawk Custom", "firearms.html#nighthawk-custom", H.tile_nighthawk], ["Korth", "firearms.html#korth", H.tile_korth], ["Available Now", "available.html", av[1]?.photos?.[0]], ["In Stock Now", sl("/pages/in-stock-now"), ""], ["Shop All Brands", sl("/brands"), ""]])],
      ["gunsmithing", "Gunsmithing", "gunsmithing.html", ""],
      ["shop", "Shop", "shop.html", mega([["Handguns", sl("/catalog/handguns"), "images/uploads/cat-handguns.jpg"], ["Rifles", sl("/catalog/rifles"), "images/uploads/cat-rifles.jpg"], ["Shotguns", sl("/catalog/shotguns"), "images/uploads/cat-shotguns.jpg"], ["Ammo", sl("/catalog/ammo"), "images/uploads/cat-ammo.jpg"], ["Accessories", sl("/catalog/accessories"), "images/uploads/cat-accessories.jpg"]])],
      ["videos", "Videos", "videos.html", ""],
      ["about", "About", "about.html", ""],
      ["contact", "Contact", "contact.html", ""]
    ];
    $("#hdr").outerHTML = `
<div class="promo" aria-label="Announcements"><div class="track">${promoItems}${promoItems}</div></div>
<header class="hd" id="hd">
  <div class="wrap hd-top">
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    <a href="index.html" class="logo" aria-label="${esc(S.business_name)} home">${logo(false)}</a>
    <form class="search" action="${esc(sl("/search"))}" method="get" role="search">
      <input name="q" placeholder="Search firearms, optics, parts" aria-label="Search the store">
      <button aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>
    </form>
    <div class="hd-icons">
      <a href="tel:${esc(S.phone)}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>Call</a>
      <a href="${esc(sl(""))}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l2.5 12h11L21 8H7"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>Cart</a>
    </div>
  </div>
  <nav class="mn" id="nav" aria-label="Main"><div class="wrap">
    ${navItems.map(([id, t, h, m]) => `<div class="it"><a href="${esc(safeUrl(h))}" class="${id === PAGE ? "on" : ""}">${t}</a>${m}</div>`).join("")}
  </div></nav>
</header>`;

    /* ---------- footer ---------- */
    const addr = [S.street, [S.city, S.state].filter(Boolean).join(", "), S.zip].filter(Boolean).join(" ");
    const soc = [["facebook", '<path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" fill="currentColor"/>'],
      ["instagram", '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>'],
      ["youtube", '<path fill="currentColor" d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.4-1.2.4-3.8.4-3.8s0-2.6-.4-3.8zM10 15V9l5.2 3z"/>'],
      ["tiktok", '<path fill="currentColor" d="M16 3c.4 2.3 1.8 3.8 4 4v3.2c-1.5 0-2.9-.4-4-1.1V15a6 6 0 1 1-6-6v3.3a2.7 2.7 0 1 0 2.7 2.7V3z"/>']]
      .filter(([k]) => S[k] && safeUrl(S[k]) !== "#").map(([k, p]) => `<a href="${esc(safeUrl(S[k]))}" target="_blank" rel="noopener" aria-label="${k}"><svg width="18" height="18" viewBox="0 0 24 24">${p}</svg></a>`).join("");
    $("#ftr").outerHTML = `
<footer>
  <div class="wrap">
    <div class="f-top">
      <div><a href="index.html" class="logo">${logo(false)}</a>
        <p style="margin-top:18px;max-width:36ch">Custom 1911 and 2011 builds, gunsmithing, and authorized Nighthawk Custom and Korth dealer.</p>
        ${soc ? `<div class="soc">${soc}</div>` : ""}</div>
      <div class="links"><h4>Shop</h4><a href="custom-shop.html">Custom Shop</a><a href="available.html">Available Now</a><a href="firearms.html">Firearms</a><a href="shop.html">Online Store</a><a href="gear.html">Tombstone Gear</a></div>
      <div class="links"><h4>Services</h4><a href="gunsmithing.html">Gunsmithing</a><a href="custom-shop.html#ios">IOS Optic System</a><a href="gallery.html">Project Gallery</a><a href="videos.html">Videos</a><a href="about.html">About</a></div>
      <div><h4>Contact</h4>
        <p><a href="tel:${esc(S.phone)}">${esc(S.phone)}</a></p>
        <p><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></p>
        ${addr ? `<p>${esc(addr)}</p>` : ""}
        ${S.hours ? `<p>${esc(S.hours)}</p>` : ""}
        ${S.ffl_number ? `<p>FFL ${esc(S.ffl_number)}</p>` : ""}
        <p style="margin-top:16px">${btn("Request a Quote", "custom-shop.html#quote", "red")}</p></div>
    </div>
    <div class="legal"><span>&copy; ${new Date().getFullYear()} ${esc(S.legal_name)}. All rights reserved.</span><span>Firearms ship to a licensed FFL dealer only. All sales subject to federal, state and local law. Must be 21 or older.</span></div>
  </div>
</footer>
<button class="to-top" id="totop" aria-label="Back to top">&uarr;</button>
<div class="lb-wrap" id="lb" role="dialog" aria-modal="true" aria-label="Photo viewer"><button class="x" aria-label="Close">&times;</button><button class="pv" aria-label="Previous">&#8249;</button><div class="ph" id="lbph"></div><button class="nx" aria-label="Next">&#8250;</button><div class="cap" id="lbcap"></div></div>
<div class="gate hide" id="gate" role="dialog" aria-modal="true" aria-labelledby="gt"><div class="bx"><div class="logo">${logo(true)}</div><h2 id="gt">Are you 21 or older?</h2><p>This site sells firearms. You must be of legal age to enter.</p><div class="row" style="justify-content:center"><button class="btn red" id="gy"><span>Yes, Enter</span></button><button class="btn outline" id="gn"><span>No</span></button></div></div></div>`;

    /* ---------- shared blocks ---------- */
    const banner = (title, text, photo, crumbs, extra = "") => `
<section class="banner">${pic(photo, title + " banner photo", "par", true)}<div class="shade"></div>
  <div class="wrap"><div class="crumb"><a href="index.html">Home</a>${crumbs.map((c) => " / " + esc(c)).join("")}</div>
  <h1 class="rv">${title}</h1>${text ? `<p class="rv"${rv(1)}>${esc(text)}</p>` : ""}${extra ? `<div class="row rv"${rv(2)}>${extra}</div>` : ""}</div>
</section>`;
    const newsletter = `
<section class="nl"><div class="wrap">
  <div class="rv-l"><h2>Get the Shop Email</h2><p>When a build is finished, subscribers hear about it before it goes on the site. You also get range days and shop news.</p></div>
  <div class="rv-r"><form data-form="Newsletter" class="tsform">
    <div class="in"><input type="email" name="email" required placeholder="Your email address" aria-label="Email address"><button class="btn" type="submit"><span>Sign Up</span></button></div>
    <label class="chk"><input type="checkbox" name="waitlist" value="yes"> Put me on the custom build waitlist</label>
  </form><div class="done">You're on the list. Check your inbox for a welcome email from the shop.</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div></div>
</div></section>`;
    const card = (o, i) => `
<a class="pc rv"${rv(i % 4)} href="${esc(safeUrl(o.href))}"${o.ext ? ' target="_blank" rel="noopener"' : ""}>
  ${pic(o.photo, o.name)}${o.flag ? `<span class="flag">${o.flag}</span>` : ""}<span class="quick"><span>${esc(o.cta || "View")}</span></span>
  <span class="bd"><span class="br">${esc(o.brand || "")}</span><span class="nm">${esc(o.name)}</span>${o.detail ? `<span class="dt">${esc(o.detail)}</span>` : ""}
  <span class="pr"><span>${esc(o.price || "")}</span>${o.status ? `<span class="st ${o.status === "On order" ? "wait" : ""}">${esc(o.status)}</span>` : ""}</span></span>
</a>`;
    const availCard = (a, i) => card({ name: a.name, brand: "Tombstone Custom", detail: (a.specs || []).slice(0, 2).map((s) => s.value).join(", "), price: a.price, photo: (a.photos || [])[0], href: "product.html#" + slug(a.id || a.name), flag: a.sold ? '<span class="badge sold">Sold</span>' : '<span class="badge ok">Ready to Ship</span>', cta: "View Build" }, i);
    const ytId = (u) => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };
    const platOf = (u) => /youtu/.test(u) ? "YouTube" : /instagram/.test(u) ? "Instagram" : /tiktok/.test(u) ? "TikTok" : /facebook|fb\.watch/.test(u) ? "Facebook" : "";
    const vcard = (v, i) => {
      const id = ytId(v.link), plat = platOf(v.link);
      const thumb = v.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
      return `<div class="vc rv"${rv(i % 3)} ${id ? `data-yt="${id}"` : safeUrl(v.link) !== "#" ? `data-href="${esc(safeUrl(v.link))}"` : ""} tabindex="0" role="button" aria-label="Play ${esc(v.title)}">
        ${pic(thumb, "Video thumbnail")}${plat ? `<span class="badge red tag">${plat}</span>` : ""}<span class="play"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z"/></svg></span>
        <div class="cap"><span>${esc(v.category)}</span><b>${esc(v.title)}</b></div></div>`;
    };
    const tabs = (id, items, key, render, hashSync) => {
      const el = $("#" + id); if (!el) return;
      const cats = ["All", ...new Set(items.map((i) => i[key]).filter(Boolean))];
      el.innerHTML = cats.map((c) => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("");
      const pick = (c) => { $$("button", el).forEach((b) => b.classList.toggle("on", b.dataset.c === c)); render(c === "All" ? items : items.filter((i) => i[key] === c)); observe(); };
      el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pick(b.dataset.c); });
      const fromHash = hashSync && cats.find((c) => slug(c) === location.hash.slice(1));
      pick(fromHash || "All");
    };
    const why = `
<section class="shopinfo"><div class="wrap">
  <div><b>Build queue</b><span>${esc(S.queue_weeks)}${S.queue_ahead ? `, ${esc(S.queue_ahead)} ahead of you` : ""}${S.queue_updated ? ` (as of ${esc(S.queue_updated)})` : ""}</span></div>
  <div><b>Shop</b><span>${esc(S.street)}, ${esc(S.city)} ${esc(S.state)}. ${esc(S.hours)}.</span></div>
  <div><b>Phone</b><span><a href="tel:${esc(String(S.phone || "").replace(/[^0-9+]/g, ""))}">${esc(S.phone)}</a></span></div>
  <div><b>FFL</b><span>${esc(S.ffl_number)}</span></div>
</div></section>`;
    const marquee = (words) => { const t = words.map((w, i) => `<span class="${i % 2 ? "o" : ""}">${esc(w)}</span><b></b>`).join(""); return `<div class="marquee" aria-hidden="true"><div class="track">${t}${t}</div></div>`; };

    /* ---------- pages ---------- */
    const P = {};
    P.home = () => {
      const slides = (H.slides || []).filter((s) => s.line1 || s.photo);
      const vids = (D.videos || []).filter((v) => v.show_on_home).slice(0, 3);
      const featured = [...av.filter((a) => !a.sold).slice(0, 2).map((a, i) => availCard(a, i)),
        ...(D.firearms || []).slice(0, 2).map((f, i) => card({ ...f, detail: f.details, href: "firearms.html", flag: `<span class="badge">${esc(f.brand === "Korth" ? "Korth" : "Nighthawk")}</span>`, cta: "View" }, i + 2))].join("");
      return `
<section class="hero" id="hero">
  ${slides.map((s, i) => `<div class="slide${i === 0 ? " on" : ""}">
    ${i === 0 && H.hero_video ? `<div class="ph"><video autoplay muted loop playsinline ${s.photo ? `poster="${esc(fix(s.photo))}"` : ""} src="${esc(fix(H.hero_video))}"></video></div>` : pic(s.photo, "Home slide " + (i + 1) + " photo", "", i === 0)}
    <div class="shade"></div>
    <div class="wrap copy"><span class="kicker fade">${esc(s.kicker)}</span>
      <h1><span class="ln"><span>${esc(s.line1)}</span></span><span class="ln"><span>${esc(s.line2)}</span></span></h1>
      <p class="fade">${esc(s.text)}</p><div class="fade d2">${btn(s.button || "Learn More", s.link || "#", "light")}</div></div>
  </div>`).join("")}
  <div class="ctrl"><div class="wrap"><div class="bars" id="hbars">${slides.map((_, i) => `<button type="button" aria-label="Slide ${i + 1}"><i></i></button>`).join("")}</div>
  <div class="arrows"><button type="button" id="hprev" aria-label="Previous slide">&#8249;</button><button type="button" id="hnext" aria-label="Next slide">&#8250;</button></div></div></div>
</section>
<section class="sec"><div class="wrap">
  <div class="head"><h2 class="title rv">What We Do</h2></div>
  <div class="cats">
    ${[["Custom Shop", "custom-shop.html", H.tile_custom], ["Nighthawk", "firearms.html#nighthawk-custom", H.tile_nighthawk], ["Korth", "firearms.html#korth", H.tile_korth], ["Gunsmithing", "gunsmithing.html", H.tile_gunsmithing]]
      .map(([t, h, p], i) => `<a class="cat rv"${rv(i)} href="${h}">${pic(p, t + " tile photo")}<span class="lbl"><h3>${t}</h3></span><span class="bar"></span></a>`).join("")}
  </div></div></section>
<section class="sec white"><div class="wrap split">
  <div class="rv-l" style="display:flex;flex-direction:column;gap:22px"><h2 class="title">${esc(H.brand_heading)}</h2>
    <p class="lede">${esc(H.brand_text)}</p>${H.brand_text_2 ? `<p class="lede">${esc(H.brand_text_2)}</p>` : ""}
    <div class="sig">${esc(S.owner)}, Gunsmith</div><div class="row">${btn("Our Story", "about.html")}${btn("Start a Build", "custom-shop.html#quote", "outline")}</div></div>
  <div class="frame rv-r brand-ph">${pic(H.brand_photo, "Photo of " + (S.owner || "the gunsmith") + " at the bench")}</div>
</div></section>
${H.heritage_photo ? `<section class="sec heritage"><div class="wrap split wide">
  <div class="rv-l hp">${pic(H.heritage_photo, "Original Tombstone Gunsmith photo")}${H.heritage_photo_2 ? `<div class="hp2">${pic(H.heritage_photo_2, "Original shop photo")}</div>` : ""}</div>
  <div class="rv-r" style="display:flex;flex-direction:column;gap:20px">${H.heritage_kicker ? `<span class="kicker">${esc(H.heritage_kicker)}</span>` : ""}<h2 class="title">${esc(H.heritage_heading)}</h2><p class="lede">${esc(H.heritage_text)}</p><div class="row">${btn("Read the Story", "about.html", "light")}</div></div>
</div></section>` : ""}
<section class="sec"><div class="wrap">
  <div class="head"><h2 class="title rv">On the Shelf</h2></div>
  <div class="grid">${featured}</div>
  <div class="row" style="justify-content:center;margin-top:40px">${btn("Shop Available Now", "available.html")}${btn("Online Store", "shop.html", "outline")}</div>
</div></section>
${vids.length ? `<section class="sec dark on-dark"><div class="wrap">
  <div class="head"><h2 class="title rv">Latest Videos</h2></div>
  <div class="grid three">${vids.map(vcard).join("")}</div>
  <div class="row" style="margin-top:36px">${btn("All Videos", "videos.html", "light")}</div>
</div></section>` : ""}
${why}
${newsletter}`;
    };

    P["custom-shop"] = () => {
      const C = D.custom_shop || {};
      const groups = [...new Set((C.options || []).map((o) => o.group))];
      return banner("Custom Shop", "Custom 1911 and 2011 pistols built one at a time. Pick your platform, spec it out and we will quote it.", C.banner_photo, ["Custom Shop"], btn("Request a Quote", "#quote", "light") + btn("Available Now", "available.html", "ghost")) + `
<section class="sec" id="platforms"><div class="wrap">
  <div class="head"><h2 class="title rv">1911 or 2011</h2></div>
  <div class="plat">${(C.platforms || []).map((p, i) => `<div class="rv"${rv(i)}>${pic(p.photo, p.name + " photo")}<div class="bd"><h3>${esc(p.name)}</h3>
    <dl><dt>Frames</dt><dd>${esc(p.frames)}</dd><dt>Calibers</dt><dd>${esc(p.calibers)}</dd><dt>Capacity</dt><dd>${esc(p.capacity)}</dd><dt>Best For</dt><dd>${esc(p.best_for)}</dd></dl>
    <div class="row" style="justify-content:space-between"><span class="from">From ${esc(p.starting_price)}</span>${btn("Quote This Build", "#quote", "red")}</div></div></div>`).join("")}</div>
</div></section>
<section class="sec white"><div class="wrap">
  <div class="head"><h2 class="title rv">How a Build Works</h2></div>
  <div class="steps">${[["Consult", "We talk about use, hand size and budget."], ["Spec Sheet", "You get a written spec and a fixed quote."], ["Deposit", "Your deposit locks your place in the queue."], ["Build", "Hand fit and finished, with photo updates."], ["Test Fire", "Function and accuracy checked on the range."], ["Delivery", "Final payment, then it ships to your FFL."]]
    .map(([b, s], i) => `<div class="rv"${rv(i)}><span class="n">0${i + 1}</span><b>${b}</b><span>${s}</span></div>`).join("")}</div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="head"><h2 class="title rv">Options</h2></div>
  <div class="tw rv"><table><thead><tr><th>Option</th><th>Choices</th><th class="r">Add</th></tr></thead><tbody>
  ${groups.map((g) => `<tr class="grp"><td colspan="3">${esc(g)}</td></tr>` + C.options.filter((o) => o.group === g).map((o) => `<tr><td><b>${esc(o.option)}</b></td><td>${esc(o.choices)}</td><td class="r"><b>${esc(o.price)}</b></td></tr>`).join("")).join("")}
  </tbody></table></div>
</div></section>
<section class="sec dark on-dark" id="ios"><div class="wrap split wide">
  <div class="rv-l">${pic(C.ios_photo, "IOS optic system photo")}</div>
  <div class="rv-r" style="display:flex;flex-direction:column;gap:20px"><span class="badge red" style="align-self:flex-start">IOS Optic System</span>
    <h2 class="title">Iron Sights or Red Dot. Same Slide.</h2><p class="lede">${esc(C.ios_text)}</p>
    <div class="tw" style="background:#161616"><table><tbody>${(C.ios_prices || []).map((r) => `<tr><td style="color:#fff">${esc(r.item)}</td><td class="r" style="color:#fff"><b>${esc(r.price)}</b></td></tr>`).join("")}</tbody></table></div>
    <div class="row">${btn("Quote an IOS Install", "#quote", "light")}</div></div>
</div></section>
<section class="sec" id="quote"><div class="wrap split" style="align-items:start">
  <div class="rv-l" style="display:flex;flex-direction:column;gap:22px"><h2 class="title">Request a Quote</h2>
    <p class="lede">We reply within two business days with a written spec or a few questions. Nothing is owed until you place a deposit.</p>
    <div class="queue"><span class="badge red" style="align-self:flex-start">Current Wait</span><span class="big">${esc(S.queue_weeks)}</span><div class="bar"><i data-w="${Math.min(95, 20 + (S.queue_ahead || 0) * 4)}"></i></div>
    <p>${S.queue_ahead ? `${esc(S.queue_ahead)} builds ahead of you. ` : ""}Updated ${esc(S.queue_updated)}. IOS retrofits run on a shorter queue, currently ${esc(S.retrofit_weeks)}.</p></div></div>
  <div class="panel rv-r"><form data-form="Quote Request" class="tsform"><div class="f">
    <label>Name<input name="name" required autocomplete="name"></label>
    <label>Email<input name="email" type="email" required autocomplete="email"></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
    <label>Platform<select name="platform"><option>Custom 1911</option><option>Custom 2011</option><option>IOS retrofit</option><option>Not sure yet</option></select></label>
    <label>Caliber<select name="caliber"><option>.45 ACP</option><option>9mm</option><option>10mm</option><option>.38 Super</option><option>.40 S&amp;W</option></select></label>
    <label>Budget<select name="budget"><option>Under $3,000</option><option>$3,000 to $5,000</option><option>$5,000 to $8,000</option><option>$8,000 and up</option></select></label>
    <label class="full">Primary use<select name="use"><option>Carry</option><option>Competition</option><option>Collection</option><option>Duty</option></select></label>
    <label class="full">Describe your build<textarea name="details" placeholder="Finish, sights, grips, anything you have seen and liked"></textarea></label>
    <label class="chk full"><input type="checkbox" name="waitlist" value="yes" checked> Add me to the waitlist and newsletter</label>
    <button class="btn red full" type="submit"><span>Send Quote Request</span>${ARR}</button>
  </div></form><div class="done">Request received. Expect a reply within two business days.</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div></div>
</div></section>`;
    };

    P.available = () => banner("Available Now", "Finished one of a kind builds in stock. Buy today, ships to your FFL this week.", av[0]?.photos?.[0] || H.tile_custom, ["Custom Shop", "Available Now"]) + `
<section class="sec"><div class="wrap">
  <div class="row rv" style="background:#fff;padding:20px 24px;margin-bottom:30px"><span class="badge ok">Ready to Ship</span><span style="color:var(--mute);flex:1;min-width:200px">Finished and on the shelf.</span><span class="badge red">Made to Order</span><span style="color:var(--mute);flex:1;min-width:200px">Built after you order. Current wait ${esc(S.queue_weeks)}.</span></div>
  <div class="grid">${av.map(availCard).join("")}${card({ name: "Build Your Own", brand: "Tombstone Custom", detail: "Made to order 1911 or 2011", photo: H.tile_custom, price: "From " + ((D.custom_shop?.platforms || [])[0]?.starting_price || ""), href: "custom-shop.html", flag: '<span class="badge red">Made to Order</span>', cta: "Start a Build" }, av.length)}</div>
</div></section>${newsletter}`;

    P.product = () => {
      const a = av.find((x) => slug(x.id || x.name) === location.hash.slice(1)) || av[0];
      if (!a) return banner("Build not found", "", "", ["Available Now"]);
      document.title = a.name + " | " + S.business_name;
      const photos = (a.photos || []).length ? a.photos : [""];
      return `<section class="sec" style="padding-top:36px"><div class="wrap">
  <div style="font-size:13px;color:var(--mute);margin-bottom:22px"><a href="index.html">Home</a> / <a href="available.html">Available Now</a> / ${esc(a.name)}</div>
  <div class="pdp"><div class="rv-l"><div id="pdmain">${pic(photos[0], a.name + " photo 1", "main", true)}</div>
    ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<div data-i="${i}">${pic(p, a.name + " photo " + (i + 1), i === 0 ? "on" : "")}</div>`).join("")}</div>` : ""}</div>
  <div class="rv-r" style="display:flex;flex-direction:column;gap:18px">
    ${a.sold ? '<span class="badge sold" style="align-self:flex-start">Sold</span>' : '<span class="badge ok" style="align-self:flex-start">Ready to Ship</span>'}
    <h1>${esc(a.name)}</h1><div class="price">${esc(a.price)}</div><p class="lede">${esc(a.description)}</p>
    <div class="ffl"><b>FFL required.</b> We ship to your local FFL dealer. You pick it up after the background check.</div>
    ${a.sold ? btn("See What's Available", "available.html") : `<div class="row">${btn("Call to Buy " + S.phone, "tel:" + S.phone, "red")}${btn("Email About This Gun", "mailto:" + S.email + "?subject=" + encodeURIComponent(a.name), "outline")}</div>`}
    <div class="tw"><table><tbody>${(a.specs || []).map((s) => `<tr><td><b>${esc(s.label)}</b></td><td>${esc(s.value)}</td></tr>`).join("")}</tbody></table></div>
  </div></div></div></section>`;
    };

    P.gunsmithing = () => {
      const Sv = D.services || {};
      return banner("Gunsmithing", "Flat rate pricing on common work. Everything else is hourly with an estimate before we start.", Sv.banner_photo, ["Gunsmithing"], btn("Schedule a Drop Off", "contact.html", "light")) + `
<section class="sec"><div class="wrap">
  <div class="row rv" style="background:var(--ink);color:#fff;padding:26px 28px;margin-bottom:34px;gap:28px">
    <span style="font-family:var(--head);font-weight:800;font-size:56px;line-height:1">${esc(S.hourly_rate)}<span style="font-size:22px">/HR</span></span>
    <span style="color:#cfcac2;flex:1;min-width:240px">Shop rate for work outside the menu. One hour minimum on diagnostics. We call with an estimate before going further. Parts billed at retail.</span>
  </div>
  <div class="tabs rv" id="svtabs"></div>
  <div class="tw rv"><table><thead><tr><th>Service</th><th>Platform</th><th>Turnaround</th><th class="r">Price</th></tr></thead><tbody id="svbody"></tbody></table></div>
  <p style="margin-top:16px;color:var(--mute)">Shipping a firearm in for service? Call ${esc(S.phone)} first for FFL shipping instructions.</p>
</div></section>${why}`;
    };

    P.firearms = () => banner("Firearms", "Authorized dealer for Nighthawk Custom and Korth.", H.tile_nighthawk, ["Firearms"], btn("Shop All Brands", sl(""), "light")) + `
<section class="sec"><div class="wrap"><div class="tabs rv" id="fatabs"></div><div class="grid" id="fagrid"></div>
  <div class="row" style="justify-content:center;margin-top:44px">${btn("Ask About Allocations " + S.phone, "tel:" + S.phone, "red")}</div></div></section>`;

    P.shop = () => {
      const I = "images/uploads/";
      const cats = [["Custom Guns", "/catalog/custom-guns", I + "colt-38-super-after.jpg"], ["Handguns", "/catalog/handguns", I + "cat-handguns.jpg"], ["Rifles", "/catalog/rifles", I + "cat-rifles.jpg"], ["Shotguns", "/catalog/shotguns", I + "cat-shotguns.jpg"], ["Ammo", "/catalog/ammo", I + "cat-ammo.jpg"], ["Accessories", "/catalog/accessories", I + "cat-accessories.jpg"]];
      return banner("Online Store", "Thousands of firearms, optics and parts with live stock and pricing from our distributor. Firearms ship to your FFL. Everything else ships to your door.", "images/uploads/cat-ammo.jpg", ["Shop"], btn("Browse Categories", "#cats", "light")) + `
<section class="sec"><div class="wrap">
  <div class="head"><h2 class="title rv">Shop by Category</h2></div>
  <div class="cats" id="cats" style="grid-template-columns:repeat(3,1fr)">${cats.map(([t, p, ph], i) => `<a class="cat rv"${rv(i % 3)} style="aspect-ratio:4/3" href="${esc(sl(p))}">${pic(ph, t + " category photo")}<span class="lbl"><h3>${t}</h3></span><span class="bar"></span></a>`).join("")}</div>
</div></section>
<section class="sec white"><div class="wrap split">
  <div class="rv-l" style="display:flex;flex-direction:column;gap:18px"><h2 class="title">Buying a Gun Online</h2>
    <p class="lede">Pick your firearm and choose a local FFL dealer at checkout. It ships to them, you fill out the paperwork and take it home. Optics, parts and gear ship straight to you.</p>
    <div class="row">${btn("Browse Categories", "#cats")}${btn("Tombstone Gear", "gear.html", "outline")}</div></div>
  <div class="rv-r plainlist"><p>Stock and prices come straight from our distributor and change during the day.</p><p>Most orders leave in 1 to 3 business days.</p><p>Questions about an order? Call ${esc(S.phone)}.</p></div>
</div></section>`;
    };

    P.gear = () => banner("Tombstone Gear", "Hats, shirts, patches and leather. Ships to your door.", (D.gear || [])[0]?.photo || H.brand_photo, ["Shop", "Tombstone Gear"]) + `
<section class="sec"><div class="wrap"><div class="grid">${(D.gear || []).map((g, i) => card({ name: g.name, brand: "Tombstone Gear", detail: g.details, price: g.price, photo: g.photo, href: g.buy_link || "contact.html", ext: !!g.buy_link, cta: g.buy_link ? "Buy Now" : "Ask About It" }, i)).join("")}</div></div></section>${newsletter}`;

    P.gallery = () => banner("Project Gallery", "Completed builds that went home with their owners.", (D.gallery || [])[0]?.photo, ["Custom Shop", "Gallery"], btn("Start Your Build", "custom-shop.html#quote", "light")) + `
<section class="sec"><div class="wrap"><div class="tabs rv" id="galtabs"></div><div class="masonry" id="galgrid"></div></div></section>`;

    P.videos = () => banner("Videos", "Builds, reviews and shop tips from our channels.", H.tile_nighthawk, ["Videos"], [["YouTube", S.youtube], ["Instagram", S.instagram], ["TikTok", S.tiktok], ["Facebook", S.facebook]].filter(([, u]) => u).map(([t, u]) => btn(t, u, "ghost", true)).join("")) + `
<section class="sec"><div class="wrap"><div class="tabs rv" id="vtabs"></div><div class="grid three" id="vgrid"></div></div></section>`;

    P.about = () => {
      const A = D.about || {};
      const paras = String(A.story || "").split(/\n\s*\n/).filter(Boolean);
      return banner(esc(A.headline || "About"), A.intro, A.banner_photo, ["About"]) + `
<section class="sec white"><div class="wrap split" style="align-items:start">
  <div class="prose rv-l">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}<div class="sig">${esc(S.owner)}, ${esc(S.legal_name)}</div></div>
  <div class="frame rv-r">${pic(A.story_photo, "Shop history photo")}</div>
</div></section>
${(A.heritage || []).length ? `<section class="sec heritage"><div class="wrap">
  <div class="head"><h2 class="title rv">Where It Started</h2></div>
  <div class="archive">${A.heritage.map((h, i) => `<figure class="rv"${rv(i)}><a href="#" data-lb="${i}">${pic(h.photo, "Archive photo")}</a><figcaption>${esc(h.caption)}</figcaption></figure>`).join("")}</div>
</div></section>` : ""}
${(A.before_after || []).map((b, i) => `<section class="sec ${i % 2 ? "white" : ""}"><div class="wrap split wide">
  <div class="ba rv-l" data-ba>${pic(b.before_photo, "Before photo")}<div class="ph after">${b.after_photo ? `<img src="${esc(fix(b.after_photo))}" alt="After photo" loading="lazy">` : slot("After photo")}</div><span class="lb" style="left:16px">Before</span><span class="lb" style="right:16px">After</span><div class="knob"></div></div>
  <div class="rv-r" style="display:flex;flex-direction:column;gap:18px"><h2 class="title">${esc(b.title)}</h2><p class="lede">${esc(b.text)}</p><p style="color:var(--mute)">Drag the slider to compare.</p></div>
</div></section>`).join("")}
<section class="sec"><div class="wrap">
  <div class="head"><h2 class="title rv">Special Thanks</h2></div>
  <div class="thanks">${(A.thanks || []).map((t, i) => t.link
    ? `<a class="rv"${rv(i)} href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener" title="${esc(t.name)}"><em>${esc(t.role)}</em><b>${esc(t.name)}</b><span>${esc(t.text)}</span><span class="go">Visit ${esc(t.name)} ${ARR}</span></a>`
    : `<div class="rv"${rv(i)}><em>${esc(t.role)}</em><b>${esc(t.name)}</b><span>${esc(t.text)}</span></div>`).join("")}</div>
</div></section>`;
    };

    P.contact = () => banner("Contact", "Questions, quotes or service drop offs. We answer every message.", H.heritage_photo, ["Contact"]) + `
<section class="sec"><div class="wrap split" style="align-items:start">
  <div class="rv-l" style="display:flex;flex-direction:column;gap:18px">
    <div class="tw"><table><tbody>
      <tr><td><b>Phone</b></td><td><a href="tel:${esc(S.phone)}">${esc(S.phone)}</a></td></tr>
      <tr><td><b>Email</b></td><td><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></td></tr>
      ${addr ? `<tr><td><b>Shop</b></td><td>${esc(addr)}</td></tr>` : ""}
      ${S.hours ? `<tr><td><b>Hours</b></td><td>${esc(S.hours)}</td></tr>` : ""}
      ${S.ffl_number ? `<tr><td><b>FFL</b></td><td>${esc(S.ffl_number)}</td></tr>` : ""}
    </tbody></table></div>
    <div class="queue"><span class="badge red" style="align-self:flex-start">Build Queue</span><span class="big">${esc(S.queue_weeks)}</span><p>Updated ${esc(S.queue_updated)}.</p></div>
  </div>
  <div class="panel rv-r"><form data-form="Contact" class="tsform"><div class="f">
    <label>Name<input name="name" required autocomplete="name"></label>
    <label>Email<input name="email" type="email" required autocomplete="email"></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
    <label>Topic<select name="topic"><option>Gunsmithing service</option><option>Custom build</option><option>Firearm purchase</option><option>Order question</option><option>Other</option></select></label>
    <label class="full">Message<textarea name="message" required></textarea></label>
    <button class="btn red full" type="submit"><span>Send Message</span>${ARR}</button>
  </div></form><div class="done">Message received. We will reply within one business day.</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div></div>
</div></section>`;

    $("#main").innerHTML = (P[PAGE] || P.home)();

    /* ---------- page wiring ---------- */
    if (PAGE === "gunsmithing") tabs("svtabs", (D.services || {}).items || [], "category", (l) => $("#svbody").innerHTML = l.map((s) => `<tr><td><b>${esc(s.name)}</b><small>${esc(s.details)}</small></td><td>${esc(s.platform)}</td><td>${esc(s.turnaround)}</td><td class="r"><b class="price">${esc(s.price)}</b></td></tr>`).join(""));
    if (PAGE === "firearms") tabs("fatabs", D.firearms || [], "brand", (l) => $("#fagrid").innerHTML = l.map((f, i) => card({ ...f, detail: f.details, href: "tel:" + S.phone, cta: "Call " + S.phone }, i)).join(""), true);
    if (PAGE === "videos") tabs("vtabs", D.videos || [], "category", (l) => { $("#vgrid").innerHTML = l.map(vcard).join(""); });
    if (PAGE === "gallery") {
      const G = D.gallery || [];
      tabs("galtabs", G, "type", (l) => {
        $("#galgrid").innerHTML = l.map((g, i) => `<a href="#" class="rv"${rv(i % 3)} data-lb="${G.indexOf(g)}" style="--ar:${g.shape === "tall" ? "3/4" : g.shape === "square" ? "1/1" : "4/3"}">${pic(g.photo, g.name + " photo")}<span class="ov"><b>${esc(g.name)}</b><span>${esc(g.notes)}</span></span></a>`).join("");
      });
      lightbox(G.map((g) => [g.photo, g.name + (g.notes ? " | " + g.notes : "")]));
    }
    if (PAGE === "about") lightbox(((D.about || {}).heritage || []).map((h) => [h.photo, h.caption]));
    if (PAGE === "product") {
      const a = av.find((x) => slug(x.id || x.name) === location.hash.slice(1)) || av[0];
      $$(".thumbs [data-i]").forEach((t) => t.addEventListener("click", () => {
        $$(".thumbs .ph").forEach((p) => p.classList.remove("on")); t.querySelector(".ph").classList.add("on");
        $("#pdmain").innerHTML = pic(a.photos[+t.dataset.i], a.name + " photo", "main");
      }));
      addEventListener("hashchange", () => location.reload());
    }

    $$("#main .grid, #main .masonry, #main #fagrid, #main #vgrid, #main #galgrid").forEach((g) => {
      if (!g.children.length) g.outerHTML = `<p class="empty">Nothing posted here right now. Call <a href="tel:${esc(String(S.phone || "").replace(/[^0-9+]/g, ""))}">${esc(S.phone)}</a> and ask what is on the bench.</p>`;
    });
    $$("#main .tabs").forEach((tb) => { if (tb.children.length <= 2) tb.style.display = "none"; });
    wire(S);
  }

  /* ---------- interactions + motion ---------- */
  let io;
  function observe() {
    const els = $$(".rv:not(.in),.rv-l:not(.in),.rv-r:not(.in),.mask:not(.in)");
    if (!("IntersectionObserver" in window) || reduce) { els.forEach((e) => e.classList.add("in")); return; }
    if (!io) io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; el.style.transitionDelay = (+(el.dataset.d || 0) * 0.1) + "s";
      el.classList.add("in"); io.unobserve(el);
      $$("[data-count]", el).forEach(count);
      $$(".bar i[data-w]", el).forEach((b) => (b.style.width = b.dataset.w + "%"));
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
    setTimeout(() => $$(".rv,.rv-l,.rv-r,.mask").forEach((e) => { const r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add("in"); }), 1200);
  }
  function count(el) {
    const end = +el.dataset.count, suf = el.dataset.suf || "", t0 = performance.now(), dur = 1600;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = end + suf) : requestAnimationFrame(step);
  }
  function lightbox(items) {
    const lb = $("#lb"); let i = 0;
    const show = (n) => { i = (n + items.length) % items.length; const [src, cap] = items[i]; $("#lbph").outerHTML = `<div class="ph" id="lbph">${src ? `<img src="${esc(fix(src))}" alt="${esc(cap)}">` : slot(cap)}</div>`; $("#lbcap").textContent = cap; };
    document.addEventListener("click", (e) => { const a = e.target.closest("[data-lb]"); if (!a) return; e.preventDefault(); show(+a.dataset.lb); lb.classList.add("open"); });
    $(".x", lb).onclick = () => lb.classList.remove("open");
    $(".pv", lb).onclick = () => show(i - 1);
    $(".nx", lb).onclick = () => show(i + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", (e) => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") lb.classList.remove("open"); if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
  }

  function wire(S) {
    observe();
    // header shrink, back to top, parallax
    const hd = $("#hd"), top = $("#totop"), par = $$(".par");
    let ticking = false;
    const onScroll = () => {
      const y = scrollY;
      hd.classList.toggle("scrolled", y > 40);
      top.classList.toggle("show", y > 700);
      if (!reduce && innerWidth > 1000) par.forEach((p) => { p.style.transform = `translateY(${y * 0.25}px)`; });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();
    top.onclick = () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    $("#burger").onclick = () => { const o = $("#nav").classList.toggle("open"); $("#burger").setAttribute("aria-expanded", o); };

    // hero slider with progress bars
    const slides = $$(".slide");
    if (slides.length) {
      const bars = $$("#hbars button"), DUR = 7000; let cur = 0, timer;
      const show = (n) => {
        cur = (n + slides.length) % slides.length;
        slides.forEach((s, j) => s.classList.toggle("on", j === cur));
        bars.forEach((b, j) => { b.classList.remove("on", "done"); if (j < cur) b.classList.add("done"); });
        void bars[cur]?.offsetWidth; bars[cur]?.classList.add("on");
        clearTimeout(timer); if (!reduce && slides.length > 1) timer = setTimeout(() => show(cur + 1), DUR);
      };
      document.documentElement.style.setProperty("--dur", DUR + "ms");
      bars.forEach((b, j) => (b.onclick = () => show(j)));
      $("#hprev").onclick = () => show(cur - 1); $("#hnext").onclick = () => show(cur + 1);
      let sx = 0; $("#hero").addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
      $("#hero").addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
      $$("video", $("#hero")).forEach((v) => v.addEventListener("error", () => { v.outerHTML = slot("Home video"); }));
      show(0);
    }

    // videos: YouTube plays inline, others open on their platform
    document.addEventListener("click", (e) => {
      const v = e.target.closest(".vc"); if (!v) return;
      if (v.dataset.yt) { v.querySelector(".ph").insertAdjacentHTML("beforeend", `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>`); v.removeAttribute("data-yt"); }
      else if (v.dataset.href && /^https:\/\//i.test(v.dataset.href)) window.open(v.dataset.href, "_blank", "noopener,noreferrer");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.classList?.contains("vc")) e.target.click(); });

    // before/after drag
    $$("[data-ba]").forEach((b) => {
      const af = $(".after", b), k = $(".knob", b);
      const set = (x) => { const r = b.getBoundingClientRect(); const p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)); af.style.clipPath = `inset(0 0 0 ${p}%)`; k.style.left = p + "%"; };
      let drag = false;
      b.addEventListener("pointerdown", (e) => { drag = true; b.setPointerCapture(e.pointerId); set(e.clientX); });
      b.addEventListener("pointermove", (e) => drag && set(e.clientX));
      b.addEventListener("pointerup", () => (drag = false));
    });

    // forms
    const loaded = Date.now();
    $$("form.tsform").forEach((f) => {
      // hidden trap field: people never see it, bots fill it in
      f.insertAdjacentHTML("beforeend", '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">');
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const box = f.parentElement, done = $(".done", box), err = $(".err", box), b = $("button[type=submit]", f);
        const data = Object.fromEntries(new FormData(f).entries());
        data.form = f.dataset.form; data.page = location.pathname; data.t = Date.now() - loaded; data.wait = S.queue_weeks || "";
        if (!data.waitlist) data.waitlist = "no";
        b.disabled = true; err.classList.remove("show");
        try {
          if (S.form_endpoint) {
            const r = await fetch(S.form_endpoint, { method: "POST", body: JSON.stringify(data) });
            const out = await r.json().catch(() => ({ ok: r.ok }));
            if (!out.ok) throw new Error(out.error || "failed");
          } else {
            // Request system not connected yet: open the visitor's email app with everything filled in.
            const body = Object.entries(data).filter(([k]) => !["page", "t", "website", "wait", "form"].includes(k)).map(([k, v]) => k.charAt(0).toUpperCase() + k.slice(1) + ": " + v).join("\n");
            location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent(data.form + " from the website") + "&body=" + encodeURIComponent(body);
            done.textContent = "Your email app should open with your details filled in. Hit send and we will get back to you. Or call " + S.phone + ".";
          }
          f.style.display = "none"; done.classList.add("show");
        } catch (x) {
          err.textContent = (x.message && x.message !== "failed" && x.message.length < 80 ? x.message + " " : "Something went wrong. ") + "Please call " + S.phone + ".";
          err.classList.add("show"); b.disabled = false;
        }
      });
    });

    // age gate
    const gate = $("#gate");
    let ok = false; try { ok = localStorage.getItem("tsg21") === "1"; } catch (e) {}
    if (!ok) gate.classList.remove("hide");
    $("#gy").onclick = () => { gate.classList.add("hide"); try { localStorage.setItem("tsg21", "1"); } catch (e) {} };
    $("#gn").onclick = () => { $("p", gate).textContent = "Sorry, you must be 21 or older to enter this site."; };

    // local business schema for Google
    const addrSchema = S.city ? { "@type": "PostalAddress", streetAddress: S.street, addressLocality: S.city, addressRegion: S.state, postalCode: S.zip, addressCountry: "US" } : undefined;
    const ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Store", name: S.business_name, legalName: S.legal_name, telephone: S.phone, email: S.email, url: location.origin, address: addrSchema, founder: S.owner,
      sameAs: [S.facebook, S.instagram, S.youtube, S.tiktok].filter(Boolean) });
    document.head.appendChild(ld);
  }
})();
