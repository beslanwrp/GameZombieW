// Z-2099 · barrido de parámetros: mide cuánto mueve cada palanca la tasa de victoria de los bots.
//   node prototipo/barrido.mjs [partidas por celda=12]
// Cada fila cambia UN parámetro respecto a la base y juega todas las misiones con 4 y 10 jugadores.
import { PARAMS, MISIONES, MAZO_ZOMBIS } from './src/datos.js';
import { jugar } from './sim.mjs';
const N = +process.argv[2] || 12; const misiones = Object.keys(MISIONES); const base = JSON.parse(JSON.stringify(PARAMS));
const variantes = [
  ['base', {}],
  ['ruidoTopeBase 12', { ruidoTopeBase: 12 }], ['ruidoTopeBase 8', { ruidoTopeBase: 8 }],
  ['ruidoPorNoche 0', { ruidoPorNoche: 0 }], ['ruidoPorNoche 2', { ruidoPorNoche: 2 }],
  ['percepcion 3', { percepcion: 3 }], ['percepcion 6', { percepcion: 6 }],
  ['dadosDefensa 2', { dadosDefensa: 2 }],
  ['turnosContagio 6', { turnosContagio: 6 }],
  ['accionesPorRonda 3', { accionesPorRonda: 3 }],
  ['impactosPorCaminanteHorda 1', { impactosPorCaminanteHorda: 1 }], ['impactosPorCaminanteHorda 3', { impactosPorCaminanteHorda: 3 }],
  ['hardcore tardío', {}, { hardcoreTardio: true }],
];
function medir(cambios, opciones) {
  Object.assign(PARAMS, base, cambios); const r = { 4: [0, 0, 0], 10: [0, 0, 0] };
  for (const m of misiones) for (const n of [4, 10]) for (let i = 0; i < N; i++) { const G = jugar(m, n, 9000 + i * 31 + n, opciones); r[n][0]++; if (G.fin.resultado === 'victoria') r[n][1]++; r[n][2] += G.stats.conversiones || 0; }
  Object.assign(PARAMS, base); return r;
}
const pct = (a, b) => Math.round(100 * a / b).toString().padStart(3) + '%';
console.log(`Barrido · ${N} partidas por misión y tamaño · ${misiones.length} misiones\n`);
console.log(['Variante'.padEnd(30), 'Victoria 4j', 'Victoria 10j', 'Conv/partida 4j', 'Conv/partida 10j'].join('\t'));
let ref = null;
for (const [nombre, cambios, opciones] of variantes) {
  const r = medir(cambios, opciones || {}); if (!ref) ref = r;
  const d = (n) => { const v = 100 * r[n][1] / r[n][0], b = 100 * ref[n][1] / ref[n][0]; const diff = Math.round(v - b); return nombre === 'base' ? '' : ` (${diff >= 0 ? '+' : ''}${diff})`; };
  console.log([nombre.padEnd(30), pct(r[4][1], r[4][0]) + d(4), pct(r[10][1], r[10][0]) + d(10), (r[4][2] / r[4][0]).toFixed(1), (r[10][2] / r[10][0]).toFixed(1)].join('\t'));
}
