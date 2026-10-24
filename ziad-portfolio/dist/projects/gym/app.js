/* IronPulse Gym — vanilla JS demo
   timetable filter · yearly price switch · BMI calculator · trial form */
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

  /* ---------------- timetable ---------------- */
  var CLASSES = {
    sat: [
      { time: "08:00", name: "Heavy bar — squat focus", coach: "Karim Mostafa", mins: 60, level: "high", taken: 14, cap: 16 },
      { time: "10:00", name: "Mobility reset", coach: "Omar Hassan", mins: 45, level: "low", taken: 9, cap: 18 },
      { time: "18:00", name: "HIIT 45", coach: "Sara Adel", mins: 45, level: "high", taken: 20, cap: 20 },
      { time: "19:30", name: "Strength basics", coach: "Karim Mostafa", mins: 60, level: "med", taken: 11, cap: 14 }
    ],
    sun: [
      { time: "09:00", name: "Conditioning circuit", coach: "Sara Adel", mins: 50, level: "med", taken: 12, cap: 16 },
      { time: "11:00", name: "Nutrition clinic (open Q&A)", coach: "Mona Nabil", mins: 40, level: "low", taken: 6, cap: 25 },
      { time: "19:00", name: "Pull & press", coach: "Karim Mostafa", mins: 60, level: "high", taken: 15, cap: 16 }
    ],
    mon: [
      { time: "07:00", name: "Sunrise lift", coach: "Karim Mostafa", mins: 55, level: "med", taken: 8, cap: 14 },
      { time: "17:30", name: "Shoulder rehab group", coach: "Omar Hassan", mins: 45, level: "low", taken: 10, cap: 12 },
      { time: "20:00", name: "Boxing conditioning", coach: "Sara Adel", mins: 50, level: "high", taken: 18, cap: 18 }
    ],
    tue: [
      { time: "08:30", name: "Deadlift technique lab", coach: "Karim Mostafa", mins: 60, level: "high", taken: 13, cap: 14 },
      { time: "12:00", name: "Lunch-move express", coach: "Sara Adel", mins: 30, level: "low", taken: 7, cap: 20 },
      { time: "18:30", name: "Hypertrophy — upper", coach: "Karim Mostafa", mins: 65, level: "med", taken: 16, cap: 18 },
      { time: "20:00", name: "Core & flow", coach: "Omar Hassan", mins: 40, level: "med", taken: 5, cap: 16 }
    ],
    wed: [
      { time: "07:00", name: "Sunrise lift", coach: "Karim Mostafa", mins: 55, level: "med", taken: 9, cap: 14 },
      { time: "16:00", name: "Teen athletic block", coach: "Sara Adel", mins: 60, level: "high", taken: 14, cap: 16 },
      { time: "19:00", name: "Meal planning workshop", coach: "Mona Nabil", mins: 45, level: "low", taken: 11, cap: 30 }
    ],
    thu: [
      { time: "09:00", name: "Low-impact strength", coach: "Omar Hassan", mins: 50, level: "low", taken: 6, cap: 15 },
      { time: "18:00", name: "HIIT 45", coach: "Sara Adel", mins: 45, level: "high", taken: 19, cap: 20 },
      { time: "19:15", name: "Push day — bench focus", coach: "Karim Mostafa", mins: 60, level: "med", taken: 12, cap: 14 },
      { time: "21:00", name: "Late stretch", coach: "Omar Hassan", mins: 35, level: "low", taken: 4, cap: 18 }
    ]
  };

  var LEVEL_LABEL = { low: "easy", med: "moderate", high: "hard" };
  var list = el("classList");
  var current = "sat";

  function renderDay(day) {
    var items = CLASSES[day] || [];
    list.innerHTML = "";
    items.forEach(function (c) {
      var free = c.cap - c.taken;

      var row = document.createElement("article");
      row.className = "class" + (free === 0 ? " is-full" : "");
      row.dataset.free = String(free);

      var time = document.createElement("p");
      time.className = "class__time";
      time.textContent = c.time;

      var mid = document.createElement("div");
      var name = document.createElement("h3");
      name.className = "class__name";
      name.textContent = c.name;
      var pill = document.createElement("span");
      pill.className = "intensity";
      pill.dataset.level = c.level;
      pill.textContent = LEVEL_LABEL[c.level];
      name.appendChild(pill);
      var meta = document.createElement("p");
      meta.className = "class__meta";
      meta.textContent = c.coach + " · " + c.mins + " min";
      mid.appendChild(name);
      mid.appendChild(meta);

      var spots = document.createElement("div");
      spots.className = "class__spots";
      var count = document.createElement("span");
      count.textContent = free === 0 ? "full" : free + " free";
      var bar = document.createElement("span");
      bar.className = "spots-bar";
      var fill = document.createElement("i");
      fill.style.width = Math.round((c.taken / c.cap) * 100) + "%";
      bar.appendChild(fill);
      spots.appendChild(count);
      spots.appendChild(bar);

      row.appendChild(time);
      row.appendChild(mid);
      row.appendChild(spots);
      list.appendChild(row);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".day"), function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".day"), function (other) {
        var on = other === btn;
        other.classList.toggle("is-on", on);
        other.setAttribute("aria-selected", String(on));
      });
      current = btn.dataset.day;
      renderDay(current);
    });
  });

  renderDay(current);

  /* ---------------- membership switch ---------------- */
  var MONTHLY = [];
  Array.prototype.forEach.call(document.querySelectorAll("[data-price]"), function (node) {
    MONTHLY.push({ node: node, value: Number(node.dataset.price) });
  });
  var switchBtn = el("billingSwitch");
  var yearly = false;

  switchBtn.addEventListener("click", function () {
    yearly = !yearly;
    switchBtn.setAttribute("aria-checked", String(yearly));
    MONTHLY.forEach(function (p) {
      p.node.textContent = yearly ? Math.round(p.value * 0.8) : p.value;
    });
    document.querySelectorAll(".plan__price small").forEach(function (unit) {
      unit.textContent = yearly ? "EGP / month, billed yearly" : "EGP / month";
    });
    toast(yearly ? "Yearly prices — 20% off" : "Monthly prices");
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"), function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.dataset.plan;
      var price = btn.closest(".plan").querySelector("[data-price]").textContent;
      toast(plan + " selected · " + price + " EGP — book your trial below");
      el("trial").scrollIntoView({ behavior: "smooth", block: "start" });
      el("trName").focus({ preventScroll: true });
    });
  });

  /* ---------------- BMI ---------------- */
  var bmiForm = el("bmiForm");
  var bmiError = el("bmiError");
  var bmiValue = el("bmiValue");
  var bmiCat = el("bmiCat");
  var bmiMarker = el("bmiMarker");
  var bmiRange = el("bmiRange");

  function category(bmi) {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "healthy range";
    if (bmi < 30) return "overweight";
    return "obese";
  }

  bmiForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var h = parseFloat(el("bmiHeight").value);
    var w = parseFloat(el("bmiWeight").value);

    if (!isFinite(h) || h < 120 || h > 230) { bmiError.textContent = "Height should be between 120 and 230 cm."; return; }
    if (!isFinite(w) || w < 35 || w > 250) { bmiError.textContent = "Weight should be between 35 and 250 kg."; return; }
    bmiError.textContent = "";

    var m = h / 100;
    var bmi = w / (m * m);
    var shown = Math.round(bmi * 10) / 10;

    bmiValue.textContent = shown.toFixed(1);
    bmiCat.textContent = category(bmi);

    /* scale runs from 15 to 35 BMI */
    var pct = Math.max(0, Math.min(100, ((bmi - 15) / 20) * 100));
    bmiMarker.style.left = pct + "%";
    bmiMarker.classList.add("is-on");

    var low = 18.5 * m * m, high = 24.9 * m * m;
    bmiRange.innerHTML = "Healthy weight for " + h + " cm: <b>" + low.toFixed(1) +
      " – " + high.toFixed(1) + " kg</b>";
  });

  /* ---------------- trial form ---------------- */
  var trialForm = el("trialForm");
  var trialNote = el("trialNote");

  trialForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = el("trName").value.trim();
    var phone = el("trPhone").value.trim();
    var slot = el("trSlot").value;

    trialNote.classList.remove("ok");
    if (name.length < 3) {
      trialNote.className = "trial__note err";
      trialNote.textContent = "Please write your full name.";
      el("trName").focus();
      return;
    }
    if (!/^01[0125][0-9]{8}$/.test(phone.replace(/[\s-]/g, ""))) {
      trialNote.className = "trial__note err";
      trialNote.textContent = "Use a valid Egyptian mobile number, e.g. 01274961835.";
      el("trPhone").focus();
      return;
    }
    trialNote.className = "trial__note ok";
    trialNote.textContent = "Thanks " + name + " — your " + slot.split(" (")[0].toLowerCase() +
      " trial is requested. We will call " + phone + " to confirm.";
    trialForm.reset();
    toast("Trial request sent");
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
})();
