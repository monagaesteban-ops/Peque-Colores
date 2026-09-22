/* numbers.js · Coloca los números dentro de cada zona del dibujo.
   - Si una zona tiene data-labels="x,y;x,y" usa esas posiciones.
   - Si no, busca el punto más "hondo" dentro de la zona (así el número nunca cae en el borde).
   - data-fs fija el tamaño del número; si falta, se calcula según el tamaño de la zona. */
(function () {
  "use strict";
  const PC = (window.PC = window.PC || {});
  const NS = "http://www.w3.org/2000/svg";

  function inside(zone, x, y) {
    try { return zone.isPointInFill(new DOMPoint(x, y)); } catch (e) { return true; }
  }

  // Distancia aproximada al borde desde un punto (8 direcciones)
  function clearance(zone, x, y, step, max) {
    let best = max;
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k;
      const dx = Math.cos(a), dy = Math.sin(a);
      let d = step;
      while (d < best && inside(zone, x + dx * d, y + dy * d)) d += step;
      if (d < best) best = d;
    }
    return best;
  }

  function bestSpot(zone, bb) {
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const step = Math.max(2, Math.min(bb.width, bb.height) / 18);
    const max = Math.min(bb.width, bb.height) / 2;
    if (inside(zone, cx, cy) && clearance(zone, cx, cy, step, max) > max * 0.55) return [cx, cy];
    let best = [cx, cy], bestScore = -1;
    const n = 12;
    for (let i = 1; i < n; i++) {
      for (let j = 1; j < n; j++) {
        const x = bb.x + (bb.width * i) / n, y = bb.y + (bb.height * j) / n;
        if (!inside(zone, x, y)) continue;
        const c = clearance(zone, x, y, step, max);
        if (c > bestScore) { bestScore = c; best = [x, y]; }
      }
    }
    return best;
  }

  function spots(zone, bb) {
    const raw = zone.getAttribute("data-labels");
    if (raw) {
      return raw.split(";").map(function (p) { return p.split(",").map(Number); });
    }
    return [bestSpot(zone, bb)];
  }

  function toSvgSpace(zone, x, y) {
    const t = zone.transform && zone.transform.baseVal;
    if (t && t.numberOfItems) {
      const p = new DOMPoint(x, y).matrixTransform(t.consolidate().matrix);
      return [p.x, p.y];
    }
    return [x, y];
  }

  PC.numbers = {
    add(svg) {
      const layer = document.createElementNS(NS, "g");
      layer.setAttribute("class", "zone-numbers");
      svg.appendChild(layer);
      svg.querySelectorAll(".paint-zone").forEach(function (zone) {
        const bb = zone.getBBox();
        const n = zone.dataset.number;
        const info = PC.PALETTE[n];
        const fs = Number(zone.dataset.fs) || Math.max(12, Math.min(22, Math.min(bb.width, bb.height) * 0.5));
        zone._labels = [];
        spots(zone, bb).forEach(function (s) {
          const p = toSvgSpace(zone, s[0], s[1]);
          const text = document.createElementNS(NS, "text");
          text.setAttribute("class", "zone-number");
          text.setAttribute("x", p[0].toFixed(1));
          text.setAttribute("y", p[1].toFixed(1));
          text.setAttribute("font-size", fs);
          text.setAttribute("fill", info ? info.hex : "#fff");
          text.setAttribute("stroke", "#3d3d5c");
          text.setAttribute("stroke-width", (fs * 0.32).toFixed(1));
          text.textContent = n;
          layer.appendChild(text);
          zone._labels.push(text);
        });
      });
    },
    hide(zone) {
      (zone._labels || []).forEach(function (t) { t.classList.add("is-hidden"); });
    },
    show(zone) {
      (zone._labels || []).forEach(function (t) { t.classList.remove("is-hidden"); });
    },
  };
})();
