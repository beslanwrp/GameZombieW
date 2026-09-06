# Z-2099 · Documento de diseño

Versión 1.0 · 6 de septiembre de 2026 · Estado: base para el prototipo

Juego de mesa digital, cooperativo, de supervivencia zombi. De 2 a 10 jugadores, cada uno desde su móvil, con una pantalla compartida opcional en la mesa. Escena 3D con cámara libre. Partidas de una hora.

---

## 1. Visión

### 1.1 En una frase

Diez supervivientes alrededor de una mesa, cada uno con su móvil, intentan cumplir una misión en un mapa octogonal que se descubre loseta a loseta, mientras el ruido que hacen atrae a las hordas y un mordisco puede convertir a un amigo en el enemigo.

### 1.2 Pilares de diseño

1. **Es un juego de mesa.** Losetas, dados, cartas y fichas con reglas que caben en una hoja. Todo lo que pasa se podría hacer con componentes físicos; la app quita la contabilidad y añade lo que la mesa no puede: información oculta, hordas que se mueven solas y una escena 3D.
2. **El ruido es la moneda del peligro.** Cada decisión útil (conducir, disparar, saquear deprisa) hace ruido, y el ruido trae a las hordas. La tensión no viene de la dificultad de las tiradas, sino de gestionar cuánto ruido se puede permitir el grupo.
3. **Nadie espera.** Con diez jugadores los turnos son simultáneos: todos planifican a la vez con un temporizador y la app resuelve por iniciativa. Una ronda dura tres minutos, no diez.
4. **El contagio cambia el bando.** Un jugador mordido puede acabar jugando como zombi con su propio objetivo. El equipo deja de confiar en la mesa y el juego cooperativo gana un enemigo con cara.
5. **Crudo, no gore.** Fotorealismo sucio, luz de atardecer, sangre visible pero sin regodeo. Tono 3 de 5.

### 1.3 Ambientación y el nombre

**Propuesta pendiente de confirmar.** «Z-2099» es el código del protocolo de cuarentena que aparece sellado en todos los expedientes, polaroids y fichas de personaje del juego. El año no cambia la estética: la tecnología de consumo ha caído y lo que queda es lo mismo que hoy, coches, radios, gasolina, antibióticos. Si prefieres que el 2099 sea literal, la única consecuencia de diseño es sustituir dos o tres objetos (paneles solares en vez de generador, dron muerto como carta de evento).

### 1.4 Referencias

La serie de AMC para fotografía, vestuario y tono. Zombicide para el ritmo de losetas y ruido. Dead of Winter para la desconfianza. Los personajes, nombres y lugares son originales. No se usa ninguna marca, nombre ni imagen de *The Walking Dead*.

---

## 2. Ficha técnica

| | |
| --- | --- |
| Plataformas | Android 10+ e iOS 16+. Cliente de pantalla compartida para Android TV, tablet y navegador |
| Jugadores | 2 a 10. Cada jugador con su móvil. Sin modo solitario en la primera versión |
| Duración | 60 minutos con 10 jugadores; 35 con 4 |
| Sesión | Partida única. Sin campaña ni progreso entre partidas |
| Conexión | Misma sala (wifi local o internet) y online con sala por código |
| Cámara | 3D libre con perspectiva: órbita, zoom y encuadre automático |
| Dirección visual | Crudo fotorealista, tono 3 de 5 |
| Idiomas | Español e inglés |
| Precio | Pago único. Sin compras dentro de la app |
| Edad | PEGI 16 orientativo |
| Motor | Unity 6 LTS con Universal Render Pipeline |

---

## 3. Una partida de principio a fin

1. **Sala.** Un jugador crea la sala y comparte un código de cuatro letras. Los demás entran desde su móvil. Si hay TV o tablet, abre el cliente de pantalla y escribe el mismo código.
2. **Personajes.** Cada jugador recibe dos cartas de personaje al azar y se queda una. Ve aptitud, habilidad, pro y contra. Los descartados vuelven al mazo.
3. **Misión.** Se revela una carta de misión de equipo. Fija el objetivo, el límite de rondas, la regla de contagio y qué casillas especiales hay en el mapa.
4. **Despliegue.** El refugio está en el centro del octógono. Solo se ven las siete losetas centrales. El resto está boca abajo. Las fichas empiezan en el refugio. El contador de ruido empieza en 2.
5. **Rondas.** Planificación simultánea de 60 segundos, resolución por iniciativa, fase de zombis, fase de noche. Ver sección 6.
6. **Mordiscos y conversiones.** Un jugador mordido sigue la regla de la misión: cuenta atrás, conversión inmediata o fin de la misión. Si se convierte, su móvil cambia de interfaz: ahora es el jugador zombi.
7. **Final.** El equipo gana si cumple la misión dentro del límite. Pierde si se agota el límite, si la misión lo declara (por ejemplo un contagio en una misión sin contagio) o si el jugador zombi cumple su objetivo. La app enseña el expediente final: quién sobrevivió, quién cayó y por qué.

---

## 4. Componentes

Todo digital, pero con nombre de componente de mesa.

