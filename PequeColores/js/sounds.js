/* sounds.js · Efectos de sonido a partir de archivos de audio existentes.
   Para usar tus propios sonidos, reemplaza los archivos de assets/sounds/
   (o cambia los nombres aquí, por ejemplo a .mp3). */
(function () {
  "use strict";
  const PC = (window.PC = window.PC || {});

  const FILES = {
    click: "click.wav",
    correct: "correct.wav",
    wrong: "wrong.wav",
    complete: "complete.wav",
  };

  const cache = {};
  let enabled = PC.storage ? PC.storage.getSetting("sound", true) !== false : true;

  function folder() {
    return (document.body.dataset.root || "") + "assets/sounds/";
  }
  function get(name) {
    if (!cache[name]) {
      const audio = new Audio(folder() + FILES[name]);
      audio.preload = "auto";
      cache[name] = audio;
    }
    return cache[name];
  }

  PC.sounds = {
    isEnabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      if (PC.storage) PC.storage.setSetting("sound", enabled);
      return enabled;
    },
    play(name) {
      if (!enabled || !FILES[name]) return;
      try {
        const audio = get(name);
        audio.currentTime = 0;
        const result = audio.play();
        if (result && result.catch) result.catch(function () { /* el navegador bloqueó el audio: no pasa nada */ });
      } catch (e) { /* sin audio disponible */ }
    },
    // Se llama una vez, en el primer toque, para que los sonidos ya estén listos.
    preload() {
      Object.keys(FILES).forEach(function (name) { get(name).load(); });
    },
  };
})();
