/* storage.js · Lo que el navegador recuerda: dibujos terminados, progreso y ajustes.
   Todo queda en localStorage del propio dispositivo. No se envía nada a ningún sitio. */
(function () {
  "use strict";
  const PC = (window.PC = window.PC || {});
  const PREFIX = "pequecolores:";

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback; // modo privado o almacenamiento bloqueado: la app sigue funcionando
    }
  }
  function write(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
  }

  PC.storage = {
    getDrawing(id) {
      const d = read("drawing-" + id, null) || {};
      return { completed: !!d.completed, painted: Array.isArray(d.painted) ? d.painted : [] };
    },
    saveProgress(id, painted) {
      const d = this.getDrawing(id);
      write("drawing-" + id, { completed: d.completed, painted: painted });
    },
    markCompleted(id) {
      write("drawing-" + id, { completed: true, painted: [] });
    },
    resetProgress(id) {
      const d = this.getDrawing(id);
      write("drawing-" + id, { completed: d.completed, painted: [] });
    },
    isCompleted(id) {
      return this.getDrawing(id).completed;
    },
    getSetting(name, fallback) {
      return read("setting-" + name, fallback);
    },
    setSetting(name, value) {
      write("setting-" + name, value);
    },
  };
})();