| Componente | Cantidad | Descripción |
| --- | --- | --- |
| Losetas | 37 en un octógono de radio 3 hexágonos | Cada loseta son 7 casillas hexagonales. 120 casillas jugables, tamaño medio |
| Casillas | Calle, edificio, gasolinera, farmacia, taller, bosque, agua, entrada de horda, refugio | Ver sección 5 |
| Dados | 3 por jugador, personalizados | Ver sección 7 |
| Fichas de superviviente | 10, una por color | Modelo 3D del personaje con anillo de color y etiqueta |
| Fichas de zombi | Caminante, corredor, acorazado, niño, horda | La horda es una ficha que vale 5 caminantes |
| Marcadores | Ruido (0 a 8), rondas, contagio por jugador, señuelo, fuego, barricada | |
| Mazos | Objetos 60, recetas 20, eventos 30, zombis 40, hordas 20, personajes 12, misiones 12, objetivos secretos 10 (reservado) | Ver sección 14 |

---

## 5. Tablero

### 5.1 Forma y losetas

Mapa con forma de octágono compuesto por losetas hexagonales de siete casillas. La loseta central es el refugio y siempre está revelada junto con sus seis vecinas. Las 30 losetas restantes se colocan boca abajo al azar desde el mazo de losetas de la misión, que decide cuántas gasolineras, farmacias y talleres hay.

Una loseta se revela cuando una ficha de superviviente entra en cualquiera de sus casillas o cuando una habilidad lo permite (Rastreo). Al revelarse se colocan los zombis que indique su icono: 0, 1, 2 o una horda en las losetas de borde.

### 5.2 Tipos de casilla

| Casilla | Efecto |
| --- | --- |
| Calle | Sin efecto. Los vehículos solo circulan por calle |
| Edificio | Se puede saquear (roba 1 objeto). Bloquea la línea de visión. Refugio parcial: los zombis necesitan 2 movimientos para entrar |
| Gasolinera | Saquear da un bidón de gasolina en vez de objeto al azar. Hace +1 ruido al saquear |
| Farmacia | Saquear da antibióticos o botiquín. Máximo 2 saqueos por partida |
| Taller | Craftear aquí no gasta la acción. Saquear da cinta, clavos o piezas |
| Bosque | Cuesta 2 pasos entrar. Los zombis tampoco lo cruzan deprisa. Bloquea visión |
| Agua | Intransitable salvo con cuerda y gancho |
| Entrada de horda | Casilla de borde marcada. Aquí aparecen las hordas |
| Refugio | Centro. Los jugadores curan 1 herida al terminar la ronda aquí. Barricable en sus 6 aristas |

### 5.3 Distancias y adyacencia

Adyacencia: las seis casillas que tocan. Distancia: número de casillas del camino más corto que no cruce agua. Línea de visión para armas a distancia: recta de casillas sin edificio ni bosque, hasta 3 casillas.

---

## 6. Estructura de la ronda

Todo el grupo juega la ronda a la vez. Duración objetivo: tres minutos.

### 6.1 Fase de planificación (60 segundos, simultánea)

Cada jugador, en su móvil, tira sus dados y programa su turno: hasta **1 movimiento y 2 acciones**, en el orden que quiera. El movimiento se traza en el mapa y se ve en la pantalla compartida como una línea de puntos del color del jugador, para que el grupo coordine. Puede hablar libremente; la mesa es la mesa. Si el temporizador acaba, lo planificado se ejecuta y el resto se pierde.

### 6.2 Fase de resolución (por iniciativa)

La app ejecuta los planes en orden de iniciativa del personaje, del más alto al más bajo, un jugador tras otro pero en pocos segundos. Conflictos: dos jugadores saquean la misma casilla, el de más iniciativa roba primero y el segundo roba del resto. Si un plan deja de ser válido (la casilla ya está en llamas, el zombi que ibas a atacar ya murió), la acción se sustituye por la más parecida o se pierde, y el jugador lo ve en su registro.

### 6.3 Fase de zombis

1. Cada horda y cada zombi se mueve hacia el marcador de ruido más cercano; si no hay, hacia el superviviente más cercano. Caminantes 1 casilla, corredores 2, acorazados 1, niños 1. Un zombi que entra en la casilla de un superviviente lo ataca (sección 10).
2. El **jugador zombi**, si lo hay, actúa después con su propio plan (sección 13).

### 6.4 Fase de noche

1. El contador de ruido sube **1 automáticamente**. Cae la noche, los muertos se mueven.
2. Si el contador llega a 8: se roba una carta de horda, se resuelve y el contador baja a 4.
3. Se roba una carta de evento en las rondas pares.
4. Los supervivientes en el refugio curan 1 herida. Se descuentan los turnos de contagio, de vehículos, de fuego y de señuelos.
5. Avanza el marcador de rondas. Si llega al límite de la misión, se comprueba el final.

---

## 7. Dados personalizados

Un único dado de seis caras sirve para moverse y para combatir. Cada jugador tira 2 (algunos personajes 3).

| Cara | Cantidad por dado | Al mover | Al combatir |
| --- | --- | --- | --- |
| Paso | 3 | 1 casilla | 1 impacto |
| Doble paso | 1 | 2 casillas | 2 impactos |
| Ruido | 1 | 0 casillas y +1 al contador de ruido | 1 impacto y +1 al contador |
| Mordisco | 1 | 0 casillas. Si acabas el movimiento adyacente a un zombi, te ataca inmediatamente | 0 impactos. Si el zombi sigue en pie, te muerde |

