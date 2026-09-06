// Z-2099 · simulador de equilibrio: jugadores automáticos con una heurística sencilla.
// Uso: node prototipo/sim.mjs [partidas=40] [misiones=todas] [jugadores=4,6,10]
import * as R from './src/reglas.js';
import { MISIONES, OBJETOS, RECETAS, PERSONAJES } from './src/datos.js';

const doce = Object.keys(PERSONAJES);
const N = +process.argv[2] || 40; const misiones = process.argv[3] && process.argv[3] !== 'todas' ? process.argv[3].split(',') : Object.keys(MISIONES); const tam = (process.argv[4] || '4,6,10').split(',').map(Number);

function bfs(G, desde, permitir) { const D = { [desde]: 0 }, P = {}, cola = [desde]; while (cola.length) { const k = cola.shift(); for (const v of R.vecinos(k)) { const c = G.casillas[v]; if (!c || D[v] != null || !permitir(c)) continue; D[v] = D[k] + 1; P[v] = k; cola.push(v); } } return { D, P }; }
function primerPaso(G, desde, hasta, permitir) { const { D, P } = bfs(G, desde, permitir); if (D[hasta] == null) return null; let k = hasta; while (P[k] && P[k] !== desde) k = P[k]; return P[k] === desde ? k : null; }
function objetivoBot(G, j) {
  const M = R.mision(G); const C = Object.values(G.casillas); const tiene = id => j.mano.some(c => c.id === id); const cuenta = id => j.mano.filter(c => c.id === id).length;
  const saqueable = c => ['edificio', 'gasolinera', 'farmacia', 'taller'].includes(c.tipo) && c.saqueos < 2 && !R.zombisEn(G, c.k).length;
  const cerca = (filtro) => C.filter(filtro).sort((a, b) => R.dist(a.k, j.pos) - R.dist(b.k, j.pos))[0];
  const oculta = () => cerca(c => !c.revelada);
  switch (M.objetivo) {
    case 'antibioticos_refugio': if (tiene('antibioticos')) return '0,0'; return (cerca(c => c.tipo === 'farmacia' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'todos_helipuerto': return G.especiales.helipuerto;
    case 'comida_refugio': if (cuenta('comida') >= 2) return '0,0'; return (cerca(c => c.tipo === 'edificio' && saqueable(c) && c.revelada) || oculta())?.k;
    case 'sobrevivir': case 'granja': if (M.objetivo === 'granja' && (tiene('bidon') || tiene('semillas'))) return '0,0'; if (M.objetivo === 'granja' && G.almacen.bidon < 2) return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k; return R.dist(j.pos, '0,0') > 2 ? '0,0' : (cerca(c => saqueable(c) && c.revelada && R.dist(c.k, '0,0') <= 3) || '0,0')?.k || '0,0';
    case 'torre': if (tiene('senuelo')) return G.especiales.torre; if (tiene('radio') && tiene('pilas')) return j.pos; return (cerca(c => c.tipo === 'taller' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'convoy': if (j.vehiculo) return cerca(c => R.esBorde(G, c.k) && ['calle', 'entrada', 'gasolinera'].includes(c.tipo))?.k; if (tiene('bidon') && (tiene('moto') || tiene('coche'))) return j.pos; if (!tiene('bidon')) return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k; return (cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'cuarentena': if (tiene('barricada')) return '0,0'; return (cerca(c => c.tipo === 'taller' && c.saqueos < 2) || cerca(c => saqueable(c) && c.revelada) || oculta())?.k;
    case 'deposito': if (tiene('bidon')) return G.especiales.generador; return (cerca(c => c.tipo === 'gasolinera' && c.saqueos < 2) || oculta())?.k;
    case 'suministros': return (cerca(c => c.revelada && c.marca === 'suministro') || cerca(c => !c.revelada && R.esBorde(G, c.k)))?.k;
    case 'cero': return cerca(c => !c.revelada && G.losetasBorde.includes(c.loseta))?.k;
    case 'protocolo': { if (['caminante', 'corredor', 'acorazado'].some(t => tiene('muestra_' + t))) return G.especiales.laboratorio; const z = Object.values(G.zombis).filter(z => ['caminante', 'corredor', 'acorazado'].includes(z.tipo) && !G.banderas['muestra_' + z.tipo] && !G.jugadores.some(x => x.mano.some(c => c.id === 'muestra_' + z.tipo))).sort((a, b) => R.dist(a.pos, j.pos) - R.dist(b.pos, j.pos))[0]; return z ? z.pos : oculta()?.k; }
  }
  return oculta()?.k;
}
function turnoBot(G) {
  const j = R.turnoActual(G); const T = G.turno; if (T.levantandose) return R.terminarTurno(G, true);
  const M = R.mision(G);
  // curarse
  if (j.mordido) { const t = j.mano.find(c => c.id === 'tratamiento') || j.mano.find(c => c.id === 'antibioticos'); if (t && T.acciones) R.curar(G, t.uid, j.id); else if (T.acciones && j.mano.some(c => c.id === 'botiquin') && j.mano.some(c => c.id === 'antibioticos') && G.recetasConocidas.includes('tratamiento')) { R.craftear(G, 'tratamiento'); const tt = j.mano.find(c => c.id === 'tratamiento'); if (tt && T.acciones) R.curar(G, tt.uid, j.id); } }
  if (j.vida <= 1 && T.acciones) { const b = j.mano.find(c => c.id === 'botiquin'); if (b) R.curar(G, b.uid, j.id); }
  // huir de una horda si se puede
  if (R.zombisEn(G, j.pos).some(R.esHorda)) { const huida = R.destinosPosibles(G).filter(k => !R.zombisEn(G, k).length).sort((a, b) => R.dist(a, '0,0') - R.dist(b, '0,0'))[0]; if (huida) R.mover(G, huida); }
  // combate en la casilla
  const mejorArma = (d) => R.armasDe(G, j).filter(a => d === 0 || OBJETOS[a.id].distancia).sort((a, b) => (OBJETOS[b.id].dados + (OBJETOS[b.id].extra || 0)) - (OBJETOS[a.id].dados + (OBJETOS[a.id].extra || 0)))[0];
  let guard = 0; while (T.acciones > 0 && guard++ < 4) { const o = R.objetivosAtaque(G).filter(x => x.d === 0)[0]; if (!o) break; const a = mejorArma(0); R.atacar(G, o.z.id, a?.uid); if (G.fin) return; }
  // disparo a distancia si el ruido lo permite
  if (T.acciones > 0 && G.ruido < 5) { const o = R.objetivosAtaque(G).filter(x => x.d > 0).sort((a, b) => a.d - b.d)[0]; const a = mejorArma(1); if (o && a && (OBJETOS[a.id].ruido === 0 || j.mano.some(c => c.id === 'silenciador') || R.esHorda(o.z) === false)) R.atacar(G, o.z.id, a.uid); }
  // crafteo útil
  const quiere = { torre: ['senuelo'], convoy: ['coche_dep', 'moto_dep'], cuarentena: ['barricada'] }[M.objetivo] || [];
  for (const r of [...quiere, 'bate_clavos', 'tratamiento', 'molotov', 'camuflaje', 'silenciador']) { if (T.acciones > 0 && G.recetasConocidas.includes(r) && !(r === 'tratamiento' && !j.mordido && !vivosMordidos(G))) { const ok = RECETAS[r].ing.every((ing, i) => j.mano.filter(c => c.id === ing).length >= RECETAS[r].ing.slice(0, i + 1).filter(x => x === ing).length); if (ok) R.craftear(G, r); } }
  // usar objetos de misión
  if (T.acciones > 0 && M.objetivo === 'cuarentena' && j.pos === '0,0') { const b = j.mano.find(c => c.id === 'barricada'); const v = R.vecinos('0,0').find(k => G.casillas[k] && !R.hayBarricada(G, '0,0', k)); if (b && v) R.usar(G, b.uid, v); }
  if (T.acciones > 0 && M.objetivo === 'torre' && j.pos === G.especiales.torre) { const s = j.mano.find(c => c.id === 'senuelo'); if (s && !G.casillas[j.pos].senuelo) R.usar(G, s.uid); }
  if (T.acciones > 0 && M.objetivo === 'convoy' && !j.vehiculo && j.pasajeroDe == null) { const v = j.mano.find(c => OBJETOS[c.id].porGas); if (v) R.vehiculo(G, v.uid); else { const c = R.conductoresDisponibles(G)[0]; if (c) R.subirPasajero(G, c.id); } }
  if (R.puedeSalir(G)) { R.salir(G); return R.terminarTurno(G, true); }
  // movimiento hacia el objetivo
  const permitir = c => !c.fuego && (!R.zombisEn(G, c.k).length || c.k === objetivo);
  let objetivo = objetivoBot(G, j); let pasos = 0;
  while (objetivo && objetivo !== j.pos && pasos++ < 8) { const paso = primerPaso(G, j.pos, objetivo, permitir); if (!paso || !R.destinosPosibles(G).includes(paso)) break; R.mover(G, paso); if (G.fin) return; if (M.objetivo === 'torre' && j.pos === objetivo) break; }
  // saquear si toca
  guard = 0; while (T.acciones > 0 && guard++ < 2) { const r = R.saquear(G); if (!r.ok) break; }
  if (T.acciones > 0 && !Object.values(G.zombis).some(z => R.dist(z.pos, j.pos) <= 2) && j.vida < j.vidaMax) R.descansar(G);
  // no terminar pegado a un zombi si queda paso
  if (T.pasos > 0 && R.vecinos(j.pos).concat(j.pos).some(k => R.zombisEn(G, k).length)) { const seguro = R.destinosPosibles(G).filter(k => !R.vecinos(k).concat(k).some(v => R.zombisEn(G, v).length))[0]; if (seguro) R.mover(G, seguro); }
  return R.terminarTurno(G, true);
}
function vivosMordidos(G) { return R.vivos(G).some(x => x.mordido); }
function turnoZombiBot(G) {
  const z = R.fichaZombi(G, G.zturno.jugadorId); const objetivo = z && R.vivos(G).sort((a, b) => R.dist(a.pos, z.pos) - R.dist(b.pos, z.pos))[0];
  if (z && objetivo) { let g = 0; while (G.zturno.acciones > 0 && g++ < 3) { if (R.jugadoresEn(G, z.pos).length) { R.zAtacar(G, R.jugadoresEn(G, z.pos)[0].id); continue; } const paso = primerPaso(G, z.pos, objetivo.pos, c => !c.fuego); if (!paso) break; if (!R.zMover(G, paso).ok) break; if (G.fin) return; } }
  if (G.zturno && G.zturno.acciones > 0) { const h = Object.values(G.zombis).filter(x => x.tipo !== 'jugador').sort((a, b) => a.n - b.n).pop(); const v = h && R.vivos(G).sort((a, b) => R.dist(a.pos, h.pos) - R.dist(b.pos, h.pos))[0]; if (h && v) { const paso = primerPaso(G, h.pos, v.pos, c => !c.fuego); if (paso) R.zMoverHorda(G, h.id, paso); } }
  if (!G.fin) R.zTerminar(G);
}
function jugar(misionId, n, semilla) {
  const jug = doce.slice(0, n).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p }));
  const G = R.nuevaPartida({ jugadores: jug, misionId, semilla }); let pasos = 0;
  while (!G.fin && pasos++ < 20000) { if (G.fase === 'turno') turnoBot(G); else if (G.fase === 'zombi') turnoZombiBot(G); else if (G.fase === 'decision') R.resolverDecision(G, false); else break; }
  if (!G.fin) throw new Error(`atascada ${misionId} n=${n} semilla=${semilla} fase=${G.fase}`);
  return G;
}
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
