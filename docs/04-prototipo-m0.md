# Z-2099 · prototipo M0 de reglas (v0.2)

Prototipo jugable en el navegador para probar las reglas del documento de diseño con un grupo real antes de invertir en arte. Sin 3D: tablero hexagonal plano, dados, cartas, contagio y jugador zombi.

## Cómo probarlo

- **Un solo móvil que se pasa.** Cada jugador planifica y resuelve su turno en el mismo dispositivo y lo pasa al siguiente. La pantalla «Pasa el móvil a…» protege la mano de cartas.
- Abre `prototipo/dist/index.html` en cualquier navegador moderno o publícalo como página estática. El progreso se guarda en el dispositivo; se puede cerrar y continuar.
- De 2 a 10 jugadores, 12 personajes y las 12 misiones del documento de diseño.

## Qué hay implementado (v0.2)

Todo lo del documento de diseño salvo la planificación simultánea (en un solo móvil los turnos son secuenciales por iniciativa) y la casilla de agua: tablero octogonal de unas 120 casillas en losetas de 7 que se revelan al entrar, 8 entradas de horda, refugio, gasolineras, farmacias, talleres, bosque y las casillas especiales de cada misión (helipuerto, torre, generador, laboratorio, suministros marcados). Dados personalizados para mover y combatir. Turnos por iniciativa con 1 movimiento y 2 acciones: saquear, atacar, craftear, curar, amputar, dar cartas (también por enlace), levantar, conducir, subir de pasajero, salir de la ciudad, descansar, sermón, compartir comida. Peso e inventario. Contador de ruido con tope que escala con los jugadores, cartas de horda, eventos en rondas pares con la decisión de Instinto de Beatriz. Cuatro tipos de zombi, hordas, percepción limitada, barricadas que derriban. Contagio según la misión (cuenta atrás, sin contagio, hardcore y ambos), conversión, reclutar, y jugador zombi con mover horda, mover ficha, atacar, oler, ocultarse y evolución. Las diez recetas. Los doce personajes con sus habilidades, pros y contras.

## Simulador de equilibrio

`node prototipo/sim.mjs [partidas] [misiones] [jugadores]` juega partidas completas con bots heurísticos (van al objetivo, atacan lo que tienen delante, saquean, craftean lo útil, huyen de las hordas si pueden) y saca una tabla. Los bots son peores que un grupo humano: no coordinan, apenas usan vehículos ni curas, y caminan hacia el objetivo aunque haya zombis al lado. Sirven para ver tendencias, no cifras finales.

### Cambios de reglas derivados de la simulación

La primera pasada con las reglas literales del documento dio 0 % de victorias en casi todo, primera horda en la ronda 2 y el bando zombi ganando el 70 al 100 %. Estos cambios ya están en el prototipo y conviene llevarlos al documento de diseño si las pruebas reales los confirman:

| Regla del documento | Cambio en el prototipo | Motivo |
| --- | --- | --- |
| Tope de ruido fijo en 8 | Tope 10 con 4 jugadores, +1 por jugador extra; tras la horda baja al tope menos 7 | Cada dado en la mesa es una cara de ruido más por ronda: con 10 jugadores el tope de 8 saltaba cada ronda |
| Revelar una loseta de borde suelta una horda | Suelta 2 caminantes; las hordas solo llegan por carta | Con el mapa de tres anillos, el 40 % de las losetas ocultas eran de borde y la primera horda llegaba en la ronda 2 |
| Cara de mordisco en combate: si el zombi sigue en pie, te muerde | El zombi contraataca y tiras defensa (1 dado, 2 Beatriz) | Atacar una horda en cuerpo a cuerpo era un mordisco seguro |
| Horda: 3 impactos por caminante | 2 impactos (Sunja 1, máximo 2 por acción) | Las hordas eran inmortales salvo molotov |
| Sin contagio: anular el mordisco en la misma ronda solo con Tratamiento | Hasta la noche siguiente, con antibióticos, Tratamiento o amputación | Las misiones SC terminaban en la ronda 3 con el primer mordisco |
| El jugador zombi gana con la mitad del equipo | Con más de la mitad | Con 4 jugadores, dos mordiscos en hardcore acababan la partida |
| Los zombis siempre persiguen al superviviente más cercano | Solo perciben a 4 casillas; sin presa, van al refugio si el ruido está alto | La distancia no servía de nada |
| Última llamada: horda cada noche desde la ronda 6 | Cada dos noches | 13 hordas por partida con 10 jugadores |
| Antibióticos 2 y botiquín 4 en el mazo | 4 y 5 | Nadie llegaba a craftear Tratamiento |

### Resultados con los cambios (60 partidas por fila, bots)