Movimiento esperado: 2 dados dan 2,3 casillas de media; con moto 4 o más. La cara de ruido hace que moverse deprisa nunca sea gratis y la cara de mordisco castiga acercarse sin necesidad.

Repeticiones: algunas habilidades (Orden, Instinto) permiten repetir un dado. Nunca se repite una cara de mordisco salvo por Instinto.

---

## 8. Acciones y movimiento

### 8.1 Movimiento

Un movimiento por ronda con los pasos de la tirada. Entrar en bosque cuesta 2 pasos. No se puede atravesar una casilla con zombis salvo con Camuflaje de vísceras o la habilidad Nadie. Se puede terminar el movimiento en una casilla con otros supervivientes sin límite.

Con vehículo no se tira: se gasta gasolina por casilla (coche) o por cada dos casillas (moto) y solo por calle. El vehículo genera ruido cada ronda que se mueve.

### 8.2 Acciones (2 por ronda)

| Acción | Efecto |
| --- | --- |
| Saquear | En edificio, gasolinera, farmacia o taller: roba una carta según la casilla. Cada casilla se puede saquear dos veces por partida; la segunda hace +1 ruido |
| Atacar | Combate contra un zombi en tu casilla o, con arma a distancia, en línea de visión hasta 3 casillas |
| Craftear | Combina cartas de tu mano según una receta conocida. Gratis en taller |
| Intercambiar | Da o recibe cualquier número de cartas con un superviviente adyacente o con Enlace |
| Curar | Usa botiquín (cura 2 heridas) o antibióticos (cura 1 herida y da +1 turno de contagio) sobre ti o un adyacente |
| Usar objeto | Molotov, señuelo, barricada, cuerda, etc. |
| Subir o bajar | Entrar o salir de un vehículo en tu casilla |
| Descansar | Recupera 1 herida si no hay zombis a 2 casillas. Cuenta como no hacer ruido |

### 8.3 Peso e inventario

La mano no tiene límite de cartas, pero cada objeto pesa. Capacidad base 6. Cinta, clavos, pilas, trapo y botella pesan 0; armas y herramientas 1; bidones, tablas y chapa 2. Al superar la capacidad, cada tirada de movimiento pierde un dado. Un coche suma 6 de capacidad compartida mientras se viaja en él.

---

## 9. Ruido y hordas

### 9.1 El contador

Un único contador de 0 a 8 para todo el grupo, siempre visible en la pantalla compartida y en la cabecera de cada móvil. Empieza en 2.

| Fuente | Ruido |
| --- | --- |
| Fase de noche | +1 automático cada ronda |
| Cara de ruido en un dado | +1 |
| Disparo (pistola, rifle) | +2, o 0 con silenciador |
| Moto en marcha | +1 por ronda |
| Coche en marcha | +2 por ronda |
| Saquear gasolinera o segundo saqueo | +1 |
| Señuelo sonoro | +2 en su casilla, atrae localmente |
| Molotov | 0, pero atrae a la horda más cercana 1 casilla |
| Derribo de barricada por horda | +1 |

Al llegar a 8: carta de horda, contador a 4. El grupo puede bajarlo: descansar todos en el refugio una ronda entera lo baja 2; las cartas de evento «Silencio» y «Lluvia» lo bajan 1.

### 9.2 Cartas de horda

Al robar una carta de horda se leen dos cosas: **dónde** (una entrada de horda concreta, la más cercana al ruido, o la más lejana a los jugadores) y **qué** (una horda de 5 caminantes, 3 corredores, 1 acorazado y 3 caminantes, o un efecto: «los zombis del tablero se mueven una casilla extra», «un caminante aparece en cada edificio revelado»).

### 9.3 Escalado por jugadores

| Jugadores | Zombis por carta de horda | Zombis al revelar loseta | Cartas de horda en el mazo |
| --- | --- | --- | --- |
| 2 a 3 | 3 | según icono | 12 |
| 4 a 6 | 5 | según icono | 16 |
| 7 a 8 | 7 | icono +1 | 20 |
| 9 a 10 | 9 | icono +1 | 20 y el contador empieza en 3 |

---

## 10. Zombis y combate

### 10.1 Tipos

| Zombi | Fuerza | Movimiento | Particularidad |
| --- | --- | --- | --- |
| Caminante | 1 | 1 | El más común. Una horda son 5 caminantes que se mueven juntos y atacan como uno de fuerza 3 |
| Corredor | 2 | 2 | Aparece en calles. Un disparo a distancia lo mata sin tirada si es con rifle |
| Acorazado | 3 | 1 | Antidisturbios o soldado. Inmune a armas a distancia; solo cuerpo a cuerpo o molotov |
| Niño | 1 | 1 | Atacarlo da 1 de pánico a quien lo hace. Los personajes con contra mental no pueden atacarlo |

### 10.2 Resolver un combate

1. El atacante elige objetivo y arma. Tira los dados que indique el arma (sin arma: 1 dado; bate 2; bate con clavos 2 con +1 impacto; pistola 2 a distancia; rifle 2 a distancia y mata corredores; katana 3).
2. Cuenta impactos. Si los impactos igualan o superan la fuerza del zombi, muere. Contra una horda, cada 3 impactos eliminan un caminante de la horda.
3. Si el zombi sigue en pie y ha salido al menos una cara de mordisco, el zombi muerde al atacante: 1 herida y estado **Mordido**.
4. Las armas cuerpo a cuerpo con durabilidad pierden 1 uso por combate.

