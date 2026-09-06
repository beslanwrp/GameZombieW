// Z-2099 · trazas doradas para el porte del motor a C#.
// Una traza guarda los parámetros de la partida, la secuencia de intenciones que los bots enviaron al motor
// y el registro completo que el motor produjo. Un porte correcto, alimentado con las mismas intenciones,
// debe producir el mismo registro línea a línea y el mismo final.
//   node prototipo/trazas.mjs generar [n=24]   → escribe prototipo/trazas/NNN.json
//   node prototipo/trazas.mjs verificar        → reproduce todas las trazas con el motor JS y compara
import * as Motor from './src/reglas.js';
import { MISIONES } from './src/datos.js';
import { jugar, doce } from './sim.mjs';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Funciones del motor que cambian el estado y reciben el estado G como primer argumento.
export const MUTADORAS = ['mover', 'rastrear', 'saquear', 'atacar', 'craftear', 'curar', 'amputar', 'triaje', 'sermon', 'compartirComida', 'levantar', 'dar', 'usar', 'vehiculo', 'subirPasajero', 'salir', 'descansar', 'terminarTurno', 'repetirDado', 'zMoverHorda', 'zMover', 'zAtacar', 'zOler', 'zOcultar', 'zTerminar', 'resolverDecision'];

export function motorGrabador(llamadas) {
  return new Proxy(Motor, { get(t, k) { const v = t[k]; if (typeof v === 'function' && MUTADORAS.includes(k)) return (G, ...args) => { llamadas.push([k, ...args.map(a => a === undefined ? null : a)]); return v(G, ...args); }; return v; } });
}
export function grabar(misionId, n, semilla, opciones = {}) {
  const llamadas = []; const G = jugar(misionId, n, semilla, opciones, motorGrabador(llamadas));
  return { version: 2, misionId, jugadores: doce.slice(0, n).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p })), semilla, opciones, llamadas, log: G.log.map(l => `${l.ronda}|${l.texto}`), fin: G.fin, resumen: resumen(G) };
}
export function resumen(G) { return { ronda: G.ronda, ruido: G.ruido, almacen: G.almacen, estados: G.jugadores.map(j => j.estado), zombis: Object.values(G.zombis).reduce((s, z) => s + z.n, 0), stats: G.stats }; }
export function reproducir(traza, motor = Motor) {
  const G = motor.nuevaPartida({ jugadores: traza.jugadores, misionId: traza.misionId, semilla: traza.semilla, opciones: traza.opciones });
  for (const [f, ...args] of traza.llamadas) { if (G.fin) break; motor[f](G, ...args.map(a => a === null ? undefined : a)); }
  return G;
}
export function comparar(traza, G) {
  const log = G.log.map(l => `${l.ronda}|${l.texto}`); const diferencias = [];
  for (let i = 0; i < Math.max(log.length, traza.log.length); i++) if (log[i] !== traza.log[i]) { diferencias.push({ linea: i, esperado: traza.log[i], obtenido: log[i] }); if (diferencias.length >= 3) break; }
  if (JSON.stringify(G.fin) !== JSON.stringify(traza.fin)) diferencias.push({ fin: true, esperado: traza.fin, obtenido: G.fin });
  if (JSON.stringify(resumen(G)) !== JSON.stringify(traza.resumen)) diferencias.push({ resumen: true });
  return diferencias;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'trazas'); const modo = process.argv[2] || 'verificar';
  if (modo === 'generar') {
    const n = +process.argv[3] || 24; mkdirSync(dir, { recursive: true }); const misiones = Object.keys(MISIONES); const tam = [4, 6, 10];
    for (let i = 0; i < n; i++) { const t = grabar(misiones[i % misiones.length], tam[i % tam.length], 5000 + i * 104729, { hardcoreTardio: i % 5 === 0 }); const nombre = String(i + 1).padStart(3, '0') + '.json'; writeFileSync(join(dir, nombre), JSON.stringify(t)); console.log(nombre, t.misionId, t.jugadores.length + ' jug', t.llamadas.length + ' intenciones', t.log.length + ' líneas', t.fin.resultado); }
  } else {
    let ok = 0, mal = 0;
    for (const f of readdirSync(dir).filter(x => x.endsWith('.json')).sort()) { const t = JSON.parse(readFileSync(join(dir, f), 'utf8')); const d = comparar(t, reproducir(t)); if (d.length) { mal++; console.log('DIFIERE', f, JSON.stringify(d[0]).slice(0, 200)); } else ok++; }
    console.log(`${ok} trazas reproducidas, ${mal} con diferencias`); if (mal) process.exit(1);
  }
}
