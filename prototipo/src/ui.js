// Z-2099 · interfaz del prototipo M0 v0.2 (un dispositivo, se pasa el móvil).
import { PARAMS, OBJETOS, RECETAS, ZOMBIS, PERSONAJES, MISIONES, EVENTOS } from './datos.js';
import { nuevaPartida, turnoActual, destinosPosibles, mover, rastrear, saquear, objetivosAtaque, atacar, armasDe, craftear, curar, objetivosCura, amputar, triaje, sermon, levantar, destinatarios, dar, usar, vehiculo, conductoresDisponibles, subirPasajero, puedeSalir, salir, descansar, puedeTerminar, terminarTurno, repetirDado, zMoverHorda, zMover, zAtacar, zOler, zOcultar, zTerminar, fichaZombi, resolverDecision, zombisEn, jugadoresEn, vecinos, dist, pixel, esHorda, vivos, peso, capacidad, hayBarricada, reglaCA, pasajerosDe } from './reglas.js';

const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'html') e.innerHTML = v; else if (v === false || v == null) { } else e.setAttribute(k, v === true ? '' : v); } kids.flat().forEach(k => k != null && k !== false && e.append(k.nodeType ? k : document.createTextNode(k))); return e; };
const CLAVE = 'z2099-m0';
let G = null, UI = { pantalla: 'inicio', reparto: null, mostrado: null, modo: 'mover', zSel: null, cam: { x: 0, y: 0, s: 1 } };

/* ---------- persistencia ---------- */
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify({ G, UI: { pantalla: UI.pantalla, reparto: UI.reparto, mostrado: UI.mostrado } })); } catch (e) { } }
function cargar() { try { const d = JSON.parse(localStorage.getItem(CLAVE)); if (d && d.G && d.G.version === 2) { G = d.G; Object.assign(UI, d.UI); return true; } } catch (e) { } return false; }

/* ---------- pantallas y modales ---------- */
function mostrar(id) { UI.pantalla = id; document.querySelectorAll('.pantalla').forEach(p => p.hidden = p.id !== 'p-' + id); if (id === 'juego' || id === 'zombi') requestAnimationFrame(() => { ajustarCanvas(); dibujar(); }); }
function modal(titulo, cuerpo, botones = [['Cerrar', null]], clase = '') {
  const m = $('#modal'); m.className = 'modal ' + clase; m.hidden = false; $('#modal-titulo').textContent = titulo; const b = $('#modal-cuerpo'); b.innerHTML = ''; if (typeof cuerpo === 'string') b.innerHTML = cuerpo; else b.append(cuerpo);
  const bb = $('#modal-botones'); bb.innerHTML = ''; botones.forEach(([t, f, c]) => bb.append(el('button', { class: c || '', onclick: () => { m.hidden = true; f && f(); } }, t)));
}
function cerrarModal() { $('#modal').hidden = true; }
function avisos(cb) { if (!G || !G.avisos.length) { cb && cb(); return; } const a = G.avisos.shift(); guardar(); modal(a.titulo, `<p>${a.texto}</p>`, [['Seguir', () => avisos(cb)]], a.tipo); }
function toast(t) { const x = $('#toast'); x.textContent = t; x.hidden = false; clearTimeout(x._t); x._t = setTimeout(() => x.hidden = true, 2400); }
function etiquetaContagio(id) { return { cuenta_atras: 'cuenta atrás de 4 turnos', sin_contagio: 'sin contagio', hardcore: 'hardcore', ambos: 'hardcore y sin contagio' }[MISIONES[id].contagio]; }

/* ---------- inicio y reparto ---------- */
function inicio() {
  const cont = $('#p-inicio .cont'); cont.innerHTML = '';
  const hay = (() => { try { const d = JSON.parse(localStorage.getItem(CLAVE)); return d && d.G && d.G.version === 2; } catch (e) { return false; } })();
  if (hay) cont.append(el('button', { class: 'primario ancho', onclick: () => { if (cargar()) reanudar(); } }, 'Continuar la partida guardada'));
  const n = el('select', {}, ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => el('option', { value: i }, i + ' jugadores'))); n.value = 4;
  const nombres = el('div', { class: 'nombres' });
  const pintaNombres = () => { nombres.innerHTML = ''; for (let i = 0; i < +n.value; i++) nombres.append(el('input', { type: 'text', placeholder: 'Jugador ' + (i + 1), maxlength: 14 })); };
  n.addEventListener('change', pintaNombres); pintaNombres();
  const mis = el('select', {}, el('option', { value: '' }, 'Misión al azar'), ...Object.entries(MISIONES).map(([id, m]) => el('option', { value: id }, `${m.nombre} · ${m.etiquetas.join(' ')} · ${m.rondas} rondas`)));
  const hc = el('select', {}, el('option', { value: '' }, 'Conversión al terminar la ronda (documento v1.0)'), el('option', { value: '1' }, 'Conversión en la noche siguiente (propuesta del simulador)'));
  cont.append(el('label', {}, 'Jugadores', n), nombres, el('label', {}, 'Misión', mis), el('label', {}, 'Variante hardcore', hc), el('button', { class: 'mini', onclick: verReglas }, 'Hoja de reglas'),
    el('button', { class: 'primario ancho', onclick: () => {
      const ids = Object.keys(MISIONES); const misionId = mis.value || ids[Math.floor(Math.random() * ids.length)];
      const js = [...nombres.querySelectorAll('input')].map((inp, i) => ({ nombre: inp.value.trim() || 'Jugador ' + (i + 1) }));
      UI.reparto = { jugadores: js, misionId, idx: 0, semilla: Math.floor(Math.random() * 1e9), opciones: { hardcoreTardio: hc.value === '1' } }; guardar(); reparto();
    } }, 'Empezar'));
  mostrar('inicio');
}
function reparto() {
  const Rp = UI.reparto;
  if (Rp.idx >= Rp.jugadores.length) { G = nuevaPartida({ jugadores: Rp.jugadores, misionId: Rp.misionId, semilla: Rp.semilla, opciones: Rp.opciones || {} }); UI.reparto = null; UI.mostrado = null; UI.cam.ajustada = false; guardar(); modal('Misión: ' + MISIONES[G.misionId].nombre, `<p>${MISIONES[G.misionId].texto}</p><p class="muted">Contagio: ${etiquetaContagio(G.misionId)}. Límite: ${MISIONES[G.misionId].rondas} rondas.</p>`, [['A la mesa', () => reanudar()]]); return; }
  const j = Rp.jugadores[Rp.idx]; const usados = Rp.jugadores.filter(x => x.personajeId).map(x => x.personajeId); const libres = Object.keys(PERSONAJES).filter(p => !usados.includes(p)).sort(() => Math.random() - .5);
  const oferta = libres.slice(0, 2);
  pasar(j.nombre, null, () => {
    const c = $('#p-reparto .cont'); c.innerHTML = ''; c.append(el('h2', {}, j.nombre + ', elige tu personaje'), el('p', { class: 'muted' }, 'Dos cartas al azar. Te quedas una.'));
    oferta.forEach(pid => { const P = PERSONAJES[pid]; c.append(el('button', { class: 'carta-personaje', style: `--c:${P.color}`, onclick: () => { j.personajeId = pid; Rp.idx++; guardar(); reparto(); } },
      el('div', { class: 'cp-nombre' }, P.nombre, el('span', {}, P.alias)), el('div', { class: 'cp-stats' }, `Vida ${P.vida} · Iniciativa ${P.iniciativa} · Capacidad ${P.capacidad} · Dados ${P.dados}${P.inicial.length ? ' · Empieza con ' + P.inicial.map(i => OBJETOS[i].nombre.toLowerCase()).join(', ') : ''}`),
      el('div', { class: 'cp-h' }, el('b', {}, 'Habilidad. '), P.habilidad), el('div', { class: 'cp-h' }, el('b', {}, 'Pro. '), P.pro), el('div', { class: 'cp-h contra' }, el('b', {}, 'Contra. '), P.contra))); });
    mostrar('reparto');
  });
}
function pasar(nombre, color, cb) { $('#pasar-nombre').textContent = nombre; $('#pasar-nombre').style.color = color || ''; $('#pasar-boton').textContent = 'Soy ' + nombre; $('#pasar-boton').onclick = cb; mostrar('pasar'); }

