# Z-2099 · informe de partidas simuladas a 2 y 4 jugadores

7 de septiembre de 2026. Partidas jugadas por bots con criterio de jugador razonable sobre el prototipo M0 (v0.3 en la primera tanda, v0.4 tras aplicar las propuestas): 40 partidas por misión y tamaño de grupo (2 y 4 jugadores), más 20 con 10 jugadores como referencia. Antes de la tanda final se leyeron partidas completas de cada misión para entender por qué se perdían, y se corrigió lo que era un defecto de diseño y no una torpeza del bot.

## Cómo juegan los bots

Se curan y curan al compañero mordido (craftean Tratamiento si pueden, amputan si hay machete), lanzan molotov a una horda adyacente, dejan un señuelo cuando la horda se acerca, huyen de la casilla si hay horda, no terminan el turno junto a un zombi si pueden evitarlo, disparan solo a objetivos que merecen la pena y sin disparar la alarma del ruido, craftean lo útil para la misión, conducen y repostan cuando el objetivo está lejos, dan las cartas de misión al compañero que va hacia el refugio, y descansan cuando están heridos y a salvo. No hablan ni planifican en conjunto: un grupo humano lo hará mejor. Las cifras son un suelo razonable, no una predicción.

## Lo que las partidas leídas enseñaron y se corrigió

| Problema visto en las partidas | Cambio aplicado |
| --- | --- |
| Las cantidades de objetivo estaban pensadas para 10 jugadores: 10 comidas con 12 en el mazo, 6 barricadas con 3 tablas y 2 chapas en todo el mazo, 5 suministros en losetas de borde para 2 personas | **Cantidades por tramos de jugadores** (hasta 3, hasta 6, hasta 10): antibióticos 2/3/4, comida 4/6/10, barricadas 3/4/6, bidones 2/3/4, suministros 3/4/5, convoy 2/4/6, bidones de la granja 1/2/2 |
| El convoy y la emisora dependían de cartas rarísimas (2 coches y 2 radios en 70 cartas) | **Kit de misión**: cartas iniciales repartidas al empezar. Convoy: coche y moto con un bidón cada uno. Emisora: radio y pilas. Cuarentena: materiales para dos barricadas y antibióticos. Farmacia: botiquín. Invierno: dos comidas. Depósito y Granja: un bidón. Suministros: moto y bidón. Protocolo: rifle y silenciador. Sin una gota y Cero contagios: antibióticos |
| Las recetas clave de una misión podían no aparecer | Cada misión conoce de inicio su receta: Cuarentena la barricada, Convoy el coche, Emisora el señuelo |
| El coche con 4 de gasolina no llegaba del refugio al borde (6 casillas) | Coche con depósito de 6 |
| Los suministros del puente exigía recorrer todo el borde en 10 rondas | 12 rondas |

## Resultados a 2 y 4 jugadores