### 10.3 Ser atacado en la fase de zombis

Cada zombi que entre en tu casilla te ataca: tiras 1 dado de defensa (2 con Instinto o con escudo improvisado). Paso o doble paso: lo esquivas. Ruido: lo esquivas pero +1 ruido. Mordisco: 1 herida y Mordido. Una horda ataca como uno de fuerza 3: si no esquivas, 2 heridas.

### 10.4 Heridas y pánico

Los personajes tienen 3 de vida (Ruy 2, Elías 4). A 0 el personaje cae: no está muerto, pero pierde la ronda y otro superviviente adyacente debe levantarlo con una acción o usará su turno siguiente en levantarse con 1 de vida. Si una horda entra en la casilla de un caído, muere y su jugador pasa a jugador zombi si la misión lo permite; si no, sale de la partida y puede seguir como espectador con voz.

El pánico es un contador de 0 a 3 por personaje. Sube con niños zombi, hordas adyacentes y ciertos eventos. A 3 el personaje solo puede moverse hacia el refugio hasta que alguien le quite pánico (Sermón, comida caliente, descansar).

---

## 11. Contagio

### 11.1 La regla la fija la misión

| Regla | Efecto de un mordisco |
| --- | --- |
| **Cuenta atrás** (por defecto) | El jugador queda Mordido con 4 turnos. Cada fase de noche baja 1. Tratamiento suma 2; antibióticos suman 1. A 0 se convierte al inicio de la fase de zombis |
| **Sin contagio** | El primer mordisco que no se anule en la misma ronda con Tratamiento hace fracasar la misión |
| **Hardcore** | Conversión inmediata al terminar la ronda. Sin cura posible |

### 11.2 Amputación

En cuenta atrás, un superviviente adyacente con machete, katana o hacha puede amputar en una acción: el mordido pierde 2 de vida, pierde la cara de doble paso en todos sus dados para el resto de la partida y deja de estar Mordido. Solo funciona si el mordisco fue en esa misma ronda o en la anterior.

### 11.3 Conversión

El personaje se convierte en un zombi con su modelo, su ropa y su anillo de color roto. Su ficha pasa a estar controlada por el jugador zombi. Si ya había un jugador zombi, el nuevo se une a su bando y controla su propia ficha; comparten objetivo.

---

## 12. Jugador zombi

Cuando un jugador se convierte, su móvil cambia: fondo oscuro, visión con el tablero teñido y el olor de los supervivientes como halos. Sigue sentado en la mesa. Puede hablar, mentir y escuchar.

### 12.1 Objetivo

Gana si **la mitad o más de los supervivientes que empezaron la partida** están convertidos o muertos antes de que el equipo cumpla la misión. El equipo aún puede ganar si cumple la misión antes.

### 12.2 Turno del jugador zombi

Actúa en la fase de zombis, después del movimiento automático, con **2 acciones**:

| Acción | Efecto |
| --- | --- |
| Mover horda | Mueve una horda o un zombi del tablero 1 casilla adicional en la dirección que quiera, o redirige su objetivo |
| Ocultarse | Su ficha se mezcla con una horda. Los supervivientes solo ven la horda; la app no marca cuál es él hasta que ataque o se separe |
| Oler | Ve la mano de un superviviente a 3 casillas o menos. El olido solo sabe que lo han olido |
| Reclutar | Cuando un superviviente se convierte estando su ficha adyacente, el jugador zombi elige dónde aparece la nueva ficha zombi y roba una carta de horda extra |
| Mover su ficha | 1 casilla, o 2 si ha evolucionado |
| Atacar | Su ficha ataca como un zombi de fuerza 2 (3 evolucionado). Un mordisco suyo aplica la regla de contagio de la misión |

### 12.3 Evolución

Por cada superviviente convertido mientras hay jugador zombi, éste evoluciona un nivel: nivel 1 mueve 2, nivel 2 fuerza 3, nivel 3 puede ocultarse y mover horda en la misma acción. Sin adiciones a partir del nivel 3.

### 12.4 Comunicación y engaño

El jugador zombi no ve la planificación de los supervivientes, pero ve el tablero entero incluidas las losetas ocultas. Puede decir lo que quiera en la mesa. Los supervivientes deciden si le creen.

---

## 13. Misiones

Doce cartas. Cada una indica objetivo, límite de rondas, regla de contagio, losetas especiales garantizadas y escalado. Las etiquetas: **SC** sin contagio, **HC** hardcore, **T** límite de rondas, **R** recolectar.

