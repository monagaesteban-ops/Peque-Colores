/* coloring.js · Motor de colorear por números.
   Lee ?id=<número> de la URL, carga el SVG del dibujo y deja pintar zona por zona. */
(function () {
  "use strict";
  const PC = window.PC;
  const params = new URLSearchParams(window.location.search);
  const wanted = Number(params.get("id"));
  const drawing = PC.DRAWINGS.find(function (d) { return d.id === wanted; }) || PC.DRAWINGS[0];

  const $ = function (sel) { return document.querySelector(sel); };
  const canvas = $("#canvas"), art = $("#art"), paletteEl = $("#palette");
  const progress = $("#progress"), fill = $("#progress-fill"), toast = $("#toast"), win = $("#win");

  const PRAISE = ["¡Muy bien!", "¡Genial!", "¡Qué lindo!", "¡Bravo!", "¡Eso es!", "¡Wow!"];
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let svg = null;
  let zones = [];
  let selected = null;
  let finished = false;
  const painted = new Set();
  let toastTimer = null;

  document.title = drawing.title + " · PequeColores";
  $("#title-text").textContent = drawing.title;
  $("#title-emoji").textContent = drawing.emoji;

  /* ---------- Paleta ---------- */

  function buildPalette() {
    paletteEl.dataset.count = drawing.colors.length;
    drawing.colors.forEach(function (n) {
      const info = PC.PALETTE[n];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.dataset.number = n;
      btn.style.setProperty("--sw", info.hex);
      btn.setAttribute("aria-label", "Color " + n + ", " + info.name.toLowerCase());
      btn.setAttribute("aria-pressed", "false");
      const num = document.createElement("span");
      num.className = "swatch-num";
      num.textContent = n;
      btn.appendChild(num);
      paletteEl.appendChild(btn);
    });
    paletteEl.addEventListener("click", function (e) {
      const btn = e.target.closest(".swatch");
      if (!btn || finished) return;
      PC.sounds.play("click");
      select(Number(btn.dataset.number));
    });
  }

  function select(n) {
    selected = n;
    paletteEl.querySelectorAll(".swatch").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.number) === n));
    });
    if (svg && n) svg.style.setProperty("--hint", tint(PC.PALETTE[n].hex));
    updateHints();
  }

  // Mezcla un color con blanco para el brillo de las zonas que hay que pintar
  function tint(hex) {
    const v = parseInt(hex.slice(1), 16);
    const mix = function (c) { return Math.round(c + (255 - c) * 0.6); };
    return "rgb(" + mix(v >> 16) + "," + mix((v >> 8) & 255) + "," + mix(v & 255) + ")";
  }

  function updateHints() {
    zones.forEach(function (z, i) {
      z.classList.toggle("is-hint", !painted.has(i) && Number(z.dataset.number) === selected);
    });
  }

  function remaining(n) {
    return zones.filter(function (z, i) { return Number(z.dataset.number) === n && !painted.has(i); }).length;
  }

  function updatePalette() {
    paletteEl.querySelectorAll(".swatch").forEach(function (b) {
      b.classList.toggle("is-done", remaining(Number(b.dataset.number)) === 0);
    });
  }

  function nextNumber() {
    const list = drawing.colors;
    const start = Math.max(0, list.indexOf(selected));
    for (let k = 1; k <= list.length; k++) {
      const n = list[(start + k) % list.length];
      if (remaining(n) > 0) return n;
    }
    return null;
  }

  /* ---------- Progreso ---------- */

  function updateProgress() {
    const pct = zones.length ? Math.round((painted.size / zones.length) * 100) : 0;
    fill.style.width = pct + "%";
    progress.setAttribute("aria-valuenow", String(pct));
    progress.classList.toggle("is-full", pct === 100);
  }

  /* ---------- Mensajes y chispas ---------- */

  function say(text) {
    toast.textContent = text;
    toast.classList.remove("is-show");
    void toast.offsetWidth; // reinicia la animación
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 1300);
  }

  function sparkle(x, y) {
    if (reduceMotion) return;
    const box = canvas.getBoundingClientRect();
    ["✨", "⭐"].forEach(function (symbol, i) {
      const s = document.createElement("span");
      s.className = "spark";
      s.textContent = symbol;
      s.style.left = x - box.left + "px";
      s.style.top = y - box.top + "px";
      s.style.setProperty("--dx", (i ? 28 : -28) + "px");
      canvas.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    });
  }

  /* ---------- Pintar ---------- */

  function onTap(e) {
    if (finished) return;
    const zone = e.target.closest(".paint-zone");
    if (!zone) return;
    const index = zones.indexOf(zone);
    if (painted.has(index)) return;

    if (!selected) {
      say("¡Elige un color!");
      return;
    }
    if (Number(zone.dataset.number) === selected) {
      PC.paintZone(zone);
      painted.add(index);
      PC.storage.saveProgress(drawing.id, Array.from(painted));
      PC.sounds.play("correct");
      sparkle(e.clientX, e.clientY);
      afterPaint();
    } else {
      // Sin castigos: un guiño suave y una pista
      PC.sounds.play("wrong");
      zone.classList.remove("is-wrong");
      void zone.getBoundingClientRect();
      zone.classList.add("is-wrong");
      setTimeout(function () { zone.classList.remove("is-wrong"); }, 500);
      say("✨ ¡Casi!");
      const sw = paletteEl.querySelector('.swatch[data-number="' + selected + '"]');
      if (sw) {
        sw.classList.remove("is-nudge");
        void sw.offsetWidth;
        sw.classList.add("is-nudge");
      }
    }
  }

  function afterPaint() {
    updateProgress();
    updatePalette();
    updateHints();

    if (painted.size === zones.length) {
      finish();
      return;
    }
    if (remaining(selected) === 0) {
      say(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      const next = nextNumber();
      setTimeout(function () { if (!finished) select(next); }, 650);
    } else if (painted.size % 4 === 0) {
      say(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    }
  }

  /* ---------- Final ---------- */

  function finish() {
    finished = true;
    PC.storage.markCompleted(drawing.id);
    setTimeout(function () {
      PC.sounds.play("complete");
      $("#win-emoji").textContent = drawing.emoji;
      $("#win-next").href = "pintar.html?id=" + PC.nextDrawing(drawing.id).id;
      win.hidden = false;
      confetti();
      $("#win-next").focus({ preventScroll: true });
    }, 700);
  }

  function confetti() {
    const layer = $("#confetti");
    layer.innerHTML = "";
    if (reduceMotion) return;
    const colors = Object.keys(PC.PALETTE).map(function (n) { return PC.PALETTE[n].hex; });
    for (let i = 0; i < 46; i++) {
      const piece = document.createElement("i");
      piece.style.setProperty("--x", Math.random() * 100 + "%");
      piece.style.setProperty("--s", 8 + Math.random() * 10 + "px");
      piece.style.setProperty("--bg", colors[i % colors.length]);
      piece.style.setProperty("--t", 2.6 + Math.random() * 2.4 + "s");
      piece.style.setProperty("--d", Math.random() * 1.4 + "s");
      piece.style.setProperty("--r", (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540) + "deg");
      layer.appendChild(piece);
    }
  }

  function restart() {
    painted.clear();
    zones.forEach(PC.clearZone);
    PC.storage.resetProgress(drawing.id);
    finished = false;
    win.hidden = true;
    $("#confetti").innerHTML = "";
    updateProgress();
    updatePalette();
    select(drawing.colors[0]);
  }

  /* ---------- Carga ---------- */

  function setup(text) {
    art.innerHTML = text;
    svg = art.querySelector("svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Dibujo para colorear: " + drawing.title);
    zones = Array.from(svg.querySelectorAll(".paint-zone"));
    PC.numbers.add(svg);

    // Recupera lo que ya estaba pintado
    const saved = PC.storage.getDrawing(drawing.id);
    saved.painted.forEach(function (i) {
      if (zones[i]) { PC.paintZone(zones[i]); painted.add(i); }
    });

    svg.addEventListener("click", onTap);
    updateProgress();
    updatePalette();
    select(remaining(drawing.colors[0]) > 0 ? drawing.colors[0] : nextNumber());
  }

  function showError() {
    art.innerHTML = '<div class="art-error"><span class="emoji">😕</span><span>No pudimos abrir este dibujo</span></div>';
  }

  $("#win-again").addEventListener("click", function () { PC.sounds.play("click"); restart(); });

  buildPalette();
  PC.loadSvg(drawing.file).then(setup).catch(showError);
})();
