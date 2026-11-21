/* Tombstone Gunsmith, the Epitaph edition.
   Same content files as the current site (../content/*.json), printed as an 1880s Tombstone front page.
   One motion moment only: the 1958 truck photo develops when it scrolls into view.
   When window.__TSG_KIT is set (by tools/extract.py) pages render the AmmoReady version:
   product grids become Collection widget notes and filters are left out. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const PAGE = document.body.dataset.page || "home";
  const KIT = !!window.__TSG_KIT;
  const BASE = "../";

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Only allow normal links: web, email, phone, same-site paths and in-page anchors. Anything else (javascript:, data:) becomes "#".
  const safeUrl = (u) => { const s = String(u == null ? "" : u).trim(); return /^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|[\w.-]+\.html(#[\w-]*)?$|[\w-]+(\/[\w.-]+)*$)/i.test(s) && !/^\s*(javascript|data|vbscript):/i.test(s) ? s : "#"; };
  const fix = (src) => { const s = String(src || "").replace(/^\//, ""); return /^(https:\/\/|images\/)/i.test(s) && !/["'<>]/.test(s) ? s : ""; };
  const src = (s) => { const f = fix(s); return !f ? "" : /^https:/i.test(f) ? f : BASE + f; };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const tel = (p) => "tel:" + String(p || "").replace(/[^0-9+]/g, "");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ARR = " &rarr;";
  const stamp = (text, href, cls = "", ext) => `<a class="stamp ${cls}" href="${esc(safeUrl(href))}"${ext ? ' target="_blank" rel="noopener"' : ""}>${esc(text)}</a>`;
  const more = (text, href) => `<p class="cont"><a href="${esc(safeUrl(href))}">${esc(text)}${ARR}</a></p>`;
  // Bold the first sentence of a caption, the way a paper sets a cutline
  const cutline = (c) => { const s = String(c || ""), m = s.match(/^(.{4,40}?[a-z0-9]\.)\s/); return m ? `<b>${esc(m[1])}</b>${esc(s.slice(m[1].length))}` : esc(s); };
  const img = (p, alt, cls = "", eager) => src(p) ? `<img ${cls ? `class="${cls}" ` : ""}src="${esc(src(p))}" alt="${esc(alt)}"${eager ? "" : ' loading="lazy"'}>` : "";
  // A printed photo. Product shots sit on red backdrops, so they print in ink (class "ink") and get color back on hover.
  const plate = (p, alt, cap, cls = "", ink = true, eager) => src(p) ? `<figure class="plate ${cls}">${img(p, alt, ink ? "ink" : "", eager)}${cap ? `<figcaption>${cutline(cap)}</figcaption>` : ""}</figure>` : "";
  const slotHTML = (label) => `<div class="slot" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;
  document.addEventListener("error", (e) => { const i = e.target; if (!i || i.tagName !== "IMG" || i.closest(".vc")) return; const d = document.createElement("div"); d.innerHTML = slotHTML(i.alt || "Photo"); i.replaceWith(d.firstChild); }, true);
  const note = (w, x) => `<div class="tsg-note" data-tsg-note>Below this block: add an AmmoReady <b>${w}</b> widget${x}. This note only shows while editing.</div>`;
  const sentences = (t) => String(t || "").match(/[^.!?]+[.!?]+/g) || [];

  const FILES = ["settings", "home", "custom-shop", "services", "available", "firearms", "gear", "gallery", "videos", "about"];
  Promise.all(FILES.map((f) => fetch(BASE + "content/" + f + ".json", { cache: "no-cache" }).then((r) => r.json()).catch(() => null)))
    .then((res) => {
      const D = {};
      FILES.forEach((f, i) => (D[f.replace("-", "_")] = res[i]));
      // Items show up only once they have a real photo (or a real video link)
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
    const H = D.home || {};
    const C = D.custom_shop || {};
    const A = D.about || {};
    const av = D.available || [];
    const store = (S.store_url || "").replace(/\/$/, "");
    const sl = (path) => (store ? store + path : "shop.html");
    const addr = [S.street, [S.city, S.state].filter(Boolean).join(", "), S.zip].filter(Boolean).join(" ");
    const wait = `<span data-tsg="wait">${esc(S.queue_weeks)}</span>`;

    /* ---------- masthead ---------- */
    const NAV = [["custom-shop", "Custom Shop", "custom-shop.html"], ["available", "Available Now", "available.html"], ["firearms", "Firearms", "firearms.html"],
      ["gunsmithing", "Gunsmithing", "gunsmithing.html"], ["shop", "Store", "shop.html"], ["videos", "Videos", "videos.html"], ["about", "Our Story", "about.html"], ["contact", "Contact", "contact.html"]];
    const parent = { gear: "shop", gallery: "custom-shop", product: "available" }[PAGE] || PAGE;
    const front = PAGE === "home";
    $("#hdr").outerHTML = `
<a class="skip" href="#main">Skip to the page</a>
<header class="mast${front ? "" : " compact"}">
  <div class="util"><div class="sheet util-in">
    <a class="u-call" href="${esc(tel(S.phone))}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span>${esc(S.phone)}</span></a>
    <form class="u-search" action="${esc(sl("/search"))}" method="get" role="search">
      <label class="vh" for="q">Search the store</label>
      <input id="q" name="q" type="search" placeholder="Search firearms, optics, parts">
      <button type="submit" aria-label="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>
    </form>
    <a class="u-cart" href="${esc(sl(""))}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.5 12h11L21 8H7"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg><span>Cart</span></a>
  </div></div>
  <div class="sheet">
    <div class="mast-top"><span>Custom 1911 and 2011 pistols</span><span class="dateline"></span><span class="q">Build queue <b class="tw">${esc(S.queue_weeks)}</b></span></div>
    <div class="mast-mid"><a class="nameplate" href="index.html" aria-label="${esc(S.business_name)}, front page"><span class="the">The</span> <span class="np">Tombstone Gunsmith</span></a></div>
    ${front ? `<div class="mast-bot"><span>Est. Tombstone, Arizona, circa ${esc(S.roots_year || 1956)}</span><span class="orn" aria-hidden="true">&#10070;</span><span>Authorized Nighthawk Custom and Korth dealer</span></div>` : ""}
    <nav class="nav" aria-label="Main">${NAV.map(([id, t, h]) => `<a href="${h}"${id === parent ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
  </div>
</header>`;

    /* ---------- footer, gate, photo viewer ---------- */
    const soc = [["Facebook", S.facebook], ["Instagram", S.instagram], ["YouTube", S.youtube], ["TikTok", S.tiktok]].filter(([, u]) => u && safeUrl(u) !== "#");
    $("#ftr").outerHTML = `
<footer class="foot"><div class="sheet">
  <div class="f-index">
    <div class="f-col"><p class="f-h">The Shop</p><a href="custom-shop.html">Custom Shop</a><a href="available.html">Available Now</a><a href="custom-shop.html#ios">IOS Optic System</a><a href="gallery.html">Project Gallery</a></div>
    <div class="f-col"><p class="f-h">The Store</p><a href="firearms.html">Firearms</a><a href="shop.html">Online Store</a><a href="gear.html">Tombstone Gear</a>${soc.map(([t, u]) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${t}</a>`).join("")}</div>
    <div class="f-col"><p class="f-h">The Bench</p><a href="gunsmithing.html">Gunsmithing</a><a href="videos.html">Videos</a><a href="about.html">Our Story</a><a href="contact.html">Contact</a></div>
    <div class="f-call"><p class="f-h">Telephone the Shop</p><p class="f-phone"><a href="${esc(tel(S.phone))}">${esc(S.phone)}</a></p>
      <p><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></p>${addr ? `<p>${esc(addr)}</p>` : ""}${S.hours ? `<p>${esc(S.hours)}</p>` : ""}${S.ffl_number ? `<p class="tw">FFL ${esc(S.ffl_number)}</p>` : ""}
      ${stamp("Request a Quote", "custom-shop.html#quote")}</div>
  </div>
  <p class="foot-name">${esc(S.legal_name)}</p>
  <p class="legal">&copy; ${new Date().getFullYear()} ${esc(S.legal_name)}. Firearms ship to a licensed FFL dealer only. All sales subject to federal, state and local law. Must be 21 or older.</p>
