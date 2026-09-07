// Z-2099 · capa de red del prototipo: cada jugador en su móvil, el servidor aplica las reglas.
const RED = { activa: false, base: '', codigo: null, token: null, asiento: null, vista: null, fuente: null, vistos: 0, conectando: false };
const CLAVE_RED = 'z2099-red';
async function redApi(ruta, cuerpo) { const r = await fetch(RED.base + ruta, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo || {}) }); return r.json(); }
async function redDisponible() { if (!location.protocol.startsWith('http') || /claude\.ai$/.test(location.hostname)) return false; try { const r = await fetch('/api/ping'); const j = await r.json(); return !!j.ok; } catch (e) { return false; } }
function redGuardar() { try { localStorage.setItem(CLAVE_RED, JSON.stringify({ codigo: RED.codigo, token: RED.token, asiento: RED.asiento })); } catch (e) { } }
function redOlvidar() { try { localStorage.removeItem(CLAVE_RED); } catch (e) { } if (RED.fuente) RED.fuente.close(); Object.assign(RED, { activa: false, codigo: null, token: null, asiento: null, vista: null, fuente: null, vistos: 0 }); }

/* Botones de red en la pantalla de inicio */
async function redInicio(cont) {
  if (!(await redDisponible())) return;
  const esMesa = location.pathname === '/mesa';
  const caja = el('div', { class: 'red' }, el('h2', {}, esMesa ? 'Pantalla compartida' : 'Jugar en red'), el('p', { class: 'muted small' }, esMesa ? 'Escribe el código de la sala para mostrar el tablero en esta pantalla.' : 'Cada jugador en su propio móvil. Uno crea la sala y los demás entran con el código.'));
  const nombre = el('input', { type: 'text', placeholder: 'Tu nombre', maxlength: 14 }); const codigo = el('input', { type: 'text', placeholder: 'Código de sala', maxlength: 4, style: 'text-transform:uppercase' });
  const aviso = el('p', { class: 'small peligro' });
  if (!esMesa) caja.append(el('label', {}, 'Nombre', nombre));
  caja.append(el('label', {}, 'Código', codigo));
  const fila = el('div', { class: 'acciones' });
  if (!esMesa) fila.append(el('button', { class: 'primario', onclick: async () => { const r = await redApi('/api/sala', { nombre: nombre.value.trim() || 'Anfitrión' }); if (!r.ok) { aviso.textContent = r.motivo; return; } redEntrar(r); } }, 'Crear sala'), el('button', { onclick: async () => { const c = codigo.value.trim().toUpperCase(); if (c.length !== 4) { aviso.textContent = 'El código tiene 4 letras'; return; } const r = await redApi(`/api/sala/${c}/unirse`, { nombre: nombre.value.trim() || 'Jugador' }); if (!r.ok) { aviso.textContent = r.motivo; return; } redEntrar(r); } }, 'Unirse'));
  fila.append(el('button', { class: esMesa ? 'primario' : 'ghost', onclick: async () => { const c = codigo.value.trim().toUpperCase(); if (c.length !== 4) { aviso.textContent = 'El código tiene 4 letras'; return; } const r = await redApi(`/api/sala/${c}/unirse`, { espectador: true }); if (!r.ok) { aviso.textContent = r.motivo; return; } redEntrar(r); } }, esMesa ? 'Mostrar la mesa' : 'Solo mirar (pantalla compartida)'));
  caja.append(fila, aviso); cont.prepend(caja);
}
function redEntrar(r) { Object.assign(RED, { activa: true, codigo: r.codigo, token: r.token, asiento: r.asiento, vistos: 0 }); redGuardar(); redConectar(); }
function redReanudar() { try { const d = JSON.parse(localStorage.getItem(CLAVE_RED)); if (!d || !d.token || !location.protocol.startsWith('http') || /claude\.ai$/.test(location.hostname)) return false; Object.assign(RED, { activa: true, codigo: d.codigo, token: d.token, asiento: d.asiento, vistos: 0 }); redConectar(); return true; } catch (e) { return false; } }
function redConectar() {
  if (RED.fuente) RED.fuente.close();
  const f = new EventSource(`${RED.base}/api/sala/${RED.codigo}/eventos?token=${encodeURIComponent(RED.token)}`); RED.fuente = f;
  f.onmessage = e => { try { redAplicar(JSON.parse(e.data)); } catch (err) { console.error(err); } };
  f.onerror = () => { const est = document.getElementById('toast'); if (est) toast('Conexión perdida. Reintentando…'); };
  mostrar('inicio'); $('#p-inicio .cont').innerHTML = '<p class="muted">Conectando con la sala…</p>';
}
function redAplicar(v) { RED.vista = v; if (v.G) G = v.G; renderRed(); }
async function redEnviar(f, args) { try { const r = await redApi(`/api/sala/${RED.codigo}/accion`, { token: RED.token, f, args }); if (r.vista) { RED.vista = r.vista; if (r.vista.G) G = r.vista.G; } return r.ok ? r.resultado : { ok: false, motivo: r.motivo || 'Error de red' }; } catch (e) { return { ok: false, motivo: 'Sin conexión con el servidor' }; } }