| # | Misión | Etiquetas | Objetivo | Rondas |
| --- | --- | --- | --- | --- |
| 1 | Farmacia Central | R, cuenta atrás | Traer 3 antibióticos al refugio. El mapa garantiza 2 farmacias en bordes opuestos | 10 |
| 2 | Sin una gota | SC, T | Llegar todos vivos al helipuerto de una loseta de borde revelada al inicio | 10 |
| 3 | La granja | HC, R | Conseguir semillas (evento) y 2 bidones, y aguantar en el refugio hasta el final | 12 |
| 4 | La emisora | R, T | Craftear Señuelo, llevarlo a la torre de radio y mantener un superviviente allí 2 rondas | 10 |
| 5 | El convoy | R, T | Craftear 2 vehículos y sacar a 6 supervivientes por cualquier borde | 9 |
| 6 | Cuarentena | SC, T | Levantar barricadas en las 6 aristas del refugio | 8 |
| 7 | Invierno | HC, T | Acumular 10 cartas de comida en el refugio | 10 |
| 8 | El depósito | R | Llevar 4 bidones al generador de la loseta central norte | 12 |
| 9 | Última llamada | HC, T | Sobrevivir con al menos la mitad del equipo. Se roba carta de horda cada ronda desde la 6 | 12 |
| 10 | Los suministros del puente | R, T | Recoger 5 objetos marcados repartidos en losetas de borde | 10 |
| 11 | Cero contagios | SC, T | Revelar las 8 losetas de borde | 12 |
| 12 | Protocolo Z-2099 | HC, SC, T | Recoger muestras de un caminante, un corredor y un acorazado (al matarlos) y llevarlas al laboratorio | 12 |

La misión 12 combina hardcore y sin contagio: un mordisco convierte y además hace fracasar. Es la misión final, para grupos que ya conocen el juego.

---

## 14. Cartas

### 14.1 Objetos (60)

| Grupo | Cartas | Notas |
| --- | --- | --- |
| Materiales | Cinta 6, clavos 5, pilas 6, trapo 4, botella 5, tablas 3, chapa 2 | Peso 0 salvo tablas y chapa |
| Armas | Bate 3, machete 2, katana 1, pistola 4, rifle 2, ballesta 1 | Katana y ballesta también las traen personajes |
| Consumibles | Botiquín 4, antibióticos 3, comida 6 | La comida cuenta para Invierno y quita pánico con Omar |
| Vehículos | Moto 2, coche 2 | Sin gasolina no se mueven |
| Combustible | Bidón de gasolina 3 en el mazo; el resto en gasolineras | |
| Otros | Radio 2, walkie-talkie 3, poncho 2, cuerda y gancho 1, prismáticos 1 | |

### 14.2 Recetas (20)

Las diez esenciales están en `02-crafteo.md`. Las diez restantes: hacha (tubo + machete roto + cinta), escudo improvisado (chapa + cinta: 2 dados de defensa), antorcha (tubo + trapo + gasolina: los zombis no entran en tu casilla 2 turnos), lanza (tubo + machete: ataca a distancia 1), trampa de ruido (radio + cuerda: se activa cuando una horda entra), botiquín de campaña (trapo + botella + alcohol de evento), munición casera (pilas no; clavos + pólvora de evento: +2 disparos), comida caliente (comida + hornillo de evento: quita 1 pánico a todos en la casilla), gancho de escalada (cuerda + clavos: cruzar agua), bengala (botella + pólvora: revela 3 losetas y hace +3 ruido).

Recetas iniciales conocidas por todos: moto con depósito, bate con clavos, tratamiento. El resto se aprende robando su carta de recetario al saquear talleres o por evento.

### 14.3 Eventos (30)

Se roban en rondas pares. Ejemplos: **Lluvia** (ruido -1, camuflaje anulado, vehículos gastan doble), **Silencio** (ruido -1), **Motor lejano** (aparece un coche en una calle revelada), **Otros supervivientes** (el grupo elige: comerciar 2 cartas por 1 o robar con riesgo de +2 ruido), **Niebla** (visión 1 casilla), **Estampida** (todas las hordas se mueven 1 extra), **Semillas**, **Pólvora**, **Hornillo**, **Alcohol**, **Recuerdo** (cada jugador cuenta algo de su personaje; -1 pánico a todos; sin efecto mecánico más allá, es el evento de mesa), **Mordisco tardío** (un jugador que curó un mordisco esta partida vuelve a estar Mordido con 2 turnos).

### 14.4 Zombis (40) y hordas (20)

El mazo de zombis se usa al revelar losetas: indica qué tipo aparece. 24 caminantes, 8 corredores, 4 acorazados, 4 niños. Las cartas de horda se describen en 9.2.

### 14.5 Objetivos secretos (10, reservado)

Preparados para el modo traidor de una ampliación. No se reparten en la primera versión. El diseño de cartas ya incluye el hueco del sello «Confidencial».

---

## 15. Personajes

Doce personajes originales. Cada uno: vida, iniciativa (1 a 10, sin repetir), capacidad, dados de movimiento, aptitud pasiva, habilidad activa, pro y contra. Todos pueden hacer todo lo básico; la diferencia está en cómo de bien.

