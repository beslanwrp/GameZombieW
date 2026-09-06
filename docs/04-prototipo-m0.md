# Z-2099 · prototipo M0 de reglas

Prototipo jugable en el navegador para probar las reglas del documento de diseño con un grupo real antes de invertir en arte. Sin 3D: tablero hexagonal plano, dados, cartas, contagio y jugador zombi. Versión 0.2.

## Cómo probarlo

- **Un solo móvil que se pasa.** Cada jugador planifica y resuelve su turno en el mismo dispositivo y lo pasa al siguiente. La pantalla «Pasa el móvil a…» protege la mano de cartas.
- Abre `prototipo/dist/index.html` en cualquier navegador moderno o publícalo como página estática. El progreso se guarda en el dispositivo; se puede cerrar y continuar.
- De 2 a 10 jugadores, 12 personajes y las 12 misiones del documento de diseño.

## Qué hay implementado

Todo lo descrito en las secciones 5 a 15 del documento de diseño: tablero octogonal de unas 120 casillas en losetas de 7 que se revelan al entrar, entradas de horda, refugio, gasolineras, farmacias, talleres, bosque y las casillas especiales de cada misión (helipuerto, torre, generador, laboratorio, suministros). Dados personalizados para mover y combatir. Turnos por iniciativa con 1 movimiento y 2 acciones: saquear, atacar, craftear, curar, amputar, dar cartas (también por enlace), levantar, conducir, subir de pasajero, salir de la ciudad, descansar. Peso e inventario. Ruido con tope escalado, cartas de horda, eventos en rondas pares con la decisión de Instinto de Beatriz. Cuatro tipos de zombi, hordas, barricadas. Contagio según misión (cuenta atrás, sin contagio, hardcore y ambos), conversión y jugador zombi con mover horda, mover ficha, atacar, oler, ocultarse, reclutar y evolución. Las 10 recetas. Las habilidades de los 12 personajes.

## Simplificaciones respecto al documento

| Regla del documento | En el prototipo |
| --- | --- |
| Planificación simultánea de 60 s y resolución por iniciativa | Turnos secuenciales por iniciativa en un solo móvil |
| Agua y cuerda | Sin casillas de agua |
| Pánico 3 obliga a ir al refugio | Implementado, pero el pánico solo sube por hordas adyacentes y niños |
| Comida en el mazo | 12 en vez de 6, para que Invierno sea posible sin Omar |

## Cambios de reglas tras la simulación (pendientes de confirmar en mesa)

El simulador `prototipo/sim.mjs` juega partidas completas con jugadores automáticos. Con las reglas literales del documento el resultado era 0 % de victorias en casi todo, primera horda en la ronda 2 y victoria del bando zombi en el 70-100 % de las partidas hardcore. Estos cambios están aplicados en el prototipo y anotados aquí para llevarlos al documento de diseño si las pruebas en mesa los confirman:

| Regla | Documento v1.0 | Prototipo v0.2 | Motivo |
| --- | --- | --- | --- |
| Tope de ruido | 8 fijo | 10 con 4 jugadores, +1 por jugador extra (16 con 10). Tras la horda baja a tope − 7 | Cada dado en la mesa es una cara de ruido más por ronda; con 10 jugadores el tope fijo daba una horda cada dos rondas |
| Revelar una loseta de borde | Aparece una horda completa | Aparecen 2 caminantes | Las hordas deben llegar por carta, no por explorar |
| Cara de mordisco en combate | El zombi te muerde si sigue en pie | El zombi contraataca: tirada de defensa normal | Atacar a una horda cuerpo a cuerpo era un 30 % de contagio seguro por acción |
| Impactos por caminante de horda | 3 | 2 (Sunja 1, máximo 2) | Las hordas eran inmortales salvo con molotov |
| Misiones sin contagio | El mordisco solo se anula con Tratamiento en la misma ronda | Hasta la noche siguiente, con antibióticos, Tratamiento o amputación | Victorias del 0 % con la regla literal |
| Victoria del bando zombi | La mitad del equipo o más | Más de la mitad (con menos de 4 jugadores, todos) | Con 4 jugadores, dos mordiscos eran derrota |
| Percepción de los zombis | Siempre van al superviviente más cercano | Solo perciben a 4 casillas; si no, van al refugio con ruido alto | La distancia no servía como defensa |
| Última llamada | Carta de horda cada noche desde la 6 | Cada dos noches desde la 6 | 13 hordas con 10 jugadores |
| Antibióticos y botiquines en el mazo | 2 y 4 | 4 y 5 | Nadie llegaba a craftear Tratamiento |

## Resultados del simulador (60 partidas por fila, bots heurísticos)

Los bots no coordinan, usan mal los vehículos y casi nunca curan: estas cifras son un suelo, no una predicción de lo que hará un grupo humano.

