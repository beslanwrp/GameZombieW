// Z-2099 · servidor de partida para varios móviles en la misma wifi (o en internet si se expone el puerto).
// Sin dependencias. El servidor es el anfitrión: aplica las reglas y envía a cada móvil su vista privada.
//   node prototipo/servidor.mjs [puerto=8080]
// Después, cada jugador abre http://<ip-del-portátil>:8080 en su móvil. La pantalla compartida: http://<ip>:8080/mesa
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as R from './src/reglas.js';
import { MISIONES, PERSONAJES } from './src/datos.js';
import { MUTADORAS } from './trazas.mjs';

const PUERTO = +process.argv[2] || +process.env.PUERTO || 8080;
const DIR = dirname(fileURLToPath(import.meta.url));
const salas = new Map();
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const nuevoCodigo = () => { let c; do { c = Array.from({ length: 4 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join(''); } while (salas.has(c)); return c; };
const nuevoToken = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

function vista(sala, asiento) {
  const v = { codigo: sala.codigo, fase: sala.fase, miAsiento: asiento, anfitrion: asiento === 0, misionId: sala.misionId, opciones: sala.opciones,
    asientos: sala.asientos.map(a => ({ asiento: a.asiento, nombre: a.nombre, personajeId: a.personajeId || null, elegido: !!a.personajeId, conectado: a.clientes.size > 0 })), espectadores: sala.espectadores.length };
  if (sala.fase === 'reparto' && asiento >= 0) v.oferta = sala.asientos[asiento].oferta;
  if (sala.G) { const G = JSON.parse(JSON.stringify(sala.G)); G.jugadores.forEach(j => { if (j.id !== asiento) j.mano = j.mano.map(c => ({ uid: c.uid, id: 'cinta', oculta: true })); }); v.G = G; }
  return v;
}
function difundir(sala) { for (const a of sala.asientos) for (const res of a.clientes) enviar(res, vista(sala, a.asiento)); for (const e of sala.espectadores) for (const res of e.clientes) enviar(res, vista(sala, -1)); }
function enviar(res, dato) { try { res.write(`data: ${JSON.stringify(dato)}\n\n`); } catch (e) { } }

function actorPermitido(sala, asiento, f) {
  const G = sala.G; if (!G || G.fin) return 'La partida ha terminado';
  const esAnfitrion = asiento === 0;
  if (G.fase === 'turno') { const actual = R.turnoActual(G); if (actual.id === asiento) return null; if (f === 'repetirDado' && G.jugadores[asiento]?.personajeId === 'elias') return null; if (esAnfitrion && f === 'terminarTurno') return null; return `Es el turno de ${actual.nombre}`; }
  if (G.fase === 'zombi') { if (G.zturno.jugadorId === asiento) return null; if (esAnfitrion && f === 'zTerminar') return null; return 'Actúa el jugador zombi'; }
  if (G.fase === 'decision') { if (G.decision.jugadorId === asiento) return null; if (esAnfitrion && f === 'resolverDecision') return null; return 'Beatriz está decidiendo'; }
  return 'Espera un momento';
}

async function cuerpo(req) { return new Promise(res => { let d = ''; req.on('data', c => d += c); req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch (e) { res({}); } }); }); }
function json(res, code, obj) { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(obj)); }
function buscar(sala, token) { const a = sala.asientos.find(x => x.token === token); if (a) return { asiento: a.asiento, obj: a }; const e = sala.espectadores.find(x => x.token === token); if (e) return { asiento: -1, obj: e }; return null; }

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); const ruta = url.pathname;
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST' }); return res.end(); }
  if (req.method === 'GET' && (ruta === '/' || ruta === '/index.html' || ruta === '/mesa')) { let html; try { html = readFileSync(join(DIR, 'dist', 'index.html')); } catch (e) { res.writeHead(500); return res.end('Falta prototipo/dist/index.html: ejecuta node prototipo/build.mjs'); } res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html); }
  if (ruta === '/api/ping') return json(res, 200, { ok: true, servidor: 'z2099', salas: salas.size });
  if (req.method === 'POST' && ruta === '/api/sala') {
    const b = await cuerpo(req); const codigo = nuevoCodigo(); const token = nuevoToken();
    const sala = { codigo, creada: Date.now(), fase: 'sala', misionId: b.misionId && MISIONES[b.misionId] ? b.misionId : Object.keys(MISIONES)[Math.floor(Math.random() * 12)], opciones: { hardcoreTardio: !!(b.opciones && b.opciones.hardcoreTardio), mapa: b.opciones && b.opciones.mapa === 'medio' ? 'medio' : 'grande' }, asientos: [{ asiento: 0, nombre: String(b.nombre || 'Anfitrión').slice(0, 14), token, clientes: new Set() }], espectadores: [], G: null };
    salas.set(codigo, sala); return json(res, 200, { ok: true, codigo, token, asiento: 0 });
  }
  const m = ruta.match(/^\/api\/sala\/([A-Z]{4})\/(\w+)$/); if (!m) return json(res, 404, { ok: false, motivo: 'Ruta desconocida' });
  const sala = salas.get(m[1]); if (!sala) return json(res, 404, { ok: false, motivo: 'Esa sala no existe' }); const op = m[2];
  if (op === 'eventos') {
    const q = buscar(sala, url.searchParams.get('token')); if (!q) return json(res, 403, { ok: false, motivo: 'Token no válido' });
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'access-control-allow-origin': '*' });
    q.obj.clientes.add(res); enviar(res, vista(sala, q.asiento)); const latido = setInterval(() => { try { res.write(': latido\n\n'); } catch (e) { } }, 20000);
    req.on('close', () => { clearInterval(latido); q.obj.clientes.delete(res); difundir(sala); }); difundir(sala); return;
  }
  const b = await cuerpo(req);
  if (op === 'unirse') {
    if (b.espectador) { const token = nuevoToken(); sala.espectadores.push({ token, clientes: new Set() }); return json(res, 200, { ok: true, codigo: sala.codigo, token, asiento: -1 }); }
    if (sala.fase !== 'sala') return json(res, 409, { ok: false, motivo: 'La partida ya ha empezado. Puedes entrar como pantalla compartida.' });
    if (sala.asientos.length >= 10) return json(res, 409, { ok: false, motivo: 'La sala está llena (10)' });
    const token = nuevoToken(); const asiento = sala.asientos.length; sala.asientos.push({ asiento, nombre: String(b.nombre || 'Jugador ' + (asiento + 1)).slice(0, 14), token, clientes: new Set() }); difundir(sala); return json(res, 200, { ok: true, codigo: sala.codigo, token, asiento });
  }
  const q = buscar(sala, b.token); if (!q) return json(res, 403, { ok: false, motivo: 'Token no válido' });
  if (op === 'configurar') { if (q.asiento !== 0) return json(res, 403, { ok: false, motivo: 'Solo el anfitrión' }); if (sala.fase !== 'sala') return json(res, 409, { ok: false, motivo: 'Ya ha empezado' }); if (b.misionId && MISIONES[b.misionId]) sala.misionId = b.misionId; if (b.opciones) sala.opciones = { hardcoreTardio: !!b.opciones.hardcoreTardio, mapa: b.opciones.mapa === 'medio' ? 'medio' : 'grande' }; difundir(sala); return json(res, 200, { ok: true }); }
  if (op === 'empezar') {
    if (q.asiento !== 0) return json(res, 403, { ok: false, motivo: 'Solo el anfitrión' }); if (sala.fase !== 'sala') return json(res, 409, { ok: false, motivo: 'Ya ha empezado' }); if (sala.asientos.length < 2) return json(res, 409, { ok: false, motivo: 'Hacen falta al menos 2 jugadores' });
    const pool = Object.keys(PERSONAJES).sort(() => Math.random() - .5); sala.asientos.forEach((a, i) => { a.oferta = [pool[(2 * i) % pool.length], pool[(2 * i + 1) % pool.length]]; a.personajeId = null; });
    sala.fase = 'reparto'; difundir(sala); return json(res, 200, { ok: true });
  }
  if (op === 'elegir') {
    if (sala.fase !== 'reparto' || q.asiento < 0) return json(res, 409, { ok: false, motivo: 'No toca elegir' }); const a = q.obj; if (!a.oferta.includes(b.personajeId)) return json(res, 400, { ok: false, motivo: 'Ese personaje no está en tu oferta' });
    if (sala.asientos.some(x => x.personajeId === b.personajeId && x !== a)) return json(res, 409, { ok: false, motivo: 'Otro jugador ya lo ha elegido' }); a.personajeId = b.personajeId;
    if (sala.asientos.every(x => x.personajeId)) { sala.G = R.nuevaPartida({ jugadores: sala.asientos.map(x => ({ nombre: x.nombre, personajeId: x.personajeId })), misionId: sala.misionId, semilla: Math.floor(Math.random() * 1e9), opciones: sala.opciones }); sala.fase = 'juego'; }
    difundir(sala); return json(res, 200, { ok: true });
  }
  if (op === 'accion') {
    if (q.asiento < 0) return json(res, 403, { ok: false, motivo: 'La pantalla compartida solo mira' }); if (!MUTADORAS.includes(b.f)) return json(res, 400, { ok: false, motivo: 'Acción desconocida' });
    const veto = actorPermitido(sala, q.asiento, b.f); if (veto) return json(res, 200, { ok: true, resultado: { ok: false, motivo: veto }, vista: vista(sala, q.asiento) });
    let resultado; try { resultado = R[b.f](sala.G, ...(Array.isArray(b.args) ? b.args : [])); } catch (e) { console.error('Error aplicando', b.f, e); resultado = { ok: false, motivo: 'Error interno: ' + e.message }; }
    difundir(sala); return json(res, 200, { ok: true, resultado: resultado ?? { ok: true }, vista: vista(sala, q.asiento) });
  }
  return json(res, 404, { ok: false, motivo: 'Operación desconocida' });
});
// Limpieza de salas viejas (4 horas sin actividad de creación)
setInterval(() => { const ahora = Date.now(); for (const [c, s] of salas) if (ahora - s.creada > 4 * 3600e3 && ![...s.asientos].some(a => a.clientes.size)) salas.delete(c); }, 600e3).unref();

servidor.listen(PUERTO, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log(`Z-2099 · servidor de partida en el puerto ${PUERTO}`);
  console.log('Cada jugador abre en su móvil una de estas direcciones (misma wifi):');
  for (const ip of ips) console.log(`  http://${ip}:${PUERTO}      pantalla compartida: http://${ip}:${PUERTO}/mesa`);
  if (!ips.length) console.log(`  http://localhost:${PUERTO}`);
});
export { servidor, salas };