/* ---------- bucle principal ---------- */
function reanudar() {
  if (!G) { if (UI.reparto) return reparto(); return inicio(); } if (G.fin) return fin();
  avisos(() => {
    if (G.fase === 'turno') { const j = turnoActual(G); const clave = 't' + G.ronda + '-' + j.id; if (UI.mostrado !== clave) { pasar(j.nombre, PERSONAJES[j.personajeId].color, () => { UI.mostrado = clave; UI.modo = 'mover'; guardar(); mostrar('juego'); pintarJuego(); }); return; } mostrar('juego'); pintarJuego(); }
    else if (G.fase === 'zombi') { const j = G.jugadores[G.zturno.jugadorId]; const clave = 'z' + G.ronda + '-' + j.id; if (UI.mostrado !== clave) { pasar(j.nombre + ' (zombi)', '#8fa86a', () => { UI.mostrado = clave; UI.modo = 'zmover'; guardar(); mostrar('zombi'); pintarZombi(); }); return; } mostrar('zombi'); pintarZombi(); }
    else if (G.fase === 'decision') { const j = G.jugadores[G.decision.jugadorId]; const E = EVENTOS[G.decision.evento]; pasar(j.nombre, PERSONAJES[j.personajeId].color, () => { mostrar('juego'); modal('Instinto de Beatriz', `<p>Se ha revelado el evento <b>${E.nombre}</b>: ${E.texto}</p><p class="muted">Una vez por partida puedes descartarlo antes de que ocurra.</p>`, [['Descartarlo', () => tras(resolverDecision(G, true)), 'primario'], ['Dejar que ocurra', () => tras(resolverDecision(G, false))]], 'evento'); }); }
    else if (G.fase === 'fin') fin();
  });
}
function tras(res) { if (res && res.ok === false && res.motivo) toast(res.motivo); guardar(); if (G.fin) { avisos(() => fin()); return; } if (G.fase !== 'turno' && G.fase !== 'zombi') { reanudar(); return; } const j = G.fase === 'turno' ? turnoActual(G) : G.jugadores[G.zturno.jugadorId]; const clave = (G.fase === 'turno' ? 't' : 'z') + G.ronda + '-' + j.id; if (UI.mostrado !== clave) { reanudar(); return; } G.fase === 'turno' ? pintarJuego() : pintarZombi(); avisos(); }

