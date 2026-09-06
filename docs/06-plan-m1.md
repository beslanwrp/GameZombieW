# Z-2099 · plan del corte vertical (hito M1)

Versión 1.0 · Estado: listo para arrancar cuando haya equipo con Unity y resultados de las pruebas de mesa del prototipo M0.

## 1. Objetivo del hito

Una partida real de **Farmacia Central** con 4 móviles conectados por sala de código, arte final en la dirección crudo fotorealista y cámara 3D libre. Sirve para tres cosas: validar que la cámara libre funciona en un móvil de gama media con el presupuesto de arte previsto, medir la latencia y la robustez de la red con jugadores reales, y tener el vídeo que enseña el juego a un socio o a una tienda.

### Definición de hecho

| Criterio | Medida |
| --- | --- |
| Partida completa de Farmacia Central con 4 jugadores en 4 móviles distintos, Android e iOS mezclados | Sin desconexiones en 5 partidas seguidas |
| Rendimiento en gama media (Snapdragon 7 / Apple A14) | 30 fps con el tablero completo revelado y 40 zombis |
| Ronda completa con 4 jugadores | Menos de 3 minutos de media |
| Módulo de reglas C# | Reproduce bit a bit 100 partidas del simulador JS (pruebas doradas) |
| Contenido | 4 personajes, 2 tipos de zombi, 12 losetas modeladas, 20 cartas ilustradas, 1 misión |
| Pantalla compartida | Cliente WebGL de solo lectura que muestra el tablero y el estado |

## 2. Equipo y duración

12 semanas, 6 sprints de 2 semanas.

| Rol | Dedicación | Responsable de |
| --- | --- | --- |
| Diseño y producción | 100 % | Reglas, equilibrio, backlog, pruebas de mesa, textos |
| Programación de reglas y red | 100 % | Módulo C#, Netcode, Relay, sala, reconexión |
| Programación de cliente | 100 % | Escena, cámara, interfaz, animación, rendimiento |
| Arte 3D | 100 % | Personajes, zombis, losetas, props, iluminación |
| Arte 2D e interfaz | 50 % | Cartas, expedientes, iconos, tipografía, pantalla compartida |
| Audio | Externo, 2 semanas | Ambiente, dados, gemidos, motivo de la noche |

## 3. Arquitectura

Cuatro ensamblados de Unity, con dependencias en una sola dirección.

```
Z2099.Datos        JSON generado desde prototipo/src/datos.js → ScriptableObjects
      ↓
Z2099.Reglas       C# puro, sin UnityEngine. Estado serializable, RNG determinista, pruebas NUnit
      ↓
Z2099.Red          Netcode for GameObjects + Relay + Lobby. El host ejecuta Reglas; los clientes envían intenciones
      ↓
Z2099.Cliente      Escena, cámara, UI Toolkit, animación, audio. Solo lee el estado y envía intenciones
```

- **Una única fuente de datos.** `prototipo/src/datos.js` sigue siendo la hoja de equilibrio. Un script exporta su contenido a `Assets/Datos/*.json`; Unity lo importa a ScriptableObjects en el editor. Cambiar un número no requiere tocar C#.
- **El estado es un documento.** Igual que en el prototipo: un objeto serializable que se puede guardar, enviar completo por red y reproducir.
- **Los clientes no calculan reglas.** Envían intenciones (`Mover(casilla)`, `Atacar(zombi, arma)`, `Craftear(receta)`); el host las valida con el mismo módulo, aplica y difunde el nuevo estado. Cero desincronizaciones y cero trampas.

## 4. Portar el motor de reglas a C#

El prototipo JS es la especificación ejecutable. El porte se hace función a función con esta correspondencia:

| Módulo JS (`reglas.js`) | Clase C# | Notas |
| --- | --- | --- |
| `rnd`, `entero`, `elegir`, `barajar`, `tirarDado` | `Azar` | Mismo algoritmo (mulberry32) con la misma semilla: imprescindible para las pruebas doradas |
| `key`, `dist`, `vecinos`, `linea`, `centroLoseta`, `pixel` | `Hex` | Coordenadas axiales, punta arriba |
| `nuevaPartida`, `generarTablero` | `Partida`, `GeneradorTablero` | Mismo orden de llamadas al azar que el JS |
| `iniciarRonda`, `iniciarTurno`, `terminarTurno`, acciones | `Turno`, `Acciones` | Cada acción devuelve `Resultado { Ok, Motivo }` |
| `atacar`, `zombiAtaca`, `herir`, `aplicarMordisco` | `Combate`, `Contagio` | Las cuatro reglas de contagio |
| `faseZombis`, `moverZombiHacia`, `objetivoZombi`, `cartaHorda` | `Zombis`, `Hordas` | BFS idéntico, incluido el desempate aleatorio |
| `zMover`, `zMoverHorda`, `zAtacar`, `zOler`, `zOcultar`, `convertir` | `JugadorZombi` | |
| `faseNoche`, `resolverDecision`, `evento` | `Noche`, `Eventos` | La decisión de Instinto pausa la noche |
| `comprobarFin` | `Objetivos` | Un método por misión |

### Pruebas doradas

1. Añadir a `prototipo/sim.mjs` una salida `--traza semilla` que escriba el registro completo de una partida (cada línea del `log` más el estado final) en JSON.
2. Generar 100 trazas con semillas fijas, mezclando misiones y tamaños de grupo.
3. La prueba NUnit carga cada traza, ejecuta la misma partida con las mismas intenciones de los bots y compara línea a línea.
4. Cualquier divergencia es un error del porte, no una decisión de diseño. Las decisiones de diseño se hacen primero en JS, se pasan por el simulador y se regeneran las trazas.

Esto convierte tres semanas de porte en un trabajo verificable y evita el clásico «en Unity se comporta distinto».

## 5. Red

| Aspecto | Decisión |
| --- | --- |
| Topología | Host en el móvil que crea la sala, con Unity Relay para atravesar redes. Descubrimiento local por wifi como atajo |
| Sala | Unity Lobby con código de 4 letras. Máximo 10 asientos más asientos de espectador |
| Mensajes | Cliente → host: intenciones. Host → clientes: estado completo comprimido tras cada cambio (unos 20 KB con 120 casillas), con diferencias solo si el perfil lo exige |
| Tiempo | Temporizador de planificación autoritativo en el host; los clientes muestran el reloj y aceptan hasta 2 s de margen |
| Reconexión | El asiento se mantiene 3 minutos. Al volver, el cliente recibe el estado completo y sigue |
| Espectador | El cliente WebGL de pantalla compartida se conecta como espectador de solo lectura |
| Pruebas | Simulador de latencia y pérdida en el editor; partidas con 4 móviles físicos en cada sprint desde el 3 |

Alternativa si Relay da problemas de latencia en las pruebas del sprint 1: Photon Fusion en modo compartido. La decisión se toma con datos al final del sprint 1.

## 6. Cámara 3D libre y presentación

Implementa la sección 16 del documento de diseño.

- Órbita con un dedo, zoom con pinza entre 4 y 30 metros, desplazamiento con dos dedos, doble toque para centrar, botones «Ver todo», «Mi ficha» y «Vista de mesa».
- Elevación limitada entre 20° y 80°. Encuadre automático de la ficha al empezar la planificación; cortes breves durante la resolución.
- Legibilidad: etiquetas en espacio de pantalla, contorno de color visible a través de edificios, contador sobre cada horda, minimapa cenital, iconos planos en el suelo para fuego, barricada y señuelo, línea de puntos del plan de movimiento.
- Rendimiento: tres niveles de detalle por modelo, oclusión ambiental precalculada por loseta, sombras dinámicas solo para fichas, hordas como grupo de 5 modelos más contador por encima de 80 zombis.

## 7. Arte

### Lista de assets del corte vertical

