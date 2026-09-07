// Z-2099 · simulador de equilibrio: jugadores automáticos con una heurística sencilla.
// Uso: node prototipo/sim.mjs [partidas=40] [misiones=todas] [jugadores=4,6,10]
import * as Motor from './src/reglas.js';
import { MISIONES, OBJETOS, RECETAS, PERSONAJES } from './src/datos.js';
import { fileURLToPath } from 'node:url';

export const doce = Object.keys(PERSONAJES);
let R = Motor; // el motor en uso; jugar() puede sustituirlo por una versión que graba las llamadas

function bfs(G, desde, permitir) { const D = { [desde]: 0 }, P = {}, cola = [desde]; while (cola.length) { const k = cola.shift(); for (const v of R.vecinos(k)) { const c = G.casillas[v]; if (!c || D[v] != null || !permitir(c)) continue; D[v] = D[k] + 1; P[v] = k; cola.push(v); } } return { D, P }; }
function primerPaso(G, desde, hasta, permitir) { const { D, P } = bfs(G, desde, permitir); if (D[hasta] == null) return null; let k = hasta; while (P[k] && P[k] !== desde) k = P[k]; return P[k] === desde ? k : null; }
function objetivoBot(G, j) {
  const M = R.mision(G); if (j.mordido && j.mordido.sc && !j.mano.some(c => ['antibioticos', 'tratamiento'].includes(c.id))) return '0,0'; const C = Object.values(G.casillas); const tiene = id => j.mano.some(c => c.id === id); const cuenta = id => j.mano.filter(c => c.id === id).length;
  const saqueable = c => ['edificio', 'gasolinera', 'farmacia', 'taller'].includes(c.tipo) && c.saqueos < 2 && !R.zombisEn(G, c.k).length;
  const cerca = (filtro) => C.filter(filtro).sort((a, b) => R.dist(a.k, j.pos) - R.dist(b.k, j.pos))[0];
  const oculta = () => cerca(c => !c.revelada);
  switch (M.objetivo) {
    case 'antibioticos_refugio': if (tiene('antibioticos')) return '0,0'; return (cerca(c => c.tipo === 'farmacia' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'todos_helipuerto': return G.especiales.helipuerto;
    case 'comida_refugio': if (cuenta('comida') >= 2) return '0,0'; return (cerca(c => c.tipo === 'edificio' && saqueable(c) && c.revelada) || oculta())?.k;
    case 'sobrevivir': if (M.enRefugio && G.ronda >= M.rondas - 2) { const radio = M.enRefugio === true ? 0 : M.enRefugio; if (R.dist(j.pos, '0,0') > radio) { const libre = C.filter(c => R.dist(c.k, '0,0') <= radio && c.revelada && !R.zombisEn(G, c.k).length).sort((a, b) => R.dist(a.k, j.pos) - R.dist(b.k, j.pos))[0]; return libre ? libre.k : '0,0'; } return j.pos; } // falls through
    case 'granja': if (M.objetivo === 'granja' && (tiene('bidon') || tiene('semillas'))) return '0,0'; if (M.objetivo === 'granja' && G.almacen.bidon < G.cantidad) return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k; return R.dist(j.pos, '0,0') > 2 ? '0,0' : (cerca(c => saqueable(c) && c.revelada && R.dist(c.k, '0,0') <= 3) || '0,0')?.k || '0,0';
    case 'torre': if (tiene('senuelo') || G.casillas[G.especiales.torre].senuelo > 0) return G.especiales.torre; if (tiene('radio') && tiene('pilas')) return j.pos; return (cerca(c => c.tipo === 'taller' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'convoy': if (j.vehiculo && G.ronda <= 4 && R.pasajerosDe(G, j).length < OBJETOS[j.vehiculo.id].plazas && R.vivos(G).some(x => x.id !== j.id && !x.vehiculo && x.pasajeroDe == null && !x.mano.some(c => OBJETOS[c.id].porGas))) return j.pos; if (j.vehiculo) { const { D } = bfs(G, j.pos, c => !c.fuego && ['calle', 'refugio', 'entrada', 'helipuerto', 'gasolinera'].includes(c.tipo)); return C.filter(c => R.esBorde(G, c.k) && D[c.k] != null).sort((a, b) => D[a.k] - D[b.k])[0]?.k; } if (j.pasajeroDe != null) return j.pos; { const cond = R.vivos(G).find(x => x.id !== j.id && x.vehiculo); if (cond && !tiene('moto_dep') && !tiene('coche_dep')) return cond.pos; } if (tiene('bidon') && (tiene('moto') || tiene('coche'))) return j.pos; if (!tiene('bidon')) return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k; return (cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'cuarentena': if (tiene('barricada') || (tiene('tablas') && tiene('chapa') && G.recetasConocidas.includes('barricada'))) return '0,0'; return (cerca(c => c.tipo === 'taller' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'deposito': if (tiene('bidon')) return G.especiales.generador; return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k;
    case 'suministros': return (cerca(c => c.revelada && c.marca === 'suministro') || cerca(c => !c.revelada && R.esBorde(G, c.k)))?.k;
    case 'cero': return cerca(c => !c.revelada && G.losetasBorde.includes(c.loseta))?.k;
    case 'protocolo': { if (['caminante', 'corredor', 'acorazado'].some(t => tiene('muestra_' + t))) return G.especiales.laboratorio; const z = Object.values(G.zombis).filter(z => ['caminante', 'corredor', 'acorazado'].includes(z.tipo) && !G.banderas['muestra_' + z.tipo] && !G.jugadores.some(x => x.mano.some(c => c.id === 'muestra_' + z.tipo))).sort((a, b) => R.dist(a.pos, j.pos) - R.dist(b.pos, j.pos))[0]; return z ? z.pos : oculta()?.k; }
  }
  return oculta()?.k;
}
function amenaza(G, k) { let t = 0; for (const z of Object.values(G.zombis)) { const d = R.dist(z.pos, k); if (d <= 1) t += z.n * (d === 0 ? 3 : 1); else if (d === 2) t += z.n * 0.3; } return t; }
function turnoBot(G) {
  const j = R.turnoActual(G); const T = G.turno; if (T.levantandose) return R.terminarTurno(G, true);
  const M = R.mision(G); const tiene = id => j.mano.find(c => c.id === id); const puedeReceta = r => G.recetasConocidas.includes(r) && RECETAS[r].ing.every((ing, i) => j.mano.filter(c => c.id === ing).length >= RECETAS[r].ing.slice(0, i + 1).filter(x => x === ing).length);
  // 1. curarse o curar al compañero mordido
  const mordidos = R.vivos(G).filter(x => x.mordido && R.dist(x.pos, j.pos) <= 1 && (x.id === j.id || x.personajeId !== 'beatriz')).sort((a, b) => (a.id === j.id ? -1 : 1));
  for (const m of mordidos) { if (T.acciones <= 0) break; if (!tiene('tratamiento') && puedeReceta('tratamiento')) R.craftear(G, 'tratamiento'); const c = tiene('tratamiento') || tiene('antibioticos'); if (c) R.curar(G, c.uid, m.id); else if (m.id !== j.id && j.mano.some(x => OBJETOS[x.id].amputa) && R.reglaCA(G)) R.amputar(G, m.id); }
  if (T.acciones > 0 && j.vida <= 1) { const b = tiene('botiquin'); if (b) R.curar(G, b.uid, j.id); }
  const herido = R.vivos(G).find(x => x.id !== j.id && x.vida <= 1 && R.dist(x.pos, j.pos) <= 1 && x.personajeId !== 'beatriz'); if (T.acciones > 0 && herido && tiene('botiquin')) R.curar(G, tiene('botiquin').uid, herido.id);
  const caido = R.vivos(G).find(x => x.estado === 'caido' && R.dist(x.pos, j.pos) <= 1); if (T.acciones > 0 && caido) R.levantar(G, caido.id);
  // 2. peligro inmediato: molotov a una horda adyacente, señuelo si la horda viene, huir
  const hordaAdy = Object.values(G.zombis).filter(z => R.esHorda(z) && R.dist(z.pos, j.pos) === 1 && !R.jugadoresEn(G, z.pos).length)[0];
  if (T.acciones > 0 && hordaAdy && tiene('molotov')) R.usar(G, tiene('molotov').uid, hordaAdy.pos);
  const hordaCerca = Object.values(G.zombis).some(z => R.esHorda(z) && R.dist(z.pos, j.pos) <= 3);
  if (T.acciones > 0 && hordaCerca && tiene('senuelo') && !G.casillas[j.pos].senuelo && R.dist(j.pos, '0,0') > 1) R.usar(G, tiene('senuelo').uid);
  if (T.acciones > 0 && hordaCerca && tiene('camuflaje') && !j.camuflaje) R.usar(G, tiene('camuflaje').uid);
  if (R.zombisEn(G, j.pos).some(R.esHorda) || (R.zombisEn(G, j.pos).length && j.vida <= 1)) { const huida = R.destinosPosibles(G).filter(k => !R.zombisEn(G, k).length).sort((a, b) => amenaza(G, a) - amenaza(G, b))[0]; if (huida) R.mover(G, huida); }
  // 3. combate: lo que hay en la casilla, con la mejor arma; a distancia solo objetivos que valgan la pena y sin disparar la alarma
  const mejorArma = (d) => R.armasDe(G, j).filter(a => d === 0 || OBJETOS[a.id].distancia).sort((a, b) => (OBJETOS[b.id].dados + (OBJETOS[b.id].extra || 0)) - (OBJETOS[a.id].dados + (OBJETOS[a.id].extra || 0)))[0];
  let guard = 0; while (T.acciones > 0 && guard++ < 4) { const o = R.objetivosAtaque(G).filter(x => x.d === 0).sort((a, b) => a.z.n - b.z.n)[0]; if (!o) break; if (R.esHorda(o.z) && T.pasos > 0) break; R.atacar(G, o.z.id, mejorArma(0)?.uid); if (G.fin) return; }
  if (T.acciones > 0) { const o = R.objetivosAtaque(G).filter(x => x.d > 0 && !R.esHorda(x.z) && x.z.tipo !== 'acorazado').sort((a, b) => a.d - b.d)[0]; const a = mejorArma(1); if (o && a && (OBJETOS[a.id].ruido === 0 || tiene('silenciador') || G.ruido <= G.escalado.ruidoTope - 4)) R.atacar(G, o.z.id, a.uid); }
  // 4. crafteo útil para la misión y para sobrevivir
  const quiere = { torre: ['senuelo'], convoy: ['coche_dep', 'moto_dep'], cuarentena: ['barricada'], deposito: [], protocolo: ['silenciador'] }[M.objetivo] || [];
  for (const r of [...quiere, 'bate_clavos', 'molotov', 'camuflaje', 'silenciador', 'enlace']) if (T.acciones > 0 && puedeReceta(r) && !(r === 'enlace' && G.enlaces.length)) R.craftear(G, r);
  if (T.acciones > 0 && M.objetivo === 'cuarentena' && j.pos === '0,0') { const b = tiene('barricada'); const v = R.vecinos('0,0').find(k => G.casillas[k] && !R.hayBarricada(G, '0,0', k)); if (b && v) R.usar(G, b.uid, v); }
  if (T.acciones > 0 && M.objetivo === 'torre' && j.pos === G.especiales.torre) { const sn = tiene('senuelo'); if (sn && !G.casillas[j.pos].senuelo) R.usar(G, sn.uid); }
  if (T.acciones > 0 && M.objetivo === 'convoy' && !j.vehiculo && j.pasajeroDe == null) { const v = j.mano.find(c => OBJETOS[c.id].porGas); if (v && j.personajeId !== 'ruy') R.vehiculo(G, v.uid); else { const c = R.conductoresDisponibles(G)[0]; if (c) R.subirPasajero(G, c.id); } }
  if (R.puedeSalir(G)) { R.salir(G); return R.terminarTurno(G, true); }
  { const obj0 = objetivoBot(G, j); const v = j.mano.find(c => OBJETOS[c.id].porGas); if (T.acciones > 0 && v && !j.vehiculo && j.pasajeroDe == null && j.personajeId !== 'ruy' && obj0 && R.dist(j.pos, obj0) > 3 && v.gas >= 1) R.vehiculo(G, v.uid); if (T.acciones > 0 && j.vehiculo && j.vehiculo.gas < 1 && tiene('bidon')) R.usar(G, tiene('bidon').uid); if (T.acciones > 0 && j.vehiculo && j.vehiculo.gas < 1 && !tiene('bidon') && M.objetivo !== 'convoy') R.vehiculo(G); }
  // 5. moverse hacia el objetivo evitando terminar junto a zombis
  let objetivo = objetivoBot(G, j); const CALLE = ['calle', 'refugio', 'entrada', 'helipuerto', 'gasolinera', 'generador', 'torre', 'laboratorio']; const permitir = c => !c.fuego && (!R.zombisEn(G, c.k).length || c.k === objetivo) && (!j.vehiculo || CALLE.includes(c.tipo));
  let pasos = 0; while (objetivo && objetivo !== j.pos && pasos++ < 8) { const paso = primerPaso(G, j.pos, objetivo, permitir); if (!paso || !R.destinosPosibles(G).includes(paso)) break; const ultimo = R.costeMovimiento(G, j, paso).coste >= T.pasos; if (ultimo && paso !== objetivo && amenaza(G, paso) > amenaza(G, j.pos) + 1) break; R.mover(G, paso); if (G.fin) return; if (M.objetivo === 'torre' && j.pos === objetivo) break; }
  // 6. saquear, juntar ingredientes de la receta de misión en un solo jugador, dar cartas de misión al que va al refugio, descansar
  for (const r of quiere) { if (T.acciones <= 0 || !G.recetasConocidas.includes(r)) break; const ing = RECETAS[r].ing; const mios = j.mano.filter(c => ing.includes(c.id)); if (!mios.length) continue; const socio = R.destinatarios(G).find(x => x.mano.filter(c => ing.includes(c.id)).length > mios.length && R.peso(G, x) + mios.length <= R.capacidad(G, x)); if (socio) { R.dar(G, socio.id, mios.map(c => c.uid)); break; } }
  guard = 0; while (T.acciones > 0 && guard++ < 2) { const r = R.saquear(G); if (!r.ok) break; }
  if (T.acciones > 0) { const util = { antibioticos_refugio: 'antibioticos', comida_refugio: 'comida', deposito: 'bidon', granja: 'bidon' }[M.objetivo]; if (util) { const dest = R.destinatarios(G).find(x => R.dist(x.pos, j.pos) <= 1 && R.dist(x.pos, '0,0') < R.dist(j.pos, '0,0') && x.mano.filter(c => c.id === util).length >= 1); const cs = j.mano.filter(c => c.id === util); if (dest && cs.length && R.peso(G, dest) + cs.length <= R.capacidad(G, dest)) R.dar(G, dest.id, cs.map(c => c.uid)); } }
  if (T.acciones > 0 && !Object.values(G.zombis).some(z => R.dist(z.pos, j.pos) <= 2) && (j.vida < j.vidaMax || j.panico > 0)) R.descansar(G);
  if (T.pasos > 0 && R.vecinos(j.pos).concat(j.pos).some(k => R.zombisEn(G, k).length)) { const seguro = R.destinosPosibles(G).filter(k => !R.zombisEn(G, k).length).sort((a, b) => amenaza(G, a) - amenaza(G, b))[0]; if (seguro && amenaza(G, seguro) < amenaza(G, j.pos)) R.mover(G, seguro); }
  return R.terminarTurno(G, true);
}
function vivosMordidos(G) { return R.vivos(G).some(x => x.mordido); }
function turnoZombiBot(G) {
  const z = R.fichaZombi(G, G.zturno.jugadorId); const objetivo = z && R.vivos(G).sort((a, b) => R.dist(a.pos, z.pos) - R.dist(b.pos, z.pos))[0];
  if (z && objetivo) { let g = 0; while (G.zturno.acciones > 0 && g++ < 3) { if (R.jugadoresEn(G, z.pos).length) { R.zAtacar(G, R.jugadoresEn(G, z.pos)[0].id); continue; } const paso = primerPaso(G, z.pos, objetivo.pos, c => !c.fuego); if (!paso) break; if (!R.zMover(G, paso).ok) break; if (G.fin) return; } }
  if (G.zturno && G.zturno.acciones > 0) { const h = Object.values(G.zombis).filter(x => x.tipo !== 'jugador').sort((a, b) => a.n - b.n).pop(); const v = h && R.vivos(G).sort((a, b) => R.dist(a.pos, h.pos) - R.dist(b.pos, h.pos))[0]; if (h && v) { const paso = primerPaso(G, h.pos, v.pos, c => !c.fuego); if (paso) R.zMoverHorda(G, h.id, paso); } }
  if (!G.fin) R.zTerminar(G);
}
export function jugar(misionId, n, semilla, opciones = {}, motor = Motor) {
  R = motor; const jug = doce.slice(0, n).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p }));
  const G = R.nuevaPartida({ jugadores: jug, misionId, semilla, opciones }); let pasos = 0;
  while (!G.fin && pasos++ < 20000) { if (G.fase === 'turno') turnoBot(G); else if (G.fase === 'zombi') turnoZombiBot(G); else if (G.fase === 'decision') R.resolverDecision(G, false); else break; }
  if (!G.fin) throw new Error(`atascada ${misionId} n=${n} semilla=${semilla} fase=${G.fase}`);
  R = Motor; return G;
}

export function narrar(misionId, n, semilla, opciones = {}) { const G = jugar(misionId, n, semilla, opciones); const claves = /Mordisco|Conversión|Carta de horda|Victoria|Derrota|Evento|se salva|amputa|craftea|deja |recoge un suministro|entrega|salen de|transmite|Loseta de borde|Muerte/; const lineas = G.log.filter(l => claves.test(l.texto)).map(l => `R${l.ronda} ${l.texto}`); return { G, lineas }; }

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1] && process.argv[2] === 'narrar') { const { G, lineas } = narrar(process.argv[3], +process.argv[4] || 4, +process.argv[5] || 1); console.log(lineas.join('\n')); console.log('FIN', G.fin.resultado, G.fin.motivo, 'ronda', G.ronda, JSON.stringify(G.stats)); }
else if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
const N = +process.argv[2] || 40; const misiones = process.argv[3] && process.argv[3] !== 'todas' ? process.argv[3].split(',') : Object.keys(MISIONES); const tam = (process.argv[4] || '4,6,10').split(',').map(Number);
const filas = [];
for (const m of misiones) for (const n of tam) {
  const acc = { victorias: 0, rondas: 0, primeraHorda: [], mordiscos: 0, conversiones: 0, hordas: 0, crafteos: 0, curas: 0, zombiGana: 0, ruidoFin: 0, mordisco_fase: 0, mordisco_combate: 0, mordisco_dado: 0 };
  for (let i = 0; i < N; i++) { const G = jugar(m, n, 1000 + i * 7919 + n); if (G.fin.resultado === 'victoria') acc.victorias++; if (/bando zombi/.test(G.fin.motivo)) acc.zombiGana++; acc.rondas += G.ronda; if (G.banderas.primeraHorda) acc.primeraHorda.push(G.banderas.primeraHorda); for (const k of ['mordiscos', 'conversiones', 'hordas', 'crafteos', 'curas', 'mordisco_fase', 'mordisco_combate', 'mordisco_dado']) acc[k] += G.stats[k] || 0; acc.ruidoFin += G.ruido; }
  const med = a => a.length ? (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) : '-';
  filas.push({ mision: MISIONES[m].nombre.padEnd(26), jug: n, victoria: Math.round(100 * acc.victorias / N) + '%', zombiGana: Math.round(100 * acc.zombiGana / N) + '%', rondas: (acc.rondas / N).toFixed(1), horda1: med(acc.primeraHorda), mordiscos: (acc.mordiscos / N).toFixed(1), conversiones: (acc.conversiones / N).toFixed(1), hordas: (acc.hordas / N).toFixed(1), crafteos: (acc.crafteos / N).toFixed(1), curas: (acc.curas / N).toFixed(1), origen: `${(acc.mordisco_fase / N).toFixed(1)}/${(acc.mordisco_combate / N).toFixed(1)}/${(acc.mordisco_dado / N).toFixed(1)}` });
}
console.log(`Z-2099 · ${N} partidas por fila · bots heurísticos\n`);
console.log(['Misión'.padEnd(26), 'Jug', 'Victoria', 'Zombi', 'Rondas', 'Horda1', 'Mord', 'Conv', 'Hordas', 'Craft', 'Curas', 'Mord fase/comb/dado'].join('\t'));
for (const f of filas) console.log([f.mision, f.jug, f.victoria, f.zombiGana, f.rondas, f.horda1, f.mordiscos, f.conversiones, f.hordas, f.crafteos, f.curas, f.origen].join('\t'));
}
