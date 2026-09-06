# Maquetas de interfaz · Z-2099

Seis pantallas estáticas en la dirección «crudo fotorealista» con cartas tipo expediente y polaroid. Se generan con `node gen.mjs` desde esta carpeta (escribe los `.dc.html` a partir de `_base.css` y `board.mjs`) y se publican como lienzo editable.

| Archivo | Pantalla |
| --- | --- |
| `Sala.dc.html` | Sala de partida: código, lista de supervivientes, aviso de pantalla compartida |
| `Personaje.dc.html` | Elección de personaje como expediente con sello Z-2099 |
| `Main.dc.html` | Tablero y planificación: cámara 3D (boceto en perspectiva), dados, acciones, mano de polaroids, minimapa |
| `Carta.dc.html` | Carta de objeto a pantalla completa (polaroid con cinta y nota a máquina) |
| `Zombi.dc.html` | Pantalla del jugador zombi: paleta verde, halos de olor, oculto entre la horda |
| `Pantalla.dc.html` | Pantalla compartida para TV (1440×810): tablero, ruido grande, lateral de jugadores, cámara directora |

Paleta: asfalto `#141614`, superficie `#1d201c`, oliva `#4f5a3a`, óxido `#c9553d`, cinta de peligro `#e0b43a`, papel de expediente `#e9e2cf`. Tipografías: Big Shoulders Display (titulares), Special Elite (expedientes y notas a máquina), Source Sans 3 (interfaz). Iconos SVG de trazo, sin emoji.

Decisiones abiertas que las maquetas ponen sobre la mesa: mano como polaroids pequeñas o tira uniforme; barra inferior de pestañas o tablero a pantalla completa con botones flotantes; pantalla del zombi en verde o en rojo; nombres reales o solo personajes en la TV.