| # | Personaje | Vida | Inic. | Cap. | Dados | Habilidad | Pro | Contra |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Elías Vega**, el Alguacil. Ex policía rural, 58 años | 4 | 7 | 6 | 2 | **Orden**: una vez por ronda, un superviviente a 3 casillas repite un dado | Pistola inicial. Tira 3 dados con armas de fuego | Social · **Mando**: no puede recibir órdenes: no se beneficia de habilidades de otros |
| 2 | **Sunja Park**, la Hoja. Profesora de kendo | 3 | 9 | 5 | 2 | **Filo silencioso**: sus combates cuerpo a cuerpo nunca generan ruido y matan hasta 2 caminantes por acción | Katana inicial, sin durabilidad | Social · **Loba solitaria**: no puede recibir cartas de otros jugadores |
| 3 | **Tomás Iriarte**, Gancho. Cazador | 3 | 6 | 6 | 2 | **Rastreo**: al final de su movimiento revela una loseta adyacente sin entrar | Ballesta inicial sin ruido; recupera la flecha al matar | Físico · **Cojera**: -1 paso en cada tirada de movimiento |
| 4 | **Naima Haddad**, la Doctora. Cirujana | 3 | 5 | 6 | 2 | **Triaje**: una vez por ronda cura 1 herida a un adyacente sin gastar carta. Su Tratamiento suma 3 en vez de 2 | Botiquín inicial | Mental · **Juramento**: no puede atacar a zombis que fueron jugadores |
| 5 | **Ruy**, el Niño. 12 años | 2 | 10 | 3 | 2 | **Pequeño**: los zombis lo ignoran si hay un adulto en su casilla. **Colarse**: saquea 2 cartas | Ningún zombi lo elige como objetivo de horda | Físico · **Débil**: capacidad 3 y no puede usar armas de fuego ni conducir |
| 6 | **Marga Solís**, la Mecánica | 3 | 4 | 7 | 2 | **Chapuza**: una vez por partida craftea con un ingrediente menos. Los vehículos que conduce gastan 1 gasolina menos por ronda | Coche inicial sin gasolina | Mental · **Claustrofobia**: no puede terminar la ronda dentro de un edificio |
| 7 | **Anselmo Ruiz**, el Padre. Sacerdote | 3 | 3 | 6 | 2 | **Sermón**: quita 1 pánico a todos los supervivientes a 2 casillas | Los eventos de otros supervivientes siempre comercian | Social · **Pacifista**: solo combate en defensa |
| 8 | **Kenji Ōta**, el Cartero. Corredor de fondo | 3 | 8 | 5 | **3** | **Zancada**: el bosque le cuesta 1 paso | Puede moverse antes y después de una acción | Mental · **Pánico a la horda**: si hay una horda a 2 casillas, su movimiento debe alejarla |
| 9 | **Beatriz Lorca**, la Superviviente. Lleva un año sola | 3 | 6 | 6 | 2 | **Instinto**: 2 dados de defensa y puede repetir una cara de mordisco una vez por ronda | Una vez por partida descarta el evento recién revelado | Social · **Desconfiada**: no acepta curas ni Tratamiento de otros; solo se cura sola |
| 10 | **Omar Benali**, el Cocinero | 3 | 2 | 7 | 2 | **Racionar**: cada comida cuenta doble para misiones y quita 1 pánico al usarse en su casilla | Machete inicial | Físico · **Mala vista**: -1 dado con armas a distancia |
| 11 | **Lidia Castaño**, la Tiradora. Ex militar | 3 | 5 | 6 | 2 | **Cobertura**: dispara a 4 casillas y mata corredores de un tiro con cualquier arma de fuego | Rifle inicial | Mental · **Insomnio**: al inicio de cada ronda tira 1 dado; mordisco = pierde una acción |
| 12 | **Ceniza**. Nadie sabe su nombre | 3 | 1 | 6 | 2 | **Nadie**: las hordas no lo eligen como objetivo si hay otro superviviente a igual distancia. Atraviesa casillas con caminantes gastando 2 pasos extra | Poncho inicial | Social · **Mudo**: no puede usar Enlace ni intercambiar fuera del refugio |

Las iniciativas 5 y 6 se repiten a propósito: los conflictos entre Naima y Lidia, o entre Tomás y Beatriz, se resuelven por quien confirmó antes su plan.

---

## 16. Cámara y presentación

Cámara **3D libre con perspectiva**, según tu decisión. El comparador `docs/encuesta/z2099-camara.html` documenta las alternativas. Estas son las medidas para que la cámara libre no comprometa la legibilidad con diez fichas ni el presupuesto.

### 16.1 Controles en el móvil

| Gesto | Efecto |
| --- | --- |
| Un dedo arrastra | Orbitar alrededor del punto de interés |
| Dos dedos pinza | Zoom, entre 4 y 30 metros de distancia |
| Dos dedos arrastran | Desplazar el punto de interés por el tablero |
| Doble toque en casilla | Centrar y acercar a esa casilla |
| Botón «Ver todo» | Encuadre automático del tablero revelado, elevación 50° |
| Botón «Mi ficha» | Encuadra tu ficha y las 3 casillas alrededor |
| Botón «Vista de mesa» | Preajuste isométrico a 35° y 45°; el jugador puede elegirlo como cámara por defecto en ajustes |

Elevación limitada entre 20° y 80°: nunca se ve el tablero desde debajo ni exactamente desde arriba. Al empezar tu planificación la cámara encuadra tu ficha. Al resolver, sigue la acción con cortes breves.

### 16.2 Ayudas de legibilidad

- Etiquetas de jugador (J1 a J10 o el nombre) en espacio de pantalla, tamaño constante sea cual sea la distancia.
- Contorno del color del jugador alrededor de cada ficha, visible a través de edificios.
- Contador sobre cada horda con su número de caminantes.
- Minimapa cenital en una esquina, con niebla sobre las losetas ocultas y puntos para fichas y hordas.
- Casillas con zombis, fuego, barricada o señuelo con un icono plano en el suelo, además del modelo 3D.
- Línea de puntos del color del jugador para el movimiento planificado; lo ven todos en la pantalla compartida.

