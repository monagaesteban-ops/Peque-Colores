/* gallery.js · Dibuja las categorías y las tarjetas de la galería a partir de data/drawings.js. */
(function () {
  "use strict";
  const PC = window.PC;
  const container = document.getElementById("gallery");
  if (!container) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  PC.CATEGORIES.forEach(function (cat) {
    const drawings = PC.DRAWINGS.filter(function (d) { return d.category === cat.id; });
    if (!drawings.length) return;

    const section = el("section");
    section.style.setProperty("--tint", cat.tint);
    section.setAttribute("aria-label", cat.title);

    const head = el("h2", "cat-head");
    head.appendChild(el("span", "emoji", cat.icon));
    head.appendChild(el("span", "", cat.title));
    section.appendChild(head);

    const grid = el("div", "cards");
    drawings.forEach(function (d) {
      const card = el("a", "card");
      card.href = PC.drawingUrl(d.id);
      card.setAttribute("data-sfx", "");
      const done = PC.storage.isCompleted(d.id);
      card.setAttribute("aria-label", d.title + (done ? " (terminado)" : ""));

      const img = el("img");
      img.src = "../assets/drawings/" + d.file;
      img.alt = "";
      img.loading = "lazy";
      img.width = 200;
      img.height = 200;
      card.appendChild(img);
      card.appendChild(el("span", "card-name", d.title));
      if (done) card.appendChild(el("span", "card-star", "⭐"));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
})();
