/* Home page behaviour. Theme handling lives in theme.js. */
(function () {
  "use strict";

  var EMAIL = "z5607934@gmail.com";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scroll spy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  });

  function spy() {
    var pos = window.scrollY + window.innerHeight * 0.32;
    var current = -1;
    sections.forEach(function (section, i) {
      if (section && section.offsetTop <= pos) current = i;
    });
    links.forEach(function (link, i) {
      link.classList.toggle("is-active", i === current);
    });
  }
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- animated counters ---------- */
  function countUp(el) {
    var target = Number(el.dataset.count);
    function show(value) { el.textContent = value.toLocaleString("en-US"); }
    if (reduceMotion || target === 0) {
      show(target);
      return;
    }
    var start = performance.now();
    var duration = 1100;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      show(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* ---------- skill bars ---------- */
  var bars = document.querySelectorAll(".bar__fill");
  function fill(el) { el.style.width = el.dataset.fill + "%"; }
  if ("IntersectionObserver" in window) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        barObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    bars.forEach(function (el) { barObserver.observe(el); });
  } else {
    bars.forEach(fill);
  }

  /* ---------- rotating role line ---------- */
  var roleText = document.getElementById("roleText");
  var roles = (document.getElementById("roleType").dataset.roles || "").split("|").filter(Boolean);
  if (roleText && roles.length) {
    if (reduceMotion) {
      roleText.textContent = roles[0];
    } else {
      var roleIndex = 0;
      var charIndex = 0;
      var deleting = false;
      (function tick() {
        var word = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        roleText.textContent = word.slice(0, charIndex);

        var delay = deleting ? 34 : 58;
        if (!deleting && charIndex === word.length) { delay = 2000; deleting = true; }
        else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 320; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var from = String(data.get("email") || "").trim();
    var message = String(data.get("message") || "").trim();

    if (!name || !from || !message) {
      note.textContent = "Please fill in all three fields first.";
      note.className = "form-note err";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(from)) {
      note.textContent = "That email address does not look valid.";
      note.className = "form-note err";
      return;
    }

    var subject = encodeURIComponent("Portfolio message from " + name);
    var body = encodeURIComponent(message + "\n\n— " + name + " (" + from + ")");
    window.location.href = "mailto:" + EMAIL + "?subject=" + subject + "&body=" + body;
    note.textContent = "Your mail app should be opening with the message ready.";
    note.className = "form-note ok";
  });
})();
