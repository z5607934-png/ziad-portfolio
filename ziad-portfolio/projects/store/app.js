/* MedSupply Store — vanilla JS demo
   live search · category + price + stock filters · sorting · persistent cart drawer */
(function () {
  "use strict";

  var el = function (id) { return document.getElementById(id); };

  var toastBox = el("toast"), toastTimer;
  function toast(msg) {
    toastBox.textContent = msg;
    toastBox.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove("is-shown"); }, 2400);
  }

  function money(n) {
    return "EGP " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  /* ---------------- catalogue ---------------- */
  var CATALOGUE = [
    { id: "bp", name: "Automatic BP monitor (upper arm)", cat: "Devices", mark: "BP", price: 1250, was: 1450, stock: 24, pop: 92, desc: "Clinically validated cuff, stores 2 × 99 readings, irregular heartbeat flag." },
    { id: "oxi", name: "Fingertip pulse oximeter", cat: "Devices", mark: "SpO2", price: 690, stock: 31, pop: 88, desc: "SpO2 and pulse with a two-line OLED. Two AAA batteries included." },
    { id: "thermo", name: "Digital thermometer", cat: "Devices", mark: "T°", price: 210, stock: 60, pop: 70, desc: "Forehead or under-arm, 10-second read, fever beep." },
    { id: "ear", name: "Infrared ear thermometer", cat: "Devices", mark: "IR", price: 540, was: 620, stock: 12, pop: 64, desc: "1 mm probe tip, 40 readings memory, paediatric mode." },
    { id: "neb", name: "Compressor nebulizer kit", cat: "Devices", mark: "NB", price: 850, stock: 8, pop: 75, desc: "Quiet compressor with mask, mouthpiece and 5 spare filters." },
    { id: "o2", name: "Oxygen concentrator 5 L/min", cat: "Devices", mark: "O2", price: 9500, stock: 0, pop: 40, desc: "Continuous flow, nebuliser port, 8 dB above idle. Backorder." },
    { id: "glu", name: "Glucose meter + 25 strips", cat: "Diagnostics", mark: "Glu", price: 780, was: 950, stock: 18, pop: 81, desc: "0.5 µL sample, 5-second result, fasting and post-meal tags." },
    { id: "strips", name: "Test strips (refill, 50 pcs)", cat: "Diagnostics", mark: "Strip", price: 320, stock: 44, pop: 77, desc: "Fits the MedSupply glucometer, 24-month shelf life." },
    { id: "ecg", name: "ECG snap electrodes (100)", cat: "Diagnostics", mark: "ECG", price: 240, stock: 26, pop: 52, desc: "Ag/AgCL gel, adult size, compatible with 3 and 5-lead cables." },
    { id: "syr", name: "Insulin syringes 1 mL (box 100)", cat: "Consumables", mark: "1 mL", price: 190, stock: 120, pop: 66, desc: "Ultra-thin wall needle, 31G, individually blister-packed." },
    { id: "gauze", name: "Sterile gauze pads 10 × 10 (50)", cat: "Consumables", mark: "Gz", price: 95, stock: 200, pop: 59, desc: "12-ply woven, EO sterilised, individually wrapped." },
    { id: "band", name: "Adhesive bandages assortment (80)", cat: "Consumables", mark: "Ab", price: 65, stock: 150, pop: 48, desc: "Fabric, waterproof and knuckle sizes in one tin." },
    { id: "wipe", name: "Alcohol prep wipes (200)", cat: "Consumables", mark: "70%", price: 85, stock: 90, pop: 44, desc: "70% isopropyl, snap-shut lid so they never dry out." },
    { id: "press", name: "Compression bandage roll", cat: "Consumables", mark: "Cmp", price: 130, stock: 0, pop: 35, desc: "Non-latex, 10 cm × 4.5 m, holds for varicose and sprain care." },
    { id: "mask", name: "Surgical masks type IIR (box 50)", cat: "Protection", mark: "IIR", price: 120, stock: 300, pop: 73, desc: "Three layers, 40 µm splash resistance, ear-loop or tie." },
    { id: "glove", name: "Nitrile gloves (box 100)", cat: "Protection", mark: "Ntr", price: 280, stock: 88, pop: 85, desc: "Powder-free, 140 mm, textured fingertips. Sizes S–XL." },
    { id: "chair", name: "Lightweight folding wheelchair", cat: "Home care", mark: "WC", price: 4200, was: 4650, stock: 5, pop: 61, desc: "Aluminium frame, 12 kg, swing-away footrests, anti-tip bars." },
    { id: "cot", name: "Folding ambulance stretcher", cat: "Home care", mark: "Str", price: 1750, stock: 3, pop: 37, desc: "Aluminium with wheels, folds to 90 cm, 160 kg load." }
  ];

  var CATS = ["Devices", "Diagnostics", "Consumables", "Protection", "Home care"];
  var MAX_PRICE = 9500, FREE_SHIP_FROM = 1500, SHIP = 45, VAT = 0.14;

  /* ---------------- filter state ---------------- */
  var filters = { q: "", cat: "all", max: MAX_PRICE, inStock: false, promo: false, sort: "pop" };

  var catsBox = el("cats");
  ["all"].concat(CATS).forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "cat"; b.dataset.cat = c;
    b.setAttribute("aria-pressed", String(c === "all"));
    b.textContent = c === "all" ? "All" : c;
    catsBox.appendChild(b);
  });

  function visible() {
    var q = filters.q.toLowerCase();
    var list = CATALOGUE.filter(function (p) {
      if (filters.cat !== "all" && p.cat !== filters.cat) return false;
      if (p.price > filters.max) return false;
      if (filters.inStock && p.stock === 0) return false;
      if (filters.promo && !p.was) return false;
      if (q && (p.name + " " + p.cat + " " + p.desc).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    list.sort(function (a, b) {
      if (filters.sort === "low") return a.price - b.price;
      if (filters.sort === "high") return b.price - a.price;
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      return b.pop - a.pop;
    });
    return list;
  }

  var grid = el("grid");

  function renderGrid() {
    var list = visible();
    grid.innerHTML = "";

    el("resultCount").innerHTML = "<b>" + list.length + "</b> product" + (list.length === 1 ? "" : "s") +
      " match" + (list.length === 1 ? "es" : "") + " your filters";

    var out = CATALOGUE.filter(function (p) { return p.stock === 0; }).length;
    el("stockNote").textContent = out ? out + " items are on backorder." : "Everything listed is in stock.";

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "grid-empty";
      empty.textContent = "Nothing matches that combination. Raise the price cap or reset the filters.";
      grid.appendChild(empty);
      return;
    }

    list.forEach(function (p) {
      var qty = cart[p.id] || 0;
      var card = document.createElement("article");
      card.className = "prod" + (p.stock === 0 ? " is-out" : "");

      var pic = document.createElement("div");
      pic.className = "prod__pic"; pic.textContent = p.mark;

      var tags = document.createElement("div");
      tags.className = "prod__tags";
      var t1 = document.createElement("i"); t1.textContent = p.cat; tags.appendChild(t1);
      if (p.was) { var t2 = document.createElement("i"); t2.className = "sale"; t2.textContent = "-" + Math.round((1 - p.price / p.was) * 100) + "%"; tags.appendChild(t2); }
      if (p.stock === 0) { var t3 = document.createElement("i"); t3.className = "out"; t3.textContent = "backorder"; tags.appendChild(t3); }
      else if (p.stock < 10) { var t4 = document.createElement("i"); t4.textContent = "only " + p.stock + " left"; tags.appendChild(t4); }

      var h = document.createElement("h3"); h.textContent = p.name;
      var d = document.createElement("p"); d.className = "prod__desc"; d.textContent = p.desc;

      var row = document.createElement("div");
      row.className = "prod__row";
      var price = document.createElement("div");
      price.className = "price";
      var b = document.createElement("b"); b.textContent = money(p.price);
      price.appendChild(b);
      if (p.was) { var s = document.createElement("s"); s.textContent = money(p.was); price.appendChild(s); }
      var unit = document.createElement("small");
      unit.textContent = p.stock === 0 ? "price on restock" : p.stock + " in stock";
      price.appendChild(unit);

      var action = document.createElement("div");
      if (p.stock === 0) {
        var dis = document.createElement("button");
        dis.type = "button"; dis.className = "add"; dis.disabled = true; dis.textContent = "Notify me";
        action.appendChild(dis);
      } else if (qty === 0) {
        var add = document.createElement("button");
        add.type = "button"; add.className = "add";
        add.innerHTML = "+ Add";
        add.addEventListener("click", function () { addToCart(p.id, 1); });
        action.appendChild(add);
      } else {
        var step = document.createElement("div");
        step.className = "stepper";
        var minus = document.createElement("button");
        minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", "One less " + p.name);
        minus.addEventListener("click", function () { addToCart(p.id, -1); });
        var num = document.createElement("span"); num.textContent = qty;
        num.setAttribute("aria-label", qty + " in cart");
        var plus = document.createElement("button");
        plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", "One more " + p.name);
        plus.addEventListener("click", function () { addToCart(p.id, 1); });
        step.appendChild(minus); step.appendChild(num); step.appendChild(plus);
        action.appendChild(step);
      }

      row.appendChild(price); row.appendChild(action);
      card.appendChild(pic); card.appendChild(tags); card.appendChild(h); card.appendChild(d); card.appendChild(row);
      grid.appendChild(card);
    });
  }

  /* ---------------- filter wiring ---------------- */
  el("q").addEventListener("input", function () { filters.q = el("q").value.trim(); renderGrid(); });
  catsBox.addEventListener("click", function (event) {
    var btn = event.target.closest(".cat"); if (!btn) return;
    filters.cat = btn.dataset.cat;
    Array.prototype.forEach.call(catsBox.children, function (c) {
      c.setAttribute("aria-pressed", String(c === btn));
    });
    renderGrid();
  });
  el("maxPrice").addEventListener("input", function () {
    filters.max = Number(el("maxPrice").value);
    el("maxPriceOut").textContent = money(filters.max);
    renderGrid();
  });
  el("inStockOnly").addEventListener("change", function () { filters.inStock = el("inStockOnly").checked; renderGrid(); });
  el("promoOnly").addEventListener("change", function () { filters.promo = el("promoOnly").checked; renderGrid(); });
  el("sort").addEventListener("change", function () { filters.sort = el("sort").value; renderGrid(); });
  el("resetBtn").addEventListener("click", function () {
    filters = { q: "", cat: "all", max: MAX_PRICE, inStock: false, promo: false, sort: "pop" };
    el("q").value = ""; el("maxPrice").value = MAX_PRICE; el("maxPriceOut").textContent = money(MAX_PRICE);
    el("inStockOnly").checked = false; el("promoOnly").checked = false; el("sort").value = "pop";
    Array.prototype.forEach.call(catsBox.children, function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.cat === "all"));
    });
    renderGrid();
    toast("Filters reset");
  });

  /* ---------------- cart ---------------- */
  var CART_KEY = "medsupply-cart";
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (err) { cart = {}; }

  function byId(id) {
    for (var i = 0; i < CATALOGUE.length; i++) if (CATALOGUE[i].id === id) return CATALOGUE[i];
    return null;
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) { /* private mode */ }
  }
  function addToCart(id, delta) {
    var p = byId(id); if (!p || p.stock === 0) return;
    var next = (cart[id] || 0) + delta;
    if (next <= 0) delete cart[id];
    else if (next > p.stock) { toast("Only " + p.stock + " left in stock"); cart[id] = p.stock; }
    else cart[id] = next;
    saveCart(); renderAll();
    if (delta > 0 && cart[id] === next) toast(p.name.split(" (")[0] + " added");
  }
  function count() {
    return Object.keys(cart).reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function totals() {
    var sub = 0;
    Object.keys(cart).forEach(function (id) { var p = byId(id); if (p) sub += p.price * cart[id]; });
    var ship = sub === 0 ? 0 : (sub >= FREE_SHIP_FROM ? 0 : SHIP);
    var vat = sub * VAT;
    return { sub: sub, ship: ship, vat: vat, total: sub + ship + vat };
  }

  var body = el("cartBody");

  function renderCart() {
    body.innerHTML = "";
    var ids = Object.keys(cart);
    if (!ids.length) {
      var p = document.createElement("p");
      p.className = "drawer__empty";
      p.textContent = "Your cart is empty. Add something from the catalogue — it stays here even if you reload.";
      body.appendChild(p);
    }
    ids.forEach(function (id) {
      var prod = byId(id); if (!prod) return;
      var line = document.createElement("div");
      line.className = "cart-line";

      var pic = document.createElement("div");
      pic.className = "cart-line__pic"; pic.textContent = prod.mark;

      var mid = document.createElement("div");
      var h = document.createElement("h3"); h.textContent = prod.name;
      var meta = document.createElement("p"); meta.textContent = money(prod.price) + " × " + cart[id];
      mid.appendChild(h); mid.appendChild(meta);

      var end = document.createElement("div");
      end.className = "cart-line__end";
      var step = document.createElement("div");
      step.className = "stepper";
      var minus = document.createElement("button");
      minus.type = "button"; minus.textContent = "−";
      minus.setAttribute("aria-label", "One less " + prod.name);
      minus.addEventListener("click", function () { addToCart(id, -1); });
      var num = document.createElement("span"); num.textContent = cart[id];
      var plus = document.createElement("button");
      plus.type = "button"; plus.textContent = "+";
      plus.setAttribute("aria-label", "One more " + prod.name);
      plus.addEventListener("click", function () { addToCart(id, 1); });
      step.appendChild(minus); step.appendChild(num); step.appendChild(plus);

      var rm = document.createElement("button");
      rm.type = "button"; rm.className = "rm"; rm.textContent = "remove";
      rm.addEventListener("click", function () { delete cart[id]; saveCart(); renderAll(); });

      end.appendChild(step); end.appendChild(rm);
      line.appendChild(pic); line.appendChild(mid); line.appendChild(end);
      body.appendChild(line);
    });

    var t = totals();
    el("sub").textContent = money(t.sub);
    el("ship").textContent = t.ship === 0 && t.sub > 0 ? "free" : money(t.ship);
    el("vat").textContent = money(t.vat);
    el("total").textContent = money(t.total);
    el("cartCount").textContent = count();

    var tip = el("freeTip");
    if (t.sub === 0) tip.textContent = "";
    else if (t.ship > 0) tip.innerHTML = "Add <b>" + money(FREE_SHIP_FROM - t.sub) + "</b> more for free delivery.";
    else tip.innerHTML = "<b>Free delivery</b> unlocked in Cairo and Giza.";
  }

  function renderAll() { renderCart(); renderGrid(); }

  /* ---------------- drawer ---------------- */
  var drawer = el("drawer"), scrim = el("scrim"), openBtn = el("cartOpen");

  function setOpen(open) {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    drawer.inert = !open;
    openBtn.setAttribute("aria-expanded", String(open));
    scrim.hidden = false;
    scrim.classList.toggle("is-on", open);
    if (!open) setTimeout(function () { scrim.hidden = true; }, 260);
    var target = open ? drawer.querySelector("button") : openBtn;
    if (target) setTimeout(function () { target.focus(); }, 0);
  }

  openBtn.addEventListener("click", function () { setOpen(!drawer.classList.contains("is-open")); });
  el("cartClose").addEventListener("click", function () { setOpen(false); });
  scrim.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false);
  });

  el("clearCart").addEventListener("click", function () {
    cart = {}; saveCart(); renderAll(); toast("Cart emptied");
  });

  el("checkout").addEventListener("click", function () {
    var t = totals();
    if (!count()) { toast("Cart is still empty"); return; }
    var ref = "MS-" + String(Date.now()).slice(-6);
    cart = {}; saveCart(); renderAll(); setOpen(false);
    toast("Order " + ref + " placed · " + money(t.total) + " (demo only)");
  });

  drawer.inert = true;

  /* ---------------- mobile nav ---------------- */
  var burger = el("navBurger");
  var menu = document.querySelector(".site-nav nav");
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------- boot ---------------- */
  renderAll();
})();
