# Z-2099 · guía del repositorio

Juego de mesa digital cooperativo de supervivencia zombi (2 a 10 jugadores, móviles + pantalla compartida, cámara 3D libre, estilo crudo fotorealista). Todo el proyecto está en español: código, comentarios, documentos y textos de juego.

## Dónde está cada cosa

| Ruta | Qué es |
| --- | --- |
| `docs/00` a `docs/06` | Concepto, decisiones de la encuesta, recetas, documento de diseño v1.0, prototipo M0, hoja de reglas, plan M1 |
| `docs/maquetas/` | Maquetas de interfaz (`.dc.html`) y su generador `gen.mjs` |
| `docs/encuesta/` | Encuesta inicial, comparador de cámara y cuaderno de pruebas (páginas publicadas como artefactos) |
| `prototipo/src/datos.js` | **Hoja de equilibrio**: parámetros, cartas, recetas, zombis, personajes, misiones, eventos, hordas. Única fuente de verdad de los números |
| `prototipo/src/reglas.js` | Motor de reglas puro, determinista, sin interfaz. Estado `G` serializable en JSON |
| `prototipo/src/ui.js` + `prototipo/plantilla.html` | Interfaz móvil en Canvas, modo «pasar el móvil» |
| `prototipo/sim.mjs` | Bots heurísticos y simulador de equilibrio (también módulo: `jugar()`) |
| `prototipo/barrido.mjs` | Barrido de parámetros: cuánto mueve cada palanca la tasa de victoria |
| `prototipo/trazas.mjs` + `prototipo/trazas/` | Trazas doradas para verificar el porte del motor a C# |
| `prototipo/exportar-datos.mjs` → `datos/` | Exportación de la hoja de equilibrio a JSON para Unity |
| `prototipo/dist/` | HTML único generado. `index.html` autónomo, `artifact.html` para publicar |
| `scripts/md2html.py` | Convierte los documentos Markdown en páginas con el estilo del proyecto |

## Comandos

```
node --test prototipo/test/            # 25 pruebas del motor (deben pasar siempre)
node prototipo/build.mjs               # regenera prototipo/dist tras cualquier cambio en src/ o plantilla
node prototipo/sim.mjs 40 todas 4,6,10 # tabla de equilibrio por misión y tamaño de grupo
node prototipo/barrido.mjs 12          # sensibilidad de cada parámetro
node prototipo/trazas.mjs verificar    # las trazas deben reproducirse sin diferencias
node prototipo/trazas.mjs generar 24   # regenerar trazas SOLO tras un cambio de reglas deliberado
node prototipo/exportar-datos.mjs      # regenerar datos/ tras cambiar datos.js
python3 scripts/md2html.py docs/X.md "Título" > salida.html
```

## Reglas de trabajo

- **Determinismo.** El motor solo usa `rnd(G)`; nunca `Math.random` ni `Date` dentro de `reglas.js`. Cualquier cambio en el orden de las llamadas al azar cambia las trazas: regenerarlas y decirlo en el commit.
- **Los números viven en `datos.js`.** No se meten constantes de equilibrio en `reglas.js` ni en `ui.js`. Tras cambiar `datos.js`: ejecutar tests, build, exportar datos.
- **Cambios de reglas.** Primero en `reglas.js` con prueba, después simulador, después documentación (`docs/04-prototipo-m0.md`, tabla de cambios pendientes de confirmar en mesa). El documento de diseño v1.0 (`docs/03`) no se edita hasta la v1.1: los cambios se anotan como propuestas.
- **Interfaz.** `[hidden]{display:none!important}` está en la plantilla; las pantallas se alternan con `hidden`. El estado de la partida se guarda en `localStorage` con la clave `z2099-m0` y versión `G.version = 2`.
- **Verificación antes de dar algo por hecho.** Tras un commit, comprobar `git status --short` vacío y el hash en `git log`. Los comandos con `cd` cambian el directorio de trabajo de forma persistente: usar rutas absolutas o volver a la raíz.
- **Idioma.** Español en todo, incluido el registro de la partida (`log`), cuyas cadenas forman parte del contrato de las trazas doradas.

## Estado (septiembre de 2026)

M0 cerrado por parte del diseño: prototipo v0.3 jugable (cantidades por jugadores y kits de misión), simulador con bots razonables, informe de partidas simuladas (`docs/07`), trazas y datos exportados. Pendiente de los resultados de las pruebas de mesa (`docs/encuesta/cuaderno-de-pruebas.html`) para fijar parámetros, elegir la variante hardcore y redactar el documento de diseño v1.1. Después, corte vertical en Unity según `docs/06-plan-m1.md`.
