# Z-2099 · decisiones tomadas en la encuesta

Respuestas del 6 de septiembre de 2026 (41 de 41 preguntas). Nombre elegido: **Z-2099** (antes «Última Ronda»).

## Resumen de decisiones

| Área | Decisión | Nota de diseño |
| --- | --- | --- |
| Dirección visual | **B · Crudo fotorealista**. Referencia: la serie de AMC. Tono 3 de 5 (sangre visible, sin regodeo) | Es la opción más cara en arte y la que más exige al móvil. Compensamos con cámara fija y pocos materiales |
| Presentación | Cámara **isométrica fija con zoom**. Duda abierta: 2,5D o 3D | Resuelta en `docs/encuesta/z2099-camara.html` y en la sección de abajo |
| Tablero | Mapa **octogonal de casillas hexagonales**, **losetas que se descubren**, tamaño **medio** (unas 120 casillas) | Seis direcciones de movimiento, distancias homogéneas |
| Cartas | Estilo **expediente y polaroid**. Ocho mazos: zombis, hordas, objetos, crafteo, eventos, personajes, misiones, objetivos secretos | Los objetivos secretos quedan para el modo traidor, que va «más adelante» |
| Mano | **Sin límite, con peso de inventario** | Cada objeto pesa; el personaje tiene capacidad. Los vehículos amplían la capacidad |
| Dados | **Dados personalizados** con caras de pasos, ruido y mordisco | La tirada mueve y a la vez genera peligro |
| Vehículos | Consumen **gasolina por casilla**; se repostan con bidones | Ver recetas 1 y 2 en `02-crafteo.md` |
| Ruido | Lo generan **vehículos y armas de fuego** | Ver tensión 1 |
| Combate | **Tirada del jugador contra la fuerza del zombi**; las armas suman | |
| Hordas | Aparecen cuando el **contador de ruido** llega al tope | Ver tensión 1 |
| Escalado | **Más zombis por carta de horda** según jugadores | |
| Crafteo | **Recetas fijas** en un libro visible; se craftea **en cualquier casilla** gastando la acción | |
| Contagio | **Lo decide la carta de misión**: sin contagios, cuenta atrás o hardcore | |
| Jugador zombi | Puede **mover una horda, ocultarse, oler, reclutar y evolucionar**. Gana al **contagiar a la mitad** del equipo | Sin «contagiar al contacto con tirada»: contagia a través de las hordas que mueve |
| Traidor oculto | **Más adelante**, en una ampliación | |
| Misiones | Condiciones: **sin contagio, hardcore, límite de rondas, recolectar N objetos** | |
| Duración | **Alrededor de una hora** con 10 jugadores. **Sin campaña** | |
| Personajes | **Originales** inspirados en arquetipos. **12** personajes. Reparto **al azar, dos cartas y te quedas una**. Contras **físicos, mentales y sociales** | Sin adicciones |
| Mesa | **Pantalla compartida** (tablet o TV) con el tablero; cada móvil es la mano privada | Interés en realidad aumentada: 3 de 5, queda como modo futuro |
| Conexión | **Misma sala y online** con sala por código. Mínimo **2** jugadores | |
| Turnos | **Simultáneos**: todos planifican y se resuelve por iniciativa | Imprescindible con 10 jugadores |
| Negocio | **Pago único** | |
| Tecnología | **Recomiéndame** | Ver recomendación |
| Idiomas | **Español e inglés** | |
| Primer entregable | **Prototipo jugable en navegador** para probar reglas | |

## Tensiones detectadas

1. **Las hordas solo llegan por ruido, y el ruido solo lo hacen vehículos y armas de fuego.** Un grupo que camine y pelee cuerpo a cuerpo no vería nunca una horda. Propuesta: el contador de ruido sube 1 al final de cada ronda de forma automática (la noche cae, los zombis se mueven), además del ruido que hagan los jugadores. Así la horda siempre acaba llegando y el ruido de los jugadores solo la adelanta.
2. **Jugador zombi sin ataque directo.** Has elegido que gane contagiando a la mitad del equipo pero sin la habilidad de contagiar al contacto. Funciona si su forma de contagiar es mover hordas encima de los jugadores. Lo dejo así y lo probamos en el prototipo.
3. **Mano ilimitada con peso.** Hay que fijar la capacidad base (propuesta: 6 unidades de peso), el peso de cada objeto y qué pasa al superarla (propuesta: se pierde una cara de pasos en cada tirada).
4. **Fotorealismo en móviles de gama media.** Con 10 fichas, hordas y 120 casillas, el fotorealismo pide cámara fija, sombras precalculadas y un límite de unos 80 zombis en pantalla. La cámara isométrica fija que has elegido lo hace posible.
5. **Z-2099.** El nombre sugiere un escenario futuro. Queda por decidir si el año importa en la ambientación (tecnología distinta, causa del brote) o si es solo un nombre.

## 2,5D o 3D

La duda del comentario final. Las dos opciones usan modelos 3D reales; lo que cambia es la cámara.

- **2,5D es cámara fija sobre una escena 3D**, lo que hacía el *God of War* clásico. Para un juego de mesa con 10 fichas es la opción correcta: el tablero se lee entero, los sprites de cartas y fichas tienen siempre el mismo tamaño y los efectos de luz se pueden precalcular.
- **3D con cámara libre** (lo que hace *God of War* de 2018 en tercera persona) da inmersión pero pierde la visión de conjunto, exige controles de cámara en el móvil y multiplica el coste de arte porque todo debe verse bien desde cualquier ángulo.

**Recomendación:** modelos 3D con cámara isométrica fija, zoom y giro del tablero en cuatro pasos de 90 grados. El comparador interactivo permite probar las cuatro cámaras sobre el mismo tablero.

## Tecnología recomendada

**Unity** (Universal Render Pipeline). Motivos: es el estándar para fotorealismo en móvil, tiene la mejor cadena de realidad aumentada si más adelante la quieres (AR Foundation), permite compilar la misma escena como cliente de pantalla compartida para Android TV y como cliente de móvil, y su ecosistema de red (Netcode for GameObjects o Photon Fusion) cubre 10 jugadores con sala por código. Godot 4 sería la alternativa si el presupuesto manda y se renuncia a la realidad aumentada. El prototipo de reglas en navegador es independiente de esta decisión.

## Cambios propuestos tras la simulación del prototipo (v0.2)

El simulador de `prototipo/sim.mjs` obligó a ajustar nueve reglas del documento de diseño para que el juego fuera ganable. Están detalladas en `docs/04-prototipo-m0.md`. Las más importantes: el tope de ruido escala con los jugadores, las losetas de borde no sueltan hordas al revelarse, la cara de mordisco en combate provoca un contraataque con tirada de defensa en vez de un mordisco automático, las hordas pierden un caminante por cada 2 impactos, «sin contagio» da hasta la noche siguiente para anular el mordisco, el jugador zombi gana con más de la mitad del equipo y los zombis solo perciben a 4 casillas. Pendiente de confirmar en mesa antes de pasarlas al documento de diseño.