| Misión | Jug. | Victoria | Gana zombi | Rondas | 1.ª horda | Mordiscos | Conversiones | Hordas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Farmacia Central | 4 | 7% | 18% | 9.8 | 3.7 | 2.1 | 1.1 | 4.4 |
| Farmacia Central | 10 | 18% | 15% | 9.2 | 3.0 | 4.6 | 2.7 | 7.0 |
| Sin una gota | 4 | 28% | 0% | 7.3 | 3.6 | 1.0 | 0.0 | 2.4 |
| Sin una gota | 10 | 8% | 0% | 6.3 | 3.4 | 2.1 | 0.0 | 2.9 |
| La granja | 4 | 23% | 68% | 9.3 | 3.3 | 2.6 | 2.6 | 4.8 |
| La granja | 10 | 5% | 93% | 8.4 | 2.5 | 6.4 | 6.3 | 8.6 |
| La emisora | 4 | 0% | 12% | 9.8 | 3.4 | 2.1 | 1.1 | 4.6 |
| La emisora | 10 | 0% | 13% | 9.9 | 2.7 | 5.3 | 3.3 | 8.1 |
| El convoy | 4 | 0% | 10% | 8.8 | 3.4 | 2.0 | 1.1 | 4.5 |
| El convoy | 10 | 0% | 17% | 8.9 | 2.5 | 5.4 | 3.2 | 7.4 |
| Cuarentena | 4 | 0% | 0% | 6.5 | 3.2 | 1.3 | 0.0 | 3.0 |
| Cuarentena | 10 | 0% | 0% | 5.2 | 2.6 | 2.3 | 0.0 | 3.6 |
| Invierno | 4 | 0% | 57% | 8.6 | 2.8 | 2.2 | 2.2 | 4.8 |
| Invierno | 10 | 0% | 75% | 8.3 | 2.5 | 5.8 | 5.7 | 7.7 |
| El depósito | 4 | 23% | 38% | 10.2 | 3.3 | 2.3 | 1.7 | 4.8 |
| El depósito | 10 | 50% | 28% | 9.1 | 2.6 | 5.1 | 3.1 | 7.3 |
| Última llamada | 4 | 7% | 93% | 9.1 | 2.8 | 3.1 | 3.1 | 7.6 |
| Última llamada | 10 | 2% | 98% | 8.1 | 2.5 | 7.0 | 6.6 | 11.2 |
| Los suministros del puente | 4 | 0% | 17% | 9.8 | 3.6 | 2.3 | 1.3 | 4.6 |
| Los suministros del puente | 10 | 12% | 18% | 9.8 | 2.8 | 5.7 | 3.4 | 7.3 |
| Cero contagios | 4 | 7% | 0% | 6.7 | 3.4 | 1.5 | 0.0 | 2.8 |
| Cero contagios | 10 | 18% | 0% | 4.3 | 2.6 | 2.1 | 0.0 | 2.3 |
| Protocolo Z-2099 | 4 | 0% | 0% | 6.8 | 3.5 | 1.4 | 1.1 | 2.7 |
| Protocolo Z-2099 | 10 | 0% | 0% | 4.8 | 2.9 | 2.4 | 1.5 | 2.6 |

**Lectura.** Las misiones con cuenta atrás (Farmacia, Emisora, Convoy, Depósito, Suministros) ya no las gana el bando zombi por sistema, pero los bots no saben cumplir el objetivo. Las misiones sin contagio rondan el 10-30 %. Las misiones **hardcore (Granja, Invierno, Última llamada) siguen casi imposibles**: tres mordiscos en toda la partida son derrota. Propuesta a probar en mesa: en hardcore el mordido se convierte en la noche *siguiente*, dando una ronda para despedirse y dejar el inventario.

## Qué observar en las pruebas

1. **Duración por ronda** con 4 y con 10 jugadores. Objetivo: menos de 3 minutos.
2. **Ronda de la primera horda.** El simulador dice 3-4. ¿Se siente pronto?
3. **Mordiscos y conversiones por partida**, y de dónde vienen: fase de zombis, combate o cara de mordisco al terminar el turno.
4. **El jugador zombi**: ¿se divierte con 2 acciones? ¿Gana alguna vez? ¿Ocultarse sirve?
5. **Crafteo**: ¿se craftea algo más que el bate con clavos?
6. **Hardcore**: ¿aceptáis la conversión inmediata o preferís la noche siguiente?

## Estructura

| Archivo | Contenido |
| --- | --- |
| `prototipo/src/datos.js` | Parámetros, cartas, recetas, zombis, personajes, misiones, eventos, hordas, escalado |
| `prototipo/src/reglas.js` | Motor de reglas puro, sin interfaz, estado serializable |
| `prototipo/src/ui.js` | Interfaz móvil con Canvas y modo «pasar el móvil» |
| `prototipo/sim.mjs` | Simulador de equilibrio: `node prototipo/sim.mjs 40 todas 4,6,10` |
| `prototipo/plantilla.html` | Maqueta y estilos |
| `prototipo/build.mjs` | Empaqueta todo en `dist/index.html` (y `dist/artifact.html`) |
| `prototipo/test/reglas.test.mjs` | 23 pruebas del motor: `node --test prototipo/test/` |