### 16.3 Coste de arte que asume la cámara libre

Todo modelo debe verse bien desde cualquier ángulo y a distancias entre 4 y 30 metros: tres niveles de detalle por modelo, texturas de 2K en fichas y 1K en escenografía, oclusión ambiental precalculada por loseta, sombras dinámicas solo para fichas. Presupuesto estimado de assets: 12 personajes, 4 zombis con 3 variantes de ropa cada uno, 2 vehículos, 9 tipos de casilla con 3 variantes, 25 props (barricada, señuelo, fuego, bidón, etc.), 37 losetas ensambladas. Con dirección fotorealista, esto es aproximadamente el doble del presupuesto de arte de la opción isométrica.

Límite de rendimiento objetivo en móvil de gama media (Snapdragon 7 o Apple A14): 30 fps con 10 fichas, 80 zombis y el tablero completo revelado. Por encima de 80 zombis la horda se representa como un grupo de 5 modelos más un contador.

---

## 17. Pantalla compartida y móviles

### 17.1 Qué se ve en cada sitio

| | Móvil de cada jugador | Pantalla compartida (opcional) |
| --- | --- | --- |
| Tablero 3D | Sí, con cámara libre propia | Sí, con cámara directora automática |
| Mano de cartas | Solo la propia | Nunca |
| Dados | Los propios, con animación física | Los de todos al resolver |
| Contador de ruido, rondas, misión | Sí, en cabecera | Grande, siempre visible |
| Planes de movimiento | El propio en detalle, el de otros como líneas | Todos como líneas |
| Estado de otros jugadores | Vida, pánico, mordido, posición | Igual, en un lateral |
| Registro de la ronda | Completo | Los eventos importantes |
| Interfaz del jugador zombi | Solo en su móvil | La pantalla no revela quién es ni dónde está oculto |

### 17.2 Cámara directora

En la pantalla compartida la cámara es automática: plano general durante la planificación, cortes a cada acción durante la resolución, plano de la horda al robar carta, plano lento del refugio al caer la noche. Cualquiera puede tocar la tablet para tomar el control manual durante 20 segundos.

### 17.3 Sin pantalla compartida

La partida es completa solo con móviles. El botón «Ver todo» y el minimapa cubren la visión de conjunto. Para partidas online, la pantalla compartida puede abrirse en el navegador de cualquier jugador que quiera verla en un segundo dispositivo.

---

## 18. Multijugador y red

- **Sala por código** de 4 letras, válido en local y online. Los móviles en la misma wifi se descubren también sin código.
- **Autoridad en el servidor** (o en el host relé): las tiradas, el mazo y la resolución las hace un solo lado; los móviles envían planes y reciben estado. Evita trampas y desincronizaciones.
- **Reconexión** durante 3 minutos manteniendo el asiento. Si un jugador no vuelve, su personaje descansa en su sitio y la app le asigna «descansar» cada ronda hasta que vuelva o el grupo lo expulse.
- **Espectadores**: los jugadores eliminados sin posibilidad de ser zombi siguen viendo la partida con la cámara directora y pueden hablar en la mesa.
- **Tiempo de planificación** ajustable: 45, 60 (por defecto) o 90 segundos, o sin límite para grupos tranquilos.
- **Latencia**: un plan enviado tarde por red se acepta hasta 2 segundos después del fin del temporizador.

---

## 19. Pantallas del móvil

1. **Inicio**: crear sala, unirse con código, reglas, ajustes.
2. **Sala**: lista de jugadores con color, selección de misión (al azar o elegida), botón de pantalla compartida.
3. **Personaje**: las dos cartas a elegir, con el expediente completo; luego la ficha del personaje elegido siempre accesible.
4. **Tablero**: vista 3D con controles de cámara, minimapa, cabecera con ruido, ronda y misión.
5. **Planificación**: dados en la parte baja; el tablero en el centro; la mano de cartas desplegable desde el borde inferior. Trazar movimiento tocando casillas; añadir acciones desde el menú radial de la casilla.
6. **Resolución**: pantalla de solo lectura con el registro en tiempo real y la cámara siguiendo la acción.
7. **Crafteo**: libro de recetas conocidas con las que puedes hacer ahora resaltadas.
8. **Jugador zombi**: mismo tablero, paleta invertida, halos de olor, acciones propias.
9. **Final**: expediente de la partida con el recorrido de cada superviviente y el momento decisivo.

Cada carta se lee ocupando toda la pantalla del móvil en vertical: la carta es el formato nativo del juego en el teléfono.

---

## 20. Arte y audio

### 20.1 Dirección

Crudo fotorealista. Paleta de verdes apagados, ocres, óxido y asfalto, con el atardecer como única luz cálida. Los materiales cuentan la historia: cinta americana en todo, óxido en los vehículos, sangre seca y no fresca. Sin neón, sin interfaz brillante. La interfaz usa papel de expediente, sello Z-2099, fotografías polaroid y letra de máquina de escribir.

### 20.2 Cartas

Formato expediente y polaroid. Cada carta de objeto es una polaroid con clip sobre una ficha de cartulina, con notas a mano. Las de personaje son un expediente policial con foto de frente, nombre tachado en las de Ceniza. Las de misión son una hoja de protocolo sellada. Las de horda, una fotografía borrosa con el número escrito con rotulador.

