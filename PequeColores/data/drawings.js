/* ==========================================================
   PequeColores · Contenido
   Aquí viven los datos: paleta, categorías y dibujos.
   Para añadir un dibujo nuevo basta con agregar un objeto a
   PC.DRAWINGS (ver README.md). No hay que tocar el motor.
   ========================================================== */

window.PC = window.PC || {};

// Paleta global: el número SIEMPRE es el mismo color en todos los dibujos.
PC.PALETTE = {
  1: { name: "Rojo", hex: "#FF4D6D" },
  2: { name: "Amarillo", hex: "#FFD93D" },
  3: { name: "Azul", hex: "#4D96FF" },
  4: { name: "Verde", hex: "#6BCB77" },
  5: { name: "Morado", hex: "#A66CFF" },
  6: { name: "Naranja", hex: "#FF9F43" },
  7: { name: "Rosa", hex: "#FF8FAB" },
  8: { name: "Café", hex: "#A9744F" },
};

PC.CATEGORIES = [
  { id: "naturaleza", title: "Naturaleza", icon: "🌳", tint: "#D8F5D3" },
  { id: "animales", title: "Animales", icon: "🐶", tint: "#FFE6C7" },
  { id: "personitas", title: "Personitas", icon: "👧", tint: "#FFD9E4" },
  { id: "fantasia", title: "Fantasía", icon: "🧚", tint: "#E6DBFF" },
];

// colors = números de la paleta que usa el dibujo (se generan a partir del SVG).
PC.DRAWINGS = [
  { id: 1, title: "Arcoíris", category: "naturaleza", emoji: "🌈", file: "arcoiris.svg", colors: [1, 2, 3, 4, 5, 6, 7] },
  { id: 2, title: "Jardín", category: "naturaleza", emoji: "🌻", file: "jardin.svg", colors: [2, 4, 5, 6, 7, 8] },
  { id: 3, title: "Árbol", category: "naturaleza", emoji: "🌳", file: "arbol.svg", colors: [1, 2, 3, 4, 8] },
  { id: 4, title: "Paisaje", category: "naturaleza", emoji: "☀️", file: "paisaje.svg", colors: [1, 2, 3, 4, 5, 6, 8] },
  { id: 5, title: "Perrito", category: "animales", emoji: "🐶", file: "perrito.svg", colors: [2, 3, 6, 7, 8] },
  { id: 6, title: "Gatito", category: "animales", emoji: "🐱", file: "gatito.svg", colors: [1, 2, 4, 5, 6, 7] },
  { id: 7, title: "Mariposa", category: "animales", emoji: "🦋", file: "mariposa.svg", colors: [2, 3, 5, 6, 8] },
  { id: 8, title: "Pez", category: "animales", emoji: "🐟", file: "pez.svg", colors: [1, 2, 3, 4, 5, 6] },
  { id: 9, title: "Elefante", category: "animales", emoji: "🐘", file: "elefante.svg", colors: [1, 2, 3, 7] },
  { id: 10, title: "Niña jugando", category: "personitas", emoji: "👧", file: "nina.svg", colors: [1, 3, 4, 6, 7, 8] },
  { id: 11, title: "Niño con cometa", category: "personitas", emoji: "👦", file: "nino.svg", colors: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 12, title: "Unicornio", category: "fantasia", emoji: "🦄", file: "unicornio.svg", colors: [2, 3, 5, 6, 7] },
  { id: 13, title: "Castillo", category: "fantasia", emoji: "🏰", file: "castillo.svg", colors: [1, 2, 3, 4, 5, 7, 8] },
  { id: 14, title: "Hada", category: "fantasia", emoji: "🧚", file: "hada.svg", colors: [1, 2, 3, 5, 6, 7] },
  { id: 15, title: "Dragón", category: "fantasia", emoji: "🐉", file: "dragon.svg", colors: [1, 2, 4, 5, 6, 7] },
];