| Misión | Jug. | Victoria | Gana el zombi | Rondas | 1ª horda | Mordiscos | Conversiones | Hordas | Crafteos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Farmacia Central | 4 | 7% | 18% | 9.8 | 3.7 | 2.1 | 1.1 | 4.4 | 0.5 |
| Farmacia Central | 10 | 18% | 15% | 9.2 | 3.0 | 4.6 | 2.7 | 7.0 | 1.3 |
| Sin una gota | 4 | 28% | 0% | 7.3 | 3.6 | 1.0 | 0.0 | 2.4 | 0.1 |
| Sin una gota | 10 | 8% | 0% | 6.3 | 3.4 | 2.1 | 0.0 | 2.9 | 0.1 |
| La granja | 4 | 23% | 68% | 9.3 | 3.3 | 2.6 | 2.6 | 4.8 | 0.1 |
| La granja | 10 | 5% | 93% | 8.4 | 2.5 | 6.4 | 6.3 | 8.6 | 0.2 |
| La emisora | 4 | 0% | 12% | 9.8 | 3.4 | 2.1 | 1.1 | 4.6 | 0.8 |
| La emisora | 10 | 0% | 13% | 9.9 | 2.7 | 5.3 | 3.3 | 8.1 | 1.8 |
| El convoy | 4 | 0% | 10% | 8.8 | 3.4 | 2.0 | 1.1 | 4.5 | 0.6 |
| El convoy | 10 | 0% | 17% | 8.9 | 2.5 | 5.4 | 3.2 | 7.4 | 1.6 |
| Cuarentena | 4 | 0% | 0% | 6.5 | 3.2 | 1.3 | 0.0 | 3.0 | 0.3 |
| Cuarentena | 10 | 0% | 0% | 5.2 | 2.6 | 2.3 | 0.0 | 3.6 | 0.7 |
| Invierno | 4 | 0% | 57% | 8.6 | 2.8 | 2.2 | 2.2 | 4.8 | 0.3 |
| Invierno | 10 | 0% | 75% | 8.3 | 2.5 | 5.8 | 5.7 | 7.7 | 0.5 |
| El depósito | 4 | 23% | 38% | 10.2 | 3.3 | 2.3 | 1.7 | 4.8 | 0.1 |
| El depósito | 10 | 50% | 28% | 9.1 | 2.6 | 5.1 | 3.1 | 7.3 | 0.6 |
| Última llamada | 4 | 7% | 93% | 9.1 | 2.8 | 3.1 | 3.1 | 7.6 | 0.3 |
| Última llamada | 10 | 2% | 98% | 8.1 | 2.5 | 7.0 | 6.6 | 11.2 | 0.3 |
| Los suministros del puente | 4 | 0% | 17% | 9.8 | 3.6 | 2.3 | 1.3 | 4.6 | 0.2 |
| Los suministros del puente | 10 | 12% | 18% | 9.8 | 2.8 | 5.7 | 3.4 | 7.3 | 0.8 |
| Cero contagios | 4 | 7% | 0% | 6.7 | 3.4 | 1.5 | 0.0 | 2.8 | 0.1 |
| Cero contagios | 10 | 18% | 0% | 4.3 | 2.6 | 2.1 | 0.0 | 2.3 | 0.2 |
| Protocolo Z-2099 | 4 | 0% | 0% | 6.8 | 3.5 | 1.4 | 1.1 | 2.7 | 0.3 |
| Protocolo Z-2099 | 10 | 0% | 0% | 4.8 | 2.9 | 2.4 | 1.5 | 2.6 | 0.2 |

Lectura: las misiones de recolección con cuenta atrás (Farmacia, Depósito, Suministros) están en un rango razonable para bots torpes y deberían ganarse la mitad de las veces con humanos. **Hardcore sigue siendo casi imposible** (La granja, Invierno, Última llamada): con conversión inmediata y umbral de más de la mitad, tres mordiscos en toda la partida son derrota. Propuesta para probar en mesa: en hardcore, el mordido se convierte a la noche siguiente en vez de la misma noche, para dar una ronda de despedida y de amputación. **Sin contagio** (Sin una gota, Cuarentena, Cero, Protocolo) ronda el 10 al 30 %: el primer mordisco que no se cura acaba la partida, y con 10 jugadores hay más dados en la mesa. Cuarentena y Protocolo con 0 % son en parte culpa del bot (no fabrica barricadas ni caza tipos concretos de zombi bien).

## Qué observar en las pruebas reales

1. **Duración por ronda** con 4 y con 10 jugadores. Objetivo: menos de 3 minutos.
2. **Ronda de la primera horda.** El simulador dice 3 o 4. ¿Se siente pronto?
3. **Mordiscos por partida** y cuántos acaban en conversión. El simulador da 2 a 7 según jugadores.
4. **El jugador zombi**: ¿se divierte con 2 acciones y ocultarse? ¿Gana alguna vez fuera de hardcore?
5. **Crafteo**: los bots craftean menos de 2 veces por partida. Si los humanos tampoco, faltan ingredientes o las recetas no compensan una acción.
6. **Hardcore**: probar la conversión a la noche siguiente.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `prototipo/src/datos.js` | Parámetros, cartas, recetas, zombis, personajes, misiones, eventos, hordas, escalado |
| `prototipo/src/reglas.js` | Motor de reglas puro, sin interfaz, estado serializable |
| `prototipo/src/ui.js` | Interfaz móvil con Canvas y modo «pasar el móvil» |
| `prototipo/plantilla.html` | Maqueta y estilos |
| `prototipo/build.mjs` | Empaqueta todo en `dist/index.html` (y `dist/artifact.html`) |
| `prototipo/sim.mjs` | Simulador de equilibrio con bots |
| `prototipo/test/reglas.test.mjs` | 23 pruebas del motor: `node --test prototipo/test/` |

Para reconstruir tras un cambio: `node prototipo/build.mjs`.