</div></footer>
<div class="lb-wrap" id="lb" role="dialog" aria-modal="true" aria-label="Photo viewer"><button class="x" aria-label="Close">&times;</button><button class="pv" aria-label="Previous">&#8249;</button><div class="ph" id="lbph"></div><button class="nx" aria-label="Next">&#8250;</button><div class="cap" id="lbcap"></div></div>
<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-h" hidden><div class="gate-box">
  <p class="gate-the">The</p><p class="gate-name">Tombstone Gunsmith</p><p class="n-rule" aria-hidden="true"></p>
  <h2 id="gate-h">Are you 21 or older?</h2><p id="gate-msg">This site sells firearms. You must be of legal age to enter.</p>
  <div class="gate-btns"><button type="button" class="stamp" id="gate-yes">Yes, enter</button><button type="button" class="stamp line" id="gate-no">No</button></div>
</div></div>`;

    /* ---------- shared blocks ---------- */
    // Page head: every inside page opens like a section front
    const phead = (o) => `
<section class="phead${o.photo && src(o.photo) ? " has-ph" : ""}">
  <div class="ph-text">
    <p class="crumb"><a href="index.html">Front Page</a>${(o.crumbs || []).map((c) => ` <span aria-hidden="true">/</span> ${c}`).join("")}</p>
    <p class="kick">${esc(o.kick)}</p><h1>${esc(o.title)}</h1>${o.deck ? `<p class="deck">${esc(o.deck)}</p>` : ""}
    ${o.extra ? `<div class="cta-row">${o.extra}</div>` : ""}
  </div>
  ${o.develop && src(o.photo) ? `<figure class="plate truck"><div class="develop">${img(o.photo, o.alt, "", true)}</div>${o.cap ? `<figcaption>${cutline(o.cap)}</figcaption>` : ""}</figure>` : plate(o.photo, o.alt || o.title, o.cap, "", o.ink !== false, true)}
</section>`;
    const crumbLink = (t, h) => `<a href="${h}">${t}</a>`;

    const good = (o) => `
<a class="good" href="${esc(safeUrl(o.href))}"${o.ext ? ' target="_blank" rel="noopener"' : ""}>
  ${o.photo ? img(o.photo, o.name, "ink") : ""}
  ${o.flag ? `<span class="g-flag">${esc(o.flag)}</span>` : ""}${o.brand ? `<span class="g-brand">${esc(o.brand)}</span>` : ""}
  <span class="g-name">${esc(o.name)}</span>${o.detail ? `<span class="g-det">${esc(o.detail)}</span>` : ""}
  <span class="g-row tw"><span>${esc(o.price || "")}</span>${o.status ? `<span class="st${o.status === "On order" ? " wait" : ""}">${esc(o.status)}</span>` : ""}</span>
  ${o.cta ? `<span class="g-cta">${esc(o.cta)}${ARR}</span>` : ""}
</a>`;
    const availGood = (a) => good({ name: a.name, brand: "Tombstone Custom", detail: (a.specs || []).slice(0, 2).map((s) => s.value).join(", "), price: a.price, photo: (a.photos || [])[0], href: "product.html#" + slug(a.id || a.name), flag: a.sold ? "Sold" : "Ready to Ship", cta: "View Build" });
    const empty = `<p class="empty">Nothing posted here right now. Call <a href="${esc(tel(S.phone))}">${esc(S.phone)}</a> and ask what is on the bench.</p>`;

    const spec = (p, full) => `
