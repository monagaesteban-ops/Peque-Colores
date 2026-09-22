#!/usr/bin/env python3
"""
Empaqueta todos los SVG de assets/drawings/ en data/svg-bundle.js.

Para qué sirve: si abres index.html haciendo doble clic (file://), el navegador
no permite leer archivos con fetch(). Este paquete deja los dibujos disponibles
como JavaScript para que la app funcione igual sin servidor.

Si publicas la app en un hosting o usas un servidor local (python -m http.server)
no lo necesitas, pero tampoco molesta.

Uso (desde la carpeta PequeColores):
    python3 tools/empaquetar_svgs.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SVGS = sorted((RAIZ / "assets" / "drawings").glob("*.svg"))

paquete = {p.name: p.read_text(encoding="utf-8").strip() for p in SVGS}

salida = RAIZ / "data" / "svg-bundle.js"
salida.write_text(
    "/* Archivo generado por tools/empaquetar_svgs.py. No editar a mano. */\n"
    "window.PC = window.PC || {};\n"
    "PC.SVG_BUNDLE = " + json.dumps(paquete, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8",
)
print(f"Listo: {len(paquete)} dibujos empaquetados en {salida.relative_to(RAIZ)}")
