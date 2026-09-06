// Z-2099 · motor de reglas del prototipo M0. Sin dependencias de interfaz.
// El estado G es un objeto JSON serializable. Todas las funciones lo mutan y devuelven un resultado.
import { PARAMS, CARAS, OBJETOS, MAZO_OBJETOS, RECETAS, ZOMBIS, MAZO_ZOMBIS, PERSONAJES, MISIONES, EVENTOS, HORDAS, escalado } from './datos.js';

/* ---------- azar determinista ---------- */
export function rnd(G) { let a = (G.semilla | 0) + 0x6D2B79F5 | 0; G.semilla = a; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
export function entero(G, n) { return Math.floor(rnd(G) * n); }
export function elegir(G, arr) { return arr[entero(G, arr.length)]; }
export function barajar(G, arr) { for (let i = arr.length - 1; i > 0; i--) { const j = entero(G, i + 1);[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
export function tirarDado(G) { return CARAS[entero(G, 6)]; }

/* ---------- hexágonos (axial, punta arriba) ---------- */
export const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
export const key = (q, r) => q + ',' + r;
export const parse = k => k.split(',').map(Number);
export function dist(a, b) { const [q1, r1] = parse(a), [q2, r2] = parse(b); return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs((q1 + r1) - (q2 + r2))); }
export function vecinos(k) { const [q, r] = parse(k); return DIRS.map(d => key(q + d[0], r + d[1])); }
export function linea(a, b) { // casillas estrictamente entre a y b
  const n = dist(a, b); if (n <= 1) return []; const [q1, r1] = parse(a), [q2, r2] = parse(b); const out = [];
  for (let i = 1; i < n; i++) { const t = i / n; let q = q1 + (q2 - q1) * t, r = r1 + (r2 - r1) * t, s = -q - r; let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s); const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s); if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs; out.push(key(rq, rr)); }
  return out;
}
export function centroLoseta(k) { if (mod7(k) === 0) return k; return vecinos(k).find(v => mod7(v) === 0); }
function mod7(k) { const [q, r] = parse(k); return ((q + 3 * r) % 7 + 7) % 7; }
export function pixel(k, s = 1) { const [q, r] = parse(k); return [s * Math.sqrt(3) * (q + r / 2), s * 1.5 * r]; }

/* ---------- registro ---------- */
export function log(G, texto, tipo = 'info') { G.log.push({ ronda: G.ronda, texto, tipo }); if (G.log.length > 300) G.log.shift(); }
export function aviso(G, titulo, texto, tipo = 'info') { G.avisos.push({ titulo, texto, tipo }); log(G, `${titulo}: ${texto}`, tipo); }

/* ---------- creación de partida ---------- */
export function nuevaPartida({ jugadores, misionId, semilla }) {
  const G = { semilla: semilla | 0 || 1, ronda: 1, fase: 'turno', log: [], avisos: [], misionId, ruido: 0, fin: null,
    jugadores: [], casillas: {}, zombis: {}, sigZombi: 1, sigCarta: 1, mazoObjetos: [], descartes: [], mazoHordas: [], mazoEventos: [],
    recetasConocidas: Object.keys(RECETAS).filter(r => RECETAS[r].inicial), almacen: { comida: 0, antibioticos: 0 }, nivelZombi: 0,
    niebla: false, banderas: {}, entradas: [], helipuerto: null, orden: [], turnoIdx: 0, turno: null, zturno: null };
  const esc = escalado(jugadores.length); G.escalado = esc; G.ruido = esc.ruidoInicial;
  const mision = MISIONES[misionId];
  jugadores.forEach((j, i) => {
    const p = PERSONAJES[j.personajeId];
    const jug = { id: i, nombre: j.nombre, personajeId: j.personajeId, pos: '0,0', vida: p.vida, vidaMax: p.vida, panico: 0, mordido: null, estado: 'vivo',
      mano: [], vehiculo: null, camuflaje: 0, curadoMordisco: false, iniciativa: p.iniciativa };
    p.inicial.forEach(id => jug.mano.push(carta(G, id)));
    G.jugadores.push(jug);
  });
  for (const [id, n] of Object.entries(MAZO_OBJETOS)) for (let i = 0; i < n; i++) G.mazoObjetos.push(id);
  barajar(G, G.mazoObjetos);
  G.mazoHordas = barajar(G, HORDAS.map((h, i) => i)); G.mazoEventos = barajar(G, EVENTOS.map((e, i) => i));
  generarTablero(G, mision);
  log(G, `Misión: ${mision.nombre}. ${mision.texto}`, 'mision');
  iniciarRonda(G);
  return G;
}
export function carta(G, id) { const o = OBJETOS[id]; const c = { uid: G.sigCarta++, id }; if (o.durabilidad) c.durab = o.durabilidad; if (o.usos) c.usos = o.usos; if (o.gasMax) c.gas = o.gasMax; return c; }

export function generarTablero(G, mision) {
  const R = PARAMS.radioMapa; const C = G.casillas;
  for (let q = -R; q <= R; q++) for (let r = Math.max(-R, -q - R); r <= Math.min(R, -q + R); r++) {
    const [px, py] = pixel(key(q, r)); if (Math.max(Math.abs(px), Math.abs(py)) > 9.2 || Math.abs(px) + Math.abs(py) > 12.6) continue;
    C[key(q, r)] = { k: key(q, r), q, r, tipo: 'calle', loseta: null, revelada: false, fuego: 0, senuelo: 0, saqueos: 0, objetos: [] };
  }
  for (const c of Object.values(C)) { c.loseta = centroLoseta(c.k); if (!C[c.loseta]) c.loseta = c.k; }
  const borde = Object.values(C).filter(c => vecinos(c.k).some(v => !C[v]));
  // tipos
  for (const c of Object.values(C)) { const x = rnd(G); c.tipo = x < .42 ? 'calle' : x < .78 ? 'edificio' : x < .90 ? 'bosque' : x < .93 ? 'gasolinera' : x < .96 ? 'farmacia' : 'taller'; }
  C['0,0'].tipo = 'refugio';
  const inicial = new Set(['0,0', '3,-1', '1,2', '-2,3', '-3,1', '-1,-2', '2,-3']);
  for (const c of Object.values(C)) if (inicial.has(c.loseta)) { c.revelada = true; if (c.tipo === 'gasolinera' || c.tipo === 'farmacia') c.tipo = 'edificio'; }
  // entradas de horda: 8 casillas de borde en 8 direcciones
  const usadas = new Set();
  for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; let mejor = null, md = 1e9; for (const c of borde) { const [px, py] = pixel(c.k); const d = Math.hypot(px - 11 * Math.cos(ang), py - 11 * Math.sin(ang)); if (d < md && !usadas.has(c.k)) { md = d; mejor = c; } } mejor.tipo = 'entrada'; usadas.add(mejor.k); G.entradas.push(mejor.k); }
  // garantías
  const ocultas = () => Object.values(C).filter(c => !c.revelada && c.tipo !== 'entrada');
  const forzar = (tipo, n, filtro = () => true) => { let hay = Object.values(C).filter(c => c.tipo === tipo).length; const cand = barajar(G, ocultas().filter(c => ['calle', 'edificio', 'bosque'].includes(c.tipo) && filtro(c))); while (hay < n && cand.length) { cand.pop().tipo = tipo; hay++; } };
  if (mision.farmacias) { for (const c of Object.values(C)) if (c.tipo === 'farmacia') c.tipo = 'edificio'; const top = ocultas().filter(c => c.r <= -4), bot = ocultas().filter(c => c.r >= 4); elegir(G, top).tipo = 'farmacia'; elegir(G, bot).tipo = 'farmacia'; }
  forzar('farmacia', 2); forzar('gasolinera', 3); forzar('taller', 2);
  if (mision.helipuerto) { const cand = borde.filter(c => !c.revelada && c.tipo !== 'entrada'); const h = elegir(G, cand); h.tipo = 'helipuerto'; G.helipuerto = h.k; for (const c of Object.values(C)) if (c.loseta === h.loseta) c.revelada = true; }
}

