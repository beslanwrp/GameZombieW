// Z-2099 · motor de reglas del prototipo M0 (v0.2). Sin dependencias de interfaz.
// El estado G es un objeto JSON serializable. Las funciones lo mutan y devuelven {ok, motivo, ...}.
import { PARAMS, CARAS, OBJETOS, MAZO_OBJETOS, RECETAS, ZOMBIS, MAZO_ZOMBIS, PERSONAJES, MISIONES, EVENTOS, HORDAS, escalado, cantidadObjetivo } from './datos.js';

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
export function linea(a, b) {
  const n = dist(a, b); if (n <= 1) return []; const [q1, r1] = parse(a), [q2, r2] = parse(b); const out = [];
  for (let i = 1; i < n; i++) { const t = i / n; let q = q1 + (q2 - q1) * t, r = r1 + (r2 - r1) * t, s = -q - r; let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s); const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s); if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs; out.push(key(rq, rr)); }
  return out;
}
export function centroLoseta(k) { if (mod7(k) === 0) return k; return vecinos(k).find(v => mod7(v) === 0); }
function mod7(k) { const [q, r] = parse(k); return ((q + 3 * r) % 7 + 7) % 7; }
export function pixel(k, s = 1) { const [q, r] = parse(k); return [s * Math.sqrt(3) * (q + r / 2), s * 1.5 * r]; }
export const arista = (a, b) => a < b ? a + '|' + b : b + '|' + a;
export const hayBarricada = (G, a, b) => G.barricadas.includes(arista(a, b));

/* ---------- registro ---------- */
export function log(G, texto, tipo = 'info') { G.log.push({ ronda: G.ronda, texto, tipo }); if (G.log.length > 300) G.log.shift(); }
export function aviso(G, titulo, texto, tipo = 'info') { G.avisos.push({ titulo, texto, tipo }); log(G, `${titulo}: ${texto}`, tipo); }
function stat(G, k, n = 1) { G.stats[k] = (G.stats[k] || 0) + n; }

/* ---------- reglas de contagio ---------- */
export const mision = G => MISIONES[G.misionId];
export const reglaCA = G => mision(G).contagio === 'cuenta_atras';
export const reglaSC = G => ['sin_contagio', 'ambos'].includes(mision(G).contagio);
export const reglaHC = G => ['hardcore', 'ambos'].includes(mision(G).contagio);

/* ---------- creación de partida ---------- */
export function nuevaPartida({ jugadores, misionId, semilla, opciones = {} }) {
  const G = { version: 2, opciones: { hardcoreTardio: !!opciones.hardcoreTardio }, semilla: semilla | 0 || 1, ronda: 1, fase: 'turno', log: [], avisos: [], misionId, ruido: 0, fin: null,
    jugadores: [], casillas: {}, zombis: {}, sigZombi: 1, sigCarta: 1, mazoObjetos: [], descartes: [], mazoHordas: [], mazoEventos: [],
    recetasConocidas: [...new Set([...Object.keys(RECETAS).filter(r => RECETAS[r].inicial), ...({ cuarentena: ['barricada'], convoy: ['coche_dep'], emisora: ['senuelo'] }[misionId] || [])])], almacen: { comida: 0, antibioticos: 0, bidon: 0, semillas: 0, suministro: 0, muestras: 0 }, nivelZombi: 0,
    niebla: false, banderas: {}, entradas: [], especiales: {}, losetasBorde: [], barricadas: [], enlaces: [], progreso: 0, orden: [], turnoIdx: 0, turno: null, zturno: null, decision: null, stats: {} };
  const esc = escalado(jugadores.length); G.escalado = esc; G.ruido = esc.ruidoInicial;
  const M = MISIONES[misionId]; G.cantidad = cantidadObjetivo(M, jugadores.length);
  jugadores.forEach((j, i) => {
    const p = PERSONAJES[j.personajeId];
    const jug = { id: i, nombre: j.nombre, personajeId: j.personajeId, pos: '0,0', vida: p.vida, vidaMax: p.vida, panico: 0, mordido: null, estado: 'vivo',
      mano: [], vehiculo: null, pasajeroDe: null, camuflaje: 0, curadoMordisco: false, sinDoble: false, iniciativa: p.iniciativa };
    p.inicial.forEach(id => jug.mano.push(carta(G, id)));
    G.jugadores.push(jug);
  });
  (M.kit || []).forEach((entrada, i) => { const ids = Array.isArray(entrada) ? entrada : [entrada]; let j = G.jugadores[i % G.jugadores.length]; if (ids.some(id => OBJETOS[id].fuego || OBJETOS[id].clase) && (j.personajeId === 'ruy')) j = G.jugadores[(i + 1) % G.jugadores.length]; ids.forEach(id => j.mano.push(carta(G, id))); });
  for (const [id, n] of Object.entries(MAZO_OBJETOS)) for (let i = 0; i < n; i++) G.mazoObjetos.push(id);
  barajar(G, G.mazoObjetos);
  G.mazoHordas = barajar(G, HORDAS.map((h, i) => i));
  G.mazoEventos = barajar(G, EVENTOS.map((e, i) => i).filter(i => EVENTOS[i].id !== 'semillas'));
  if (M.semillas) { const idx = EVENTOS.findIndex(e => e.id === 'semillas'); G.mazoEventos.splice(G.mazoEventos.length - 1, 0, idx); } // sale en la ronda 4
  generarTablero(G, M);
  for (let i = 0; i < PARAMS.recetasExtraInicio; i++) { const libres = Object.keys(RECETAS).filter(r => !G.recetasConocidas.includes(r)); if (libres.length) { const r = elegir(G, libres); G.recetasConocidas.push(r); log(G, `El grupo conoce además la receta: ${RECETAS[r].nombre}.`); } }
  log(G, `Misión: ${M.nombre}. ${M.texto}`, 'mision');
  iniciarRonda(G);
  return G;
}
export function carta(G, id) { const o = OBJETOS[id]; const c = { uid: G.sigCarta++, id }; if (o.durabilidad) c.durab = o.durabilidad; if (o.usos) c.usos = o.usos; if (o.gasMax) c.gas = o.gasMax; return c; }

export function generarTablero(G, M) {
  const R = PARAMS.radioMapa; const C = G.casillas;
  for (let q = -R; q <= R; q++) for (let r = Math.max(-R, -q - R); r <= Math.min(R, -q + R); r++) {
    const [px, py] = pixel(key(q, r)); if (Math.max(Math.abs(px), Math.abs(py)) > 9.2 || Math.abs(px) + Math.abs(py) > 12.6) continue;
    C[key(q, r)] = { k: key(q, r), q, r, tipo: 'calle', loseta: null, revelada: false, fuego: 0, senuelo: 0, saqueos: 0, objetos: [] };
  }
  for (const c of Object.values(C)) { c.loseta = centroLoseta(c.k); if (!C[c.loseta]) c.loseta = c.k; }
  const borde = Object.values(C).filter(c => vecinos(c.k).some(v => !C[v]));
  for (const c of Object.values(C)) { const x = rnd(G); c.tipo = x < .42 ? 'calle' : x < .78 ? 'edificio' : x < .90 ? 'bosque' : x < .93 ? 'gasolinera' : x < .96 ? 'farmacia' : 'taller'; }
  C['0,0'].tipo = 'refugio';
  const inicial = new Set(['0,0', '3,-1', '1,2', '-2,3', '-3,1', '-1,-2', '2,-3']);
  for (const c of Object.values(C)) if (inicial.has(c.loseta)) { c.revelada = true; if (c.tipo === 'gasolinera' || c.tipo === 'farmacia') c.tipo = 'edificio'; }
  const usadas = new Set();
  for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; let mejor = null, md = 1e9; for (const c of borde) { const [px, py] = pixel(c.k); const d = Math.hypot(px - 11 * Math.cos(ang), py - 11 * Math.sin(ang)); if (d < md && !usadas.has(c.k)) { md = d; mejor = c; } } mejor.tipo = 'entrada'; usadas.add(mejor.k); G.entradas.push(mejor.k); }
  G.losetasBorde = [...new Set(G.entradas.map(k => C[k].loseta))];
  const ocultas = () => Object.values(C).filter(c => !c.revelada && c.tipo !== 'entrada');
  const forzar = (tipo, n) => { let hay = Object.values(C).filter(c => c.tipo === tipo).length; const cand = barajar(G, ocultas().filter(c => ['calle', 'edificio', 'bosque'].includes(c.tipo))); while (hay < n && cand.length) { cand.pop().tipo = tipo; hay++; } };
  if (M.farmacias) { for (const c of Object.values(C)) if (c.tipo === 'farmacia') c.tipo = 'edificio'; const top = ocultas().filter(c => c.r <= -4), bot = ocultas().filter(c => c.r >= 4); elegir(G, top).tipo = 'farmacia'; elegir(G, bot).tipo = 'farmacia'; }
  forzar('farmacia', 2); forzar('gasolinera', M.objetivo === 'deposito' || M.objetivo === 'convoy' || M.objetivo === 'granja' ? 4 : 3); forzar('taller', 2);
  const revelarLosetaDe = k => { for (const c of Object.values(C)) if (c.loseta === C[k].loseta) c.revelada = true; };
  if (M.especial === 'helipuerto' || M.especial === 'torre' || M.especial === 'laboratorio') { const cand = borde.filter(c => !c.revelada && c.tipo !== 'entrada'); const h = elegir(G, cand); h.tipo = M.especial; G.especiales[M.especial] = h.k; revelarLosetaDe(h.k); }
  if (M.especial === 'generador') { const norte = Object.values(C).filter(c => !c.revelada).sort((a, b) => dist(a.k, '0,-5') - dist(b.k, '0,-5'))[0]; norte.tipo = 'generador'; G.especiales.generador = norte.k; revelarLosetaDe(norte.k); }
  if (M.zombisGarantizados) { const cand = barajar(G, Object.values(C).filter(c => !c.revelada && c.tipo !== 'entrada' && !vecinos(c.k).some(v => !C[v]))); for (const [tipo, n] of Object.entries(M.zombisGarantizados)) for (let i = 0; i < n && cand.length; i++) ponerZombi(G, tipo, 1, cand.pop().k); }
  if (M.suministros) { const cand = barajar(G, borde.filter(c => !c.revelada && c.tipo !== 'entrada')); const porLoseta = new Set(); let n = 0; for (const c of cand) { if (porLoseta.has(c.loseta)) continue; porLoseta.add(c.loseta); c.objetos.push('suministro'); c.marca = 'suministro'; if (++n >= M.suministros) break; } }
}

