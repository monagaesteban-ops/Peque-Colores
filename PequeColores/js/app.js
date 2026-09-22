/* app.js · Control general: sonido, navegación y pantalla principal. */
(function () {
  "use strict";
  const PC = (window.PC = window.PC || {});
  const root = document.body.dataset.root || "";
  const page = document.body.dataset.page;

  /* ---------- Utilidades compartidas ---------- */

  // Devuelve el texto SVG de un dibujo (paquete embebido o, si no existe, fetch).
  PC.loadSvg = function (file) {
    if (PC.SVG_BUNDLE && PC.SVG_BUNDLE[file]) return Promise.resolve(PC.SVG_BUNDLE[file]);
    return fetch(root + "assets/drawings/" + file).then(function (res) {
      if (!res.ok) throw new Error("No se encontró " + file);
      return res.text();
    });
  };

  PC.drawingUrl = function (id) {
    return (root ? "" : "pages/") + "pintar.html?id=" + id;
  };

  PC.nextDrawing = function (id) {
    const list = PC.DRAWINGS;
    const i = list.findIndex(function (d) { return d.id === id; });
    return list[(i + 1) % list.length];
  };

  // Primer dibujo sin terminar (para el botón PINTAR de la portada)
  PC.firstPending = function () {
    return PC.DRAWINGS.find(function (d) { return !PC.storage.isCompleted(d.id); }) || PC.DRAWINGS[0];
  };

  PC.paintZone = function (zone) {
    zone.style.fill = PC.PALETTE[zone.dataset.number].hex;
    zone.classList.remove("is-hint");
    zone.classList.add("is-painted");
    PC.numbers.hide(zone);
  };
  PC.clearZone = function (zone) {
    zone.style.removeProperty("fill");
    zone.classList.remove("is-painted", "is-hint", "is-wrong");
    PC.numbers.show(zone);
  };

  /* ---------- Sonido y botones ---------- */

  function syncSoundButtons() {
    const on = PC.sounds.isEnabled();
    document.querySelectorAll("[data-sound-toggle]").forEach(function (btn) {
      btn.textContent = on ? "🔊" : "🔇";
      btn.setAttribute("aria-pressed", String(!on));
      btn.setAttribute("aria-label", on ? "Sonido encendido" : "Sonido apagado");
    });
  }

  function initSound() {
    syncSoundButtons();
    document.addEventListener("pointerdown", PC.sounds.preload, { once: true });

    document.addEventListener("click", function (e) {
      const toggle = e.target.closest("[data-sound-toggle]");
      if (toggle) {
        PC.sounds.toggle();
        syncSoundButtons();
        PC.sounds.play("click");
        return;
      }
      const el = e.target.closest("[data-sfx]");
      if (!el) return;
      PC.sounds.play("click");
      // En los enlaces, esperamos un instante para que el "clic" alcance a sonar antes de cambiar de pantalla
      if (el.tagName === "A" && el.href && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setTimeout(function () { window.location.href = el.href; }, 140);
      }
    });
  }

  /* ---------- Portada ---------- */

  function initHome() {
    const paint = document.getElementById("btn-paint");
    if (paint) paint.href = PC.drawingUrl(PC.firstPending().id);

    const hero = document.getElementById("hero");
    if (!hero) return;
    let timers = [];

    function play(svg) {
      timers.forEach(clearTimeout);
      timers = [];
      const zones = Array.from(svg.querySelectorAll(".paint-zone"));
      zones.forEach(PC.clearZone);
      zones.forEach(function (zone, i) {
        timers.push(setTimeout(function () { PC.paintZone(zone); }, 900 + i * 420));
      });
    }

    PC.loadSvg("arcoiris.svg").then(function (text) {
      hero.innerHTML = text;
      const svg = hero.querySelector("svg");
      svg.setAttribute("viewBox", "0 100 400 250");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Un arcoíris que se pinta solo. Tócalo para verlo otra vez.");
      PC.numbers.add(svg);
      play(svg);
      hero.addEventListener("click", function () {
        PC.sounds.play("correct");
        play(svg);
      });
    }).catch(function () { hero.hidden = true; });
  }

  /* ---------- Arranque ---------- */
  initSound();
  if (page === "home") initHome();
})();