/* ---------- consultas ---------- */
export const jugador = (G, id) => G.jugadores[id];
export const vivos = G => G.jugadores.filter(j => j.estado === 'vivo' || j.estado === 'caido');
export const jugadoresEn = (G, k) => G.jugadores.filter(j => j.pos === k && (j.estado === 'vivo' || j.estado === 'caido'));
export const zombisEn = (G, k) => Object.values(G.zombis).filter(z => z.pos === k);
export const esHorda = z => z.tipo === 'caminante' && z.n >= 3;
export const personaje = j => PERSONAJES[j.personajeId];
export const mision = G => MISIONES[G.misionId];
export function peso(G, j) { let p = j.mano.reduce((s, c) => s + OBJETOS[c.id].peso, 0); return p; }
export function capacidad(G, j) { return personaje(j).capacidad + (j.vehiculo && OBJETOS[j.vehiculo.id].capacidad ? OBJETOS[j.vehiculo.id].capacidad : 0); }
export function distanciaMin(G, k, lista) { let m = 1e9; for (const x of lista) m = Math.min(m, dist(k, x)); return m; }
export function losetaOculta(G, k) { const c = G.casillas[k]; return c && !c.revelada; }

/* ---------- zombis ---------- */
export function ponerZombi(G, tipo, n, k, extra = {}) {
  const mismo = Object.values(G.zombis).find(z => z.pos === k && z.tipo === tipo && tipo !== 'jugador');
  if (mismo) { mismo.n += n; return mismo; }
  const z = { id: G.sigZombi++, tipo, n, pos: k, ...extra }; G.zombis[z.id] = z; return z;
}
export function tipoZombiAleatorio(G) { const total = Object.values(MAZO_ZOMBIS).reduce((a, b) => a + b, 0); let x = entero(G, total); for (const [t, n] of Object.entries(MAZO_ZOMBIS)) { if (x < n) return t; x -= n; } return 'caminante'; }
export function revelarLoseta(G, centro) {
  const celdas = Object.values(G.casillas).filter(c => c.loseta === centro && !c.revelada); if (!celdas.length) return [];
  celdas.forEach(c => c.revelada = true);
  const entrada = celdas.find(c => c.tipo === 'entrada');
  const libres = celdas.filter(c => !jugadoresEn(G, c.k).length && c.tipo !== 'refugio');
  const puestos = [];
  if (entrada) { puestos.push(ponerZombi(G, 'caminante', G.escalado.horda, entrada.k)); log(G, `Una horda de ${G.escalado.horda} espera en la entrada.`, 'peligro'); }
  else { const x = rnd(G); let n = x < .3 ? 0 : x < .75 ? 1 : 2; n += G.escalado.extraLoseta; for (let i = 0; i < n && libres.length; i++) { const c = elegir(G, libres); puestos.push(ponerZombi(G, tipoZombiAleatorio(G), 1, c.k)); } if (n) log(G, `Loseta revelada: ${n} zombi${n > 1 ? 's' : ''}.`, 'peligro'); else log(G, 'Loseta revelada: despejada.'); }
  return puestos;
}

/* ---------- ronda y turno ---------- */
export function iniciarRonda(G) {
  G.orden = vivos(G).sort((a, b) => b.iniciativa - a.iniciativa || a.id - b.id).map(j => j.id);
  G.turnoIdx = 0; G.banderas = { ordenUsada: false, triajeUsado: false }; G.fase = 'turno';
  if (!G.orden.length) return faseZombis(G);
  iniciarTurno(G);
}
export function iniciarTurno(G) {
  const j = jugador(G, G.orden[G.turnoIdx]); const p = personaje(j);
  if (j.estado === 'caido') { j.estado = 'vivo'; j.vida = 1; G.turno = { jugadorId: j.id, dados: [], pasos: 0, acciones: 0, levantandose: true, movido: false, mordiscoDado: false, rastreo: false, movidoVehiculo: false, instintoUsado: false }; log(G, `${j.nombre} se levanta con 1 de vida y pierde el turno.`, 'peligro'); return; }
  let n = p.dados; if (peso(G, j) > capacidad(G, j)) { n = Math.max(1, n - 1); log(G, `${j.nombre} va sobrecargado: un dado menos.`); }
  const dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  G.turno = { jugadorId: j.id, dados, pasos: 0, acciones: PARAMS.accionesPorRonda, movido: false, mordiscoDado: false, rastreo: j.personajeId === 'tomas', movidoVehiculo: false, instintoUsado: false, disparo: false };
  aplicarDados(G, j, dados);
}
function aplicarDados(G, j, dados) {
  let pasos = 0, ruido = 0, mord = false;
  for (const d of dados) { if (d === 'paso') pasos++; else if (d === 'doble') pasos += 2; else if (d === 'ruido') ruido++; else mord = true; }
  if (j.personajeId === 'tomas') pasos = Math.max(0, pasos - 1);
  G.turno.pasos = pasos; G.turno.mordiscoDado = mord; if (ruido) subirRuido(G, ruido, `${j.nombre} hace ruido al moverse`);
}
export function subirRuido(G, n, motivo) { const antes = G.ruido; G.ruido = Math.max(0, Math.min(PARAMS.ruidoTope, G.ruido + n)); if (G.ruido !== antes) log(G, `Ruido ${antes} → ${G.ruido} (${motivo}).`, G.ruido >= 6 ? 'peligro' : 'info'); }
export function turnoActual(G) { return G.turno ? jugador(G, G.turno.jugadorId) : null; }