/* ---------- cabecera ---------- */
function textoObjetivo() {
  const M = MISIONES[G.misionId]; const A = G.almacen;
  return { antibioticos_refugio: `Antibióticos en refugio ${A.antibioticos}/${M.cantidad}`, comida_refugio: `Comida en refugio ${A.comida}/${M.cantidad}`, todos_helipuerto: 'Todos al helipuerto (H)', sobrevivir: `Sobrevivir con al menos ${Math.ceil(G.jugadores.length / 2)}`,
    granja: `Semillas ${A.semillas}/1 · Bidones ${A.bidon}/2 · aguantar`, torre: `Emisora ${G.progreso}/${M.cantidad} noches`, convoy: `Salidos ${G.jugadores.filter(j => j.estado === 'salido').length}/${Math.min(M.cantidad, G.jugadores.length)}`,
    cuarentena: `Barricadas del refugio ${vecinos('0,0').filter(v => hayBarricada(G, '0,0', v)).length}/6`, deposito: `Bidones en el generador ${A.bidon}/${M.cantidad}`, suministros: `Suministros ${A.suministro}/${M.cantidad}`,
    cero: `Losetas de borde ${G.losetasBorde.filter(l => G.casillas[l].revelada).length}/8`, protocolo: `Muestras ${A.muestras}/3` }[M.objetivo] || '';
}
function cabecera(root) {
  const M = MISIONES[G.misionId]; const h = root.querySelector('.cabecera'); h.innerHTML = '';
  const ruido = el('div', { class: 'ruido' + (G.ruido >= 6 ? ' alto' : ''), title: 'Ruido' }, el('span', { class: 'lab' }, 'Ruido'), el('div', { class: 'ruido-bar' }, ...Array.from({ length: G.escalado.ruidoTope }, (_, i) => el('i', { class: i < G.ruido ? 'on' : '' }))), el('b', {}, `${G.ruido}/${G.escalado.ruidoTope}`));
  h.append(el('div', { class: 'mision' }, el('b', {}, M.nombre), el('span', {}, ` · Ronda ${G.ronda}/${M.rondas} · ${textoObjetivo()}`)), ruido, el('button', { class: 'mini', onclick: verLog }, 'Registro'), el('button', { class: 'mini', onclick: verReglas }, 'Reglas'));
}
const REGLAS = `
<h4>La ronda</h4><p>Por orden de iniciativa, cada superviviente tira sus dados y tiene <b>1 movimiento y 2 acciones</b>. Después se mueven los zombis y el jugador zombi. Al caer la noche el ruido sube 1, si llega al tope entra una carta de horda, en rondas pares hay evento, el refugio cura 1 y avanzan los contagios.</p>
<h4>Dados</h4><p>Cada dado: 3 caras de <b>paso</b> (1 casilla / 1 impacto), <b>doble paso</b> (2 / 2), <b>ruido</b> (0 casillas y +1 ruido / 1 impacto y +1 ruido) y <b>mordisco</b> (0 / 0; si terminas al lado de un zombi te ataca; en combate el zombi contraataca).</p>
<h4>Acciones</h4><p>Saquear (edificio, gasolinera, farmacia, taller; dos veces por casilla), atacar, craftear (gratis en taller), curar, amputar, dar cartas (adyacente o por enlace), levantar a un caído, conducir o subir de pasajero, descansar (+1 vida, −1 pánico sin zombis a 2 casillas).</p>
<h4>Combate</h4><p>Tira los dados del arma (sin arma 1). Impactos ≥ fuerza del zombi: muere. Contra una horda, cada 2 impactos eliminan un caminante. Armas de fuego: +2 ruido y alcance 3 con línea de visión. El acorazado solo cae cuerpo a cuerpo o con molotov.</p>
<h4>Defensa</h4><p>Cuando un zombi entra en tu casilla tiras 1 dado (Beatriz 2). Paso o doble: esquivas. Ruido: esquivas con +1 ruido. Mordisco: 1 herida (2 si es horda) y quedas <b>mordido</b>.</p>
<h4>Contagio</h4><p>Lo fija la misión. <b>Cuenta atrás</b>: 4 turnos para curarte con Tratamiento (+2), antibióticos (+1) o amputación. <b>Sin contagio</b>: hasta la noche siguiente para anularlo o la misión fracasa. <b>Hardcore</b>: te conviertes al caer la noche (o la siguiente, según la variante elegida).</p>
<h4>Jugador zombi</h4><p>Actúa tras los zombis con 2 acciones: empujar una horda, mover su ficha, atacar, oler una mano, ocultarse entre caminantes. Gana cuando más de la mitad del equipo esté convertido o muerto. Evoluciona con cada conversión.</p>
<h4>Peso</h4><p>Capacidad base 6. Materiales 0, armas y consumibles 1, bidones, tablas y chapa 2. Sobrecargado: un dado menos.</p>`;
function verReglas() { modal('Hoja de reglas', REGLAS, [['Cerrar', null]]); }
function verLog() { const c = el('div', { class: 'log' }); [...G.log].reverse().slice(0, 80).forEach(l => c.append(el('div', { class: 'l ' + l.tipo }, el('span', { class: 'r' }, 'R' + l.ronda), l.texto))); modal('Registro de la partida', c); }

