/* Nile Care Clinic — vanilla JS demo
   specialty filter · 3-step booking wizard · localStorage visits · FAQ accordion */
(function () {
  "use strict";

  var el = function (id) { return document.getElementById(id); };
  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var toastBox = el("toast"), toastTimer;
  function toast(msg) {
    toastBox.textContent = msg;
    toastBox.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove("is-shown"); }, 2600);
  }

  /* ---------------- data ---------------- */
  var DOCTORS = [
    { id: "hs", name: "Dr. Hala Sabry", spec: "Internal Medicine", ini: "HS", c: "#3ddbd9",
      bio: "Fever workups, diabetes follow-up and hypertension. Writes the plan on paper so you actually read it.",
      fee: 350, days: [6, 0, 1, 2, 3], from: 9, to: 17 },
    { id: "af", name: "Dr. Ahmed Fawzy", spec: "Cardiology", ini: "AF", c: "#ff8787",
      bio: "ECG, Holter reading and post-stent follow-up. 14 years in the cath lab.",
      fee: 600, days: [0, 2, 4], from: 11, to: 19 },
    { id: "me", name: "Dr. Marwa El Sayed", spec: "Paediatrics", ini: "ME", c: "#ffd43b",
      bio: "Newborn visits, vaccination calendars and growth charts. Children get the sticker drawer.",
      fee: 400, days: [6, 1, 3, 4], from: 9, to: 16 },
    { id: "yt", name: "Dr. Youssef Tarek", spec: "Dermatology", ini: "YT", c: "#b197fc",
      bio: "Acne protocols, hair-loss assessment and mole checks with dermoscopy.",
      fee: 450, days: [6, 0, 2], from: 12, to: 20 },
    { id: "na", name: "Dr. Nourhan Ali", spec: "Orthopaedics", ini: "NA", c: "#74c0fc",
      bio: "Sports injuries, knee and shoulder. Reads your own X-rays with you on screen.",
      fee: 500, days: [1, 3, 4], from: 10, to: 18 },
    { id: "ba", name: "Dr. Bassem Adel", spec: "ENT", ini: "BA", c: "#63e6be",
      bio: "Sinus, tonsils and hearing. Endoscope reviews done the same visit.",
      fee: 380, days: [6, 0, 1], from: 9, to: 15 },
    { id: "rm", name: "Dr. Rania Mostafa", spec: "Internal Medicine", ini: "RM", c: "#f783ac",
      bio: "Thyroid, anaemia and chronic fatigue. Late clinic for people on shifts.",
      fee: 320, days: [6, 2, 3, 4], from: 13, to: 20 },
    { id: "ks", name: "Dr. Kareem Shawky", spec: "Paediatrics", ini: "KS", c: "#ffa94d",
      bio: "Allergy and asthma in kids, inhaler technique included in the visit.",
      fee: 420, days: [0, 2, 5], from: 14, to: 19 }
  ];

  var SPECS = DOCTORS.reduce(function (acc, d) {
    if (acc.indexOf(d.spec) === -1) acc.push(d.spec);
    return acc;
  }, []).sort();

  /* ---------------- doctors filter ---------------- */
  var activeSpec = "all";
  var grid = el("docGrid"), count = el("docCount");

  function initialsFilter() {
    var box = el("specChips");
    var all = document.createElement("button");
    all.type = "button"; all.className = "chip"; all.dataset.spec = "all";
    all.setAttribute("aria-pressed", "true"); all.textContent = "All specialties";
    box.appendChild(all);
    SPECS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.dataset.spec = s;
      b.setAttribute("aria-pressed", "false"); b.textContent = s;
      box.appendChild(b);
    });
    box.addEventListener("click", function (event) {
      var btn = event.target.closest(".chip"); if (!btn) return;
      activeSpec = btn.dataset.spec;
      Array.prototype.forEach.call(box.children, function (c) {
        c.setAttribute("aria-pressed", String(c === btn));
      });
      renderDoctors();
    });
  }

  function renderDoctors() {
    var q = el("docSearch").value.trim().toLowerCase();
    var list = DOCTORS.filter(function (d) {
      var okSpec = activeSpec === "all" || d.spec === activeSpec;
      var okText = !q || (d.name + " " + d.spec + " " + d.bio).toLowerCase().indexOf(q) > -1;
      return okSpec && okText;
    });

    grid.innerHTML = "";
    count.textContent = list.length + " of " + DOCTORS.length + " doctors shown";

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "docs-empty";
      empty.textContent = "No doctor matches that. Clear the search or pick another specialty.";
      grid.appendChild(empty);
      return;
    }

    list.forEach(function (d) {
      var card = document.createElement("article");
      card.className = "doc";

      var top = document.createElement("div");
      top.className = "doc__top";
      var av = document.createElement("span");
      av.className = "doc__avatar"; av.style.setProperty("--c", d.c); av.textContent = d.ini;
      var who = document.createElement("div");
      var h = document.createElement("h3"); h.textContent = d.name;
      var sp = document.createElement("p"); sp.className = "doc__spec"; sp.textContent = d.spec;
      who.appendChild(h); who.appendChild(sp);
      top.appendChild(av); top.appendChild(who);

      var bio = document.createElement("p");
      bio.className = "doc__bio"; bio.textContent = d.bio;

      var meta = document.createElement("ul");
      meta.className = "doc__meta";
      [d.days.map(function (n) { return DAY_NAMES[n]; }).join(" · "),
       String(d.from).padStart(2, "0") + ":00 – " + String(d.to).padStart(2, "0") + ":00",
       (d.to - d.from) * 30 + " min clinic"].forEach(function (txt) {
        var li = document.createElement("li"); li.textContent = txt; meta.appendChild(li);
      });

      var foot = document.createElement("div");
      foot.className = "doc__foot";
      var fee = document.createElement("p");
      fee.className = "doc__fee";
      fee.innerHTML = "Consultation <b>" + d.fee + "</b> EGP";
      var bookBtn = document.createElement("button");
      bookBtn.type = "button"; bookBtn.className = "btn btn--primary btn--sm";
      bookBtn.textContent = "Book";
      bookBtn.addEventListener("click", function () { pickFromCard(d); });
      foot.appendChild(fee); foot.appendChild(bookBtn);

      card.appendChild(top); card.appendChild(bio); card.appendChild(meta); card.appendChild(foot);
      grid.appendChild(card);
    });
  }

  function pickFromCard(d) {
    state.dept = d.spec;
    el("wDept").value = d.spec;
    state.doc = d.id;
    state.date = ""; state.time = "";
    renderPicks();
    goStep(2);
    renderDates();
    el("booking").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(d.name + " selected — pick a day");
  }

  el("docSearch").addEventListener("input", renderDoctors);
  initialsFilter();
  renderDoctors();

  /* ---------------- bookings store ---------------- */
  var STORE_KEY = "nilecare-bookings";

  function loadBookings() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (err) { return []; }
  }
  function saveBookings(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (err) { /* private mode */ }
  }
  var bookings = loadBookings();

  function bookedSlot(doctorId, dateKey, time) {
    return bookings.some(function (b) { return b.doc === doctorId && b.date === dateKey && b.time === time; });
  }

  /* deterministic "already taken by someone else" */
  function clinicBusy(doctorId, dateKey, time) {
    var seed = doctorId + "|" + dateKey + "|" + time;
    var h = 0;
    for (var i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) % 100003; }
    return h % 100 < 34;
  }

  /* ---------------- wizard state ---------------- */
  var state = { dept: SPECS[0], doc: "", date: "", time: "", step: 1 };

  var deptSel = el("wDept");
  ["all"].concat(SPECS).forEach(function (s) {
    var o = document.createElement("option");
    o.value = s; o.textContent = s === "all" ? "All specialties" : s;
    deptSel.appendChild(o);
  });
  deptSel.value = state.dept;

  function doctorById(id) {
    for (var i = 0; i < DOCTORS.length; i++) if (DOCTORS[i].id === id) return DOCTORS[i];
    return null;
  }
  function deptDoctors() {
    return DOCTORS.filter(function (d) { return state.dept === "all" || d.spec === state.dept; });
  }

  function renderPicks() {
    var box = el("wDocs");
    box.innerHTML = "";
    deptDoctors().forEach(function (d) {
      var lab = document.createElement("label");
      lab.className = "pick__item" + (state.doc === d.id ? " is-picked" : "");
      var input = document.createElement("input");
      input.type = "radio"; input.name = "doctor"; input.value = d.id;
      input.checked = state.doc === d.id;
      var dot = document.createElement("span"); dot.className = "pick__dot";
      var txt = document.createElement("span");
      var n = document.createElement("span"); n.className = "pick__name"; n.textContent = d.name;
      var s = document.createElement("span"); s.className = "pick__sub"; s.textContent = d.spec + " · " + d.fee + " EGP";
      txt.appendChild(n); txt.appendChild(s);
      lab.appendChild(input); lab.appendChild(dot); lab.appendChild(txt);
      lab.addEventListener("click", function () {
        state.doc = d.id;
        state.date = ""; state.time = "";
        renderPicks(); renderDates();
      });
      box.appendChild(lab);
    });
  }

  deptSel.addEventListener("change", function () {
    state.dept = deptSel.value;
    if (state.doc && !deptDoctors().some(function (d) { return d.id === state.doc; })) state.doc = "";
    state.date = ""; state.time = "";
    renderPicks(); renderDates();
  });

  /* ---- step 2: dates + slots ---- */
  function dateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function renderDates() {
    var box = el("wDates"), slots = el("wSlots");
    box.innerHTML = ""; slots.innerHTML = "";
    var doc = doctorById(state.doc);
    el("wWho").innerHTML = doc
      ? "<b>" + doc.name + "</b> · " + doc.spec + " · clinic " +
        String(doc.from).padStart(2, "0") + ":00 – " + String(doc.to).padStart(2, "0") + ":00"
      : "Choose a doctor first.";

    if (!doc) {
      slots.innerHTML = '<p class="slots--none">Pick a doctor in step 1 to see the calendar.</p>';
      return;
    }

    var made = 0;
    for (var i = 0; i < 10; i++) {
      var day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() + i);
      var works = doc.days.indexOf(day.getDay()) > -1;
      var key = dateKey(day);
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "date" + (state.date === key ? " is-picked" : "");
      btn.disabled = !works;
      var dow = document.createElement("span");
      dow.textContent = i === 0 ? "Today" : DAY_NAMES[day.getDay()];
      var num = document.createElement("b");
      num.textContent = String(day.getDate()).padStart(2, "0") + "/" + String(day.getMonth() + 1).padStart(2, "0");
      var mon = document.createElement("span");
      mon.textContent = works ? MONTHS[day.getMonth()] : "off";
      btn.appendChild(dow); btn.appendChild(num); btn.appendChild(mon);
      if (works) {
        made++;
        btn.addEventListener("click", function (k) {
          return function () { state.date = k; state.time = ""; renderDates(); };
        }(key));
      }
      box.appendChild(btn);
    }

    if (!made) {
      slots.innerHTML = '<p class="slots--none">This doctor has no clinic day in the next 10 days.</p>';
      return;
    }
    renderSlots();
  }

  function renderSlots() {
    var slots = el("wSlots");
    slots.innerHTML = "";
    var doc = doctorById(state.doc);
    if (!doc || !state.date) {
      slots.innerHTML = '<p class="slots--none">Select a day above to load the slots.</p>';
      return;
    }
    var found = 0;
    for (var h = doc.from; h < doc.to; h++) {
      [0, 30].forEach(function (m) {
        var time = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
        var mine = bookedSlot(doc.id, state.date, time);
        var taken = mine || clinicBusy(doc.id, state.date, time);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "slot" + (state.time === time ? " is-picked" : "");
        b.dataset.time = time;
        b.disabled = taken;
        b.textContent = time;
        if (mine) b.textContent = time + " ●";
        if (!taken) {
          found++;
          b.addEventListener("click", function (t) {
            return function () {
              state.time = t;
              Array.prototype.forEach.call(slots.children, function (c) {
                if (c.dataset) c.classList.toggle("is-picked", c.dataset.time === t);
              });
              el("e2").textContent = "";
            };
          }(time));
        }
        slots.appendChild(b);
      });
    }
    if (!found) slots.innerHTML = '<p class="slots--none">Fully booked on this day — try another one.</p>';
  }

  /* ---- step 3: review ---- */
  function renderReview() {
    var doc = doctorById(state.doc);
    var d = new Date(state.date + "T00:00:00");
    el("wReview").innerHTML =
      row("Doctor", doc ? doc.name : "—") +
      row("Specialty", doc ? doc.spec : "—") +
      row("Day", DAY_NAMES[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]) +
      row("Time", state.time) +
      row("Fee", doc ? doc.fee + " EGP" : "—");
  }
  function row(label, value) {
    return '<div><span>' + label + "</span><b>" + value + "</b></div>";
  }

  /* ---- step machine ---- */
  function goStep(n) {
    state.step = n;
    Array.prototype.forEach.call(document.querySelectorAll(".step"), function (p) {
      p.classList.toggle("is-hidden", Number(p.dataset.panel) !== n);
    });
    Array.prototype.forEach.call(el("steps").children, function (li) {
      var s = Number(li.dataset.step);
      li.classList.toggle("is-on", s === n);
      li.classList.toggle("is-done", s < n);
    });
    if (n === 3) renderReview();
  }

  function error(n, msg) { el("e" + n).textContent = msg; }

  document.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = Number(btn.dataset.next);
      if (target === 2) {
        if (!state.doc) { error(1, "Pick a doctor to continue."); return; }
        error(1, ""); renderDates();
      }
      if (target === 3) {
        if (!state.date) { error(2, "Choose an available day."); return; }
        if (!state.time) { error(2, "Choose a time slot."); return; }
        error(2, "");
      }
      goStep(target);
    });
  });
  document.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () { goStep(Number(btn.dataset.back)); });
  });

  /* ---- submit ---- */
  el("bookForm").addEventListener("submit", function (event) {
    event.preventDefault();
    var doc = doctorById(state.doc);
    var name = el("pName").value.trim();
    var phone = el("pPhone").value.replace(/[\s-]/g, "");
    var age = el("pAge").value.trim();

    if (!doc || !state.date || !state.time) { goStep(1); error(1, "The appointment lost its doctor or slot — start again."); return; }
    if (name.length < 3) { error(3, "Please write the full name as in the ID."); el("pName").focus(); return; }
    if (!/^01[0125][0-9]{8}$/.test(phone)) { error(3, "Phone should be an Egyptian mobile, e.g. 01274961835."); el("pPhone").focus(); return; }
    if (age === "" || Number(age) < 0 || Number(age) > 110) { error(3, "Enter a valid age."); el("pAge").focus(); return; }
    if (bookedSlot(doc.id, state.date, state.time)) { error(3, "That slot was just taken on this device. Pick another one."); goStep(2); return; }
    error(3, "");

    bookings.push({
      id: "v" + Date.now(),
      doc: doc.id, docName: doc.name, spec: doc.spec,
      date: state.date, time: state.time, fee: doc.fee,
      name: name, phone: phone, age: age,
      type: el("pType").value, notes: el("pNotes").value.trim(),
      at: new Date().toISOString()
    });
    saveBookings(bookings);
    renderVisits();

    el("bookForm").reset();
    deptSel.value = state.dept;
    state.doc = ""; state.date = ""; state.time = "";
    renderPicks(); renderDates(); goStep(1);
    toast("Booked with " + doc.name + " — see My visits");
  });

  /* ---------------- visits list ---------------- */
  var visitsBox = el("visitList");

  function renderVisits() {
    visitsBox.innerHTML = "";
    if (!bookings.length) {
      var p = document.createElement("p");
      p.className = "visits-empty";
      p.textContent = "No appointments yet. The wizard above saves them to this browser only.";
      visitsBox.appendChild(p);
      return;
    }
    bookings.slice().sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time);
    }).forEach(function (b) {
      var d = new Date(b.date + "T00:00:00");
      var card = document.createElement("article");
      card.className = "visit";

      var when = document.createElement("div");
      when.className = "visit__when";
      var day = document.createElement("b"); day.textContent = String(d.getDate()).padStart(2, "0");
      var mo = document.createElement("span"); mo.textContent = MONTHS[d.getMonth()];
      when.appendChild(day); when.appendChild(mo);

      var body = document.createElement("div");
      body.className = "visit__body";
      var h = document.createElement("h3");
      h.textContent = b.docName + " · " + b.time;
      var p = document.createElement("p");
      p.textContent = b.spec + " — " + b.name + ", " + b.age + " yrs · " + b.type + " · " + b.fee + " EGP" +
        (b.notes ? " · \"" + b.notes + "\"" : "");
      body.appendChild(h); body.appendChild(p);

      var cancel = document.createElement("button");
      cancel.type = "button"; cancel.className = "btn btn--sm";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", function () {
        bookings = bookings.filter(function (x) { return x.id !== b.id; });
        saveBookings(bookings);
        renderVisits();
        if (state.doc === b.doc && state.date === b.date) renderSlots();
        toast("Appointment cancelled, the slot is free again");
      });

      card.appendChild(when); card.appendChild(body); card.appendChild(cancel);
      visitsBox.appendChild(card);
    });
  }
  renderVisits();

  /* ---------------- FAQ ---------------- */
  var FAQ = [
    ["Do I need a referral?", "No. Walk in or book here — the specialist sees you directly. Only insurance pre-approval needs a paper from your provider."],
    ["How long is a first consultation?", "Thirty to forty minutes. Follow-ups are usually fifteen. The wizard only frees slots that fit inside the doctor's clinic hours."],
    ["Can I reschedule?", "Call reception at least three hours before, and we move you to the next free slot the same week at no charge."],
    ["Which cards do you accept?", "Visa and Mastercard at reception, plus InstaPay transfers. Cash is fine too. Nothing is charged online in this demo."],
    ["Do you issue medical reports?", "Yes — fitness, school and work reports are printed and stamped the same visit for EGP 120."],
    ["Is there parking?", "Two spots in the yard and street parking on Thabet St. The clinic is on the ground floor, no stairs."]
  ];

  var faqBox = el("faqList");
  FAQ.forEach(function (item, i) {
    var wrap = document.createElement("div");
    wrap.className = "faq__item";
    var q = document.createElement("button");
    q.type = "button"; q.className = "faq__q";
    q.setAttribute("aria-expanded", "false");
    q.id = "faq-q-" + i;
    q.innerHTML = "<span>" + item[0] + "</span><i>+</i>";
    var a = document.createElement("div");
    a.className = "faq__a";
    a.setAttribute("role", "region");
    a.setAttribute("aria-labelledby", q.id);
    var inner = document.createElement("div");
    var p = document.createElement("p");
    p.textContent = item[1];
    inner.appendChild(p); a.appendChild(inner);
    q.addEventListener("click", function () {
      var open = !wrap.classList.contains("is-open");
      Array.prototype.forEach.call(faqBox.children, function (c) {
        c.classList.remove("is-open");
        c.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });
      if (open) { wrap.classList.add("is-open"); q.setAttribute("aria-expanded", "true"); }
    });
    wrap.appendChild(q); wrap.appendChild(a);
    faqBox.appendChild(wrap);
  });

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
  renderPicks();
  renderDates();
})();