/* ---------- consultas ---------- */
export const jugador = (G, id) => G.jugadores[id];
export const vivos = G => G.jugadores.filter(j => j.estado === 'vivo' || j.estado === 'caido');
export const jugadoresEn = (G, k) => G.jugadores.filter(j => j.pos === k && (j.estado === 'vivo' || j.estado === 'caido'));
export const zombisEn = (G, k) => Object.values(G.zombis).filter(z => z.pos === k);
export const esHorda = z => z.tipo === 'caminante' && z.n >= 3;
export const personaje = j => PERSONAJES[j.personajeId];
export function peso(G, j) { return j.mano.reduce((s, c) => s + OBJETOS[c.id].peso, 0); }
export function capacidad(G, j) { const v = j.vehiculo || (j.pasajeroDe != null && jugador(G, j.pasajeroDe).vehiculo); return personaje(j).capacidad + (v && OBJETOS[v.id].capacidad ? OBJETOS[v.id].capacidad : 0); }
export function distanciaMin(G, k, lista) { let m = 1e9; for (const x of lista) m = Math.min(m, dist(k, x)); return m; }
export const esBorde = (G, k) => vecinos(k).some(v => !G.casillas[v]);
export function enlazados(G, a, b) { return G.enlaces.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)); }
export function pasajerosDe(G, j) { return G.jugadores.filter(p => p.pasajeroDe === j.id && (p.estado === 'vivo' || p.estado === 'caido')); }
function adultoCon(G, j) { return jugadoresEn(G, j.pos).some(x => x.id !== j.id && x.personajeId !== 'ruy' && x.estado === 'vivo'); }

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
  if (entrada) { puestos.push(ponerZombi(G, 'caminante', 2, entrada.k)); log(G, 'Loseta de borde: dos caminantes rondan la entrada de horda.', 'peligro'); }
  else { const x = rnd(G); let n = x < .3 ? 0 : x < .75 ? 1 : 2; n += G.escalado.extraLoseta; for (let i = 0; i < n && libres.length; i++) { const c = elegir(G, libres); puestos.push(ponerZombi(G, tipoZombiAleatorio(G), 1, c.k)); } if (n) log(G, `Loseta revelada: ${n} zombi${n > 1 ? 's' : ''}.`, 'peligro'); else log(G, 'Loseta revelada: despejada.'); }
  return puestos;
}

/* ---------- ronda y turno ---------- */
export function iniciarRonda(G) {
  G.orden = vivos(G).sort((a, b) => b.iniciativa - a.iniciativa || a.id - b.id).map(j => j.id);
  G.turnoIdx = 0; G.banderas = { ...G.banderas, ordenUsada: false, triajeUsado: false }; G.fase = 'turno';
  if (!G.orden.length) return faseZombis(G);
  iniciarTurno(G);
}
export function iniciarTurno(G) {
  const j = jugador(G, G.orden[G.turnoIdx]); const p = personaje(j);
  if (j.estado === 'caido') { j.estado = 'vivo'; j.vida = 1; G.turno = { jugadorId: j.id, dados: [], pasos: 0, acciones: 0, levantandose: true, movido: false, mordiscoDado: false, rastreo: false, movidoVehiculo: false, instintoUsado: false, margaGratis: false, disparo: false }; log(G, `${j.nombre} se levanta con 1 de vida y pierde el turno.`, 'peligro'); return; }
  let n = p.dados; if (peso(G, j) > capacidad(G, j)) { n = Math.max(1, n - 1); log(G, `${j.nombre} va sobrecargado: un dado menos.`); }
  const dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  G.turno = { jugadorId: j.id, dados, pasos: 0, acciones: PARAMS.accionesPorRonda, movido: false, mordiscoDado: false, rastreo: j.personajeId === 'tomas', movidoVehiculo: false, instintoUsado: false, disparo: false, margaGratis: j.personajeId === 'marga' };
  if (j.personajeId === 'lidia') { const d = tirarDado(G); if (d === 'mordisco') { G.turno.acciones--; log(G, 'Insomnio: Lidia pierde una acción.', 'peligro'); } }
  aplicarDados(G, j, dados);
}
function aplicarDados(G, j, dados) {
  let pasos = 0, ruido = 0, mord = false;
  for (const d of dados) { if (d === 'paso') pasos++; else if (d === 'doble') pasos += j.sinDoble ? 1 : 2; else if (d === 'ruido') ruido++; else mord = true; }
  if (j.personajeId === 'tomas') pasos = Math.max(0, pasos - 1);
  G.turno.pasos = pasos; G.turno.mordiscoDado = mord; if (ruido) subirRuido(G, ruido, `${j.nombre} hace ruido al moverse`);
}
export function subirRuido(G, n, motivo) { const antes = G.ruido; G.ruido = Math.max(0, Math.min(G.escalado.ruidoTope, G.ruido + n)); if (G.ruido !== antes) log(G, `Ruido ${antes} → ${G.ruido} (${motivo}).`, G.ruido >= 6 ? 'peligro' : 'info'); }
export function turnoActual(G) { return G.turno ? jugador(G, G.turno.jugadorId) : null; }
export function repetirDado(G, idx) {
  const j = turnoActual(G); const e = G.jugadores.find(x => x.personajeId === 'elias' && x.estado === 'vivo');
  if (!e || G.banderas.ordenUsada || j.id === e.id || dist(e.pos, j.pos) > 3) return { ok: false, motivo: 'Orden no disponible' };
  const viejo = G.turno.dados[idx]; if (!viejo) return { ok: false }; const nuevo = tirarDado(G); G.turno.dados[idx] = nuevo; G.banderas.ordenUsada = true;
  const v = c => c === 'paso' ? 1 : c === 'doble' ? (j.sinDoble ? 1 : 2) : 0; G.turno.pasos = Math.max(0, G.turno.pasos - v(viejo) + v(nuevo));
  if (nuevo === 'ruido') subirRuido(G, 1, 'la repetición sale ruido'); G.turno.mordiscoDado = G.turno.dados.includes('mordisco');
  log(G, `Orden de ${e.nombre}: ${j.nombre} repite un dado (${viejo} → ${nuevo}).`); return { ok: true, nuevo };
}