/* ---------- pantalla del superviviente ---------- */
function pintarJuego() {
  const root = $('#p-juego'); cabecera(root); const j = turnoActual(G); const P = PERSONAJES[j.personajeId]; const T = G.turno;
  const panel = root.querySelector('.panel'); panel.innerHTML = ''; panel.style.setProperty('--c', P.color);
  const corazones = '♥'.repeat(j.vida) + '♡'.repeat(Math.max(0, j.vidaMax - j.vida));
  const tags = [j.mordido ? `<span class="tag peligro">Mordido${j.mordido.turnos != null ? ' · ' + j.mordido.turnos + ' turnos' : ''}</span>` : '', j.panico ? `<span class="tag">Pánico ${j.panico}</span>` : '', j.camuflaje ? `<span class="tag bien">Camuflaje ${j.camuflaje}</span>` : '',
    j.vehiculo ? `<span class="tag bien">${OBJETOS[j.vehiculo.id].nombre} · gas ${j.vehiculo.gas}${pasajerosDe(G, j).length ? ' · ' + pasajerosDe(G, j).length + ' pasajeros' : ''}</span>` : '', j.pasajeroDe != null ? `<span class="tag bien">Pasajero de ${G.jugadores[j.pasajeroDe].nombre}</span>` : '',
    j.sinDoble ? '<span class="tag">Amputado</span>' : '', G.enlaces.filter(e => e.a === j.id || e.b === j.id).map(e => `<span class="tag bien">Enlace con ${G.jugadores[e.a === j.id ? e.b : e.a].nombre} · ${e.rondas}</span>`).join(''), peso(G, j) > capacidad(G, j) ? '<span class="tag peligro">Sobrecarga</span>' : '', G.niebla ? '<span class="tag">Niebla</span>' : ''].join('');
  panel.append(el('div', { class: 'quien' }, el('b', {}, j.nombre), el('span', {}, ` · ${P.nombre}, ${P.alias}`), el('span', { class: 'vida' }, corazones)), el('div', { class: 'estado', html: tags }));
  if (T.levantandose) { panel.append(el('p', {}, `${j.nombre} estaba en el suelo. Se levanta con 1 de vida y pierde el turno.`), el('button', { class: 'primario', onclick: () => { terminarTurno(G, true); tras(); } }, 'Continuar')); dibujar(); root.querySelector('.mano').innerHTML = ''; return; }
  const dados = el('div', { class: 'dados' }, ...T.dados.map((d, i) => el('button', { class: 'dado ' + d, title: d, onclick: () => { const r = repetirDado(G, i); if (!r.ok) toast(r.motivo || 'No se puede repetir'); else tras(); } }, { paso: '→', doble: '⇒', ruido: '♪', mordisco: '☠' }[d])));
  const elias = G.jugadores.find(x => x.personajeId === 'elias' && x.estado === 'vivo'); const puedeOrden = elias && !G.banderas.ordenUsada && elias.id !== j.id && dist(elias.pos, j.pos) <= 3;
  panel.append(el('div', { class: 'fila' }, dados, el('div', { class: 'contadores' }, el('span', {}, el('b', {}, T.pasos), ' pasos'), el('span', {}, el('b', {}, T.acciones), ' acciones'))), puedeOrden ? el('p', { class: 'muted small' }, 'Orden de Elías disponible: toca un dado para repetirlo.') : null);
  const acc = el('div', { class: 'acciones' }); const c = G.casillas[j.pos]; const zs = zombisEn(G, j.pos); const sinAcc = T.acciones <= 0;
  const btn = (t, f, dis = false, cls = '') => acc.append(el('button', { class: cls, disabled: dis || (sinAcc && !cls.includes('libre')), onclick: f }, t));
  const puedeSaquear = ['edificio', 'gasolinera', 'farmacia', 'taller'].includes(c.tipo) && c.saqueos < PARAMS.saqueosPorCasilla && !zs.length;
  btn(`Saquear${c.saqueos ? ' (' + (PARAMS.saqueosPorCasilla - c.saqueos) + ')' : ''}`, () => tras(saquear(G)), !puedeSaquear);
  const objs = objetivosAtaque(G); btn('Atacar', () => elegirAtaque(objs), !objs.length);
  btn(`Craftear${c.tipo === 'taller' ? ' (gratis)' : ''}`, () => elegirReceta(), false, c.tipo === 'taller' ? 'libre' : '');
  const adyacentes = vivos(G).filter(x => x.id !== j.id && dist(x.pos, j.pos) <= 1);
  if (j.pasajeroDe != null) btn('Bajar del vehículo', () => tras(vehiculo(G)));
  else if (j.vehiculo) btn('Bajar del vehículo', () => tras(vehiculo(G)));
  else { const vs = j.mano.filter(cc => OBJETOS[cc.id].porGas); if (vs.length && j.personajeId !== 'ruy') btn('Conducir', () => vs.length === 1 ? tras(vehiculo(G, vs[0].uid)) : elegirDeLista('¿Cuál?', vs.map(v => [OBJETOS[v.id].nombre + ' · gas ' + v.gas, () => tras(vehiculo(G, v.uid))]))); const cond = conductoresDisponibles(G); if (cond.length) btn('Subir de pasajero', () => elegirDeLista('¿Con quién?', cond.map(x => [`${x.nombre} · ${OBJETOS[x.vehiculo.id].nombre}`, () => tras(subirPasajero(G, x.id))]))); }
  if (puedeSalir(G)) btn('Salir de la ciudad', () => modal('Salir de la ciudad', `<p>Te vas con ${pasajerosDe(G, j).length} pasajeros. No vuelves a la partida.</p>`, [['Salir', () => tras(salir(G)), 'primario'], ['Cancelar', null]]));
  const dests = destinatarios(G); btn('Dar cartas', () => darCartas(dests), !dests.length || !j.mano.length);
  const caidos = adyacentes.filter(x => x.estado === 'caido'); if (caidos.length) btn('Levantar', () => elegirDeLista('¿A quién?', caidos.map(x => [x.nombre, () => tras(levantar(G, x.id))])));
  const amputables = j.mano.some(cc => OBJETOS[cc.id].amputa) ? adyacentes.filter(x => x.mordido && (x.mordido.turnos != null || x.mordido.sc) && x.estado === 'vivo' && G.ronda - x.mordido.ronda <= 1) : []; if (amputables.length) btn('Amputar', () => elegirDeLista('Amputar (2 heridas, salva del contagio)', amputables.map(x => [x.nombre, () => tras(amputar(G, x.id))])));
  btn('Descansar', () => tras(descansar(G)), Object.values(G.zombis).some(z => dist(z.pos, j.pos) <= 2));
  if (j.personajeId === 'anselmo') btn('Sermón', () => tras(sermon(G)), !vivos(G).some(x => dist(x.pos, j.pos) <= 2 && x.panico > 0));
  if (j.personajeId === 'naima' && !G.banderas.triajeUsado) { const cand = adyacentes.filter(x => !['elias', 'beatriz'].includes(x.personajeId) && x.vida < x.vidaMax); if (cand.length) btn('Triaje (gratis)', () => elegirDeLista('Triaje', cand.map(x => [x.nombre, () => tras(triaje(G, x.id))])), false, 'libre'); }
  if (T.rastreo && T.movido) btn('Rastrear (gratis)', () => { UI.modo = 'rastreo'; toast('Toca una loseta oculta adyacente'); dibujar(); }, false, 'libre');
  acc.append(el('button', { class: 'primario libre', onclick: () => { const p = puedeTerminar(G); if (!p.ok) { toast(p.motivo); return; } terminarTurno(G); UI.modo = 'mover'; tras(); } }, 'Terminar turno'));
  const ayuda = { mover: T.pasos > 0 || j.vehiculo ? 'Toca una casilla iluminada para moverte. Toca un zombi para atacarlo. Toca cualquier casilla para ver qué hay.' : 'Sin pasos. Usa tus acciones o termina el turno.', molotov: 'Toca la casilla adyacente donde lanzar el molotov.', barricada: 'Toca la casilla adyacente cuyo paso quieres bloquear.', rastreo: 'Toca una loseta oculta adyacente para rastrearla.' }[UI.modo];
  panel.append(acc, el('p', { class: 'muted small ayuda' }, ayuda));
  const mano = root.querySelector('.mano'); mano.innerHTML = ''; mano.append(el('div', { class: 'peso' }, `Peso ${peso(G, j)}/${capacidad(G, j)}`));
  j.mano.forEach(cc => { const O = OBJETOS[cc.id]; const extra = cc.durab != null ? ` · dur ${cc.durab}` : cc.usos != null ? ` · usos ${cc.usos}` : cc.gas != null ? ` · gas ${cc.gas}` : ''; mano.append(el('button', { class: 'carta ' + O.tipo, onclick: () => usarCarta(cc) }, el('b', {}, O.nombre), el('span', {}, `${O.tipo}${O.dados ? ' · ' + O.dados + ' dados' : ''}${O.distancia ? ' · dist ' + O.distancia : ''}${extra}`))); });
  dibujar();
}
function elegirDeLista(titulo, items) { const c = el('div', { class: 'lista' }); items.forEach(([t, f]) => c.append(el('button', { onclick: () => { cerrarModal(); f(); } }, t))); modal(titulo, c, [['Cancelar', null]]); }
function elegirAtaque(objs) {
  const j = turnoActual(G); const armas = armasDe(G, j); const c = el('div', { class: 'lista' });
  objs.forEach(({ z, d }) => { const nombre = (z.tipo === 'jugador' ? G.jugadores[z.jugadorId].nombre + ' (zombi)' : ZOMBIS[z.tipo].nombre) + (z.n > 1 ? ' ×' + z.n : '') + (esHorda(z) ? ' · horda' : '') + (d ? ` · a ${d} casillas` : ' · aquí');
    let opciones = [[null, 'Manos (1 dado)'], ...armas.filter(a => d === 0 || OBJETOS[a.id].distancia).filter(a => !(d > 0 && ZOMBIS[z.tipo].inmuneDistancia)).map(a => [a.uid, `${OBJETOS[a.id].nombre} (${OBJETOS[a.id].dados} dados${OBJETOS[a.id].fuego ? ', ruido' : ''})`])];
    if (d > 0) opciones.shift();
    c.append(el('div', { class: 'objetivo' }, el('b', {}, nombre), el('div', {}, ...opciones.map(([uid, t]) => el('button', { onclick: () => { cerrarModal(); const r = atacar(G, z.id, uid); if (r.ok) toast(`[${r.dados.join(' ')}] ${r.impactos} impactos · ${r.muertos} eliminados${r.mordido ? ' · ¡te muerde!' : ''}`); tras(r); } }, t))))); });
  modal('Atacar', c, [['Cancelar', null]]);
}
function elegirReceta() {
  const j = turnoActual(G); const c = el('div', { class: 'lista' }); let chapuza = false;
  if (j.personajeId === 'marga' && !G.banderas.chapuzaUsada) c.append(el('label', { class: 'check' }, el('input', { type: 'checkbox', onchange: e => { chapuza = e.target.checked; pinta(); } }), 'Chapuza: un ingrediente menos (una vez por partida)'));
  const lista = el('div', { class: 'lista' }); c.append(lista);
  const pinta = () => { lista.innerHTML = ''; G.recetasConocidas.forEach(r => { const R = RECETAS[r]; const faltan = R.ing.filter((ing, i) => j.mano.filter(cc => cc.id === ing).length < R.ing.slice(0, i + 1).filter(x => x === ing).length).length; const puede = faltan === 0 || (chapuza && faltan === 1); lista.append(el('button', { class: 'receta' + (puede ? '' : ' falta'), disabled: !puede, onclick: () => { cerrarModal(); tras(craftear(G, r, chapuza)); } }, el('b', {}, R.nombre), el('span', {}, R.ing.map(i => OBJETOS[i].nombre).join(' + ')), el('small', {}, R.texto))); }); };
  pinta(); if (!G.recetasConocidas.length) c.append('No conoces recetas.'); modal('Libro de recetas', c, [['Cerrar', null]]);
}
function darCartas(dests) { const j = turnoActual(G); const c = el('div', { class: 'lista' }); const sel = new Set(); j.mano.forEach(cc => c.append(el('label', { class: 'check' }, el('input', { type: 'checkbox', onchange: e => e.target.checked ? sel.add(cc.uid) : sel.delete(cc.uid) }), OBJETOS[cc.id].nombre))); const dest = el('select', {}, ...dests.map(x => el('option', { value: x.id }, x.nombre + (dist(x.pos, j.pos) > 1 ? ' (por enlace)' : '')))); c.append(el('label', {}, 'Para ', dest)); modal('Dar cartas (1 acción)', c, [['Dar', () => tras(dar(G, +dest.value, [...sel]))], ['Cancelar', null]]); }
function usarCarta(cc) {
  const j = turnoActual(G); const O = OBJETOS[cc.id]; const ops = [];
  if (O.cura || O.contagio) { const dests = objetivosCura(G); ops.push(['Usar en…', () => elegirDeLista(O.nombre, dests.map(d => [d.id === j.id ? 'Yo' : d.nombre, () => tras(curar(G, cc.uid, d.id))]))]); }
  if (cc.id === 'molotov') ops.push(['Lanzar', () => { UI.modo = 'molotov'; toast('Toca la casilla adyacente objetivo'); pintarJuego(); }]);
  if (cc.id === 'barricada') ops.push(['Colocar', () => { UI.modo = 'barricada'; toast('Toca la casilla adyacente a bloquear'); pintarJuego(); }]);
  if (cc.id === 'enlace') ops.push(['Enlazar con…', () => elegirDeLista('Enlace', vivos(G).filter(x => x.id !== j.id && x.estado === 'vivo' && x.personajeId !== 'ceniza').map(x => [x.nombre, () => tras(usar(G, cc.uid, x.id))]))]);
  if (cc.id === 'senuelo' || cc.id === 'camuflaje') ops.push(['Usar aquí', () => tras(usar(G, cc.uid))]);
  if (cc.id === 'bidon' && j.vehiculo) ops.push(['Repostar', () => tras(usar(G, cc.uid))]);
  if (cc.id === 'comida' && j.personajeId === 'omar') ops.push(['Compartir (quita pánico)', () => tras(usar(G, cc.uid))]);
  if (O.porGas && !j.vehiculo && j.pasajeroDe == null && j.personajeId !== 'ruy') ops.push(['Conducir', () => tras(vehiculo(G, cc.uid))]);
  const desc = cc.id in RECETAS ? RECETAS[cc.id].texto : O.tipo === 'arma' ? `${O.dados} dados${O.extra ? ' +' + O.extra : ''}${O.distancia ? ', distancia ' + O.distancia : ', cuerpo a cuerpo'}${O.fuego ? ', +2 ruido' : ''}${O.mataCorredor ? ', mata corredores' : ''}${O.amputa ? ', sirve para amputar' : ''}.` : O.tipo === 'material' ? 'Material de crafteo.' : O.tipo === 'vehiculo' && !O.porGas ? 'Necesita gasolina: craftea con un bidón.' : cc.id === 'comida' ? 'Se deposita al terminar turno en el refugio.' : cc.id === 'bidon' ? 'Combustible. Se deposita en el generador (El depósito) o en el refugio (La granja).' : cc.id === 'semillas' ? 'Se depositan en el refugio.' : cc.id.startsWith('muestra') ? 'Se entrega en el laboratorio.' : '';
  modal(O.nombre, `<p>${desc}</p><p class="muted">Peso ${O.peso}${cc.durab != null ? ' · durabilidad ' + cc.durab : ''}</p>`, [...ops, ['Cerrar', null]]);
}