<div class="spec">
  <p class="spec-h">${esc(p.name)} <span>from ${esc(p.starting_price)}</span></p>
  <dl class="tw"><div><dt>Frames</dt><dd>${esc(p.frames)}</dd></div><div><dt>Calibers</dt><dd>${esc(p.calibers)}</dd></div>${full ? `<div><dt>Capacity</dt><dd>${esc(p.capacity)}</dd></div>` : ""}<div><dt>Best for</dt><dd>${esc(p.best_for)}</dd></div></dl>
</div>`;
    const STEPS = [["Consult", "We talk about use, hand size and budget."], ["Spec sheet", "You get a written spec and a fixed quote."], ["Deposit", "It locks your place in the queue."], ["Build", "Hand fit and finished, with photo updates."], ["Test fire", "Function and accuracy checked on the range."], ["Delivery", "Final payment, then it ships to your FFL."]];
    const steps = `<ol class="steps">${STEPS.map(([b, s]) => `<li><b>${b}</b> ${s}</li>`).join("")}</ol>`;

    const ytId = (u) => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };
    const platOf = (u) => /youtu/.test(u) ? "YouTube" : /instagram/.test(u) ? "Instagram" : /tiktok/.test(u) ? "TikTok" : /facebook|fb\.watch/.test(u) ? "Facebook" : "";
    const vcard = (v) => {
      const id = ytId(v.link), plat = platOf(v.link), thumb = v.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
      return `<div class="vc" ${id ? `data-yt="${id}"` : safeUrl(v.link) !== "#" ? `data-href="${esc(safeUrl(v.link))}"` : ""} tabindex="0" role="button" aria-label="Play ${esc(v.title)}">
  <div class="ph">${src(thumb) ? `<img src="${esc(src(thumb))}" alt="Video thumbnail" loading="lazy">` : ""}</div><span class="play"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg></span>
  <div class="cap">${v.category || plat ? `<span>${esc([v.category, plat].filter(Boolean).join(" on "))}</span>` : ""}<b>${esc(v.title)}</b></div></div>`;
    };

    const subscribe = `
<section class="subscribe">
  <div class="sub-copy"><p class="kick">The Shop Email</p><h2>Hear About Finished Builds First</h2><p>When a build is finished, subscribers hear about it before it goes on the site. You also get range days and shop news.</p></div>
  <div class="sub-form"><form data-form="Newsletter" class="tsform">
    <div class="in"><label class="vh" for="nl-email">Email address</label><input id="nl-email" type="email" name="email" required placeholder="Your email address"><button class="stamp" type="submit">Sign Up</button></div>
    <label class="chk"><input type="checkbox" name="waitlist" value="yes"> Put me on the custom build waitlist</label>
  </form><div class="done">You're on the list. Check your inbox for a welcome email from the shop.</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div></div>
</section>`;

    const particulars = `
<section class="particulars" aria-label="Shop particulars">
  <div><p class="n-small">Build Queue</p><p class="tw">${wait}${S.queue_ahead ? `, ${esc(S.queue_ahead)} ahead of you` : ""}</p></div>
  <div><p class="n-small">The Shop</p><p>${esc(S.street)}, ${esc(S.city)} ${esc(S.state)}. ${esc(S.hours)}.</p></div>
  <div><p class="n-small">Telephone</p><p><a href="${esc(tel(S.phone))}">${esc(S.phone)}</a></p></div>
  <div><p class="n-small">FFL</p><p class="tw">${esc(S.ffl_number)}</p></div>
</section>`;

    const queueBox = (long) => `
<div class="notice queue">
  <p class="n-small">Current Wait</p><p class="q-big">${wait}</p><p class="n-rule" aria-hidden="true"></p>
  <p class="small">${S.queue_ahead && long ? `${esc(S.queue_ahead)} builds ahead of you. ` : ""}Updated ${esc(S.queue_updated)}.${long ? ` IOS retrofits run on a shorter queue, currently ${esc(S.retrofit_weeks)}.` : ""}</p>
</div>`;

    const field = (label, inner, full) => `<label${full ? ' class="full"' : ""}><span>${label}</span>${inner}</label>`;
    const coupon = (title, lead, form, fields, submit, done) => `
<div class="coupon">
  <p class="coupon-h">${title}</p>${lead ? `<p class="small">${lead}</p>` : ""}
  <form data-form="${form}" class="tsform"><div class="f">${fields}</div><button class="stamp" type="submit">${submit}</button></form>
  <div class="done">${done}</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div>
</div>`;
    const opts = (a) => a.map((o) => `<option>${o}</option>`).join("");

    /* ---------- pages ---------- */
    const P = {};

    P.home = () => {
      const plats = C.platforms || [];
      const korth = (D.firearms || []).slice(0, 2);
      const items = (D.services || {}).items || [];
      const cats = [...new Set(items.map((i) => i.category))];
      const ledger = cats.flatMap((c) => items.filter((i) => i.category === c).slice(0, 2)).slice(0, 8);
      const ba = (A.before_after || [])[0];
      const leadCap = ba && plats[0] && fix(ba.after_photo) === fix(plats[0].photo) ? "The Colt that started it. A Competition .38 Super, tuned until it ran and shot true." : (plats[0] || {}).name;
      const vids = (D.videos || []).filter((v) => v.show_on_home).slice(0, 3);
      const h0 = (A.heritage || [])[0] || {}, h1 = (A.heritage || [])[1] || {};
      const iosRows = (C.ios_prices || []).filter((r) => /\$/.test(r.price)).slice(0, 3);
      const counter = korth.length ? `
  <article class="story counter">
    <p class="kick">On the Counter</p><h2>Korth Revolvers, In Stock</h2>
    <div class="goods two">${korth.map((f) => good({ name: f.name, detail: f.details, price: f.price, status: f.status, photo: f.photo, href: "firearms.html#" + slug(f.brand) })).join("")}</div>
    <p>Pick your firearm, choose a local FFL at checkout and it ships to them. You fill out the paperwork and take it home.</p>
    ${more("Everything in the case", "firearms.html")}
  </article>` : "";
      return `<div class="sheet">