| Tipo | Cantidad | Especificación | Horas estimadas |
| --- | --- | --- | --- |
| Personajes | 4 (Elías, Sunja, Naima, Kenji) | 8 000 triángulos en LOD0, texturas 2K, 6 animaciones (idle, andar, atacar, disparar, herido, caer) | 160 |
| Zombis | 2 (caminante, corredor) con 3 variantes de ropa | 5 000 triángulos, texturas 1K, 5 animaciones | 90 |
| Losetas | 12 (refugio, 4 calle, 3 edificio, farmacia, gasolinera, bosque, entrada) | Modulares, 7 casillas cada una, texturas 1K por material, oclusión precalculada | 120 |
| Props | 12 (bidón, molotov, barricada, señuelo, fuego, coche abandonado, moto, botiquín, etc.) | 500 a 2 000 triángulos | 40 |
| Cartas | 20 (12 objetos, 4 personajes, 3 recetas, 1 misión) | Expediente y polaroid según `docs/maquetas` | 60 |
| Interfaz | Pantallas de `docs/maquetas` en UI Toolkit | Componentes reutilizables, tres tamaños de pantalla | 80 |
| Iluminación y atmósfera | 1 escena de atardecer | Cielo, niebla volumétrica ligera, grano | 30 |

Total aproximado: 580 horas de arte, coherente con las 12 semanas de una persona de 3D y media de 2D.

### Cadena de producción

Blender → FBX → Unity URP. Nomenclatura `tipo_nombre_variante_LOD0`. Cada modelo se revisa en el móvil de referencia antes de darse por terminado, desde los ángulos extremos de la cámara libre (elevación 20° a 4 metros y 80° a 30 metros).

## 8. Sprints

| Sprint | Semanas | Entregable | Cómo se comprueba |
| --- | --- | --- | --- |
| 1 · Cimientos y pruebas técnicas | 1-2 | Proyecto Unity con los 4 ensamblados. Exportador de datos. Pruebas técnicas: Relay con 4 móviles, escena con 40 zombis en el móvil de referencia, cámara libre básica | Informe con latencia, fps y decisión Relay o Photon |
| 2 · Motor de reglas | 3-4 | `Z2099.Reglas` portado con las pruebas doradas en verde | 100 trazas idénticas |
| 3 · Partida en red sin arte | 5-6 | Farmacia Central jugable con 4 móviles y cubos de colores | 5 partidas seguidas sin desconexión |
| 4 · Arte y cámara | 7-8 | Losetas, personajes y zombis finales en la escena; cámara con todas las ayudas de legibilidad | 30 fps en gama media, tablero completo |
| 5 · Interfaz y cartas | 9-10 | Pantallas de las maquetas en UI Toolkit; cartas ilustradas; jugador zombi; audio | Ronda de 4 jugadores en menos de 3 minutos |
| 6 · Pantalla compartida y cierre | 11-12 | Cliente WebGL espectador con cámara directora; pruebas con 3 grupos externos; vídeo de 90 segundos | Definición de hecho completa |

## 9. Riesgos del hito y pruebas técnicas de la semana 1

| Riesgo | Prueba técnica | Si falla |
| --- | --- | --- |
| Latencia de Relay inaceptable en la mesa | 4 móviles, 200 mensajes, medir ida y vuelta | Photon Fusion |
| Fotorealismo con cámara libre no llega a 30 fps | Escena con 40 zombis y 12 losetas, perfil en el móvil de referencia | Bajar a texturas 1K en personajes, quitar sombras dinámicas, reducir a 25 zombis representados |
| La cámara libre confunde en una pantalla de 6 pulgadas | 5 personas ajenas juegan una ronda sin explicación | Activar «Vista de mesa» por defecto y dejar la libre como opción |
| El porte del motor diverge del JS | Pruebas doradas desde el primer día | El JS es la especificación; se corrige el C# |

## 10. Qué necesita este plan antes de empezar

1. Resultados de las pruebas de mesa del prototipo M0, para fijar los parámetros que se exportan a Unity.
2. Las cuatro decisiones de interfaz anotadas en las maquetas (mano en polaroids o tira, pestañas o botones flotantes, zombi en verde o rojo, nombres o personajes en la TV).
3. Confirmación de la variante hardcore (conversión inmediata o en la noche siguiente).
4. Un móvil Android de gama media y un iPhone de hace tres años como dispositivos de referencia.
