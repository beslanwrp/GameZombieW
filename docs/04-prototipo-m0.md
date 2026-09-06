# Z-2099 · prototipo M0 de reglas

Prototipo jugable en el navegador para probar las reglas del documento de diseño con un grupo real antes de invertir en arte. Sin 3D: tablero hexagonal plano, dados, cartas, contagio y jugador zombi.

## Cómo probarlo

- **Un solo móvil que se pasa.** Cada jugador planifica y resuelve su turno en el mismo dispositivo y lo pasa al siguiente. La pantalla «Pasa el móvil a…» protege la mano de cartas.
- Abre `prototipo/dist/index.html` en cualquier navegador moderno o publícalo como página estática. El progreso se guarda en el dispositivo; se puede cerrar y continuar.
- De 2 a 6 jugadores (los 6 personajes de M0). Cuatro misiones: Farmacia Central (cuenta atrás), Sin una gota (sin contagio), Invierno (hardcore) y Última llamada (hardcore, horda cada ronda desde la 6).

## Qué hay implementado

Tablero octogonal de unas 120 casillas hexagonales agrupadas en losetas de 7 que se revelan al entrar, con 8 entradas de horda, refugio central, gasolineras, farmacias, talleres y bosque. Dados personalizados (paso, doble paso, ruido, mordisco) para mover y combatir. Turnos por iniciativa con 1 movimiento y 2 acciones: saquear, atacar, craftear, curar, dar cartas, levantar, subir a vehículo, descansar. Peso e inventario. Contador de ruido con subida automática por noche, cartas de horda con escalado por jugadores, eventos en rondas pares. Cuatro tipos de zombi y hordas que se mueven hacia el ruido o el superviviente más cercano. Contagio según la misión, amputación no, conversión y jugador zombi con mover horda, mover ficha, atacar y oler, con evolución. Ocho recetas: moto y coche con depósito, molotov, bate con clavos, silenciador, señuelo, tratamiento y camuflaje. Habilidades de los seis personajes.

## Simplificaciones respecto al documento de diseño

| Regla del documento | En el prototipo |
| --- | --- |
| Planificación simultánea de 60 s y resolución por iniciativa | Turnos secuenciales por iniciativa en un solo móvil. En una mesa real el tiempo total es el mismo |
| Hasta 10 jugadores y 12 personajes | 6 jugadores y 6 personajes |
| Barricadas y Enlace (walkie-talkies) | No implementados; no los necesitan las 4 misiones |
| Amputación | No implementada |
| Ocultarse y reclutar del jugador zombi | No implementados; sí mover horda, mover ficha, atacar, oler y evolucionar |
| Instinto de Beatriz para descartar un evento | No implementado (sí sus 2 dados de defensa y la repetición del mordisco) |
| Pasajeros en vehículos | Solo el conductor |
| Agua y cuerda | Sin casillas de agua |
| Comida en el mazo | 12 en vez de 6, porque Omar no está y la misión Invierno pide 10 |

## Qué observar en las pruebas

1. **Duración por ronda** con 4 y con 6 jugadores. Objetivo: menos de 3 minutos.
2. **Cuándo llega la primera horda.** Con ruido inicial 2 y +1 por noche, sin ruido de los jugadores llega en la ronda 6. ¿Es tarde? ¿Demasiado pronto cuando saquean gasolineras?
3. **Mordiscos por partida** y cuántos acaban en conversión. Si nadie se convierte en 3 partidas, la cara de mordisco es demasiado suave.
4. **El jugador zombi**: ¿se divierte con 2 acciones? ¿Gana alguna vez?
5. **Crafteo**: ¿se craftea algo más que el bate con clavos? Si no, faltan ingredientes en el mazo.
6. **Misiones**: Farmacia Central debería ganarse la mitad de las veces; Sin una gota menos.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `prototipo/src/datos.js` | Parámetros, cartas, recetas, zombis, personajes, misiones, eventos, hordas |
| `prototipo/src/reglas.js` | Motor de reglas puro, sin interfaz, estado serializable |
| `prototipo/src/ui.js` | Interfaz móvil con Canvas y modo «pasar el móvil» |
| `prototipo/plantilla.html` | Maqueta y estilos |
| `prototipo/build.mjs` | Empaqueta todo en `dist/index.html` (y `dist/artifact.html`) |
| `prototipo/test/reglas.test.mjs` | 15 pruebas del motor: `node --test prototipo/test/` |

Para reconstruir tras un cambio: `node prototipo/build.mjs`.