/* ---------- pantalla del jugador zombi ---------- */
function pintarZombi() {
  const root = $('#p-zombi'); cabecera(root); const j = G.jugadores[G.zturno.jugadorId]; const z = fichaZombi(G, j.id); const panel = root.querySelector('.panel'); panel.innerHTML = '';
  panel.append(el('div', { class: 'quien' }, el('b', {}, j.nombre + ' · zombi'), el('span', {}, ` · nivel ${G.nivelZombi} · ${G.zturno.acciones} acciones${G.zturno.pasos ? ' · ' + G.zturno.pasos + ' pasos' : ''}${z && z.oculto ? ' · oculto' : ''}`)));
  const acc = el('div', { class: 'acciones' }); const b = (t, f, dis) => acc.append(el('button', { disabled: dis, onclick: f }, t));
  b(UI.modo === 'zmover' ? '● Mover mi ficha' : 'Mover mi ficha', () => { UI.modo = 'zmover'; pintarZombi(); }, !z);
  b(UI.modo.startsWith('zhorda') ? '● Empujar horda' : 'Empujar horda', () => { UI.modo = 'zhorda_sel'; UI.zSel = null; toast('Toca el grupo de zombis y luego la casilla'); pintarZombi(); }, G.zturno.acciones <= 0);
  const presas = z ? jugadoresEn(G, z.pos) : []; b('Atacar', () => elegirDeLista('Atacar a…', presas.map(p => [p.nombre, () => tras(zAtacar(G, p.id))])), !presas.length || G.zturno.acciones <= 0);
  const olibles = z ? vivos(G).filter(p => dist(p.pos, z.pos) <= 3) : []; b('Oler', () => elegirDeLista('Oler a…', olibles.map(p => [p.nombre, () => { const r = zOler(G, p.id); if (r.ok) modal('Mano de ' + p.nombre, r.mano.length ? '<ul>' + r.mano.map(x => `<li>${x}</li>`).join('') + '</ul>' : '<p>Nada.</p>', [['Cerrar', () => tras()]]); else tras(r); }])), !olibles.length || G.zturno.acciones <= 0);
  b('Ocultarse', () => tras(zOcultar(G)), !z || z.oculto || G.zturno.acciones <= 0 || !zombisEn(G, z.pos).some(x => x.tipo === 'caminante'));
  acc.append(el('button', { class: 'primario', onclick: () => { zTerminar(G); UI.modo = 'mover'; tras(); } }, 'Terminar'));
  panel.append(acc, el('p', { class: 'muted small ayuda' }, 'Ganas cuando más de la mitad del equipo esté convertido o muerto. Oculto entre caminantes nadie puede atacarte. Puedes hablar y mentir en la mesa.'));
  root.querySelector('.mano').innerHTML = ''; dibujar();
}