export function repetirDado(G, idx, quien) { // Orden de Elías sobre el jugador actual
  const j = turnoActual(G); const e = G.jugadores.find(x => x.personajeId === 'elias' && x.estado === 'vivo');
  if (!e || G.banderas.ordenUsada || j.id === e.id || j.personajeId === 'elias' || dist(e.pos, j.pos) > 3) return { ok: false, motivo: 'Orden no disponible' };
  const viejo = G.turno.dados[idx]; if (!viejo) return { ok: false }; const nuevo = tirarDado(G); G.turno.dados[idx] = nuevo; G.banderas.ordenUsada = true;
  const v = c => c === 'paso' ? 1 : c === 'doble' ? 2 : 0; G.turno.pasos = Math.max(0, G.turno.pasos - v(viejo) + v(nuevo));
  if (nuevo === 'ruido') subirRuido(G, 1, 'la repetición sale ruido'); G.turno.mordiscoDado = G.turno.dados.includes('mordisco');
  log(G, `Orden de ${e.nombre}: ${j.nombre} repite un dado (${viejo} → ${nuevo}).`); return { ok: true, nuevo };
}

/* ---------- movimiento ---------- */
export function costeMovimiento(G, j, dest) {
  const c = G.casillas[dest]; if (!c) return { ok: false, motivo: 'Fuera del mapa' };
  if (dist(j.pos, dest) !== 1) return { ok: false, motivo: 'Solo casillas adyacentes' };
  if (c.fuego) return { ok: false, motivo: 'La casilla arde' };
  const zs = zombisEn(G, dest);
  if (j.vehiculo) {
    const v = OBJETOS[j.vehiculo.id]; if (!['calle', 'refugio', 'entrada', 'helipuerto', 'gasolinera'].includes(c.tipo)) return { ok: false, motivo: 'El vehículo solo va por calle' };
    if ((j.vehiculo.gas || 0) < 1 / v.porGas) return { ok: false, motivo: 'Sin gasolina' };
    if (zs.length && !v.atropella) return { ok: false, motivo: 'Hay zombis' };
    return { ok: true, coste: 0, gas: 1 / v.porGas, atropello: zs.length > 0 };
  }
  if (zs.length) { if (!(j.camuflaje > 0 && zs.every(z => z.tipo === 'caminante'))) return { ok: false, motivo: 'Hay zombis: necesitas camuflaje' }; }
  let coste = c.tipo === 'bosque' ? (j.personajeId === 'kenji' ? 1 : 2) : 1;
  if (coste > G.turno.pasos) return { ok: false, motivo: 'No te quedan pasos' };
  if (j.personajeId === 'kenji') { const hordas = Object.values(G.zombis).filter(esHorda).map(z => z.pos); if (hordas.length && distanciaMin(G, j.pos, hordas) <= 2 && distanciaMin(G, dest, hordas) < distanciaMin(G, j.pos, hordas)) return { ok: false, motivo: 'Kenji no se acerca a la horda' }; }
  if (j.panico >= 3 && dist(dest, '0,0') >= dist(j.pos, '0,0')) return { ok: false, motivo: 'Con pánico 3 solo puede ir hacia el refugio' };
  return { ok: true, coste };
}
export function destinosPosibles(G) { const j = turnoActual(G); if (!j || G.turno.levantandose) return []; return vecinos(j.pos).filter(k => costeMovimiento(G, j, k).ok); }
export function mover(G, dest) {
  const j = turnoActual(G); const r = costeMovimiento(G, j, dest); if (!r.ok) return r;
  if (j.vehiculo) { j.vehiculo.gas = Math.round((j.vehiculo.gas - r.gas) * 100) / 100; G.turno.movidoVehiculo = true; } else G.turno.pasos -= r.coste;
  j.pos = dest; G.turno.movido = true; const c = G.casillas[dest];
  if (!c.revelada) revelarLoseta(G, c.loseta);
  if (c.objetos.length) { c.objetos.forEach(id => { j.mano.push(carta(G, id)); log(G, `${j.nombre} recoge ${OBJETOS[id].nombre}.`); }); c.objetos = []; }
  if (r.atropello) { const d = tirarDado(G); const zs = zombisEn(G, dest); if (d === 'paso' || d === 'doble') { let quitar = 3; for (const z of zs) { if (z.tipo !== 'caminante') continue; const q = Math.min(quitar, z.n); z.n -= q; quitar -= q; if (z.n <= 0) delete G.zombis[z.id]; } log(G, `${j.nombre} atropella caminantes (${d}).`, 'combate'); } else log(G, `${j.nombre} intenta atropellar y falla (${d}).`, 'combate'); }
  return { ok: true };
}
export function rastrear(G, k) { const j = turnoActual(G); if (!G.turno.rastreo || !G.turno.movido) return { ok: false, motivo: 'Rastreo no disponible' }; const c = G.casillas[k]; if (!c || c.revelada || dist(j.pos, k) > 1 && !vecinos(j.pos).some(v => G.casillas[v] && G.casillas[v].loseta === c.loseta)) return { ok: false, motivo: 'Elige una loseta oculta adyacente' }; G.turno.rastreo = false; revelarLoseta(G, c.loseta); log(G, `${j.nombre} rastrea la zona.`); return { ok: true }; }

