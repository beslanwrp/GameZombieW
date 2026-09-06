# Z-2099

Juego de mesa digital, cooperativo y de supervivencia zombi en 2,5D, inspirado en *The Walking Dead*.
Hasta 10 jugadores, cada uno desde su móvil (Android e iOS), sobre un tablero octogonal con cartas de
zombis, hordas, objetos y crafteo, una misión de equipo y un modo «jugador zombi» para los contagiados.

## Estado

Hito M0 v0.2: prototipo web de reglas completo (`prototipo/dist/index.html`) con 10 jugadores, 12 personajes, 12 misiones y simulador de equilibrio. Documento de diseño v1.0 cerrado con cámara 3D libre.

| Documento | Contenido |
| --- | --- |
| `docs/00-concepto-y-propuestas.md` | Resumen del concepto, cuatro direcciones visuales, dos lecturas del tablero, opciones de mesa y encuesta |
| `docs/01-decisiones.md` | Decisiones tomadas en la encuesta, tensiones detectadas, 2,5D frente a 3D y tecnología recomendada |
| `docs/02-crafteo.md` | Diez recetas de crafteo con pesos y reglas comunes |
| `docs/03-documento-de-diseno.md` | Documento de diseño completo v1.0: reglas, ronda, dados, ruido, contagio, jugador zombi, misiones, cartas, personajes, cámara 3D libre, red, tecnología y plan |
| `docs/04-prototipo-m0.md` | Prototipo M0: cómo probarlo, qué implementa, simplificaciones y qué observar en las pruebas |
| `docs/05-hoja-de-reglas.md` | Hoja de reglas de una página para la mesa |
| `docs/encuesta/ultima-ronda.html` | Encuesta interactiva con maquetas SVG (copia local de la publicada como artefacto) |
| `docs/encuesta/z2099-camara.html` | Comparador interactivo de cámaras: isométrica fija, 3D libre, cenital y tercera persona |

## Próximos pasos

1. Probar el prototipo con grupos reales y anotar lo que pide `docs/04-prototipo-m0.md`.
2. Ajustar parámetros en `prototipo/src/datos.js` y reconstruir con `node prototipo/build.mjs`.
3. Resolver las preguntas abiertas de la sección 24 del documento de diseño.
4. Corte vertical en Unity (hito M1).

## Desarrollo del prototipo

```
node --test prototipo/test/            # pruebas del motor
node prototipo/build.mjs               # genera prototipo/dist/index.html
node prototipo/sim.mjs 40 todas 4,6,10 # simulador de equilibrio
node prototipo/sim.mjs 40      # simula 40 partidas por misión y tamaño de grupo
```