/* ---------- fin ---------- */
function fin() { mostrar('fin'); const c = $('#p-fin .cont'); c.innerHTML = ''; const F = G.fin; c.append(el('h1', { class: F.resultado }, F.resultado === 'victoria' ? 'Misión cumplida' : 'Misión fracasada'), el('p', {}, F.motivo), el('p', { class: 'muted' }, `${MISIONES[G.misionId].nombre} · ${G.ronda} rondas · ruido final ${G.ruido} · ${G.stats.mordiscos || 0} mordiscos · ${G.stats.conversiones || 0} conversiones · ${G.stats.crafteos || 0} crafteos`));
  const t = el('table', { class: 'expediente' }); t.append(el('tr', {}, el('th', {}, 'Superviviente'), el('th', {}, 'Personaje'), el('th', {}, 'Estado'))); G.jugadores.forEach(j => t.append(el('tr', {}, el('td', {}, j.nombre), el('td', {}, PERSONAJES[j.personajeId].nombre), el('td', { class: j.estado }, { vivo: `vivo (${j.vida} vida)`, caido: 'en el suelo', zombi: 'convertido', muerto: 'muerto', salido: 'a salvo, fuera de la ciudad' }[j.estado]))));
  c.append(t, el('button', { class: 'mini', onclick: verLog }, 'Ver registro'), el('button', { class: 'primario ancho', onclick: () => { try { localStorage.removeItem(CLAVE); } catch (e) { } G = null; inicio(); } }, 'Nueva partida')); }