/* Pantallas de red */
function renderRed() {
  const v = RED.vista; if (!v) return;
  if (v.fase === 'sala') return pintarSala(v);
  if (v.fase === 'reparto') return pintarRepartoRed(v);
  // juego
  const pendientes = (G.avisos || []).slice(RED.vistos); RED.vistos = (G.avisos || []).length;
  const seguir = () => { if (G.fin) return fin(); if (RED.asiento < 0) return pintarEspera(v, true);
    if (G.fase === 'turno' && turnoActual(G).id === RED.asiento) { mostrar('juego'); pintarJuego(); }
    else if (G.fase === 'zombi' && G.zturno.jugadorId === RED.asiento) { mostrar('zombi'); pintarZombi(); }
    else if (G.fase === 'decision' && G.decision.jugadorId === RED.asiento) { pintarEspera(v); const E = EVENTOS[G.decision.evento]; modal('Instinto de Beatriz', `<p>Se ha revelado el evento <b>${E.nombre}</b>: ${E.texto}</p><p class="muted">Una vez por partida puedes descartarlo antes de que ocurra.</p>`, [['Descartarlo', () => tras(M.resolverDecision(G, true)), 'primario'], ['Dejar que ocurra', () => tras(M.resolverDecision(G, false))]], 'evento'); }
    else pintarEspera(v); };
  if (pendientes.length && $('#modal').hidden && RED.asiento >= 0) { const cadena = (i) => { if (i >= pendientes.length) return seguir(); const a = pendientes[i]; modal(a.titulo, `<p>${a.texto}</p>`, [['Seguir', () => cadena(i + 1)]], a.tipo); }; cadena(0); } else seguir();
}
function pintarSala(v) {
  mostrar('sala'); const c = $('#p-sala .cont'); c.innerHTML = '';
  c.append(el('div', { class: 'eyebrow' }, 'Sala de partida'), el('div', { class: 'codigo' }, v.codigo), el('p', { class: 'muted small' }, `Los demás entran en ${location.origin} y escriben este código. Pantalla compartida: ${location.origin}/mesa`));
  const lista = el('div', { class: 'lista-sala' }); v.asientos.forEach(a => lista.append(el('div', { class: 'jug' + (a.conectado ? '' : ' off') }, el('b', {}, a.nombre), el('span', { class: 'muted' }, a.asiento === 0 ? ' · anfitrión' : ''), el('span', { class: 'tag' + (a.conectado ? ' bien' : '') }, a.conectado ? 'conectado' : 'desconectado')))); c.append(el('h2', {}, `Supervivientes · ${v.asientos.length} de 10`), lista);
  if (v.espectadores) c.append(el('p', { class: 'muted small' }, `${v.espectadores} pantalla${v.espectadores > 1 ? 's' : ''} compartida${v.espectadores > 1 ? 's' : ''} conectada${v.espectadores > 1 ? 's' : ''}.`));
  const M0 = MISIONES[v.misionId]; c.append(el('h2', {}, 'Misión'), el('p', {}, el('b', {}, M0.nombre), ` · ${M0.etiquetas.join(' ')} · ${M0.rondas} rondas`), el('p', { class: 'muted small' }, M0.texto));
  if (v.anfitrion) {
    const mis = el('select', {}, ...Object.entries(MISIONES).map(([id, m]) => el('option', { value: id, selected: id === v.misionId }, `${m.nombre} · ${m.etiquetas.join(' ')}`)));
    const hc = el('select', {}, el('option', { value: '', selected: !v.opciones.hardcoreTardio }, 'Hardcore: conversión al terminar la ronda'), el('option', { value: '1', selected: v.opciones.hardcoreTardio }, 'Hardcore: conversión en la noche siguiente'));
    const cfg = () => redApi(`/api/sala/${v.codigo}/configurar`, { token: RED.token, misionId: mis.value, opciones: { hardcoreTardio: hc.value === '1' } });
    mis.addEventListener('change', cfg); hc.addEventListener('change', cfg);
    c.append(el('label', {}, 'Cambiar misión', mis), el('label', {}, 'Variante hardcore', hc), el('button', { class: 'primario ancho', disabled: v.asientos.length < 2, onclick: async () => { const r = await redApi(`/api/sala/${v.codigo}/empezar`, { token: RED.token }); if (!r.ok) toast(r.motivo); } }, v.asientos.length < 2 ? 'Esperando a otro jugador…' : 'Repartir personajes y empezar'));
  } else if (RED.asiento >= 0) c.append(el('p', { class: 'muted' }, 'Esperando a que el anfitrión empiece.'));
  else c.append(el('p', { class: 'muted' }, 'Esta pantalla mostrará el tablero cuando empiece la partida.'));
  c.append(el('button', { class: 'mini', onclick: () => { redOlvidar(); inicio(); } }, 'Salir de la sala'));
}
function pintarRepartoRed(v) {
  if (RED.asiento < 0) { mostrar('sala'); $('#p-sala .cont').innerHTML = '<p class="muted">Los supervivientes están eligiendo personaje…</p>'; return; }
  const yo = v.asientos[RED.asiento]; const c = $('#p-reparto .cont'); c.innerHTML = '';
  if (yo.elegido) { c.append(el('h2', {}, 'Personaje elegido'), el('p', { class: 'muted' }, `Esperando a: ${v.asientos.filter(a => !a.elegido).map(a => a.nombre).join(', ') || 'nadie'}.`)); mostrar('reparto'); return; }
  c.append(el('h2', {}, yo.nombre + ', elige tu personaje'), el('p', { class: 'muted' }, 'Dos cartas al azar. Te quedas una.'));
  (v.oferta || []).forEach(pid => { const P = PERSONAJES[pid]; c.append(el('button', { class: 'carta-personaje', style: `--c:${P.color}`, onclick: async () => { const r = await redApi(`/api/sala/${v.codigo}/elegir`, { token: RED.token, personajeId: pid }); if (!r.ok) toast(r.motivo); } },
    el('div', { class: 'cp-nombre' }, P.nombre, el('span', {}, P.alias)), el('div', { class: 'cp-stats' }, `Vida ${P.vida} · Iniciativa ${P.iniciativa} · Capacidad ${P.capacidad} · Dados ${P.dados}${P.inicial.length ? ' · Empieza con ' + P.inicial.map(i => OBJETOS[i].nombre.toLowerCase()).join(', ') : ''}`),
    el('div', { class: 'cp-h' }, el('b', {}, 'Habilidad. '), P.habilidad), el('div', { class: 'cp-h' }, el('b', {}, 'Pro. '), P.pro), el('div', { class: 'cp-h contra' }, el('b', {}, 'Contra. '), P.contra))); });
  mostrar('reparto');
}
function pintarEspera(v, mesa = false) {
  mostrar('espera'); const root = $('#p-espera'); cabecera(root); const panel = root.querySelector('.panel'); panel.innerHTML = '';
  let quien = '';
  if (G.fase === 'turno') { const j = turnoActual(G); quien = `Turno de ${j.nombre} · ${PERSONAJES[j.personajeId].alias}`; }
  else if (G.fase === 'zombi') quien = `Actúa el jugador zombi: ${G.jugadores[G.zturno.jugadorId].nombre}`;
  else if (G.fase === 'decision') quien = `${G.jugadores[G.decision.jugadorId].nombre} decide sobre el evento`;
  panel.append(el('div', { class: 'quien' }, el('b', {}, mesa ? 'Pantalla compartida' : 'Esperando'), el('span', {}, ' · ' + quien)));
  const filas = el('div', { class: 'estado' }); G.jugadores.forEach(j => filas.append(el('span', { class: 'tag' + (j.estado === 'zombi' || j.estado === 'muerto' ? ' peligro' : j.estado === 'caido' ? '' : ' bien'), style: `border-color:${PERSONAJES[j.personajeId].color}` }, `${j.id + 1} ${j.nombre} ♥${j.vida}${j.mordido ? ' ☠' : ''}${j.estado === 'zombi' ? ' zombi' : j.estado === 'caido' ? ' caído' : j.estado === 'salido' ? ' a salvo' : ''}`))); panel.append(filas);
  if (!mesa && RED.asiento >= 0) { const yo = G.jugadores[RED.asiento]; if (yo) panel.append(el('p', { class: 'muted small' }, `Tú: ${PERSONAJES[yo.personajeId].nombre} · vida ${yo.vida}/${yo.vidaMax}${yo.mordido ? ' · mordido' : ''}${yo.panico ? ' · pánico ' + yo.panico : ''} · ${yo.mano.length} cartas`)); }
  const mano = root.querySelector('.mano'); mano.innerHTML = '';
  if (!mesa && RED.asiento >= 0 && G.jugadores[RED.asiento]) G.jugadores[RED.asiento].mano.forEach(cc => { const O = OBJETOS[cc.id]; mano.append(el('button', { class: 'carta ' + O.tipo, onclick: () => modal(O.nombre, `<p>${cc.id in RECETAS ? RECETAS[cc.id].texto : ''}</p><p class="muted">Peso ${O.peso}</p>`) }, el('b', {}, O.nombre), el('span', {}, O.tipo))); });
  if (mesa) { const ult = [...G.log].reverse().slice(0, 6); const lg = el('div', { class: 'log mini-log' }); ult.forEach(l => lg.append(el('div', { class: 'l ' + l.tipo }, el('span', { class: 'r' }, 'R' + l.ronda), l.texto))); panel.append(lg); }
  dibujar();
}