/* ---------- movimiento ---------- */
export function costeMovimiento(G, j, dest) {
  const c = G.casillas[dest]; if (!c) return { ok: false, motivo: 'Fuera del mapa' };
  if (dist(j.pos, dest) !== 1) return { ok: false, motivo: 'Solo casillas adyacentes' };
  if (c.fuego) return { ok: false, motivo: 'La casilla arde' };
  if (j.pasajeroDe != null) return { ok: false, motivo: 'Vas de pasajero: baja primero' };
  const zs = zombisEn(G, dest);
  if (j.vehiculo) {
    const v = OBJETOS[j.vehiculo.id]; if (!['calle', 'refugio', 'entrada', 'helipuerto', 'gasolinera', 'generador', 'torre', 'laboratorio'].includes(c.tipo)) return { ok: false, motivo: 'El vehículo solo va por calle' };
    const gas = G.turno.margaGratis ? 0 : 1 / v.porGas; if ((j.vehiculo.gas || 0) < gas) return { ok: false, motivo: 'Sin gasolina' };
    if (zs.length && !v.atropella) return { ok: false, motivo: 'Hay zombis' };
    return { ok: true, coste: 0, gas, atropello: zs.length > 0 };
  }
  let coste = c.tipo === 'bosque' ? (j.personajeId === 'kenji' ? 1 : 2) : 1;
  if (zs.length) { if (j.camuflaje > 0 && zs.every(z => z.tipo === 'caminante')) { } else if (j.personajeId === 'ceniza' && zs.every(z => z.tipo === 'caminante')) coste += 2; else return { ok: false, motivo: 'Hay zombis: necesitas camuflaje' }; }
  if (coste > G.turno.pasos) return { ok: false, motivo: 'No te quedan pasos' };
  if (j.personajeId === 'kenji') { const hordas = Object.values(G.zombis).filter(esHorda).map(z => z.pos); if (hordas.length && distanciaMin(G, j.pos, hordas) <= 2 && distanciaMin(G, dest, hordas) < distanciaMin(G, j.pos, hordas)) return { ok: false, motivo: 'Kenji no se acerca a la horda' }; }
  if (j.panico >= 3 && dist(dest, '0,0') >= dist(j.pos, '0,0')) return { ok: false, motivo: 'Con pánico 3 solo puede ir hacia el refugio' };
  return { ok: true, coste };
}
export function destinosPosibles(G) { const j = turnoActual(G); if (!j || G.turno.levantandose) return []; return vecinos(j.pos).filter(k => costeMovimiento(G, j, k).ok); }
export function mover(G, dest) {
  const j = turnoActual(G); const r = costeMovimiento(G, j, dest); if (!r.ok) return r;
  if (j.vehiculo) { j.vehiculo.gas = Math.round((j.vehiculo.gas - r.gas) * 100) / 100; G.turno.movidoVehiculo = true; G.turno.margaGratis = false; } else G.turno.pasos -= r.coste;
  j.pos = dest; pasajerosDe(G, j).forEach(p => p.pos = dest); G.turno.movido = true; const c = G.casillas[dest];
  if (!c.revelada) revelarLoseta(G, c.loseta);
  recoger(G, j, c);
  if (r.atropello) { const d = tirarDado(G); const zs = zombisEn(G, dest); if (d === 'paso' || d === 'doble') { let quitar = 3; for (const z of zs) { if (z.tipo !== 'caminante') continue; const q = Math.min(quitar, z.n); z.n -= q; quitar -= q; if (z.n <= 0) delete G.zombis[z.id]; } log(G, `${j.nombre} atropella caminantes (${d}).`, 'combate'); } else log(G, `${j.nombre} intenta atropellar y falla (${d}).`, 'combate'); }
  return { ok: true };
}
function recoger(G, j, c) { if (!c.objetos.length) return; c.objetos.forEach(id => { if (id === 'suministro') { G.almacen.suministro++; log(G, `${j.nombre} recoge un suministro marcado (${G.almacen.suministro}).`, 'bien'); } else { j.mano.push(carta(G, id)); log(G, `${j.nombre} recoge ${OBJETOS[id].nombre}.`); } }); c.objetos = []; c.marca = null; }
export function rastrear(G, k) { const j = turnoActual(G); if (!G.turno.rastreo || !G.turno.movido) return { ok: false, motivo: 'Rastreo no disponible' }; const c = G.casillas[k]; if (!c || c.revelada || !vecinos(j.pos).some(v => G.casillas[v] && G.casillas[v].loseta === c.loseta)) return { ok: false, motivo: 'Elige una loseta oculta adyacente' }; G.turno.rastreo = false; revelarLoseta(G, c.loseta); log(G, `${j.nombre} rastrea la zona.`); return { ok: true }; }

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
    else if (c.tipo === 'farmacia') id = mision(G).farmaciasSoloAntibioticos || c.saqueos % 2 ? 'antibioticos' : 'botiquin';
    else if (c.tipo === 'taller') id = rnd(G) < .3 ? 'receta' : elegir(G, mision(G).tallerMateriales || ['cinta', 'clavos', 'tubo', 'pilas', 'tablas', 'chapa']);
    else id = robarObjeto(G);
    if (id === 'receta') { const desconocidas = Object.keys(RECETAS).filter(r => !G.recetasConocidas.includes(r)); if (desconocidas.length) { const r = elegir(G, desconocidas); G.recetasConocidas.push(r); log(G, `${j.nombre} encuentra un recetario: ${RECETAS[r].nombre}.`, 'bien'); obtenidos.push('Recetario: ' + RECETAS[r].nombre); continue; } id = 'cinta'; }
    j.mano.push(carta(G, id)); obtenidos.push(OBJETOS[id].nombre);
  }
  stat(G, 'saqueos'); log(G, `${j.nombre} saquea: ${obtenidos.join(', ')}.`, 'bien'); return { ok: true, obtenidos };
}
export function robarObjeto(G) { if (!G.mazoObjetos.length) { G.mazoObjetos = barajar(G, G.descartes); G.descartes = []; if (!G.mazoObjetos.length) return 'cinta'; } return G.mazoObjetos.pop(); }
export function descartar(G, j, uid) { const i = j.mano.findIndex(c => c.uid === uid); if (i < 0) return null; const [c] = j.mano.splice(i, 1); if (OBJETOS[c.id].tipo !== 'vehiculo' && !c.id.startsWith('muestra')) G.descartes.push(c.id); return c; }
function quitarCarta(j, uid) { const i = j.mano.findIndex(c => c.uid === uid); if (i >= 0) return j.mano.splice(i, 1)[0]; return null; }