/* ---------- tablero ---------- */
const canvas = () => $('#p-' + (UI.pantalla === 'zombi' ? 'zombi' : 'juego') + ' canvas');
function ajustarCanvas() { const cv = canvas(); if (!cv) return; const r = cv.parentElement.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.floor(r.width * dpr); cv.height = Math.floor(r.height * dpr); cv._dpr = dpr; if (!UI.cam.ajustada) { encuadrar(); } }
function encuadrar() { const cv = canvas(); if (!cv || !G) return; let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; for (const c of Object.values(G.casillas)) { const [x, y] = pixel(c.k); minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); } const s = Math.min(cv.width / (maxx - minx + 2.2), cv.height / (maxy - miny + 2.4)); UI.cam = { s, x: cv.width / 2 - s * (minx + maxx) / 2, y: cv.height / 2 - s * (miny + maxy) / 2, ajustada: true }; }
const COL = { calle: '#4a4d47', edificio: '#6a6152', bosque: '#3f4d33', gasolinera: '#7a5a2e', farmacia: '#6e4a4a', taller: '#5b5a6a', refugio: '#7a3a2a', entrada: '#5a2d2d', helipuerto: '#3d5a6a', torre: '#3d5a6a', laboratorio: '#4a3d6a', generador: '#6a5a2a', oculta: '#22241f' };
const ICON = { gasolinera: '⛽', farmacia: '✚', taller: '🔧', refugio: '⌂', helipuerto: 'H', entrada: '↯', bosque: '♣', edificio: '▪', torre: '📡', laboratorio: '⚗', generador: '⚡' };
function hexPath(ctx, x, y, s) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; const px = x + s * Math.cos(a), py = y + s * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); }
function dibujar() {
  const cv = canvas(); if (!cv || !G) return; const ctx = cv.getContext('2d'); const { s, x: ox, y: oy } = UI.cam; ctx.clearRect(0, 0, cv.width, cv.height);
  const actual = G.fase === 'turno' ? turnoActual(G) : null; const dest = G.fase === 'turno' && UI.modo === 'mover' ? new Set(destinosPosibles(G)) : new Set();
  if (G.fase === 'turno' && (UI.modo === 'molotov' || UI.modo === 'barricada')) vecinos(actual.pos).forEach(k => G.casillas[k] && dest.add(k));
  const zf = G.fase === 'zombi' ? fichaZombi(G, G.zturno.jugadorId) : null;
  const zdest = new Set(); if (zf && UI.modo === 'zmover') vecinos(zf.pos).forEach(k => G.casillas[k] && !G.casillas[k].fuego && zdest.add(k)); if (UI.modo === 'zhorda_dest' && UI.zSel && G.zombis[UI.zSel]) vecinos(G.zombis[UI.zSel].pos).forEach(k => G.casillas[k] && !G.casillas[k].fuego && zdest.add(k));
  const rr = s * 0.98;
  for (const c of Object.values(G.casillas)) {
    const [px, py] = pixel(c.k, s); const x = ox + px, y = oy + py; hexPath(ctx, x, y, rr);
    ctx.fillStyle = c.revelada ? COL[c.tipo] : COL.oculta; ctx.fill(); ctx.lineWidth = Math.max(1, s * 0.06); ctx.strokeStyle = '#151714'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (c.revelada) { if (c.fuego) { ctx.fillStyle = 'rgba(230,120,40,.7)'; ctx.fill(); } if (c.senuelo) { ctx.fillStyle = 'rgba(214,163,25,.35)'; ctx.fill(); }
      const ocupada = zombisEn(G, c.k).length || jugadoresEn(G, c.k).length;
      if (ICON[c.tipo]) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `${s * 0.7}px sans-serif`; ctx.fillText(ICON[c.tipo], x, y - (ocupada ? s * 0.45 : 0)); }
      if (c.saqueos >= PARAMS.saqueosPorCasilla && ['edificio', 'gasolinera', 'farmacia', 'taller'].includes(c.tipo)) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); }
      if (c.objetos.length) { ctx.font = `${s * 0.6}px sans-serif`; ctx.fillText(c.objetos.includes('suministro') ? '📦' : '🚗', x, y); }
    } else { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.font = `${s * 0.7}px sans-serif`; ctx.fillText('?', x, y); }
  }
  ctx.lineWidth = Math.max(1, s * 0.09); ctx.strokeStyle = 'rgba(230,227,218,.18)';
  for (const c of Object.values(G.casillas)) { const [px, py] = pixel(c.k, s); const x = ox + px, y = oy + py; vecinos(c.k).forEach((v, i) => { const n = G.casillas[v]; if (n && n.loseta === c.loseta) return; const a = Math.PI / 6 + (i + 4) * Math.PI / 3, b = a + Math.PI / 3; ctx.beginPath(); ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); ctx.lineTo(x + rr * Math.cos(b), y + rr * Math.sin(b)); ctx.stroke(); }); }
  // barricadas
  ctx.lineWidth = Math.max(3, s * 0.18); ctx.strokeStyle = '#e0b43a';
  for (const ar of G.barricadas) { const [a, b] = ar.split('|'); const i = vecinos(a).indexOf(b); if (i < 0) continue; const [px, py] = pixel(a, s); const x = ox + px, y = oy + py; const a1 = Math.PI / 6 + (i + 4) * Math.PI / 3, a2 = a1 + Math.PI / 3; ctx.beginPath(); ctx.moveTo(x + rr * Math.cos(a1), y + rr * Math.sin(a1)); ctx.lineTo(x + rr * Math.cos(a2), y + rr * Math.sin(a2)); ctx.stroke(); }
  for (const k of [...dest, ...zdest]) { const [px, py] = pixel(k, s); hexPath(ctx, ox + px, oy + py, rr - s * 0.08); ctx.lineWidth = Math.max(2, s * 0.12); ctx.strokeStyle = dest.has(k) ? (UI.modo === 'mover' ? '#9db060' : '#e0b43a') : '#c9553d'; ctx.stroke(); }
  if (UI.modo === 'zhorda_dest' && UI.zSel && G.zombis[UI.zSel]) { const [px, py] = pixel(G.zombis[UI.zSel].pos, s); hexPath(ctx, ox + px, oy + py, rr - s * 0.08); ctx.strokeStyle = '#e0b43a'; ctx.stroke(); }
  for (const z of Object.values(G.zombis)) { const c = G.casillas[z.pos]; if (!c.revelada) continue; if (z.tipo === 'jugador' && z.oculto && G.fase !== 'zombi') continue; const [px, py] = pixel(z.pos, s); const x = ox + px + s * 0.3, y = oy + py + s * 0.25; const r = s * (esHorda(z) ? 0.42 : 0.32);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = z.tipo === 'jugador' ? '#8fa86a' : z.tipo === 'acorazado' ? '#3a3f4a' : z.tipo === 'corredor' ? '#7a5a3a' : z.tipo === 'nino' ? '#6a5a6a' : '#4f5a3a'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = z.oculto ? '#e0b43a' : '#c9553d'; ctx.stroke();
    ctx.fillStyle = '#e6e3da'; ctx.font = `bold ${r * 1.1}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(z.n > 1 ? ZOMBIS[z.tipo].letra + z.n : ZOMBIS[z.tipo].letra, x, y); }
  for (const j of G.jugadores) { if (!['vivo', 'caido'].includes(j.estado)) continue; if (j.pasajeroDe != null) continue; const [px, py] = pixel(j.pos, s); const compa = jugadoresEn(G, j.pos).filter(x => x.pasajeroDe == null); const i = compa.indexOf(j); const ang = compa.length > 1 ? (i / compa.length) * Math.PI * 2 : 0; const off = compa.length > 1 ? s * 0.32 : 0;
    const x = ox + px - s * 0.15 + Math.cos(ang) * off, y = oy + py - s * 0.15 + Math.sin(ang) * off; const r = s * 0.3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = PERSONAJES[j.personajeId].color; ctx.fill(); ctx.lineWidth = actual && actual.id === j.id ? 4 : 2; ctx.strokeStyle = actual && actual.id === j.id ? '#fff' : j.estado === 'caido' ? '#c9553d' : '#151714'; ctx.stroke();
    ctx.fillStyle = '#151714'; ctx.font = `bold ${r * 1.1}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(j.estado === 'caido' ? '✕' : j.vehiculo ? '🚗' : String(j.id + 1), x, y); if (j.mordido) { ctx.fillStyle = '#c9553d'; ctx.beginPath(); ctx.arc(x + r * 0.8, y - r * 0.8, r * 0.4, 0, Math.PI * 2); ctx.fill(); } }
}
function casillaEn(cx, cy) { const cv = canvas(); const { s, x: ox, y: oy } = UI.cam; const dpr = cv._dpr || 1; const x = (cx * dpr - ox) / s, y = (cy * dpr - oy) / s; const r = y / 1.5, q = x / Math.sqrt(3) - r / 2; let rq = Math.round(q), rr = Math.round(r), rs = Math.round(-q - r); const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - (-q - r)); if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs; const k = rq + ',' + rr; return G.casillas[k] ? k : null; }
function tocar(k) {
  if (!k) return;
  if (G.fase === 'turno') {
    const j = turnoActual(G);
    if (UI.modo === 'molotov') { const m = j.mano.find(cc => cc.id === 'molotov'); UI.modo = 'mover'; tras(m ? usar(G, m.uid, k) : { ok: false }); return; }
    if (UI.modo === 'barricada') { const m = j.mano.find(cc => cc.id === 'barricada'); UI.modo = 'mover'; tras(m ? usar(G, m.uid, k) : { ok: false }); return; }
    if (UI.modo === 'rastreo') { const r = rastrear(G, k); if (r.ok) UI.modo = 'mover'; tras(r); return; }
    if (destinosPosibles(G).includes(k)) { tras(mover(G, k)); return; }
    const objs = objetivosAtaque(G).filter(o => o.z.pos === k); if (objs.length && G.turno.acciones > 0) { elegirAtaque(objs); return; }
    info(k);
  } else if (G.fase === 'zombi') {
    if (UI.modo === 'zmover') { const r = zMover(G, k); if (!r.ok) info(k); else tras(r); return; }
    if (UI.modo === 'zhorda_sel') { const zs = zombisEn(G, k).filter(z => z.tipo !== 'jugador'); if (!zs.length) { info(k); return; } UI.zSel = zs.sort((a, b) => b.n - a.n)[0].id; UI.modo = 'zhorda_dest'; toast('Ahora toca la casilla de destino'); dibujar(); return; }
    if (UI.modo === 'zhorda_dest') { const r = zMoverHorda(G, UI.zSel, k); UI.modo = 'zhorda_sel'; UI.zSel = null; tras(r); return; }
  }
}
function info(k) { const c = G.casillas[k]; if (!c.revelada) { modal('Loseta oculta', '<p>Se revela al entrar. Puede haber zombis.</p>'); return; } const zs = zombisEn(G, k).filter(z => !(z.tipo === 'jugador' && z.oculto)).map(z => `${ZOMBIS[z.tipo].nombre}${z.n > 1 ? ' ×' + z.n : ''}${esHorda(z) ? ' (horda)' : ''}`); const js = jugadoresEn(G, k).map(j => `${j.nombre} (${PERSONAJES[j.personajeId].alias})`);
  const tipo = { calle: 'Calle. Los vehículos circulan por aquí.', edificio: 'Edificio. Se puede saquear dos veces. Los zombis tardan en entrar.', bosque: 'Bosque. Cuesta 2 pasos. Bloquea la visión.', gasolinera: 'Gasolinera. Saquear da bidones y hace ruido.', farmacia: 'Farmacia. Botiquín y antibióticos, dos saqueos.', taller: 'Taller. Craftear aquí es gratis. Piezas, tablas, chapa y recetarios.', refugio: 'Refugio. Cura 1 al final de la ronda. Comida, antibióticos y semillas se depositan aquí.', entrada: 'Entrada de horda.', helipuerto: 'Helipuerto. Objetivo de Sin una gota.', torre: 'Torre de radio. Objetivo de La emisora.', laboratorio: 'Laboratorio. Aquí se entregan las muestras.', generador: 'Generador. Aquí se dejan los bidones.' }[c.tipo];
  modal(c.tipo[0].toUpperCase() + c.tipo.slice(1), `<p>${tipo}</p>${c.saqueos ? `<p class="muted">Saqueada ${c.saqueos} vez/veces.</p>` : ''}${c.fuego ? `<p class="peligro">Arde ${c.fuego} rondas.</p>` : ''}${c.senuelo ? `<p>Señuelo activo ${c.senuelo} rondas.</p>` : ''}${c.objetos.length ? `<p>Hay algo: ${c.objetos.map(o => OBJETOS[o].nombre).join(', ')}.</p>` : ''}${zs.length ? `<p><b>Zombis:</b> ${zs.join(', ')}</p>` : ''}${js.length ? `<p><b>Supervivientes:</b> ${js.join(', ')}</p>` : ''}`); }