| Misión | Jug. | Victoria | Gana zombi | Rondas | 1.ª horda | Mordiscos | Conversiones | Hordas | Crafteos | Curas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Farmacia Central | 2 | 25% | 0% | 9.2 | 4.6 | 0.6 | 0.2 | 2.6 | 0.3 | 0.1 |
| Farmacia Central | 4 | 10% | 3% | 9.6 | 3.4 | 1.9 | 0.6 | 4.7 | 0.8 | 0.3 |
| Sin una gota | 2 | 78% | 0% | 5.5 | 3.7 | 0.3 | 0.0 | 1.1 | 0.0 | 0.1 |
| Sin una gota | 4 | 38% | 0% | 7.5 | 3.8 | 1.1 | 0.0 | 2.4 | 0.1 | 0.4 |
| La granja | 2 | 75% | 20% | 11.8 | 4.5 | 0.9 | 0.9 | 3.5 | 0.3 | 0.0 |
| La granja | 4 | 28% | 60% | 9.9 | 3.2 | 2.5 | 2.5 | 5.0 | 0.1 | 0.0 |
| La emisora | 2 | 75% | 0% | 6.2 | 3.9 | 0.2 | 0.1 | 1.9 | 1.2 | 0.0 |
| La emisora | 4 | 60% | 8% | 6.7 | 3.1 | 1.1 | 0.6 | 3.1 | 1.3 | 0.1 |
| El convoy | 2 | 45% | 5% | 6.3 | 3.5 | 0.4 | 0.2 | 1.3 | 2.0 | 0.1 |
| El convoy | 4 | 35% | 0% | 7.0 | 3.7 | 0.6 | 0.1 | 2.0 | 2.0 | 0.3 |
| Cuarentena | 2 | 5% | 0% | 7.1 | 4.1 | 0.8 | 0.0 | 2.1 | 2.2 | 0.2 |
| Cuarentena | 4 | 0% | 0% | 6.8 | 3.3 | 1.2 | 0.0 | 3.2 | 2.2 | 0.2 |
| Invierno | 2 | 48% | 13% | 8.3 | 4.0 | 0.5 | 0.5 | 2.4 | 0.3 | 0.0 |
| Invierno | 4 | 13% | 43% | 8.4 | 2.7 | 2.0 | 1.9 | 4.0 | 0.2 | 0.0 |
| El depósito | 2 | 60% | 13% | 8.6 | 4.1 | 0.9 | 0.5 | 2.7 | 0.1 | 0.1 |
| El depósito | 4 | 63% | 18% | 8.6 | 3.0 | 1.7 | 1.0 | 4.3 | 0.2 | 0.1 |
| Última llamada | 2 | 40% | 60% | 10.4 | 3.9 | 1.4 | 1.4 | 6.7 | 0.2 | 0.0 |
| Última llamada | 4 | 15% | 85% | 9.1 | 2.7 | 3.1 | 3.1 | 7.5 | 0.3 | 0.0 |
| Los suministros del puente | 2 | 28% | 13% | 11.2 | 4.6 | 1.4 | 0.7 | 3.4 | 0.3 | 0.2 |
| Los suministros del puente | 4 | 5% | 18% | 11.8 | 3.4 | 2.7 | 1.6 | 5.6 | 0.5 | 0.3 |
| Cero contagios | 2 | 5% | 0% | 10.3 | 4.4 | 2.0 | 0.0 | 3.5 | 0.1 | 1.1 |
| Cero contagios | 4 | 10% | 0% | 8.4 | 3.4 | 2.4 | 0.0 | 3.8 | 0.2 | 0.9 |
| Protocolo Z-2099 | 2 | 0% | 0% | 9.9 | 4.9 | 0.9 | 0.5 | 2.6 | 0.2 | 0.2 |
| Protocolo Z-2099 | 4 | 0% | 0% | 7.2 | 3.5 | 1.6 | 1.0 | 2.6 | 0.1 | 0.2 |

Referencia con 10 jugadores (20 partidas):

| Misión | Jug. | Victoria | Gana zombi | Rondas | 1.ª horda | Mordiscos | Conversiones | Hordas | Crafteos | Curas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sin una gota | 10 | 0% | 0% | 7.2 | 3.0 | 2.7 | 0.0 | 3.9 | 0.1 | 0.8 |
| La granja | 10 | 20% | 75% | 9.4 | 2.5 | 6.0 | 5.8 | 8.6 | 0.1 | 0.0 |
| La emisora | 10 | 60% | 0% | 7.0 | 2.7 | 2.5 | 0.8 | 5.3 | 1.9 | 0.3 |
| El convoy | 10 | 30% | 0% | 7.5 | 3.2 | 3.0 | 0.2 | 3.9 | 2.3 | 2.0 |
| Cuarentena | 10 | 0% | 0% | 5.8 | 2.6 | 2.1 | 0.0 | 4.0 | 2.3 | 0.5 |
| Invierno | 10 | 5% | 70% | 8.7 | 2.2 | 5.3 | 5.3 | 8.3 | 0.6 | 0.0 |
| El depósito | 10 | 65% | 15% | 8.9 | 2.4 | 5.1 | 2.5 | 7.3 | 0.2 | 0.8 |
| Última llamada | 10 | 20% | 80% | 10.2 | 2.4 | 6.3 | 5.9 | 12.8 | 0.2 | 0.0 |
| Los suministros del puente | 10 | 15% | 15% | 11.6 | 2.8 | 7.1 | 3.4 | 9.0 | 0.9 | 1.4 |
| Cero contagios | 10 | 30% | 0% | 5.3 | 2.7 | 2.8 | 0.0 | 3.5 | 0.2 | 0.9 |
| Protocolo Z-2099 | 10 | 0% | 0% | 5.8 | 2.8 | 2.2 | 1.3 | 3.4 | 0.1 | 0.3 |