/* ---------- acciones ---------- */
function gastaAccion(G) { if (G.turno.acciones <= 0) return false; G.turno.acciones--; return true; }
export function saquear(G) {
  const j = turnoActual(G); const c = G.casillas[j.pos];
  if (!['edificio', 'gasolinera', 'farmacia', 'taller'].includes(c.tipo)) return { ok: false, motivo: 'Aquí no hay nada que saquear' };
  if (c.saqueos >= PARAMS.saqueosPorCasilla) return { ok: false, motivo: 'Ya está vacío' };
  if (zombisEn(G, j.pos).length) return { ok: false, motivo: 'Hay zombis en la casilla' };
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  c.saqueos++; if (c.saqueos === 2) subirRuido(G, 1, 'segundo saqueo');
  const n = j.personajeId === 'ruy' ? 2 : 1; const obtenidos = [];
  for (let i = 0; i < n; i++) {
    let id; if (c.tipo === 'gasolinera') { id = 'bidon'; if (i === 0) subirRuido(G, 1, 'saquear la gasolinera'); }
    else if (c.tipo === 'farmacia') id = c.saqueos % 2 ? 'antibioticos' : 'botiquin';
    else if (c.tipo === 'taller') id = rnd(G) < .3 ? 'receta' : elegir(G, ['cinta', 'clavos', 'tubo', 'pilas']);
    else id = robarObjeto(G);
    if (id === 'receta') { const desconocidas = Object.keys(RECETAS).filter(r => !G.recetasConocidas.includes(r)); if (desconocidas.length) { const r = elegir(G, desconocidas); G.recetasConocidas.push(r); log(G, `${j.nombre} encuentra un recetario: ${RECETAS[r].nombre}.`, 'bien'); obtenidos.push('Recetario: ' + RECETAS[r].nombre); continue; } id = 'cinta'; }
    j.mano.push(carta(G, id)); obtenidos.push(OBJETOS[id].nombre);
  }
  log(G, `${j.nombre} saquea: ${obtenidos.join(', ')}.`, 'bien'); return { ok: true, obtenidos };
}
export function robarObjeto(G) { if (!G.mazoObjetos.length) { G.mazoObjetos = barajar(G, G.descartes); G.descartes = []; if (!G.mazoObjetos.length) return 'cinta'; } return G.mazoObjetos.pop(); }
export function descartar(G, j, uid) { const i = j.mano.findIndex(c => c.uid === uid); if (i < 0) return null; const [c] = j.mano.splice(i, 1); if (OBJETOS[c.id].tipo !== 'vehiculo') G.descartes.push(c.id === 'moto_dep' ? 'moto' : c.id); return c; }