/* ---------- gestos ---------- */
function gestos(cv) {
  let drag = null, pinch = null, movido = false;
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; movido = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id || pinch) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 6) movido = true; if (movido) { UI.cam.x += dx * (cv._dpr || 1); UI.cam.y += dy * (cv._dpr || 1); drag.x = e.clientX; drag.y = e.clientY; dibujar(); } });
  cv.addEventListener('pointerup', e => { if (drag && !movido && !pinch) { const r = cv.getBoundingClientRect(); tocar(casillaEn(e.clientX - r.left, e.clientY - r.top)); } drag = null; });
  cv.addEventListener('pointercancel', () => { drag = null; });
  cv.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 0.9 : 1.1, e.clientX, e.clientY, cv); }, { passive: false });
  cv.addEventListener('touchstart', e => { if (e.touches.length === 2) { pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); drag = null; } }, { passive: true });
  cv.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); zoom(d / pinch, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2, cv); pinch = d; } }, { passive: true });
  cv.addEventListener('touchend', () => { setTimeout(() => pinch = null, 50); });
}
function zoom(k, cx, cy, cv) { const r = cv.getBoundingClientRect(); const dpr = cv._dpr || 1; const px = (cx - r.left) * dpr, py = (cy - r.top) * dpr; const ns = Math.min(UI.cam.s * k, 120 * dpr); const kk = ns / UI.cam.s; if (ns < 6) return; UI.cam.x = px - (px - UI.cam.x) * kk; UI.cam.y = py - (py - UI.cam.y) * kk; UI.cam.s = ns; dibujar(); }

/* ---------- arranque ---------- */
window.addEventListener('resize', () => { UI.cam.ajustada = false; ajustarCanvas(); dibujar(); });
document.querySelectorAll('canvas').forEach(gestos);
document.querySelectorAll('.encuadrar').forEach(b => b.addEventListener('click', () => { encuadrar(); dibujar(); }));
$('#modal-fondo').addEventListener('click', e => { if (e.target.id === 'modal-fondo') cerrarModal(); });
if (cargar()) reanudar(); else inicio();