${KIT ? `<section class="kit-mast"><div class="km-top"><span>Custom 1911 and 2011 pistols</span><span class="dateline"></span><span>Build queue <b class="tw">${wait}</b></span></div>
  <p class="km-name"><span class="the">The</span> Tombstone Gunsmith</p>
  <div class="km-bot"><span>Est. Tombstone, Arizona, circa ${esc(S.roots_year || 1956)}</span><span>Authorized Nighthawk Custom and Korth dealer</span></div></section>` : ""}
<section class="front">
  <article class="lead">
    <p class="kick">The Custom Shop</p>
    <h1>Custom 1911s and 2011s, Built Start to Finish at One Bench</h1>
    <p class="deck">One pistol, one gunsmith. Built to your spec by ${esc(S.owner)} in ${esc(S.city === "Roswell" ? "Roswell, New Mexico" : [S.city, S.state].filter(Boolean).join(", "))}, and test fired before it ships.</p>
    <div class="lead-body">
      ${plate((plats[0] || {}).photo, (plats[0] || {}).name + " photo", leadCap, "", true, true)}
      <div class="specs">${plats.slice(0, 2).map((p) => spec(p)).join("")}
        <div class="cta-row">${stamp("Request a Quote", "custom-shop.html#quote")}<span class="tw wait">Queue: ${wait}</span></div></div>
    </div>
    ${steps}
  </article>
  <aside class="rail" aria-label="Authorized dealer">
    <div class="notice notice-dealer"><p class="n-small">Authorized Dealer</p><p class="n-head">Nighthawk Custom<br>and Korth</p><p class="n-rule" aria-hidden="true"></p>
      ${plate(H.brand_photo, "Korth revolver beside the Tombstone Gunsmith logo")}
      <p class="n-body">Hand built Nighthawk Custom pistols and Korth revolvers, in stock and on order.</p>${stamp("See the Case", "firearms.html")}</div>
    <div class="notice notice-plain"><p class="n-small">Telephone the Shop</p><p class="n-phone"><a href="${esc(tel(S.phone))}">${esc(S.phone)}</a></p><p class="n-small">${esc(S.street)}, ${esc(S.city)}</p><p class="n-small">${esc(S.hours)}</p></div>
  </aside>
</section>
${KIT ? `<section class="kit-counter"><p class="kick">On the Counter</p><h2>In the Case Now</h2>${note("Collection", " with 4 featured products")}</section>` : ""}
<section class="fold${KIT || !counter ? " two" : ""}">
  ${KIT ? "" : counter}
  <article class="story ledger">
    <p class="kick">Shop Work</p><h2>Flat Rate, Posted Prices</h2><p>You know the number before the gun goes on the bench.</p>
    <table class="tw prices"><caption class="vh">Sample gunsmithing prices</caption><tbody>${ledger.map((s) => `<tr><th scope="row">${esc(s.name)}</th><td>${esc(s.price)}</td></tr>`).join("")}</tbody></table>
    ${more("The full price list", "gunsmithing.html")}
  </article>
  <article class="story ios">
    <p class="kick">Optics</p><h2>The Nighthawk IOS</h2><p>${esc(sentences(C.ios_text).slice(0, 2).join(" ").trim() || C.ios_text)}</p>
    <dl class="tw">${iosRows.map((r) => `<div><dt>${esc(r.item.replace(/^IOS /, "").replace(/^on a /, "On a ").replace(/^retrofit.*/, "Retrofit"))}</dt><dd>${esc(r.price)}</dd></div>`).join("")}</dl>
    <p class="small">Retrofits fit existing 1911 and 2011 slides with a Novak style rear sight cut.${(C.ios_prices || []).find((r) => /footprint/i.test(r.item)) ? ` Plates for ${esc((C.ios_prices || []).find((r) => /footprint/i.test(r.item)).price)}.` : ""}</p>
    ${more("IOS details", "custom-shop.html#ios")}
  </article>
</section>
${src(H.heritage_photo) ? `<section class="heritage">
  <figure class="plate truck"><div class="develop">${img(H.heritage_photo, h0.caption || "The original Tombstone Gunsmith shop truck")}</div><figcaption>${cutline(h0.caption)}</figcaption></figure>
  <div class="h-text"><p class="kick">Third Generation</p><h2>The Name on the Truck Is Back at the Bench</h2>
    <p class="drop">${esc(H.heritage_text)}</p><p>It runs on faith, family and the same name Harold painted on his truck.</p>${more("The whole story", "about.html")}</div>
  ${plate(H.heritage_photo_2, h1.caption || "The original Tombstone Gunsmith", h1.caption, "store", false)}
</section>` : ""}
${KIT ? `<section class="vsec" data-tsg-vsec><p class="kick">Builds and Reviews</p><h2>From the Bench, on Film</h2><div class="tsg-videos vgrid"><p>Paste up to 3 YouTube links here, one per line.</p></div></section>`
    : vids.length ? `<section class="vsec"><p class="kick">Builds and Reviews</p><h2>From the Bench, on Film</h2><div class="vgrid">${vids.map(vcard).join("")}</div>${more("All videos", "videos.html")}</section>` : ""}
<section class="classifieds" aria-label="Notices">
  <div class="ad"><p class="ad-h">Available Now</p><p>Finished Tombstone builds, ready to ship to your FFL. One of each, and when it sells it is gone.</p><a href="available.html">Finished builds${ARR}</a></div>
  <div class="ad ad-store"><p class="ad-h">The General Store</p><p>Handguns, rifles, shotguns, ammunition and accessories from the full distributor catalog.</p><a href="shop.html">Browse the store${ARR}</a></div>
  <div class="ad ad-gear"><p class="ad-h">Tombstone Gear</p><p>Hats, shirts, patches and leather with the Tombstone name on them. Ships to your door.</p><a href="gear.html">See the gear${ARR}</a></div>
  <div class="ad ad-sub"><p class="ad-h">Subscribe</p><p>Finished builds go to subscribers before they go on the site.</p>
    <form data-form="Newsletter" class="tsform"><label class="vh" for="sub-email">Email address</label><input id="sub-email" type="email" name="email" required placeholder="you@example.com"><button type="submit">Sign up</button></form>
    <div class="done">You're on the list. Check your inbox for a welcome email.</div><div class="err">Something went wrong. Please call ${esc(S.phone)}.</div></div>