## Conclusiones

### 1. Jugar a 2 es más fácil que jugar a 4, y eso es un problema de diseño

En casi todas las misiones la tasa de victoria a 2 jugadores duplica o triplica la de 4. Tres causas se suman: con menos fichas hay menos ataques de zombi por ronda y por tanto menos mordiscos (0,3 a 1,4 por partida frente a 1,1 a 3,1); con menos de 4 jugadores el bando zombi necesita convertir a **todos** para ganar, así que un mordisco en hardcore no acaba la partida; y las cantidades de objetivo escalan hacia abajo. El escalado de hordas (3 caminantes con 2 o 3 jugadores, 5 con 4 a 6) no compensa. **Propuesta:** que la horda de 2 o 3 jugadores sea de 4, y que con 3 jugadores el bando zombi gane con 2 conversiones. Y sobre todo, que en mesa se pruebe el juego a 4, que es el caso difícil.

### 2. Las misiones de recolección funcionan; las de resistencia y las de cero contagios, no

Con las cantidades escaladas, Farmacia, Emisora, Convoy, Depósito, Invierno y Granja se ganan entre el 25 y el 75 % a 2 jugadores y entre el 10 y el 63 % a 4. Es el rango que buscamos para un cooperativo difícil. En cambio:

- **Última llamada** la gana el bando zombi el 60 % (2 jugadores) y el 85 % (4). Hardcore más una horda extra cada dos noches más «sobrevive con la mitad» es demasiado. **Propuesta:** cuenta atrás de contagio en vez de hardcore, o quitar la horda extra.
- **Cero contagios**, **Cuarentena** y **Protocolo Z-2099** (las de cero contagios) rondan el 0 al 10 %. La regla «un mordisco sin anular hace fracasar» convierte la partida en una moneda al aire por cada ataque de zombi, y los antibióticos del kit apenas lo mitigan. **Propuesta:** en misiones sin contagio, permitir también anular el mordisco descansando una ronda entera en el refugio, y que Protocolo deje de combinar hardcore y sin contagio: con una de las dos ya es la misión más dura.
- **Sin una gota** es la excepción: 78 % a 2 y 38 % a 4, porque el helipuerto está a la vista desde el inicio y la partida dura 5 a 7 rondas. Es la misión correcta para enseñar el juego.

### 3. Los mordiscos vienen de la fase de zombis, no de las decisiones

Entre el 70 y el 90 % de los mordiscos ocurren cuando un zombi entra en la casilla del superviviente en la fase de zombis, con una tirada de defensa de un dado (1 de 6 de mordisco). El barrido de parámetros confirmó que es la única palanca que mueve el resultado de forma decisiva: con dos dados de defensa, la victoria sube 17 a 20 puntos. Los bots ya evitan terminar junto a zombis y aun así reciben 2 a 3 mordiscos por partida a 4 jugadores. **Propuesta para probar en mesa:** dos dados de defensa base (Beatriz 3). Si en mesa los jugadores también sienten que los muerden «sin poder hacer nada», es este cambio y no otro.

### 4. El ruido y las hordas están bien donde están

La primera horda llega entre la ronda 3 y la 5 y hay entre 2 y 5 cartas de horda por partida a 2 y 4 jugadores. El tope de ruido escalado hace su trabajo. No tocar.

### 5. El crafteo ocurre cuando la misión lo pide

Emisora, Convoy y Cuarentena craftean 1 a 3 veces por partida; el resto casi nunca. Es coherente con el diseño (recetas iniciales limitadas) pero indica que las 10 recetas se verán poco sin kits. **Propuesta:** que todos los grupos empiecen con una receta al azar además de las tres iniciales.

### 6. Duración

Las partidas que se ganan duran 5 a 9 rondas; las que se pierden por rondas agotadas, 10 a 12. Con el objetivo de 3 minutos por ronda, eso son 20 a 35 minutos con pocos jugadores: por debajo de la hora del documento. Está bien para 2 y 4; con 10 jugadores la ronda será más larga y la partida se acercará a la hora.

## Segunda tanda: resultados tras aplicar las propuestas

Se aplicaron las seis propuestas y, al ver los resultados, hubo que afinar tres misiones más. Lo aplicado:

| Propuesta | Aplicación |
| --- | --- |
| Horda de 4 con pocos jugadores y umbral zombi a 3 jugadores | Horda de 4 hasta 3 jugadores; con 3 jugadores el bando zombi gana con 2 conversiones |
| Dos dados de defensa | Defensa base 2 dados, Beatriz 3 |
| Refugio anula el mordisco en misiones sin contagio | Pasar la noche en el refugio elimina el mordisco pendiente; también en Protocolo |
| Protocolo sin combinar hardcore y sin contagio | Protocolo es solo sin contagio. Además garantiza un acorazado y dos corredores en el mapa |
| Receta extra al azar | Cada grupo empieza con las 3 recetas iniciales, la de su misión y una al azar |
| Última llamada | Probado con cuenta atrás: 100 % de victorias, demasiado fácil con dos dados de defensa. Versión final: hardcore, defender el refugio (la mitad del equipo viva en el refugio o pegada a él en la noche 12), horda extra cada dos noches desde la 6 y percepción total de los zombis |
| Cuarentena | Barricada con solo tablas y chapa; los talleres dan tablas y chapa; solo las hordas derriban barricadas; 3 barricadas hasta 6 jugadores y 4 con más; 10 rondas |
| Farmacia Central | Las farmacias dan antibióticos en los dos saqueos |
| Invierno | 8 raciones con 7 a 10 jugadores (antes 10) |
| Cero contagios | 14 rondas |
| Corrección | Los antibióticos ya solo se depositan en el refugio en Farmacia Central (antes se perdían en las demás misiones) |

| Misión | Jug. | Victoria | Gana zombi | Rondas | 1.ª horda | Mordiscos | Conversiones | Hordas | Crafteos | Curas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Farmacia Central | 2 | 68% | 0% | 7.7 | 4.2 | 0.1 | 0.1 | 2.0 | 0.1 | 0.0 |
| Farmacia Central | 4 | 38% | 0% | 8.8 | 3.6 | 0.3 | 0.1 | 3.8 | 0.2 | 0.0 |
| Sin una gota | 2 | 90% | 0% | 5.3 | 4.0 | 0.0 | 0.0 | 1.0 | 0.0 | 0.0 |
| Sin una gota | 4 | 40% | 0% | 8.5 | 4.0 | 0.3 | 0.0 | 2.8 | 0.1 | 0.2 |
| La granja | 2 | 95% | 0% | 12.0 | 4.5 | 0.3 | 0.3 | 3.5 | 0.3 | 0.0 |
| La granja | 4 | 63% | 8% | 11.8 | 3.3 | 0.6 | 0.6 | 5.8 | 0.1 | 0.0 |
| La emisora | 2 | 73% | 0% | 6.1 | 3.9 | 0.0 | 0.0 | 1.7 | 1.1 | 0.0 |
| La emisora | 4 | 70% | 0% | 6.3 | 3.0 | 0.1 | 0.1 | 2.8 | 1.2 | 0.0 |
| El convoy | 2 | 45% | 0% | 6.4 | 4.6 | 0.1 | 0.0 | 1.2 | 2.0 | 0.0 |
| El convoy | 4 | 35% | 0% | 6.9 | 3.6 | 0.2 | 0.0 | 2.1 | 2.0 | 0.1 |
| Cuarentena | 2 | 45% | 0% | 8.2 | 4.5 | 0.1 | 0.0 | 2.3 | 2.9 | 0.1 |
| Cuarentena | 4 | 60% | 0% | 7.7 | 3.1 | 0.3 | 0.0 | 3.1 | 3.2 | 0.1 |
| Invierno | 2 | 45% | 0% | 8.3 | 3.9 | 0.1 | 0.1 | 2.3 | 0.2 | 0.0 |
| Invierno | 4 | 18% | 0% | 9.6 | 2.8 | 0.3 | 0.3 | 4.5 | 0.4 | 0.0 |
| El depósito | 2 | 68% | 0% | 8.8 | 4.2 | 0.2 | 0.1 | 2.6 | 0.0 | 0.0 |
| El depósito | 4 | 73% | 0% | 8.7 | 3.1 | 0.4 | 0.2 | 4.0 | 0.1 | 0.1 |
| Última llamada | 2 | 50% | 0% | 12.0 | 3.9 | 0.4 | 0.4 | 8.0 | 0.3 | 0.0 |
| Última llamada | 4 | 43% | 3% | 11.9 | 2.8 | 0.8 | 0.8 | 10.0 | 0.4 | 0.0 |
| Los suministros del puente | 2 | 20% | 0% | 11.6 | 4.3 | 0.1 | 0.1 | 3.6 | 0.1 | 0.0 |
| Los suministros del puente | 4 | 15% | 0% | 11.8 | 3.6 | 0.8 | 0.4 | 5.6 | 0.2 | 0.1 |
| Cero contagios | 2 | 15% | 0% | 13.0 | 4.6 | 0.6 | 0.0 | 4.3 | 0.5 | 0.4 |
| Cero contagios | 4 | 45% | 0% | 12.1 | 3.3 | 0.7 | 0.0 | 5.8 | 0.2 | 0.3 |
| Protocolo Z-2099 | 2 | 40% | 0% | 10.1 | 5.0 | 0.3 | 0.0 | 2.7 | 0.1 | 0.1 |
| Protocolo Z-2099 | 4 | 25% | 0% | 9.8 | 3.6 | 0.7 | 0.0 | 4.2 | 0.1 | 0.2 |