export function armasDe(G, j) { return j.mano.filter(c => OBJETOS[c.id].tipo === 'arma'); }
export function objetivosAtaque(G) {
  const j = turnoActual(G); const out = [];
  for (const z of Object.values(G.zombis)) {
    const d = dist(j.pos, z.pos); if (d === 0) { out.push({ z, d }); continue; }
    const alcance = G.niebla ? 1 : PARAMS.distanciaDisparo; if (d > alcance) continue;
    if (!armasDe(G, j).some(c => OBJETOS[c.id].distancia)) continue;
    if (linea(j.pos, z.pos).some(k => { const c = G.casillas[k]; return !c || c.tipo === 'edificio' || c.tipo === 'bosque'; })) continue;
    out.push({ z, d });
  }
  return out;
}
export function atacar(G, zombiId, armaUid) {
  const j = turnoActual(G); const z = G.zombis[zombiId]; if (!z) return { ok: false, motivo: 'Ese zombi ya no está' };
  const arma = armaUid ? j.mano.find(c => c.uid === armaUid) : null; const A = arma ? OBJETOS[arma.id] : { dados: 1 };
  const d = dist(j.pos, z.pos); const tipo = ZOMBIS[z.tipo];
  if (d > 0 && !A.distancia) return { ok: false, motivo: 'Necesitas un arma a distancia' };
  if (d > 0 && tipo.inmuneDistancia) return { ok: false, motivo: 'El acorazado es inmune a disparos' };
  if (z.tipo === 'jugador' && j.personajeId === 'naima') return { ok: false, motivo: 'Naima no ataca a antiguos compañeros' };
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  let n = A.dados || 1; if (j.personajeId === 'elias' && A.fuego) n = 3;
  const dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  let imp = A.extra || 0, ruido = 0, mord = false; for (const c of dados) { if (c === 'paso') imp++; else if (c === 'doble') imp += 2; else if (c === 'ruido') { imp++; ruido++; } else mord = true; }
  const melee = d === 0; const silencioso = j.personajeId === 'sunja' && melee;
  if (ruido && !silencioso) subirRuido(G, ruido, 'el combate');
  if (A.fuego) { const sil = j.mano.find(c => c.id === 'silenciador'); if (sil) { sil.usos--; if (sil.usos <= 0) descartar(G, j, sil.uid); log(G, 'Disparo silenciado.'); } else subirRuido(G, A.ruido, 'el disparo'); if (j.camuflaje) { j.camuflaje = 0; log(G, 'El disparo arruina el camuflaje.'); } G.turno.disparo = true; }
  let muertos = 0; const antes = z.n;
  if (A.mataCorredor && z.tipo === 'corredor') muertos = 1;
  else { let coste = tipo.fuerza; let max = z.n; if (esHorda(z)) { coste = silencioso ? 2 : 3; if (silencioso) max = 2; } muertos = Math.min(max, Math.floor(imp / coste)); }
  z.n -= muertos; const texto = `${j.nombre} ataca ${tipo.nombre}${antes > 1 ? ' ×' + antes : ''} con ${arma ? A.nombre : 'las manos'}: [${dados.join(', ')}] ${imp} impactos, ${muertos} eliminado${muertos === 1 ? '' : 's'}.`;
  log(G, texto, 'combate');
  if (z.tipo === 'nino' && muertos) { j.panico = Math.min(3, j.panico + 1); log(G, `${j.nombre} gana 1 de pánico.`, 'peligro'); }
  if (z.n <= 0) { if (z.tipo === 'jugador') { const v = jugador(G, z.jugadorId); v.estado = 'muerto'; log(G, `${v.nombre} descansa por fin.`, 'peligro'); } delete G.zombis[z.id]; if (melee && !j.mano.some(c => c.id === 'visceras')) j.mano.push(carta(G, 'visceras')); }
  if (arma && arma.durab != null) { arma.durab--; if (arma.durab <= 0) { descartar(G, j, arma.uid); log(G, `${A.nombre} se rompe.`, 'peligro'); } }
  let mordido = false; if (z.n > 0 && mord && melee) { mordido = true; herir(G, j, 1, `${tipo.nombre} muerde a ${j.nombre} en el combate`); }
  comprobarFin(G); return { ok: true, dados, impactos: imp, muertos, mordido };
}
export function herir(G, j, n, motivo) {
  j.vida -= n; log(G, `${motivo}: ${n} herida${n > 1 ? 's' : ''} (vida ${Math.max(0, j.vida)}).`, 'peligro'); aplicarMordisco(G, j);
  if (j.vida <= 0) { j.vida = 0; j.estado = 'caido'; log(G, `${j.nombre} cae al suelo.`, 'peligro'); }
}
export function aplicarMordisco(G, j) {
  if (j.mordido) return; const regla = mision(G).contagio;
  if (regla === 'cuenta_atras') { j.mordido = { turnos: PARAMS.turnosContagio }; aviso(G, 'Mordisco', `${j.nombre} está infectado. ${PARAMS.turnosContagio} turnos para curarlo.`, 'peligro'); }
  else if (regla === 'sin_contagio') { j.mordido = { sc: true, ronda: G.ronda }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Si no se anula con Tratamiento esta misma ronda, la misión fracasa.`, 'peligro'); }
  else { j.mordido = { hc: true }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Al terminar la ronda se convertirá.`, 'peligro'); }
}
export function craftear(G, recetaId) {
  const j = turnoActual(G); const R = RECETAS[recetaId]; if (!R || !G.recetasConocidas.includes(recetaId)) return { ok: false, motivo: 'Receta desconocida' };
  const usados = []; const mano = [...j.mano];
  for (const ing of R.ing) { const i = mano.findIndex(c => c.id === ing); if (i < 0) return { ok: false, motivo: `Falta ${OBJETOS[ing].nombre}` }; usados.push(mano.splice(i, 1)[0]); }
  const gratis = G.casillas[j.pos].tipo === 'taller'; if (!gratis && !gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  usados.forEach(c => descartar(G, j, c.uid)); const res = Array.isArray(R.res) ? R.res : [R.res]; res.forEach(id => j.mano.push(carta(G, id)));
  log(G, `${j.nombre} craftea ${R.nombre}${gratis ? ' en el taller' : ''}.`, 'bien'); return { ok: true };
}
export function objetivosCura(G) { const j = turnoActual(G); if (j.personajeId === 'beatriz') return [j]; return vivos(G).filter(x => dist(x.pos, j.pos) <= 1 && x.personajeId !== 'beatriz' || x.id === j.id); }
export function curar(G, uid, destId) {
  const j = turnoActual(G); const d = jugador(G, destId); const c = j.mano.find(x => x.uid === uid); if (!c) return { ok: false };
  if (!objetivosCura(G).includes(d)) return { ok: false, motivo: 'No puedes curar a ese jugador' }; const O = OBJETOS[c.id];
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, c.uid);
  if (O.cura) { d.vida = Math.min(d.vidaMax, d.vida + O.cura); if (d.estado === 'caido') d.estado = 'vivo'; }
  if (O.contagio && d.mordido) { const regla = mision(G).contagio; if (regla === 'cuenta_atras') { const extra = c.id === 'tratamiento' && j.personajeId === 'naima' ? 3 : O.contagio; d.mordido.turnos += extra; log(G, `${d.nombre} gana ${extra} turnos frente al contagio.`, 'bien'); } else if (regla === 'sin_contagio' && c.id === 'tratamiento' && d.mordido.ronda === G.ronda) { d.mordido = null; d.curadoMordisco = true; log(G, `${d.nombre} se salva del contagio.`, 'bien'); } else log(G, 'Sin efecto sobre el contagio en esta misión.'); }
  log(G, `${j.nombre} usa ${O.nombre} en ${d.id === j.id ? 'sí mismo' : d.nombre}.`, 'bien'); return { ok: true };
}
export function triaje(G, destId) { const j = turnoActual(G); const d = jugador(G, destId); if (j.personajeId !== 'naima' || G.banderas.triajeUsado || dist(j.pos, d.pos) > 1 || ['elias', 'beatriz'].includes(d.personajeId) || d.id === j.id) return { ok: false, motivo: 'Triaje no disponible' }; G.banderas.triajeUsado = true; d.vida = Math.min(d.vidaMax, d.vida + 1); if (d.estado === 'caido') d.estado = 'vivo'; log(G, `Triaje: ${d.nombre} recupera 1 de vida.`, 'bien'); return { ok: true }; }
export function levantar(G, destId) { const j = turnoActual(G); const d = jugador(G, destId); if (d.estado !== 'caido' || dist(j.pos, d.pos) > 1) return { ok: false }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; d.estado = 'vivo'; d.vida = 1; log(G, `${j.nombre} levanta a ${d.nombre}.`, 'bien'); return { ok: true }; }
export function dar(G, destId, uids) {
  const j = turnoActual(G); const d = jugador(G, destId); if (dist(j.pos, d.pos) > 1 || d.estado !== 'vivo') return { ok: false, motivo: 'Debe estar adyacente' };
  if (d.personajeId === 'sunja') return { ok: false, motivo: 'Sunja no acepta cartas' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  for (const uid of uids) { const i = j.mano.findIndex(c => c.uid === uid); if (i >= 0) d.mano.push(j.mano.splice(i, 1)[0]); }
  log(G, `${j.nombre} da ${uids.length} carta${uids.length > 1 ? 's' : ''} a ${d.nombre}.`); return { ok: true };
}
export function usar(G, uid, destino) {
  const j = turnoActual(G); const c = j.mano.find(x => x.uid === uid); if (!c) return { ok: false };
  if (c.id === 'molotov') { if (!destino || dist(j.pos, destino) !== 1 || jugadoresEn(G, destino).length) return { ok: false, motivo: 'Elige una casilla adyacente sin supervivientes' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); let n = 0; for (const z of zombisEn(G, destino)) { n += z.n; if (z.tipo === 'jugador') { const v = jugador(G, z.jugadorId); v.estado = 'muerto'; } delete G.zombis[z.id]; } G.casillas[destino].fuego = 2; log(G, `${j.nombre} lanza un molotov: ${n} zombis arden. La casilla arde 2 rondas.`, 'combate'); const hordas = Object.values(G.zombis).filter(esHorda); if (hordas.length) { const h = hordas.sort((a, b) => dist(a.pos, destino) - dist(b.pos, destino))[0]; moverZombiHacia(G, h, destino, 1); log(G, 'La luz atrae a la horda más cercana.', 'peligro'); } return { ok: true }; }
  if (c.id === 'senuelo') { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); G.casillas[j.pos].senuelo = 2; subirRuido(G, 2, 'el señuelo'); log(G, `${j.nombre} deja un señuelo sonoro.`); return { ok: true }; }
  if (c.id === 'camuflaje') { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); j.camuflaje = 2; log(G, `${j.nombre} se cubre de vísceras. Los caminantes lo ignoran 2 turnos.`); return { ok: true }; }
  if (c.id === 'bidon' && j.vehiculo) { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); const V = OBJETOS[j.vehiculo.id]; j.vehiculo.gas = Math.min(V.gasMax, (j.vehiculo.gas || 0) + 3); log(G, `${j.nombre} reposta (${j.vehiculo.gas}/${V.gasMax}).`); return { ok: true }; }
  return { ok: false, motivo: 'Ese objeto no se usa así' };
}
export function vehiculo(G, uid) {
  const j = turnoActual(G);
  if (j.vehiculo) { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.mano.push(j.vehiculo); log(G, `${j.nombre} baja del vehículo.`); j.vehiculo = null; return { ok: true }; }
  const c = j.mano.find(x => x.uid === uid && OBJETOS[x.id].porGas); if (!c) return { ok: false, motivo: 'Necesitas un vehículo con depósito' };
  if (j.personajeId === 'ruy') return { ok: false, motivo: 'Ruy no conduce' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  j.mano.splice(j.mano.indexOf(c), 1); j.vehiculo = c; log(G, `${j.nombre} sube a ${OBJETOS[c.id].nombre}.`); return { ok: true };
}
export function descansar(G) { const j = turnoActual(G); if (Object.values(G.zombis).some(z => dist(z.pos, j.pos) <= 2)) return { ok: false, motivo: 'Hay zombis demasiado cerca' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.vida = Math.min(j.vidaMax, j.vida + 1); j.panico = Math.max(0, j.panico - 1); log(G, `${j.nombre} descansa.`); return { ok: true }; }

export function terminarTurno(G) {
  const j = turnoActual(G); const T = G.turno;
  if (!T.levantandose) {
    if (T.mordiscoDado) { const z = vecinos(j.pos).flatMap(k => zombisEn(G, k))[0]; if (z && j.estado === 'vivo') { log(G, `La cara de mordisco: un ${ZOMBIS[z.tipo].nombre} se lanza sobre ${j.nombre}.`, 'peligro'); zombiAtaca(G, z, j); } }
    if (j.estado === 'vivo' && vecinos(j.pos).concat(j.pos).some(k => zombisEn(G, k).some(esHorda))) { j.panico = Math.min(3, j.panico + 1); log(G, `${j.nombre} gana 1 de pánico por la horda cercana.`, 'peligro'); }
    if (T.movidoVehiculo && j.vehiculo) subirRuido(G, OBJETOS[j.vehiculo.id].ruido, 'el motor');
    if (j.pos === '0,0') { for (const id of ['comida', 'antibioticos']) { const cs = j.mano.filter(c => c.id === id); if (cs.length) { cs.forEach(c => descartarSinMazo(j, c.uid)); G.almacen[id] += cs.length; log(G, `${j.nombre} deja ${cs.length} ${OBJETOS[id].nombre.toLowerCase()} en el refugio (${G.almacen[id]}).`, 'bien'); } } }
  }
  G.turnoIdx++; if (G.fin) return; if (G.turnoIdx >= G.orden.length) faseZombis(G); else iniciarTurno(G);
}
function descartarSinMazo(j, uid) { const i = j.mano.findIndex(c => c.uid === uid); if (i >= 0) j.mano.splice(i, 1); }

/* ---------- zombis: movimiento y ataque ---------- */
function distancias(G, desde, bloqueaEdificio = false) { // BFS desde una lista de casillas
  const D = {}; const cola = []; for (const k of desde) { D[k] = 0; cola.push(k); }
  while (cola.length) { const k = cola.shift(); for (const v of vecinos(k)) { const c = G.casillas[v]; if (!c || c.fuego || D[v] != null) continue; D[v] = D[k] + 1; cola.push(v); } }
  return D;
}
export function moverZombiHacia(G, z, objetivo, pasos) {
  const D = distancias(G, [objetivo]); let movido = 0;
  for (let i = 0; i < pasos; i++) {
    if (z.pos === objetivo) break; const opciones = vecinos(z.pos).filter(v => D[v] != null && D[v] < (D[z.pos] ?? 1e9)); if (!opciones.length) break;
    const dest = opciones[entero(G, opciones.length)]; z.pos = dest; movido++;
    const c = G.casillas[dest]; const js = jugadoresEn(G, dest);
    if (js.length) { for (const j of js) { if (j.estado === 'caido') { if (esHorda(z)) morirOConvertir(G, j, 'la horda alcanza a ' + j.nombre + ' en el suelo'); } else if (!(j.camuflaje > 0 && z.tipo === 'caminante')) zombiAtaca(G, z, j); } break; }
    if (c.tipo === 'edificio' || c.tipo === 'bosque') break;
  }
  return movido;
}
export function objetivoZombi(G, z) {
  const senuelos = Object.values(G.casillas).filter(c => c.senuelo > 0).map(c => c.k).filter(k => dist(k, z.pos) <= 3);
  if (senuelos.length) return senuelos.sort((a, b) => dist(a, z.pos) - dist(b, z.pos))[0];
  const cand = vivos(G).filter(j => !(j.camuflaje > 0 && z.tipo === 'caminante')).filter(j => !(j.personajeId === 'ceniza'));
  if (!cand.length) return null; cand.sort((a, b) => dist(a.pos, z.pos) - dist(b.pos, z.pos) || a.id - b.id); return cand[0].pos;
}
export function faseZombis(G, extra = 0) {
  G.fase = 'zombis'; G.turno = null;
  for (const z of Object.values(G.zombis)) { if (!G.zombis[z.id] || z.tipo === 'jugador') continue; const obj = objetivoZombi(G, z); if (!obj) continue; moverZombiHacia(G, z, obj, ZOMBIS[z.tipo].mov + extra); }
  fusionar(G); comprobarFin(G); if (G.fin) return;
  const zjs = G.jugadores.filter(j => j.estado === 'zombi' && Object.values(G.zombis).some(z => z.tipo === 'jugador' && z.jugadorId === j.id));
  if (zjs.length) { G.fase = 'zombi'; G.zturno = { jugadorId: zjs[0].id, acciones: 2, pendientes: zjs.slice(1).map(j => j.id), pasos: G.nivelZombi >= 1 ? 2 : 1 }; }
  else faseNoche(G);
}
function fusionar(G) { const porPos = {}; for (const z of Object.values(G.zombis)) { if (z.tipo === 'jugador') continue; const k = z.pos + '|' + z.tipo; if (porPos[k]) { porPos[k].n += z.n; delete G.zombis[z.id]; } else porPos[k] = z; } }
export function zombiAtaca(G, z, j) {
  if (j.estado !== 'vivo') return; const n = j.personajeId === 'beatriz' ? 2 : 1; let dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  const evalua = ds => ds.some(d => d === 'paso' || d === 'doble') ? 'esquiva' : ds.includes('ruido') ? 'ruido' : 'mordisco';
  let res = evalua(dados);
  if (res === 'mordisco' && j.personajeId === 'beatriz' && G.turno && !G.turno.instintoUsado && G.turno.jugadorId === j.id) { G.turno.instintoUsado = true; dados = [tirarDado(G), tirarDado(G)]; res = evalua(dados); log(G, 'Instinto: Beatriz repite la defensa.'); }
  const nombre = z.tipo === 'jugador' ? jugador(G, z.jugadorId).nombre + ' (zombi)' : ZOMBIS[z.tipo].nombre + (z.n > 1 ? ' ×' + z.n : '');
  if (res === 'esquiva') log(G, `${j.nombre} esquiva a ${nombre} [${dados.join(', ')}].`, 'combate');
  else if (res === 'ruido') { log(G, `${j.nombre} esquiva a ${nombre} haciendo ruido [${dados.join(', ')}].`, 'combate'); subirRuido(G, 1, 'la defensa'); }
  else { const heridas = esHorda(z) || (z.tipo === 'jugador' && G.nivelZombi >= 2) ? 2 : 1; herir(G, j, heridas, `${nombre} muerde a ${j.nombre} [${dados.join(', ')}]`); }
}
export function morirOConvertir(G, j, motivo) {
  if (mision(G).contagio === 'sin_contagio') { j.estado = 'muerto'; aviso(G, 'Muerte', `${j.nombre} muere: ${motivo}.`, 'peligro'); }
  else convertir(G, j, motivo);
  comprobarFin(G);
}
export function convertir(G, j, motivo) {
  if (j.estado === 'zombi' || j.estado === 'muerto') return;
  j.estado = 'zombi'; j.mordido = null; j.mano.forEach(c => { if (OBJETOS[c.id].tipo !== 'vehiculo') G.descartes.push(c.id); }); j.mano = []; j.vehiculo = null;
  const habia = G.jugadores.some(x => x.estado === 'zombi' && x.id !== j.id); if (habia) G.nivelZombi = Math.min(3, G.nivelZombi + 1);
  ponerZombi(G, 'jugador', 1, j.pos, { jugadorId: j.id });
  aviso(G, 'Conversión', `${j.nombre} se ha convertido (${motivo}). Ahora juega como zombi${habia ? '. El bando zombi evoluciona a nivel ' + G.nivelZombi : ''}.`, 'peligro');
}

/* ---------- turno del jugador zombi ---------- */
export function fichaZombi(G, jugadorId) { return Object.values(G.zombis).find(z => z.tipo === 'jugador' && z.jugadorId === jugadorId); }
function zGasta(G) { if (G.zturno.acciones <= 0) return false; G.zturno.acciones--; return true; }
export function zMoverHorda(G, zombiId, dest) { const z = G.zombis[zombiId]; if (!z || z.tipo === 'jugador' || dist(z.pos, dest) !== 1 || !G.casillas[dest] || G.casillas[dest].fuego) return { ok: false, motivo: 'Movimiento no válido' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; moverZombiHacia(G, z, dest, 1); fusionar(G); log(G, `El jugador zombi empuja a ${ZOMBIS[z.tipo].nombre}${z.n > 1 ? ' ×' + z.n : ''}.`, 'peligro'); comprobarFin(G); return { ok: true }; }
export function zMover(G, dest) { const z = fichaZombi(G, G.zturno.jugadorId); if (!z || dist(z.pos, dest) !== 1 || !G.casillas[dest] || G.casillas[dest].fuego) return { ok: false, motivo: 'Movimiento no válido' }; if (G.zturno.pasos <= 0) { if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; G.zturno.pasos = G.nivelZombi >= 1 ? 2 : 1; } G.zturno.pasos--; z.pos = dest; if (!G.casillas[dest].revelada) revelarLoseta(G, G.casillas[dest].loseta); return { ok: true }; }
export function zAtacar(G, destId) { const z = fichaZombi(G, G.zturno.jugadorId); const j = jugador(G, destId); if (!z || j.pos !== z.pos || j.estado === 'zombi' || j.estado === 'muerto') return { ok: false, motivo: 'No hay nadie a tu alcance' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; if (j.estado === 'caido') morirOConvertir(G, j, 'el jugador zombi lo alcanza en el suelo'); else zombiAtaca(G, z, j); comprobarFin(G); return { ok: true }; }
export function zOler(G, destId) { const z = fichaZombi(G, G.zturno.jugadorId); const j = jugador(G, destId); if (!z || dist(z.pos, j.pos) > 3) return { ok: false, motivo: 'Demasiado lejos' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; log(G, `El jugador zombi huele a ${j.nombre}.`); return { ok: true, mano: j.mano.map(c => OBJETOS[c.id].nombre) }; }
export function zTerminar(G) { const p = G.zturno.pendientes; if (p.length) { G.zturno = { jugadorId: p[0], acciones: 2, pendientes: p.slice(1), pasos: G.nivelZombi >= 1 ? 2 : 1 }; return; } G.zturno = null; faseNoche(G); }

/* ---------- noche ---------- */
export function faseNoche(G) {
  G.fase = 'noche'; const M = mision(G);
  subirRuido(G, PARAMS.ruidoPorNoche, 'cae la noche');
  if (G.ruido >= PARAMS.ruidoTope) { cartaHorda(G); G.ruido = PARAMS.ruidoTrasHorda; log(G, `El ruido baja a ${G.ruido}.`); }
  if (M.hordaDesde && G.ronda >= M.hordaDesde) cartaHorda(G);
  if (G.ronda % 2 === 0) evento(G);
  for (const j of vivos(G)) if (j.pos === '0,0' && j.estado === 'vivo' && j.vida < j.vidaMax) { j.vida++; log(G, `${j.nombre} descansa en el refugio (+1 vida).`, 'bien'); }
  for (const j of vivos(G)) { if (!j.mordido) continue; if (j.mordido.turnos != null) { j.mordido.turnos--; if (j.mordido.turnos <= 0) convertir(G, j, 'el contagio completa su curso'); else log(G, `${j.nombre}: ${j.mordido.turnos} turnos para la cura.`, 'peligro'); } else if (j.mordido.sc) { G.fin = { resultado: 'derrota', motivo: `${j.nombre} no pudo anular el contagio. La misión exigía cero contagios.` }; } else if (j.mordido.hc) convertir(G, j, 'modo hardcore'); }
  for (const c of Object.values(G.casillas)) { if (c.fuego) c.fuego--; if (c.senuelo) c.senuelo--; }
  for (const j of G.jugadores) if (j.camuflaje) j.camuflaje--;
  G.niebla = !!G.banderas.nieblaProxima; G.banderas.nieblaProxima = false;
  comprobarFin(G, true); if (G.fin) return;
  G.ronda++; iniciarRonda(G);
}
export function cartaHorda(G) {
  if (!G.mazoHordas.length) G.mazoHordas = barajar(G, HORDAS.map((h, i) => i)); const H = HORDAS[G.mazoHordas.pop()];
  let donde = null; const posJ = vivos(G).map(j => j.pos);
  if (H.donde === 'ruido') { const sen = Object.values(G.casillas).filter(c => c.senuelo > 0).map(c => c.k); const ref = sen.length ? sen : posJ; donde = [...G.entradas].sort((a, b) => distanciaMin(G, a, ref) - distanciaMin(G, b, ref))[0]; }
  else if (H.donde === 'lejana') donde = [...G.entradas].sort((a, b) => distanciaMin(G, b, posJ) - distanciaMin(G, a, posJ))[0];
  else if (H.donde === 'aleatoria') donde = elegir(G, G.entradas);
  if (donde) { const c = G.casillas[donde]; if (!c.revelada) Object.values(G.casillas).filter(x => x.loseta === c.loseta).forEach(x => x.revelada = true); }
  if (H.que === 'horda') ponerZombi(G, 'caminante', G.escalado.horda, donde);
  else if (H.que === 'corredores') ponerZombi(G, 'corredor', 3, donde);
  else if (H.que === 'acorazado') { ponerZombi(G, 'acorazado', 1, donde); ponerZombi(G, 'caminante', 3, donde); }
  else if (H.que === 'estampida') { for (const z of Object.values(G.zombis)) { if (z.tipo === 'jugador') continue; const o = objetivoZombi(G, z); if (o) moverZombiHacia(G, z, o, 1); } fusionar(G); }
  else if (H.que === 'edificios') { for (const c of Object.values(G.casillas)) if (c.revelada && c.tipo === 'edificio' && !jugadoresEn(G, c.k).length) ponerZombi(G, 'caminante', 1, c.k); }
  aviso(G, 'Carta de horda', H.texto, 'peligro');
}
export function evento(G) {
  if (!G.mazoEventos.length) G.mazoEventos = barajar(G, EVENTOS.map((e, i) => i)); const E = EVENTOS[G.mazoEventos.pop()];
  switch (E.id) {
    case 'lluvia': subirRuido(G, -1, 'la lluvia'); G.jugadores.forEach(j => j.camuflaje = 0); break;
    case 'silencio': subirRuido(G, -1, 'el silencio'); break;
    case 'motor': { const calles = Object.values(G.casillas).filter(c => c.revelada && c.tipo === 'calle' && !zombisEn(G, c.k).length); if (calles.length) { elegir(G, calles).objetos.push('coche'); } break; }
    case 'estampida': for (const z of Object.values(G.zombis)) { if (z.tipo === 'jugador') continue; const o = objetivoZombi(G, z); if (o) moverZombiHacia(G, z, o, 1); } fusionar(G); break;
    case 'recuerdo': G.jugadores.forEach(j => j.panico = Math.max(0, j.panico - 1)); break;
    case 'tardio': { const c = vivos(G).filter(j => j.curadoMordisco && !j.mordido); if (c.length) { const j = elegir(G, c); j.curadoMordisco = false; aplicarMordisco(G, j); if (j.mordido && j.mordido.turnos) j.mordido.turnos = 2; } break; }
    case 'otros': { const v = vivos(G).filter(j => j.estado === 'vivo'); if (v.length) { const j = v.sort((a, b) => a.mano.length - b.mano.length)[0]; for (let i = 0; i < 2; i++) j.mano.push(carta(G, robarObjeto(G))); subirRuido(G, 2, 'los otros supervivientes'); } break; }
    case 'niebla': G.banderas.nieblaProxima = true; break;
  }
  aviso(G, 'Evento: ' + E.nombre, E.texto, 'evento');
}

/* ---------- fin de partida ---------- */
export function comprobarFin(G, finRonda = false) {
  if (G.fin) return G.fin; const M = mision(G); const N = G.jugadores.length;
  const perdidos = G.jugadores.filter(j => j.estado === 'zombi' || j.estado === 'muerto').length;
  const umbral = N >= 4 ? Math.ceil(N / 2) : N;
  if (perdidos >= umbral) { G.fin = { resultado: 'derrota', motivo: G.jugadores.some(j => j.estado === 'zombi') ? 'El bando zombi ha alcanzado a la mitad del equipo.' : 'No queda nadie en pie.' }; return G.fin; }
  if (finRonda) {
    if (M.objetivo === 'antibioticos_refugio' && G.almacen.antibioticos >= M.cantidad) G.fin = { resultado: 'victoria', motivo: `${G.almacen.antibioticos} antibióticos en el refugio.` };
    if (M.objetivo === 'comida_refugio' && G.almacen.comida >= M.cantidad) G.fin = { resultado: 'victoria', motivo: `${G.almacen.comida} raciones almacenadas. El invierno puede venir.` };
    if (M.objetivo === 'todos_helipuerto') { const v = G.jugadores.filter(j => j.estado === 'vivo' || j.estado === 'caido'); if (v.length && v.every(j => j.pos === G.helipuerto && j.estado === 'vivo')) G.fin = { resultado: 'victoria', motivo: 'Todo el equipo despega sin una gota de sangre infectada.' }; }
    if (!G.fin && G.ronda >= M.rondas) {
      if (M.objetivo === 'sobrevivir') G.fin = vivos(G).length >= Math.ceil(N / 2) ? { resultado: 'victoria', motivo: `${vivos(G).length} de ${N} responden a la última llamada.` } : { resultado: 'derrota', motivo: 'Demasiados caídos cuando llegó la última llamada.' };
      else G.fin = { resultado: 'derrota', motivo: 'Se agotaron las rondas.' };
    }
  }
  if (G.fin) { G.fase = 'fin'; aviso(G, G.fin.resultado === 'victoria' ? 'Victoria' : 'Derrota', G.fin.motivo, G.fin.resultado === 'victoria' ? 'bien' : 'peligro'); }
  return G.fin;
}