</section>
</div>`;
    };

    P["custom-shop"] = () => {
      const groups = [...new Set((C.options || []).map((o) => o.group))];
      const ios = C.ios_prices || [];
      return `<div class="sheet">${phead({ kick: "The Custom Shop", title: "Built One at a Time", deck: "Custom 1911 and 2011 pistols built one at a time. Pick your platform, spec it out and we will quote it.", photo: C.banner_photo, alt: "Custom 1911 build", crumbs: ["Custom Shop"], extra: stamp("Request a Quote", "#quote") + stamp("Available Now", "available.html", "line") })}
<section class="band" id="platforms">
  <div class="band-h"><p class="kick">Pick Your Platform</p><h2>1911 or 2011</h2></div>
  <div class="plats">${(C.platforms || []).map((p) => `<article class="plat">${plate(p.photo, p.name + " photo")}${spec(p, true)}<div class="cta-row">${stamp("Quote This Build", "#quote")}</div></article>`).join("")}</div>
</section>
<section class="band"><div class="band-h"><p class="kick">Start to Finish</p><h2>How a Build Works</h2></div>${steps}</section>
<section class="band" id="options">
  <div class="band-h"><p class="kick">The Price Sheet</p><h2>Options</h2></div>
  <div class="ledger-cols">${groups.map((g) => `<table class="tw prices sheet-t"><caption>${esc(g)}</caption><tbody>${C.options.filter((o) => o.group === g).map((o) => `<tr><th scope="row"><b>${esc(o.option)}</b><small>${esc(o.choices)}</small></th><td>${esc(o.price)}</td></tr>`).join("")}</tbody></table>`).join("")}</div>
</section>
<section class="band ios-band" id="ios">
  <div class="ios-text"><p class="kick">IOS Optic System</p><h2>Iron Sights or Red Dot. Same Slide.</h2><p class="drop">${esc(C.ios_text)}</p></div>
  <div class="ios-side">${plate(C.ios_photo, "IOS optic system photo")}
    <dl class="tw">${ios.map((r) => `<div><dt>${esc(r.item)}</dt><dd>${esc(r.price)}</dd></div>`).join("")}</dl>${stamp("Quote an IOS Install", "#quote")}</div>
</section>
<section class="band quote" id="quote">
  <div class="q-side"><p class="kick">Request a Quote</p><h2>Tell Us About Your Build</h2>
    <p>We reply within two business days with a written spec or a few questions. Nothing is owed until you place a deposit.</p>${queueBox(true)}</div>
  ${coupon("Quote Request", "", "Quote Request",
      field("Name", '<input name="name" required autocomplete="name">') + field("Email", '<input name="email" type="email" required autocomplete="email">') + field("Phone", '<input name="phone" type="tel" autocomplete="tel">') +
      field("Platform", `<select name="platform">${opts(["Custom 1911", "Custom 2011", "IOS retrofit", "Not sure yet"])}</select>`) +
      field("Caliber", `<select name="caliber">${opts([".45 ACP", "9mm", "10mm", ".38 Super", ".40 S&amp;W"])}</select>`) +
      field("Budget", `<select name="budget">${opts(["Under $3,000", "$3,000 to $5,000", "$5,000 to $8,000", "$8,000 and up"])}</select>`) +
      field("Primary use", `<select name="use">${opts(["Carry", "Competition", "Collection", "Duty"])}</select>`, true) +
      field("Describe your build", '<textarea name="details" placeholder="Finish, sights, grips, anything you have seen and liked"></textarea>', true) +
      '<label class="chk full"><input type="checkbox" name="waitlist" value="yes" checked> Add me to the waitlist and newsletter</label>',
      "Send Quote Request", "Request received. Expect a reply within two business days.")}
</section></div>`;
    };

    P.available = () => `<div class="sheet">${phead({ kick: "Available Now", title: "Finished Builds, Ready to Ship", deck: "Finished one of a kind builds in stock. Buy today, ships to your FFL this week.", photo: av[0]?.photos?.[0], alt: av[0]?.name, crumbs: [crumbLink("Custom Shop", "custom-shop.html"), "Available Now"] })}
<section class="band">
  <div class="legend"><p><b class="g-flag">Ready to Ship</b> Finished and on the shelf.</p><p><b class="g-flag navy">Made to Order</b> Built after you order. Current wait ${wait}.</p></div>
  ${KIT ? note("Collection", " set to your Available Now collection") : `<div class="goods">${av.map(availGood).join("")}${good({ name: "Build Your Own", brand: "Tombstone Custom", detail: "Made to order 1911 or 2011", photo: H.tile_custom, price: "From " + ((C.platforms || [])[0]?.starting_price || ""), href: "custom-shop.html", flag: "Made to Order", cta: "Start a Build" })}</div>`}