export function armasDe(G, j) { return j.mano.filter(c => OBJETOS[c.id].tipo === 'arma' && !(j.personajeId === 'ruy' && OBJETOS[c.id].fuego)); }
export function alcance(G, j) { return G.niebla ? 1 : j.personajeId === 'lidia' ? 4 : PARAMS.distanciaDisparo; }
export function objetivosAtaque(G) {
  const j = turnoActual(G); const out = []; if (!j) return out;
  for (const z of Object.values(G.zombis)) {
    if (z.tipo === 'jugador' && z.oculto) continue;
    const d = dist(j.pos, z.pos); if (d === 0) { out.push({ z, d }); continue; }
    if (j.personajeId === 'anselmo' || d > alcance(G, j)) continue;
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
  if (z.tipo === 'jugador' && z.oculto) return { ok: false, motivo: 'No distingues a ese zombi de la horda' };
  if (d > 0 && !A.distancia) return { ok: false, motivo: 'Necesitas un arma a distancia' };
  if (d > 0 && tipo.inmuneDistancia) return { ok: false, motivo: 'El acorazado es inmune a disparos' };
  if (d > 0 && j.personajeId === 'anselmo') return { ok: false, motivo: 'Anselmo solo combate en defensa' };
  if (j.personajeId === 'ruy' && A.fuego) return { ok: false, motivo: 'Ruy no usa armas de fuego' };
  if (z.tipo === 'jugador' && j.personajeId === 'naima') return { ok: false, motivo: 'Naima no ataca a antiguos compañeros' };
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  let n = A.dados || 1; if (j.personajeId === 'elias' && A.fuego) n = 3; if (j.personajeId === 'omar' && d > 0) n = Math.max(1, n - 1);
  const dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  let imp = A.extra || 0, ruido = 0, mord = false; for (const c of dados) { if (c === 'paso') imp++; else if (c === 'doble') imp += 2; else if (c === 'ruido') { imp++; ruido++; } else mord = true; }
  const melee = d === 0; const silencioso = j.personajeId === 'sunja' && melee;
  if (ruido && !silencioso) subirRuido(G, ruido, 'el combate');
  if (A.fuego) { const sil = j.mano.find(c => c.id === 'silenciador'); if (sil) { sil.usos--; if (sil.usos <= 0) descartar(G, j, sil.uid); log(G, 'Disparo silenciado.'); } else subirRuido(G, A.ruido, 'el disparo'); if (j.camuflaje) { j.camuflaje = 0; log(G, 'El disparo arruina el camuflaje.'); } G.turno.disparo = true; }
  let muertos = 0; const antes = z.n;
  if (z.tipo === 'corredor' && (A.mataCorredor || (A.fuego && j.personajeId === 'lidia'))) muertos = 1;
  else { let coste = tipo.fuerza; let max = z.n; if (esHorda(z)) { coste = silencioso ? 1 : PARAMS.impactosPorCaminanteHorda; if (silencioso) max = 2; } muertos = Math.min(max, Math.floor(imp / coste)); }
  z.n -= muertos; stat(G, 'ataques'); stat(G, 'muertos', muertos);
  log(G, `${j.nombre} ataca ${tipo.nombre}${antes > 1 ? ' ×' + antes : ''} con ${arma ? A.nombre : 'las manos'}: [${dados.join(', ')}] ${imp} impactos, ${muertos} eliminado${muertos === 1 ? '' : 's'}.`, 'combate');
  if (z.tipo === 'nino' && muertos) { j.panico = Math.min(3, j.panico + 1); log(G, `${j.nombre} gana 1 de pánico.`, 'peligro'); }
  if (muertos && mision(G).muestras && ['caminante', 'corredor', 'acorazado'].includes(z.tipo) && !G.jugadores.some(x => x.mano.some(c => c.id === 'muestra_' + z.tipo)) && !G.banderas['muestra_' + z.tipo]) { j.mano.push(carta(G, 'muestra_' + z.tipo)); log(G, `${j.nombre} toma una muestra de ${tipo.nombre.toLowerCase()}.`, 'bien'); }
  if (z.n <= 0) { if (z.tipo === 'jugador') { const v = jugador(G, z.jugadorId); v.estado = 'muerto'; log(G, `${v.nombre} descansa por fin.`, 'peligro'); } delete G.zombis[z.id]; if (melee && !j.mano.some(c => c.id === 'visceras')) j.mano.push(carta(G, 'visceras')); }
  if (arma && arma.durab != null) { arma.durab--; if (arma.durab <= 0) { descartar(G, j, arma.uid); log(G, `${A.nombre} se rompe.`, 'peligro'); } }
  let mordido = false; if (z.n > 0 && mord && melee) { const vidaAntes = j.vida; log(G, `La cara de mordisco: ${tipo.nombre} contraataca.`, 'combate'); stat(G, 'contraataques'); zombiAtaca(G, z, j, 'combate'); mordido = j.vida < vidaAntes; }
  comprobarFin(G); return { ok: true, dados, impactos: imp, muertos, mordido };
}
export function herir(G, j, n, motivo, mordisco = true) {
  j.vida -= n; log(G, `${motivo}: ${n} herida${n > 1 ? 's' : ''} (vida ${Math.max(0, j.vida)}).`, 'peligro'); if (mordisco) aplicarMordisco(G, j);
  if (j.vida <= 0) { j.vida = 0; j.estado = 'caido'; j.pasajeroDe = null; log(G, `${j.nombre} cae al suelo.`, 'peligro'); }
}
export function aplicarMordisco(G, j) {
  if (j.mordido) return; stat(G, 'mordiscos'); const regla = mision(G).contagio;
  if (regla === 'cuenta_atras') { j.mordido = { turnos: PARAMS.turnosContagio, ronda: G.ronda }; aviso(G, 'Mordisco', `${j.nombre} está infectado. ${PARAMS.turnosContagio} turnos para curarlo o amputar.`, 'peligro'); }
  else if (regla === 'sin_contagio') { j.mordido = { sc: true, ronda: G.ronda, limite: G.ronda + 1 }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Si no se anula antes de la próxima noche con antibióticos, Tratamiento, amputación o pasando la noche en el refugio, la misión fracasa.`, 'peligro'); }
  else if (regla === 'ambos') { j.mordido = { sc: true, hc: true, ronda: G.ronda, limite: G.ronda + 1 }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Sin cura antes de la próxima noche, la misión fracasa y además se convertirá.`, 'peligro'); }
  else if (G.opciones.hardcoreTardio) { j.mordido = { hc: true, ronda: G.ronda, limite: G.ronda + 1 }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Se convertirá en la noche siguiente: una ronda para despedirse y repartir el inventario.`, 'peligro'); }
  else { j.mordido = { hc: true, ronda: G.ronda }; aviso(G, 'Mordisco', `${j.nombre} está infectado. Al terminar la ronda se convertirá.`, 'peligro'); }
}
export function craftear(G, recetaId, chapuza = false) {
  const j = turnoActual(G); const R = RECETAS[recetaId]; if (!R || !G.recetasConocidas.includes(recetaId)) return { ok: false, motivo: 'Receta desconocida' };
  if (chapuza && (j.personajeId !== 'marga' || G.banderas.chapuzaUsada)) return { ok: false, motivo: 'Chapuza no disponible' };
  const usados = []; const mano = [...j.mano]; let faltan = 0;
  for (const ing of R.ing) { const i = mano.findIndex(c => c.id === ing); if (i < 0) { faltan++; if (!chapuza || faltan > 1) return { ok: false, motivo: `Falta ${OBJETOS[ing].nombre}` }; continue; } usados.push(mano.splice(i, 1)[0]); }
  const gratis = G.casillas[j.pos].tipo === 'taller'; if (!gratis && !gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  if (chapuza) G.banderas.chapuzaUsada = true;
  usados.forEach(c => descartar(G, j, c.uid)); const res = Array.isArray(R.res) ? R.res : [R.res]; res.forEach(id => j.mano.push(carta(G, id)));
  stat(G, 'crafteos'); log(G, `${j.nombre} craftea ${R.nombre}${gratis ? ' en el taller' : ''}${chapuza ? ' con una chapuza' : ''}.`, 'bien'); return { ok: true };
}
export function objetivosCura(G) { const j = turnoActual(G); if (j.personajeId === 'beatriz') return [j]; return vivos(G).filter(x => x.id === j.id || (dist(x.pos, j.pos) <= 1 && x.personajeId !== 'beatriz')); }
export function curar(G, uid, destId) {
  const j = turnoActual(G); const d = jugador(G, destId); const c = j.mano.find(x => x.uid === uid); if (!c) return { ok: false };
  if (!objetivosCura(G).includes(d)) return { ok: false, motivo: 'No puedes curar a ese jugador' }; const O = OBJETOS[c.id];
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, c.uid);
  if (O.cura) { d.vida = Math.min(d.vidaMax, d.vida + O.cura); if (d.estado === 'caido') d.estado = 'vivo'; }
  if (O.contagio && d.mordido) {
    if (reglaCA(G)) { const extra = c.id === 'tratamiento' && j.personajeId === 'naima' ? 3 : O.contagio; d.mordido.turnos += extra; log(G, `${d.nombre} gana ${extra} turnos frente al contagio.`, 'bien'); }
    else if (reglaSC(G) && d.mordido.sc && G.ronda <= d.mordido.limite) { d.mordido = null; d.curadoMordisco = true; stat(G, 'curas'); log(G, `${d.nombre} se salva del contagio.`, 'bien'); }
    else log(G, 'Sin efecto sobre el contagio en esta misión.');
  }
  log(G, `${j.nombre} usa ${O.nombre} en ${d.id === j.id ? 'sí mismo' : d.nombre}.`, 'bien'); return { ok: true };
}
export function amputar(G, destId) {
  const j = turnoActual(G); const d = jugador(G, destId); const arma = j.mano.find(c => OBJETOS[c.id].amputa);
  if (!arma) return { ok: false, motivo: 'Necesitas machete o katana' }; if (dist(j.pos, d.pos) > 1 || d.estado !== 'vivo') return { ok: false, motivo: 'Debe estar adyacente y en pie' };
  if (!d.mordido || (d.mordido.turnos == null && !d.mordido.sc)) return { ok: false, motivo: 'Amputar no sirve en hardcore puro' };
  if (G.ronda - d.mordido.ronda > 1) return { ok: false, motivo: 'Demasiado tarde para amputar' };
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  d.mordido = null; d.curadoMordisco = true; d.sinDoble = true; stat(G, 'curas'); log(G, `${j.nombre} amputa a ${d.nombre}. Se salva, pero sus dobles pasos ya solo valen uno.`, 'peligro'); herir(G, d, 2, 'la amputación', false); return { ok: true };
}
export function triaje(G, destId) { const j = turnoActual(G); const d = jugador(G, destId); if (j.personajeId !== 'naima' || G.banderas.triajeUsado || dist(j.pos, d.pos) > 1 || ['elias', 'beatriz'].includes(d.personajeId) || d.id === j.id) return { ok: false, motivo: 'Triaje no disponible' }; G.banderas.triajeUsado = true; d.vida = Math.min(d.vidaMax, d.vida + 1); if (d.estado === 'caido') d.estado = 'vivo'; log(G, `Triaje: ${d.nombre} recupera 1 de vida.`, 'bien'); return { ok: true }; }
export function sermon(G) { const j = turnoActual(G); if (j.personajeId !== 'anselmo') return { ok: false }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; let n = 0; for (const x of vivos(G)) if (dist(x.pos, j.pos) <= 2 && x.panico > 0 && x.personajeId !== 'elias') { x.panico--; n++; } log(G, `Sermón de Anselmo: ${n} superviviente${n === 1 ? '' : 's'} respira${n === 1 ? '' : 'n'}.`, 'bien'); return { ok: true }; }
export function compartirComida(G, uid) { const j = turnoActual(G); if (j.personajeId !== 'omar') return { ok: false }; const c = j.mano.find(x => x.uid === uid && x.id === 'comida'); if (!c) return { ok: false }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); for (const x of jugadoresEn(G, j.pos)) if (x.personajeId !== 'elias') x.panico = Math.max(0, x.panico - 1); log(G, 'Omar prepara comida caliente: todos en la casilla pierden 1 de pánico.', 'bien'); return { ok: true }; }
export function levantar(G, destId) { const j = turnoActual(G); const d = jugador(G, destId); if (d.estado !== 'caido' || dist(j.pos, d.pos) > 1) return { ok: false }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; d.estado = 'vivo'; d.vida = 1; log(G, `${j.nombre} levanta a ${d.nombre}.`, 'bien'); return { ok: true }; }
export function destinatarios(G) { const j = turnoActual(G); if (!j) return []; if (j.personajeId === 'ceniza' && j.pos !== '0,0') return []; return vivos(G).filter(x => x.id !== j.id && x.estado === 'vivo' && x.personajeId !== 'sunja' && (dist(x.pos, j.pos) <= 1 || enlazados(G, j.id, x.id))); }
export function dar(G, destId, uids) {
  const j = turnoActual(G); const d = jugador(G, destId); if (!destinatarios(G).includes(d)) return { ok: false, motivo: 'No puedes dar cartas a ese jugador' };
  if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  for (const uid of uids) { const c = quitarCarta(j, uid); if (c) d.mano.push(c); }
  log(G, `${j.nombre} da ${uids.length} carta${uids.length > 1 ? 's' : ''} a ${d.nombre}${dist(j.pos, d.pos) > 1 ? ' por el enlace' : ''}.`); return { ok: true };
}
export function usar(G, uid, destino) {
  const j = turnoActual(G); const c = j.mano.find(x => x.uid === uid); if (!c) return { ok: false };
  if (c.id === 'molotov') { if (!destino || dist(j.pos, destino) !== 1 || jugadoresEn(G, destino).length) return { ok: false, motivo: 'Elige una casilla adyacente sin supervivientes' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); let n = 0; for (const z of zombisEn(G, destino)) { n += z.n; if (z.tipo === 'jugador') jugador(G, z.jugadorId).estado = 'muerto'; delete G.zombis[z.id]; } G.casillas[destino].fuego = 2; stat(G, 'muertos', n); log(G, `${j.nombre} lanza un molotov: ${n} zombis arden. La casilla arde 2 rondas.`, 'combate'); const hordas = Object.values(G.zombis).filter(esHorda); if (hordas.length) { const h = hordas.sort((a, b) => dist(a.pos, destino) - dist(b.pos, destino))[0]; moverZombiHacia(G, h, destino, 1); log(G, 'La luz atrae a la horda más cercana.', 'peligro'); } comprobarFin(G); return { ok: true }; }
  if (c.id === 'senuelo') { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); G.casillas[j.pos].senuelo = 2; subirRuido(G, 2, 'el señuelo'); log(G, `${j.nombre} deja un señuelo sonoro.`); return { ok: true }; }
  if (c.id === 'camuflaje') { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); j.camuflaje = 2; log(G, `${j.nombre} se cubre de vísceras. Los caminantes lo ignoran 2 turnos.`); return { ok: true }; }
  if (c.id === 'barricada') { if (!destino || dist(j.pos, destino) !== 1 || !G.casillas[destino]) return { ok: false, motivo: 'Elige la casilla adyacente que quieres bloquear' }; if (hayBarricada(G, j.pos, destino)) return { ok: false, motivo: 'Ya hay una barricada ahí' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); G.barricadas.push(arista(j.pos, destino)); stat(G, 'barricadas'); log(G, `${j.nombre} levanta una barricada.`, 'bien'); comprobarFin(G); return { ok: true }; }
  if (c.id === 'enlace') { if (j.personajeId === 'ceniza') return { ok: false, motivo: 'Ceniza no habla por radio' }; const d = destino != null ? jugador(G, +destino) : null; if (!d || d.id === j.id || d.estado !== 'vivo' || d.personajeId === 'ceniza') return { ok: false, motivo: 'Elige con quién enlazarte' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); G.enlaces.push({ a: j.id, b: d.id, rondas: PARAMS.rondasEnlace }); log(G, `${j.nombre} y ${d.nombre} quedan enlazados ${PARAMS.rondasEnlace} rondas.`, 'bien'); return { ok: true }; }
  if (c.id === 'bidon' && j.vehiculo) { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; descartar(G, j, uid); const V = OBJETOS[j.vehiculo.id]; j.vehiculo.gas = Math.min(V.gasMax, (j.vehiculo.gas || 0) + 3); log(G, `${j.nombre} reposta (${j.vehiculo.gas}/${V.gasMax}).`); return { ok: true }; }
  if (c.id === 'comida' && j.personajeId === 'omar') return compartirComida(G, uid);
  return { ok: false, motivo: 'Ese objeto no se usa así' };
}
export function vehiculo(G, uid) {
  const j = turnoActual(G);
  if (j.vehiculo) { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.mano.push(j.vehiculo); pasajerosDe(G, j).forEach(p => p.pasajeroDe = null); log(G, `${j.nombre} baja del vehículo.`); j.vehiculo = null; return { ok: true }; }
  if (j.pasajeroDe != null) { if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.pasajeroDe = null; log(G, `${j.nombre} baja del vehículo.`); return { ok: true }; }
  const c = j.mano.find(x => x.uid === uid && OBJETOS[x.id].porGas); if (!c) return { ok: false, motivo: 'Necesitas un vehículo con depósito' };
  if (j.personajeId === 'ruy') return { ok: false, motivo: 'Ruy no conduce' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' };
  quitarCarta(j, c.uid); j.vehiculo = c; log(G, `${j.nombre} sube a ${OBJETOS[c.id].nombre}.`); return { ok: true };
}
export function conductoresDisponibles(G) { const j = turnoActual(G); if (!j || j.vehiculo || j.pasajeroDe != null) return []; return jugadoresEn(G, j.pos).filter(x => x.id !== j.id && x.vehiculo && pasajerosDe(G, x).length < OBJETOS[x.vehiculo.id].plazas); }
export function subirPasajero(G, conductorId) { const j = turnoActual(G); const c = jugador(G, conductorId); if (!conductoresDisponibles(G).includes(c)) return { ok: false, motivo: 'No hay sitio en ese vehículo' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.pasajeroDe = c.id; log(G, `${j.nombre} sube de pasajero con ${c.nombre}.`); return { ok: true }; }
export function puedeSalir(G) { const j = turnoActual(G); return !!j && mision(G).objetivo === 'convoy' && esBorde(G, j.pos) && !!j.vehiculo; }
export function salir(G) { const j = turnoActual(G); if (!puedeSalir(G)) return { ok: false, motivo: 'Necesitas estar en el borde a bordo de un vehículo' }; const grupo = [j, ...pasajerosDe(G, j)]; grupo.forEach(p => { p.estado = 'salido'; p.pasajeroDe = null; }); j.vehiculo = null; log(G, `${grupo.map(p => p.nombre).join(', ')} abandona${grupo.length > 1 ? 'n' : ''} la ciudad.`, 'bien'); G.turno.acciones = 0; comprobarFin(G); return { ok: true, grupo: grupo.length }; }
export function descansar(G) { const j = turnoActual(G); if (Object.values(G.zombis).some(z => dist(z.pos, j.pos) <= 2)) return { ok: false, motivo: 'Hay zombis demasiado cerca' }; if (!gastaAccion(G)) return { ok: false, motivo: 'Sin acciones' }; j.vida = Math.min(j.vidaMax, j.vida + 1); j.panico = Math.max(0, j.panico - 1); log(G, `${j.nombre} descansa.`); return { ok: true }; }

export function puedeTerminar(G) { const j = turnoActual(G); if (!j) return { ok: false }; if (j.personajeId === 'marga' && G.casillas[j.pos].tipo === 'edificio' && j.estado === 'vivo' && !G.turno.levantandose) return { ok: false, motivo: 'Claustrofobia: Marga no puede terminar dentro de un edificio' }; return { ok: true }; }
export function terminarTurno(G, forzar = false) {
  const j = turnoActual(G); const T = G.turno; if (!forzar) { const p = puedeTerminar(G); if (!p.ok) return p; }
  if (!T.levantandose && j.estado !== 'salido') {
    if (T.mordiscoDado) { const z = vecinos(j.pos).flatMap(k => zombisEn(G, k))[0]; if (z && j.estado === 'vivo') { log(G, `La cara de mordisco: un ${ZOMBIS[z.tipo].nombre} se lanza sobre ${j.nombre}.`, 'peligro'); zombiAtaca(G, z, j, 'dado'); } }
    if (j.estado === 'vivo' && vecinos(j.pos).concat(j.pos).some(k => zombisEn(G, k).some(esHorda))) { j.panico = Math.min(3, j.panico + 1); log(G, `${j.nombre} gana 1 de pánico por la horda cercana.`, 'peligro'); }
    if (T.movidoVehiculo && j.vehiculo) subirRuido(G, OBJETOS[j.vehiculo.id].ruido, 'el motor');
    depositar(G, j);
  }
  G.turnoIdx++; if (G.fin) return { ok: true }; if (G.turnoIdx >= G.orden.length) faseZombis(G); else iniciarTurno(G); return { ok: true };
}
function depositar(G, j) {
  const c = G.casillas[j.pos]; const M = mision(G);
  const dejar = (id, clave, mult = 1) => { const cs = j.mano.filter(x => x.id === id); if (!cs.length) return; cs.forEach(x => quitarCarta(j, x.uid)); G.almacen[clave] += cs.length * mult; log(G, `${j.nombre} deja ${cs.length} ${OBJETOS[id].nombre.toLowerCase()} (${G.almacen[clave]}).`, 'bien'); };
  if (c.tipo === 'refugio') { if (M.objetivo === 'comida_refugio') dejar('comida', 'comida', j.personajeId === 'omar' ? 2 : 1); if (M.objetivo === 'antibioticos_refugio') dejar('antibioticos', 'antibioticos'); dejar('semillas', 'semillas'); if (M.objetivo === 'granja') dejar('bidon', 'bidon'); }
  if (c.tipo === 'generador') dejar('bidon', 'bidon');
  if (c.tipo === 'laboratorio') for (const t of ['caminante', 'corredor', 'acorazado']) { const m = j.mano.find(x => x.id === 'muestra_' + t); if (m) { quitarCarta(j, m.uid); G.banderas['muestra_' + t] = true; G.almacen.muestras++; log(G, `${j.nombre} entrega la muestra de ${t} (${G.almacen.muestras}/3).`, 'bien'); } }
}

/* ---------- zombis: movimiento y ataque ---------- */
function distancias(G, desde) { const D = {}; const cola = []; for (const k of desde) { D[k] = 0; cola.push(k); } while (cola.length) { const k = cola.shift(); for (const v of vecinos(k)) { const c = G.casillas[v]; if (!c || c.fuego || D[v] != null) continue; D[v] = D[k] + 1; cola.push(v); } } return D; }
export function moverZombiHacia(G, z, objetivo, pasos) {
  const D = distancias(G, [objetivo]); let movido = 0;
  for (let i = 0; i < pasos; i++) {
    if (z.pos === objetivo) break; const opciones = vecinos(z.pos).filter(v => D[v] != null && D[v] < (D[z.pos] ?? 1e9)); if (!opciones.length) break;
    const dest = opciones[entero(G, opciones.length)];
    if (hayBarricada(G, z.pos, dest)) { if (!esHorda(z)) { log(G, `${ZOMBIS[z.tipo].nombre} se queda arañando una barricada.`); break; } G.barricadas = G.barricadas.filter(a => a !== arista(z.pos, dest)); subirRuido(G, 1, 'una barricada cae'); log(G, `${ZOMBIS[z.tipo].nombre} ×${z.n} derriba una barricada.`, 'peligro'); break; }
    z.pos = dest; movido++;
    const c = G.casillas[dest]; const js = jugadoresEn(G, dest);
    if (js.length) { for (const j of js) { if (j.personajeId === 'ruy' && adultoCon(G, j)) continue; if (j.estado === 'caido') { if (esHorda(z)) morirOConvertir(G, j, 'la horda alcanza a ' + j.nombre + ' en el suelo'); } else if (!(j.camuflaje > 0 && z.tipo === 'caminante')) zombiAtaca(G, z, j); } break; }
    if (c.tipo === 'edificio' || c.tipo === 'bosque') break;
  }
  return movido;
}
export function objetivoZombi(G, z) {
  const senuelos = Object.values(G.casillas).filter(c => c.senuelo > 0).map(c => c.k).filter(k => dist(k, z.pos) <= 3);
  if (senuelos.length) return senuelos.sort((a, b) => dist(a, z.pos) - dist(b, z.pos))[0];
  // Los zombis solo perciben supervivientes a PERCEPCION casillas; si no huelen a nadie, van hacia el refugio cuando el ruido es alto y si no se quedan.
  const cand = vivos(G).filter(j => !(j.camuflaje > 0 && z.tipo === 'caminante')).filter(j => !(j.personajeId === 'ruy' && (esHorda(z) || adultoCon(G, j)))).filter(j => dist(j.pos, z.pos) <= (mision(G).percepcion || PARAMS.percepcion));
  if (!cand.length) return G.ruido >= G.escalado.ruidoTrasHorda && z.pos !== '0,0' ? '0,0' : null;
  cand.sort((a, b) => dist(a.pos, z.pos) - dist(b.pos, z.pos) || (a.personajeId === 'ceniza') - (b.personajeId === 'ceniza') || a.id - b.id); return cand[0].pos;
}
export function faseZombis(G, extra = 0) {
  G.fase = 'zombis'; G.turno = null;
  for (const z of Object.values(G.zombis)) { if (!G.zombis[z.id] || z.tipo === 'jugador') continue; const obj = objetivoZombi(G, z); if (!obj) continue; moverZombiHacia(G, z, obj, ZOMBIS[z.tipo].mov + extra); }
  fusionar(G); comprobarFin(G); if (G.fin) return;
  const zjs = G.jugadores.filter(j => j.estado === 'zombi' && fichaZombi(G, j.id));
  if (zjs.length) { G.fase = 'zombi'; G.zturno = { jugadorId: zjs[0].id, acciones: 2, pendientes: zjs.slice(1).map(j => j.id), pasos: 0 }; }
  else faseNoche(G);
}
function fusionar(G) { const porPos = {}; for (const z of Object.values(G.zombis)) { if (z.tipo === 'jugador') continue; const k = z.pos + '|' + z.tipo; if (porPos[k]) { porPos[k].n += z.n; delete G.zombis[z.id]; } else porPos[k] = z; } }
export function zombiAtaca(G, z, j, origen = 'fase') {
  if (j.estado !== 'vivo') return; stat(G, 'ataques_' + origen); const n = PARAMS.dadosDefensa + (j.personajeId === 'beatriz' ? 1 : 0); let dados = []; for (let i = 0; i < n; i++) dados.push(tirarDado(G));
  const evalua = ds => ds.some(d => d === 'paso' || d === 'doble') ? 'esquiva' : ds.includes('ruido') ? 'ruido' : 'mordisco';
  let res = evalua(dados);
  if (res === 'mordisco' && j.personajeId === 'beatriz' && G.turno && !G.turno.instintoUsado && G.turno.jugadorId === j.id) { G.turno.instintoUsado = true; dados = [tirarDado(G), tirarDado(G)]; res = evalua(dados); log(G, 'Instinto: Beatriz repite la defensa.'); }
  const nombre = z.tipo === 'jugador' ? jugador(G, z.jugadorId).nombre + ' (zombi)' : ZOMBIS[z.tipo].nombre + (z.n > 1 ? ' ×' + z.n : '');
  if (res === 'esquiva') log(G, `${j.nombre} esquiva a ${nombre} [${dados.join(', ')}].`, 'combate');
  else if (res === 'ruido') { log(G, `${j.nombre} esquiva a ${nombre} haciendo ruido [${dados.join(', ')}].`, 'combate'); subirRuido(G, 1, 'la defensa'); }
  else { const heridas = esHorda(z) || (z.tipo === 'jugador' && G.nivelZombi >= 2) ? 2 : 1; stat(G, 'mordisco_' + origen); herir(G, j, heridas, `${nombre} muerde a ${j.nombre} [${dados.join(', ')}]`); }
}
export function morirOConvertir(G, j, motivo) { if (reglaSC(G) && !reglaHC(G)) { j.estado = 'muerto'; j.pasajeroDe = null; aviso(G, 'Muerte', `${j.nombre} muere: ${motivo}.`, 'peligro'); } else convertir(G, j, motivo); comprobarFin(G); }
export function convertir(G, j, motivo) {
  if (j.estado === 'zombi' || j.estado === 'muerto' || j.estado === 'salido') return;
  j.estado = 'zombi'; j.mordido = null; j.pasajeroDe = null; pasajerosDe(G, j).forEach(p => p.pasajeroDe = null); j.mano.forEach(c => { if (OBJETOS[c.id].tipo !== 'vehiculo') G.descartes.push(c.id); }); j.mano = []; j.vehiculo = null; stat(G, 'conversiones');
  const habia = G.jugadores.some(x => x.estado === 'zombi' && x.id !== j.id); if (habia) G.nivelZombi = Math.min(3, G.nivelZombi + 1);
  const reclutador = Object.values(G.zombis).find(z => z.tipo === 'jugador' && dist(z.pos, j.pos) <= 1);
  ponerZombi(G, 'jugador', 1, j.pos, { jugadorId: j.id });
  aviso(G, 'Conversión', `${j.nombre} se ha convertido (${motivo}). Ahora juega como zombi${habia ? '. El bando zombi evoluciona a nivel ' + G.nivelZombi : ''}.`, 'peligro');
  if (reclutador) { log(G, 'Reclutar: el jugador zombi estaba al lado y llama a más muertos.', 'peligro'); cartaHorda(G); }
}

/* ---------- turno del jugador zombi ---------- */
export function fichaZombi(G, jugadorId) { return Object.values(G.zombis).find(z => z.tipo === 'jugador' && z.jugadorId === jugadorId); }
function zGasta(G) { if (G.zturno.acciones <= 0) return false; G.zturno.acciones--; return true; }
export function zMoverHorda(G, zombiId, dest) { const z = G.zombis[zombiId]; if (!z || z.tipo === 'jugador' || dist(z.pos, dest) !== 1 || !G.casillas[dest] || G.casillas[dest].fuego) return { ok: false, motivo: 'Movimiento no válido' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; moverZombiHacia(G, z, dest, 1); fusionar(G); log(G, `El jugador zombi empuja a ${ZOMBIS[z.tipo].nombre}${z.n > 1 ? ' ×' + z.n : ''}.`, 'peligro'); comprobarFin(G); return { ok: true }; }
export function zMover(G, dest) { const z = fichaZombi(G, G.zturno.jugadorId); if (!z || dist(z.pos, dest) !== 1 || !G.casillas[dest] || G.casillas[dest].fuego) return { ok: false, motivo: 'Movimiento no válido' }; if (G.zturno.pasos <= 0) { if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; G.zturno.pasos = G.nivelZombi >= 1 ? 2 : 1; } G.zturno.pasos--; z.pos = dest; if (z.oculto && !zombisEn(G, dest).some(x => x.tipo === 'caminante')) { z.oculto = false; log(G, 'El jugador zombi se separa de la horda y queda a la vista.'); } if (!G.casillas[dest].revelada) revelarLoseta(G, G.casillas[dest].loseta); return { ok: true }; }
export function zAtacar(G, destId) { const z = fichaZombi(G, G.zturno.jugadorId); const j = jugador(G, destId); if (!z || j.pos !== z.pos || !['vivo', 'caido'].includes(j.estado)) return { ok: false, motivo: 'No hay nadie a tu alcance' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; z.oculto = false; if (j.estado === 'caido') morirOConvertir(G, j, 'el jugador zombi lo alcanza en el suelo'); else zombiAtaca(G, z, j); comprobarFin(G); return { ok: true }; }
export function zOler(G, destId) { const z = fichaZombi(G, G.zturno.jugadorId); const j = jugador(G, destId); if (!z || dist(z.pos, j.pos) > 3) return { ok: false, motivo: 'Demasiado lejos' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; log(G, `El jugador zombi huele a ${j.nombre}.`); return { ok: true, mano: j.mano.map(c => OBJETOS[c.id].nombre) }; }
export function zOcultar(G) { const z = fichaZombi(G, G.zturno.jugadorId); if (!z || !zombisEn(G, z.pos).some(x => x.tipo === 'caminante')) return { ok: false, motivo: 'Necesitas caminantes en tu casilla' }; if (!zGasta(G)) return { ok: false, motivo: 'Sin acciones' }; z.oculto = true; log(G, 'El jugador zombi se confunde entre los caminantes.'); return { ok: true }; }
export function zTerminar(G) { const z = fichaZombi(G, G.zturno.jugadorId); if (z && z.oculto && !zombisEn(G, z.pos).some(x => x.tipo === 'caminante')) z.oculto = false; const p = G.zturno.pendientes; if (p.length) { G.zturno = { jugadorId: p[0], acciones: 2, pendientes: p.slice(1), pasos: 0 }; return; } G.zturno = null; faseNoche(G); }

/* ---------- noche ---------- */
export function faseNoche(G) {
  G.fase = 'noche'; const M = mision(G);
  subirRuido(G, PARAMS.ruidoPorNoche, 'cae la noche');
  if (G.ruido >= G.escalado.ruidoTope) { cartaHorda(G); G.ruido = G.escalado.ruidoTrasHorda; log(G, `El ruido baja a ${G.ruido}.`); }
  if (M.hordaDesde && G.ronda >= M.hordaDesde && (G.ronda - M.hordaDesde) % (M.hordaCada || 2) === 0) cartaHorda(G);
  if (G.ronda % 2 === 0) {
    const idx = robarEvento(G); const bea = G.jugadores.find(j => j.personajeId === 'beatriz' && j.estado === 'vivo');
    if (bea && !G.banderas.instintoEventoUsado) { G.fase = 'decision'; G.decision = { tipo: 'evento', jugadorId: bea.id, evento: idx }; return; }
    aplicarEvento(G, idx);
  }
  nocheB(G);
}
export function resolverDecision(G, descartar) {
  const D = G.decision; if (!D) return { ok: false }; G.decision = null;
  if (D.tipo === 'evento') { if (descartar) { G.banderas.instintoEventoUsado = true; aviso(G, 'Instinto', `Beatriz descarta el evento «${EVENTOS[D.evento].nombre}» antes de que ocurra.`, 'bien'); } else aplicarEvento(G, D.evento); }
  nocheB(G); return { ok: true };
}
function nocheB(G) {
  G.fase = 'noche'; const M = mision(G);
  for (const j of vivos(G)) if (j.pos === '0,0' && j.estado === 'vivo' && j.vida < j.vidaMax) { j.vida++; log(G, `${j.nombre} descansa en el refugio (+1 vida).`, 'bien'); }
  for (const j of vivos(G)) { if (!j.mordido) continue;
    if (j.mordido.turnos != null) { j.mordido.turnos--; if (j.mordido.turnos <= 0) convertir(G, j, 'el contagio completa su curso'); else log(G, `${j.nombre}: ${j.mordido.turnos} turnos para la cura.`, 'peligro'); }
    else { if (j.mordido.sc && j.pos === '0,0' && j.estado === 'vivo') { j.mordido = null; j.curadoMordisco = true; stat(G, 'curas'); log(G, `${j.nombre} pasa la noche en el refugio y el mordisco no llega a infectar.`, 'bien'); continue; }
      const vence = j.mordido.limite == null || G.ronda >= j.mordido.limite; if (!vence) { log(G, `${j.nombre}: última ronda para anular el contagio (cura o noche en el refugio).`, 'peligro'); continue; } if (j.mordido.sc) G.fin = { resultado: 'derrota', motivo: `${j.nombre} no pudo anular el contagio. La misión exigía cero contagios.` }; if (j.mordido.hc) convertir(G, j, 'modo hardcore'); } }
  for (const c of Object.values(G.casillas)) { if (c.fuego) c.fuego--; if (c.senuelo) c.senuelo--; }
  for (const j of G.jugadores) if (j.camuflaje) j.camuflaje--;
  G.enlaces = G.enlaces.map(e => ({ ...e, rondas: e.rondas - 1 })).filter(e => e.rondas > 0);
  if (M.objetivo === 'torre') { const t = G.casillas[G.especiales.torre]; if (t && (t.senuelo > 0 || jugadoresEn(G, t.k).some(j => j.mano.some(c => c.id === 'senuelo'))) && jugadoresEn(G, t.k).some(j => j.estado === 'vivo')) { G.progreso++; log(G, `La emisora transmite (${G.progreso}/${G.cantidad}).`, 'bien'); } }
  G.niebla = !!G.banderas.nieblaProxima; G.banderas.nieblaProxima = false;
  if (!G.banderas.primeraHorda && Object.values(G.zombis).some(esHorda)) G.banderas.primeraHorda = G.ronda;
  comprobarFin(G, true); if (G.fin) return;
  G.ronda++; iniciarRonda(G);
}
export function cartaHorda(G) {
  if (!G.mazoHordas.length) G.mazoHordas = barajar(G, HORDAS.map((h, i) => i)); const H = HORDAS[G.mazoHordas.pop()]; stat(G, 'hordas');
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
function robarEvento(G) { if (!G.mazoEventos.length) G.mazoEventos = barajar(G, EVENTOS.map((e, i) => i).filter(i => EVENTOS[i].id !== 'semillas')); return G.mazoEventos.pop(); }
function aplicarEvento(G, idx) {
  const E = EVENTOS[idx];
  switch (E.id) {
    case 'lluvia': subirRuido(G, -1, 'la lluvia'); G.jugadores.forEach(j => j.camuflaje = 0); break;
    case 'silencio': subirRuido(G, -1, 'el silencio'); break;
    case 'motor': { const calles = Object.values(G.casillas).filter(c => c.revelada && c.tipo === 'calle' && !zombisEn(G, c.k).length); if (calles.length) elegir(G, calles).objetos.push('coche'); break; }
    case 'estampida': for (const z of Object.values(G.zombis)) { if (z.tipo === 'jugador') continue; const o = objetivoZombi(G, z); if (o) moverZombiHacia(G, z, o, 1); } fusionar(G); break;
    case 'recuerdo': G.jugadores.forEach(j => j.panico = Math.max(0, j.panico - 1)); break;
    case 'tardio': { const c = vivos(G).filter(j => j.curadoMordisco && !j.mordido); if (c.length) { const j = elegir(G, c); j.curadoMordisco = false; aplicarMordisco(G, j); if (j.mordido && j.mordido.turnos) j.mordido.turnos = 2; } break; }
    case 'otros': { const v = vivos(G).filter(j => j.estado === 'vivo'); if (v.length) { const j = v.sort((a, b) => a.mano.length - b.mano.length)[0]; const n = j.personajeId === 'anselmo' ? 3 : 2; for (let i = 0; i < n; i++) j.mano.push(carta(G, robarObjeto(G))); subirRuido(G, 2, 'los otros supervivientes'); } break; }
    case 'niebla': G.banderas.nieblaProxima = true; break;
    case 'semillas': { const v = vivos(G).filter(j => j.estado === 'vivo'); if (v.length) { const j = elegir(G, v); j.mano.push(carta(G, 'semillas')); log(G, `${j.nombre} encuentra las semillas.`, 'bien'); } break; }
  }
  aviso(G, 'Evento: ' + E.nombre, E.texto, 'evento');
}

/* ---------- fin de partida ---------- */
export function comprobarFin(G, finRonda = false) {
  if (G.fin) return G.fin; const M = mision(G); const N = G.jugadores.length;
  const perdidos = G.jugadores.filter(j => j.estado === 'zombi' || j.estado === 'muerto').length;
  const umbral = N >= 4 ? Math.floor(N / 2) + 1 : N === 3 ? 2 : N; // más de la mitad; con 3 jugadores bastan 2; con 2, todos
  if (perdidos >= umbral) G.fin = { resultado: 'derrota', motivo: G.jugadores.some(j => j.estado === 'zombi') ? 'El bando zombi ha alcanzado a la mitad del equipo.' : 'No queda nadie en pie.' };
  const salidos = G.jugadores.filter(j => j.estado === 'salido').length; const enPie = vivos(G).length + salidos;
  if (!G.fin) {
    if (M.objetivo === 'convoy' && salidos >= Math.min(G.cantidad, N)) G.fin = { resultado: 'victoria', motivo: `${salidos} supervivientes salen de la ciudad en el convoy.` };
    if (M.objetivo === 'cuarentena' && vecinos('0,0').filter(v => hayBarricada(G, '0,0', v)).length >= G.cantidad) G.fin = { resultado: 'victoria', motivo: 'El refugio queda sellado. Cuarentena completa.' };
    if (M.objetivo === 'suministros' && G.almacen.suministro >= G.cantidad) G.fin = { resultado: 'victoria', motivo: 'Los cinco suministros del puente están a salvo.' };
    if (M.objetivo === 'cero' && G.losetasBorde.every(l => G.casillas[l].revelada)) G.fin = { resultado: 'victoria', motivo: 'Las ocho losetas de borde exploradas sin un solo contagio.' };
  }
  if (!G.fin && finRonda) {
    if (M.objetivo === 'antibioticos_refugio' && G.almacen.antibioticos >= G.cantidad) G.fin = { resultado: 'victoria', motivo: `${G.almacen.antibioticos} antibióticos en el refugio.` };
    if (M.objetivo === 'comida_refugio' && G.almacen.comida >= G.cantidad) G.fin = { resultado: 'victoria', motivo: `${G.almacen.comida} raciones almacenadas. El invierno puede venir.` };
    if (M.objetivo === 'deposito' && G.almacen.bidon >= G.cantidad) G.fin = { resultado: 'victoria', motivo: 'El generador ruge. Hay luz en el refugio.' };
    if (M.objetivo === 'protocolo' && G.almacen.muestras >= 3) G.fin = { resultado: 'victoria', motivo: 'Las tres muestras llegan al laboratorio. El protocolo Z-2099 se activa.' };
    if (M.objetivo === 'torre' && G.progreso >= G.cantidad) G.fin = { resultado: 'victoria', motivo: 'La emisora transmite dos noches seguidas. Alguien responderá.' };
    if (M.objetivo === 'todos_helipuerto') { const v = vivos(G); if (v.length && v.every(j => j.pos === G.especiales.helipuerto && j.estado === 'vivo')) G.fin = { resultado: 'victoria', motivo: 'Todo el equipo despega sin una gota de sangre infectada.' }; }
    if (!G.fin && G.ronda >= M.rondas) {
      if (M.objetivo === 'sobrevivir') { const cuenta = M.enRefugio ? vivos(G).filter(j => dist(j.pos, '0,0') <= (M.enRefugio === true ? 0 : M.enRefugio) && j.estado === 'vivo').length : enPie; G.fin = cuenta >= Math.ceil(N / 2) ? { resultado: 'victoria', motivo: `${cuenta} de ${N} responden a la última llamada desde el refugio.` } : { resultado: 'derrota', motivo: `Solo ${cuenta} de ${N} estaban en pie dentro del refugio cuando llegó la última llamada.` }; }
      else if (M.objetivo === 'granja') G.fin = G.almacen.semillas >= 1 && G.almacen.bidon >= G.cantidad && enPie >= Math.ceil(N / 2) ? { resultado: 'victoria', motivo: 'Semillas, gasolina y gente suficiente: la granja tiene futuro.' } : { resultado: 'derrota', motivo: `La granja no arranca (semillas ${G.almacen.semillas}, bidones ${G.almacen.bidon}, en pie ${enPie}).` };
      else G.fin = { resultado: 'derrota', motivo: 'Se agotaron las rondas.' };
    }
  }
  if (G.fin) { G.fase = 'fin'; G.stats.rondas = G.ronda; aviso(G, G.fin.resultado === 'victoria' ? 'Victoria' : 'Derrota', G.fin.motivo, G.fin.resultado === 'victoria' ? 'bien' : 'peligro'); }
  return G.fin;
}