Con 10 jugadores (20 partidas):

| Misión | Jug. | Victoria | Gana zombi | Rondas | 1.ª horda | Mordiscos | Conversiones | Hordas | Crafteos | Curas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sin una gota | 10 | 10% | 0% | 9.2 | 3.1 | 1.4 | 0.0 | 5.3 | 0.2 | 0.7 |
| La granja | 10 | 90% | 0% | 12.0 | 2.5 | 1.4 | 1.4 | 8.4 | 0.3 | 0.0 |
| La emisora | 10 | 55% | 0% | 7.2 | 2.6 | 0.7 | 0.3 | 5.1 | 2.0 | 0.1 |
| El convoy | 10 | 35% | 0% | 6.9 | 3.2 | 0.5 | 0.0 | 3.5 | 2.0 | 0.3 |
| Cuarentena | 10 | 30% | 0% | 7.4 | 2.7 | 0.8 | 0.0 | 5.0 | 4.3 | 0.1 |
| Invierno | 10 | 15% | 0% | 9.7 | 2.3 | 1.4 | 1.4 | 8.1 | 1.1 | 0.0 |
| El depósito | 10 | 80% | 0% | 8.7 | 2.4 | 1.1 | 0.6 | 6.3 | 0.4 | 0.1 |
| Última llamada | 10 | 20% | 5% | 11.9 | 2.3 | 1.9 | 1.8 | 12.5 | 0.5 | 0.0 |
| Los suministros del puente | 10 | 30% | 0% | 11.6 | 2.7 | 1.6 | 0.8 | 7.9 | 0.8 | 0.3 |
| Cero contagios | 10 | 70% | 0% | 6.3 | 2.4 | 0.8 | 0.0 | 4.0 | 0.1 | 0.3 |
| Protocolo Z-2099 | 10 | 30% | 0% | 8.3 | 3.0 | 1.5 | 0.0 | 5.3 | 0.5 | 0.5 |

**Lectura de la segunda tanda.** Las conversiones caen a la sexta parte y el bando zombi deja de ganar por sistema (0 a 5 %). Diez de las doce misiones quedan entre el 15 y el 75 % de victorias a 2 y 4 jugadores, que es el rango buscado para un cooperativo difícil. Las dos fuera de rango son **Sin una gota a 10 jugadores** (10 %, porque diez personas deben estar todas vivas y en la misma casilla) y **La granja a 2** (95 %, demasiado fácil). El jugador zombi casi no aparece: con dos dados de defensa, convertirse vuelve a ser raro, así que la pregunta para la mesa pasa a ser si el modo zombi sale lo suficiente. Si no sale, la palanca es la variante hardcore inmediata en más misiones, no la defensa.

## Qué llevar a la mesa

1. Jugar primero **Sin una gota** a 4 para aprender, luego **Farmacia Central** y **El depósito**.
2. Probar **dos dados de defensa** en la mitad de las partidas y anotar los mordiscos por partida en el cuaderno.
3. Jugar una misión de cero contagios (**Cuarentena**) y contar cuántas veces el mordisco se anuló.
4. Anotar si el grupo entiende el kit de misión y las cantidades por tamaño, que ahora aparecen en el texto de la misión.