</section>${subscribe}</div>`;

    P.product = () => {
      const a = av.find((x) => slug(x.id || x.name) === location.hash.slice(1)) || av[0];
      if (!a) return `<div class="sheet">${phead({ kick: "Available Now", title: "That Build Has Gone Home", deck: "It may have sold. Here is what is on the shelf now.", crumbs: [crumbLink("Available Now", "available.html")], extra: stamp("See What's Available", "available.html") })}</div>`;
      document.title = a.name + " | " + S.business_name;
      const photos = (a.photos || []).filter((p) => src(p));
      return `<div class="sheet"><section class="pdp">
  <div class="pd-ph"><div id="pdmain">${plate(photos[0], a.name + " photo 1", "", "main", true, true)}</div>
    ${photos.length > 1 ? `<div class="thumbs">${photos.map((p, i) => `<button type="button" data-i="${i}" aria-label="Photo ${i + 1}">${img(p, "")}</button>`).join("")}</div>` : ""}</div>
  <div class="pd-text">
    <p class="crumb"><a href="index.html">Front Page</a> / <a href="available.html">Available Now</a> / ${esc(a.name)}</p>
    <p class="g-flag${a.sold ? " sold" : ""}">${a.sold ? "Sold" : "Ready to Ship"}</p>
    <h1>${esc(a.name)}</h1><p class="price tw">${esc(a.price)}</p><p class="deck">${esc(a.description)}</p>
    <dl class="tw">${(a.specs || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("")}</dl>
    <p class="ffl"><b>FFL required.</b> We ship to your local FFL dealer. You pick it up after the background check.</p>
    <div class="cta-row">${a.sold ? stamp("See What's Available", "available.html") : stamp("Call to Buy " + S.phone, tel(S.phone)) + stamp("Email About This Gun", "mailto:" + S.email + "?subject=" + encodeURIComponent(a.name), "line")}</div>
  </div>
</section></div>`;
    };

    P.gunsmithing = () => {
      const Sv = D.services || {}, items = Sv.items || [];
      const cats = [...new Set(items.map((i) => i.category))];
      return `<div class="sheet">${phead({ kick: "Gunsmithing", title: "Flat Rate Shop Work", deck: "Flat rate pricing on common work. Everything else is hourly with an estimate before we start.", photo: Sv.banner_photo, alt: "Colt 1911 before shop work", crumbs: ["Gunsmithing"], extra: stamp("Schedule a Drop Off", "contact.html") })}
<section class="band">
  <div class="rate"><p class="rate-n">${esc(S.hourly_rate)}<span>an hour</span></p><p>Shop rate for work outside the menu. One hour minimum on diagnostics. We call with an estimate before going further. Parts billed at retail.</p></div>
  <div class="band-h"><p class="kick">The Price List</p><h2>Posted Prices</h2></div>
  <div class="ledger-cols">${cats.map((c) => `<table class="tw prices sheet-t"><caption>${esc(c)}</caption><tbody>${items.filter((i) => i.category === c).map((s) => `<tr><th scope="row"><b>${esc(s.name)}</b><small>${esc(s.details)}</small><small class="meta">${esc(s.platform)} &middot; ${esc(s.turnaround)}</small></th><td>${esc(s.price)}</td></tr>`).join("")}</tbody></table>`).join("")}</div>
  <p class="small after">Shipping a firearm in for service? Call ${esc(S.phone)} first for FFL shipping instructions.</p>
</section>${particulars}</div>`;
    };

    P.firearms = () => {
      const F = D.firearms || [];
      const brands = [...new Set(["Nighthawk Custom", "Korth", ...F.map((f) => f.brand)])].filter((b) => F.some((f) => f.brand === b));
      return `<div class="sheet">${phead({ kick: "Authorized Dealer", title: "Nighthawk Custom and Korth", deck: "Hand built Nighthawk Custom pistols and Korth revolvers, in stock and on order.", photo: H.brand_photo, alt: "Korth revolver beside the Tombstone Gunsmith logo", crumbs: ["Firearms"], extra: stamp("Ask About Allocations", tel(S.phone)) + stamp("Shop All Brands", sl(""), "line") })}
${KIT ? `<section class="band">${note("Collection", " for Nighthawk Custom and Korth")}</section>`
    : brands.length ? brands.map((b) => `<section class="band" id="${slug(b)}"><div class="band-h"><p class="kick">In the Case</p><h2>${esc(b)}</h2></div>
  <div class="goods">${F.filter((f) => f.brand === b).map((f) => good({ name: f.name, detail: f.details, price: f.price, status: f.status, photo: f.photo, href: tel(S.phone), cta: "Call " + S.phone })).join("")}</div></section>`).join("") : `<section class="band">${empty}</section>`}
<section class="band center"><p>Call for what is in stock and what is on order.</p>${stamp("Call " + S.phone, tel(S.phone))}</section></div>`;
    };

    P.shop = () => {
      const I = "images/uploads/";
      const cats = [["Custom Guns", "/catalog/custom-guns", H.tile_custom || ""], ["Handguns", "/catalog/handguns", I + "cat-handguns.jpg"], ["Rifles", "/catalog/rifles", I + "cat-rifles.jpg"], ["Shotguns", "/catalog/shotguns", I + "cat-shotguns.jpg"], ["Ammo", "/catalog/ammo", I + "cat-ammo.jpg"], ["Accessories", "/catalog/accessories", I + "cat-accessories.jpg"]];
      return `<div class="sheet">${phead({ kick: "The General Store", title: "Online Store", deck: "Thousands of firearms, optics and parts with live stock and pricing from our distributor. Firearms ship to your FFL. Everything else ships to your door.", crumbs: ["Store"], extra: stamp("Browse Departments", "#cats") + stamp("Tombstone Gear", "gear.html", "line") })}
<section class="band" id="cats"><div class="band-h"><p class="kick">Departments</p><h2>Shop by Category</h2></div>
  <div class="depts">${cats.map(([t, p, ph]) => `<a class="dept" href="${esc(sl(p))}">${img(ph, t + " category photo", "ink")}<span class="d-name">${t}</span><span class="g-cta">Browse${ARR}</span></a>`).join("")}</div></section>
<section class="band split">
  <article><p class="kick">How It Works</p><h2>Buying a Gun Online</h2><p class="drop">Pick your firearm and choose a local FFL dealer at checkout. It ships to them, you fill out the paperwork and take it home. Optics, parts and gear ship straight to you.</p></article>
  <div class="notice notice-plain"><p class="n-small">Particulars</p><p class="n-rule" aria-hidden="true"></p><p>Stock and prices come straight from our distributor and change during the day.</p><p>Most orders leave in 1 to 3 business days.</p><p>Questions about an order? Call <a href="${esc(tel(S.phone))}">${esc(S.phone)}</a>.</p></div>
</section></div>`;
    };

    P.gear = () => `<div class="sheet">${phead({ kick: "Tombstone Gear", title: "Hats, Shirts, Patches and Leather", deck: "Gear with the Tombstone name on it. Ships to your door.", photo: (D.gear || [])[0]?.photo, crumbs: [crumbLink("Store", "shop.html"), "Tombstone Gear"] })}
<section class="band">${KIT ? note("Collection", " set to your Tombstone Gear collection") : (D.gear || []).length ? `<div class="goods">${D.gear.map((g) => good({ name: g.name, brand: "Tombstone Gear", detail: g.details, price: g.price, photo: g.photo, href: g.buy_link || "contact.html", ext: !!g.buy_link, cta: g.buy_link ? "Buy Now" : "Ask About It" })).join("")}</div>` : empty}</section>${subscribe}</div>`;

    P.gallery = () => {
      const G = D.gallery || [];
      return `<div class="sheet">${phead({ kick: "Project Gallery", title: "Builds That Went Home", deck: "Completed builds that went home with their owners.", crumbs: [crumbLink("Custom Shop", "custom-shop.html"), "Gallery"], extra: stamp("Start Your Build", "custom-shop.html#quote") })}
<section class="band">${KIT ? "" : '<div class="tabs" id="galtabs"></div>'}${G.length ? `<div class="masonry" id="galgrid">${galleryFigs(G, G)}</div>` : empty}</section></div>`;
    };
    const galleryFigs = (list, all) => list.map((g) => `<figure class="plate"><a href="#" data-lb="${all.indexOf(g)}">${img(g.photo, g.name + " photo", "ink")}</a><figcaption><b>${esc(g.name)}.</b> ${esc(g.notes)}</figcaption></figure>`).join("");

    P.videos = () => {
      const socials = [["YouTube", S.youtube], ["Instagram", S.instagram], ["TikTok", S.tiktok], ["Facebook", S.facebook]].filter(([, u]) => u).map(([t, u]) => stamp(t, u, "line", true)).join("");
      return `<div class="sheet">${phead({ kick: "Videos", title: "Builds, Reviews and Shop Tips", deck: "Builds, reviews and shop tips from our channels.", crumbs: ["Videos"], extra: socials })}
<section class="band">${KIT ? '<div class="tsg-videos vgrid"><p>Paste YouTube links here, one per line. Each one turns into a player.</p></div>'
    : `<div class="tabs" id="vtabs"></div>${(D.videos || []).length ? `<div class="vgrid" id="vgrid"></div>` : empty}`}</section></div>`;
    };

    P.about = () => {
      const paras = String(A.story || "").split(/\n\s*\n/).filter(Boolean);
      const h0 = (A.heritage || [])[0] || {};
      return `<div class="sheet">${phead({ kick: "Our Story", title: A.headline || "About", deck: A.intro, photo: A.banner_photo, alt: h0.caption || "The original shop truck", cap: fix(A.banner_photo) === fix(h0.photo) ? h0.caption : "", develop: true, crumbs: ["Our Story"] })}
<section class="band story-band">
  <div class="prose">${paras.map((p, i) => `<p${i === 0 ? ' class="drop"' : ""}>${esc(p)}</p>`).join("")}<p class="sig">${esc(S.owner)}, ${esc(S.legal_name)}</p></div>
  ${plate(A.story_photo, "Shop history photo", ((A.heritage || []).find((h) => fix(h.photo) === fix(A.story_photo)) || {}).caption, "", false)}
</section>
${(A.heritage || []).length ? `<section class="band"><div class="band-h"><p class="kick">From the Family Album</p><h2>Where It Started</h2></div>
  <div class="archive">${A.heritage.map((h, i) => `<figure class="plate"><a href="#" data-lb="${i}">${img(h.photo, h.caption || "Archive photo")}</a><figcaption>${cutline(h.caption)}</figcaption></figure>`).join("")}</div></section>` : ""}
${(A.before_after || []).map((b) => `<section class="band ba-band">
  <div class="ba" data-ba>${src(b.before_photo) ? `<div class="ph">${img(b.before_photo, "Before photo")}</div>` : slotHTML("Before photo")}<div class="ph after">${img(b.after_photo, "After photo")}</div><span class="lb l">Before</span><span class="lb r">After</span><div class="knob"></div></div>
  <div><p class="kick">Before and After</p><h2>${esc(b.title)}</h2><p>${esc(b.text)}</p><p class="small">Drag the slider to compare.</p></div>
</section>`).join("")}
<section class="band"><div class="band-h"><p class="kick">Acknowledgments</p><h2>Special Thanks</h2></div>
  <div class="thanks">${(A.thanks || []).map((t) => `<div class="notice"><p class="n-small">${esc(t.role)}</p><p class="n-head">${esc(t.name)}</p><p class="n-rule" aria-hidden="true"></p><p class="n-body">${esc(t.text)}</p>${t.link ? `<a class="cont-a" href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener">Visit ${esc(t.name)}${ARR}</a>` : ""}</div>`).join("")}</div></section></div>`;
    };

    P.contact = () => `<div class="sheet">${phead({ kick: "Contact", title: "Write or Call the Shop", deck: "Questions, quotes or service drop offs. We answer every message.", crumbs: ["Contact"] })}
<section class="band quote">
  <div class="q-side">
    <table class="tw prices contact-t"><tbody>
      <tr><th scope="row">Phone</th><td><a href="${esc(tel(S.phone))}">${esc(S.phone)}</a></td></tr>
      <tr><th scope="row">Email</th><td><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></td></tr>
      ${addr ? `<tr><th scope="row">Shop</th><td>${esc(addr)}</td></tr>` : ""}${S.hours ? `<tr><th scope="row">Hours</th><td>${esc(S.hours)}</td></tr>` : ""}${S.ffl_number ? `<tr><th scope="row">FFL</th><td>${esc(S.ffl_number)}</td></tr>` : ""}
    </tbody></table>${queueBox(false)}</div>
  ${coupon("Send a Message", "", "Contact",
      field("Name", '<input name="name" required autocomplete="name">') + field("Email", '<input name="email" type="email" required autocomplete="email">') + field("Phone", '<input name="phone" type="tel" autocomplete="tel">') +
      field("Topic", `<select name="topic">${opts(["Gunsmithing service", "Custom build", "Firearm purchase", "Order question", "Other"])}</select>`) +
      field("Message", '<textarea name="message" required></textarea>', true),
      "Send Message", "Message received. We will reply within one business day.")}
</section></div>`;

    $("#main").innerHTML = (P[PAGE] || P.home)();

    /* ---------- page wiring ---------- */
    const tabs = (id, items, key, render) => {
      const el = $("#" + id); if (!el) return;
      const cats = ["All", ...new Set(items.map((i) => i[key]).filter(Boolean))];
      if (cats.length <= 2) { el.remove(); render(items); return; }
      el.innerHTML = `<span class="n-small">Filed under</span>` + cats.map((c) => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("");
      const pick = (c) => { $$("button", el).forEach((b) => b.setAttribute("aria-pressed", b.dataset.c === c)); render(c === "All" ? items : items.filter((i) => i[key] === c)); };
      el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pick(b.dataset.c); });
      pick("All");
    };
    if (PAGE === "videos" && !KIT) tabs("vtabs", D.videos || [], "category", (l) => { const g = $("#vgrid"); if (g) g.innerHTML = l.map(vcard).join(""); });
    if (PAGE === "gallery") {
      const G = D.gallery || [];
      if (!KIT) tabs("galtabs", G, "type", (l) => { const g = $("#galgrid"); if (g) g.innerHTML = galleryFigs(l, G); });
      lightbox(G.map((g) => [src(g.photo), g.name + (g.notes ? ". " + g.notes : "")]));
    }
    if (PAGE === "about") lightbox((A.heritage || []).map((h) => [src(h.photo), h.caption]));
    if (PAGE === "product") {
      const a = av.find((x) => slug(x.id || x.name) === location.hash.slice(1)) || av[0];
      $$(".thumbs [data-i]").forEach((t) => t.addEventListener("click", () => { $("#pdmain").innerHTML = plate(a.photos[+t.dataset.i], a.name + " photo", "", "main", true); }));
      addEventListener("hashchange", () => location.reload());
    }
    wire(S);
  }

  /* ---------- interactions ---------- */
  function lightbox(items) {
    const lb = $("#lb"); let i = 0;
    const show = (n) => { i = (n + items.length) % items.length; const [s, cap] = items[i]; $("#lbph").innerHTML = s ? `<img src="${esc(s)}" alt="${esc(cap)}">` : ""; $("#lbcap").textContent = cap; };
    document.addEventListener("click", (e) => { const a = e.target.closest("[data-lb]"); if (!a) return; e.preventDefault(); show(+a.dataset.lb); lb.classList.add("open"); $(".x", lb).focus(); });
    $(".x", lb).onclick = () => lb.classList.remove("open");
    $(".pv", lb).onclick = () => show(i - 1);
    $(".nx", lb).onclick = () => show(i + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", (e) => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") lb.classList.remove("open"); if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
  }

  function wire(S) {
    // Dated masthead, printed the way a paper would
    const d = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $$(".dateline").forEach((l) => (l.textContent = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()));

    // The one motion moment: the truck photo develops once it has loaded and is on screen
    $$(".develop").forEach((box) => {
      const im = $("img", box); if (!im) return;
      let loaded = im.complete && im.naturalWidth > 0, seen = false;
      const go = () => { if (loaded && seen) requestAnimationFrame(() => box.classList.add("on")); };
      if (!loaded) { im.addEventListener("load", () => { loaded = true; go(); }); im.addEventListener("error", () => { loaded = true; go(); }); }
      if (!("IntersectionObserver" in window)) { seen = true; go(); return; }
      const io = new IntersectionObserver((ents) => { if (ents[0].isIntersecting) { seen = true; io.disconnect(); go(); } }, { threshold: 0.35 });
      io.observe(box);
    });

    // videos: YouTube plays inline, others open on their platform
    document.addEventListener("click", (e) => {
      const v = e.target.closest(".vc"); if (!v) return;
      if (v.dataset.yt) { $(".ph", v).insertAdjacentHTML("beforeend", `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>`); v.removeAttribute("data-yt"); }
      else if (v.dataset.href && /^https:\/\//i.test(v.dataset.href)) window.open(v.dataset.href, "_blank", "noopener,noreferrer");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.classList?.contains("vc")) e.target.click(); });

    // before and after drag
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

    // age gate, same storage key as the current site so a visitor only answers once
    const gate = $("#gate");
    let ok = false; try { ok = localStorage.getItem("tsg21") === "1"; } catch (e) {}
    if (!ok && !window.__TSG_KIT) {
      gate.hidden = false; document.body.classList.add("gated");
      const yes = $("#gate-yes"), no = $("#gate-no");
      yes.focus();
      yes.onclick = () => { gate.hidden = true; document.body.classList.remove("gated"); try { localStorage.setItem("tsg21", "1"); } catch (e) {} };
      no.onclick = () => { $("#gate-msg").textContent = "Sorry, you must be 21 or older to enter this site."; };
      gate.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === yes) { e.preventDefault(); no.focus(); }
        else if (!e.shiftKey && document.activeElement === no) { e.preventDefault(); yes.focus(); }
      });
    }

    // local business schema for Google
    const addrSchema = S.city ? { "@type": "PostalAddress", streetAddress: S.street, addressLocality: S.city, addressRegion: S.state, postalCode: S.zip, addressCountry: "US" } : undefined;
    const ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Store", name: S.business_name, legalName: S.legal_name, telephone: S.phone, email: S.email, url: location.origin, address: addrSchema, founder: S.owner,
      sameAs: [S.facebook, S.instagram, S.youtube, S.tiktok].filter(Boolean) });
    document.head.appendChild(ld);
  }
})();