### 20.3 Audio

Ambiente de viento, chapa y cuervos; el ruido del contador se oye: a 6 empiezan los gemidos lejanos, a 7 se acercan, a 8 la horda. Sin música durante la planificación; un motivo de cuerda cuando cae la noche. Los dados suenan a hueso sobre madera. Voz mínima: sin diálogos grabados en la primera versión.

---

## 21. Tecnología

| Capa | Elección | Motivo |
| --- | --- | --- |
| Motor | Unity 6 LTS, Universal Render Pipeline | Fotorealismo en móvil, niveles de detalle, cliente de TV con el mismo proyecto |
| Red | Netcode for GameObjects con Unity Relay y Lobby | Sala por código sin servidores propios; el host es el móvil que crea la sala. Alternativa si crece: Photon Fusion |
| Reglas | Módulo C# puro, sin dependencias de Unity, con pruebas automáticas | El mismo módulo corre en el prototipo web compilado a WebAssembly y en el juego |
| Datos de cartas | Hojas de cálculo exportadas a JSON | Equilibrar sin recompilar |
| Cliente de pantalla | Compilación Android TV y WebGL del mismo proyecto | Una sola base de código |
| Localización | Unity Localization, español e inglés | |
| Backend | Ninguno en la primera versión más allá de Relay y Lobby | Pago único, sin cuentas |
| Análisis | Registro anónimo de partidas (duración, misión, resultado, ruido medio) exportable | Equilibrio tras el lanzamiento |

### 21.1 Prototipo web (primer entregable)

Antes de Unity: un prototipo de reglas en el navegador, sin 3D, con tablero hexagonal plano, dados, cartas y turnos simultáneos en una misma pantalla o en varios móviles vía sala. Sirve para probar las reglas de las secciones 6 a 13 con amigos en dos semanas y ajustar números antes de invertir en arte.

---

## 22. Parámetros de equilibrio

Valores iniciales, todos en el JSON de datos.

| Parámetro | Valor |
| --- | --- |
| Acciones por ronda | 2 |
| Dados base | 2 |
| Capacidad base | 6 |
| Vida base | 3 |
| Contador de ruido inicial | 2 (3 con 9 a 10 jugadores) |
| Tope de ruido | 8, baja a 4 tras la horda |
| Ruido automático por ronda | 1 |
| Turnos de cuenta atrás de contagio | 4 |
| Tratamiento | +2 turnos |
| Tiempo de planificación | 60 s |
| Rondas por misión | 8 a 12 |
| Zombis máximos representados | 80 |
| Saqueos por casilla | 2 |
| Distancia de disparo | 3 (4 con Cobertura) |
| Gasolina inicial de moto y coche | 3 y 4 |
| Umbral de victoria del jugador zombi | mitad del equipo inicial, redondeando arriba |

---

## 23. Alcance y plan

| Hito | Contenido | Duración |
| --- | --- | --- |
| **M0 · Prototipo web de reglas** | Tablero plano, dados, 4 misiones, 6 personajes, crafteo esencial, contagio, jugador zombi. Pruebas con grupos reales | 4 semanas |
| **M1 · Corte vertical en Unity** | Una misión completa con arte final: 4 personajes, 2 zombis, 12 losetas, cámara libre, red con sala por código, 4 móviles | 3 meses |
| **M2 · Alfa de contenido** | 12 personajes, 12 misiones, todos los mazos, 10 jugadores, jugador zombi, español e inglés | 3 meses |
| **M3 · Beta y pantalla compartida** | Cliente de TV y web, cámara directora, reconexión, equilibrio con datos, pruebas cerradas | 2 meses |
| **M4 · Lanzamiento** | Tiendas, ficha, tráiler, soporte | 1 mes |

Equipo mínimo: una persona de diseño y producción, dos de programación (reglas y red; cliente y cámara), dos de arte 3D, una de interfaz y cartas, audio externo.

### 23.1 Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Coste de arte de fotorealismo con cámara libre | Corte vertical M1 con presupuesto real antes de comprometer las 37 losetas. Preajuste «Vista de mesa» ya diseñado por si hay que recortar ángulos |
| Rondas lentas con 10 jugadores | Temporizador, planificación simultánea, resolución en menos de 20 segundos. Medir en M0 |
| El jugador zombi aburre o domina | Probar en M0 sus 2 acciones y el umbral de la mitad; ajustar evolución |
| Reconocimiento de la marca *The Walking Dead* | Todo el contenido es original; revisión legal del texto de tienda antes de M4 |
| Móviles antiguos | Nivel gráfico bajo automático: sin sombras dinámicas, hordas como grupo con contador |

---

## 24. Preguntas abiertas

1. ¿El 2099 es literal o solo el código del protocolo? (sección 1.3)
2. ¿Confirmas la subida automática de ruido por ronda? Sin ella, las hordas dependen solo de vehículos y disparos.
3. ¿Umbral de victoria del jugador zombi con 2 y 3 jugadores? Con 2, «la mitad» es un solo contagio; propongo que con menos de 4 jugadores la victoria zombi requiera a todos.
4. ¿Modo solitario más adelante? Implica una inteligencia para 2 o 3 personajes controlados por un jugador.
5. ¿Nombre definitivo? Z-2099 funciona como código; conviene comprobar disponibilidad en las tiendas antes de M4.
