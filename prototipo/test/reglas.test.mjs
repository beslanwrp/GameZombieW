import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/reglas.js';
import { PARAMS, RECETAS, OBJETOS } from '../src/datos.js';

const seis = ['elias', 'sunja', 'tomas', 'naima', 'kenji', 'beatriz'];
function partida(n = 4, misionId = 'farmacia', semilla = 42) { return R.nuevaPartida({ jugadores: seis.slice(0, n).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p })), misionId, semilla }); }

test('el tablero tiene unas 120 casillas, 8 entradas y garantías', () => {
  const G = partida(); const n = Object.keys(G.casillas).length;
  assert.ok(n >= 105 && n <= 135, 'casillas: ' + n);
  assert.equal(G.entradas.length, 8);
  const tipos = {}; for (const c of Object.values(G.casillas)) tipos[c.tipo] = (tipos[c.tipo] || 0) + 1;
  assert.ok(tipos.farmacia >= 2 && tipos.gasolinera >= 3 && tipos.taller >= 2, JSON.stringify(tipos));
  assert.equal(G.casillas['0,0'].tipo, 'refugio');
  const reveladas = Object.values(G.casillas).filter(c => c.revelada).length; assert.ok(reveladas >= 40 && reveladas <= 49, 'reveladas ' + reveladas);
});
test('cada casilla pertenece a exactamente una loseta de 7 y los centros son válidos', () => {
  const G = partida(); for (const c of Object.values(G.casillas)) { const centro = R.centroLoseta(c.k); assert.ok(centro); assert.ok(R.dist(c.k, centro) <= 1); }
});
test('los dados tienen la distribución de caras esperada', () => {
  const G = { semilla: 7 }; const cnt = {}; for (let i = 0; i < 6000; i++) { const d = R.tirarDado(G); cnt[d] = (cnt[d] || 0) + 1; }
  assert.ok(cnt.paso > 2700 && cnt.paso < 3300); assert.ok(cnt.mordisco > 800 && cnt.mordisco < 1200);
});
test('la misma semilla da la misma partida', () => { const a = partida(4, 'farmacia', 9), b = partida(4, 'farmacia', 9); assert.deepEqual(a.casillas, b.casillas); assert.deepEqual(a.turno, b.turno); });
test('el orden de turno sigue la iniciativa', () => { const G = partida(4); assert.deepEqual(G.orden.map(id => G.jugadores[id].personajeId), ['sunja', 'elias', 'tomas', 'naima']); });
test('mover gasta pasos y revela losetas ocultas', () => {
  const G = partida(4, 'farmacia', 3); const j = R.turnoActual(G);
  const antes = G.turno.pasos; const dest = R.destinosPosibles(G)[0]; if (!dest) return;
  const res = R.mover(G, dest); assert.ok(res.ok); assert.equal(j.pos, dest); assert.ok(G.turno.pasos < antes || G.casillas[dest].tipo === 'calle');
});
test('el combate elimina zombis y aplica el mordisco según la misión', () => {
  const G = partida(4, 'farmacia', 5); const j = R.turnoActual(G);
  const z = R.ponerZombi(G, 'caminante', 1, j.pos); let intentos = 0;
  while (G.zombis[z.id] && intentos++ < 20) { G.turno.acciones = 2; R.atacar(G, z.id, null); }
  assert.ok(!G.zombis[z.id], 'el caminante acaba muriendo');
  R.herir(G, j, 1, 'prueba'); assert.equal(j.mordido.turnos, PARAMS.turnosContagio);
});
test('la horda pierde un caminante por cada 2 impactos (Sunja: uno por impacto, máximo 2)', () => {
  const G = partida(4, 'farmacia', 11); const j = R.turnoActual(G);
  const z = R.ponerZombi(G, 'caminante', 5, j.pos); assert.ok(R.esHorda(z));
  G.turno.acciones = 1; const r = R.atacar(G, z.id, null); assert.ok(r.ok);
  const esperado = j.personajeId === 'sunja' ? Math.min(2, r.impactos) : Math.min(5, Math.floor(r.impactos / 2)); assert.equal(r.muertos, esperado);
});
test('crafteo consume ingredientes y produce el resultado', () => {
  const G = partida(4, 'farmacia', 2); const j = R.turnoActual(G); j.mano.push(R.carta(G, 'bidon'), R.carta(G, 'moto'));
  const r = R.craftear(G, 'moto_dep'); assert.ok(r.ok, r.motivo); assert.ok(j.mano.some(c => c.id === 'moto_dep')); assert.ok(!j.mano.some(c => c.id === 'moto'));
  assert.equal(R.craftear(G, 'coche_dep').ok, false, 'receta desconocida');
});
test('la noche sube el ruido y en el tope llega una horda', () => {
  const G = partida(4, 'farmacia', 8); G.ruido = G.escalado.ruidoTope - 1; const zombisAntes = Object.values(G.zombis).reduce((s, z) => s + z.n, 0);
  R.faseNoche(G); assert.equal(G.ruido, G.escalado.ruidoTrasHorda); assert.ok(Object.values(G.zombis).reduce((s, z) => s + z.n, 0) > zombisAntes); assert.equal(G.ronda, 2);
});
test('hardcore convierte al mordido en la noche y crea la ficha zombi', () => {
  const G = partida(4, 'invierno', 13); const j = G.jugadores[0]; R.herir(G, j, 1, 'prueba'); assert.ok(j.mordido.hc);
  R.faseNoche(G); assert.equal(j.estado, 'zombi'); assert.ok(R.fichaZombi(G, j.id));
});
test('sin contagio: un mordisco sin anular hace fracasar; el tratamiento lo anula', () => {
  let G = partida(4, 'sin_gota', 21); let j = G.jugadores[0]; R.herir(G, j, 1, 'prueba'); R.faseNoche(G); assert.equal(G.fin, null, 'una ronda de margen'); G.fase = 'noche'; R.faseNoche(G); assert.equal(G.fin.resultado, 'derrota');
  G = partida(4, 'sin_gota', 21); j = R.turnoActual(G); R.herir(G, j, 1, 'prueba'); j.mano.push(R.carta(G, 'tratamiento')); G.turno.acciones = 1;
  const r = R.curar(G, j.mano.find(c => c.id === 'tratamiento').uid, j.id); assert.ok(r.ok, r.motivo); assert.equal(j.mordido, null); R.faseNoche(G); assert.equal(G.fin, null);
});
test('el bando zombi gana al alcanzar la mitad del equipo (o a todos con menos de 4)', () => {
  let G = partida(4, 'invierno', 1); R.convertir(G, G.jugadores[0], 'p'); R.convertir(G, G.jugadores[1], 'p'); R.comprobarFin(G); assert.equal(G.fin, null); R.convertir(G, G.jugadores[2], 'p'); R.comprobarFin(G); assert.equal(G.fin.resultado, 'derrota');
  G = partida(2, 'invierno', 1); R.convertir(G, G.jugadores[0], 'p'); R.comprobarFin(G); assert.equal(G.fin, null);
});
test('objetivo de Invierno: la comida se deposita al terminar turno en el refugio', () => {
  const G = partida(4, 'invierno', 4); const j = R.turnoActual(G); for (let i = 0; i < 10; i++) j.mano.push(R.carta(G, 'comida'));
  R.terminarTurno(G); assert.equal(G.almacen.comida, 10); G.ronda = 3; R.comprobarFin(G, true); assert.equal(G.fin.resultado, 'victoria');
});
test('una partida automática con acciones al azar termina sin errores', () => {
  for (const m of ['farmacia', 'sin_gota', 'invierno', 'ultima']) {
    const G = partida(6, m, 99); let pasos = 0;
    while (!G.fin && pasos++ < 3000) {
      if (G.fase === 'turno') { const d = R.destinosPosibles(G); if (d.length && R.rnd(G) < .7) R.mover(G, d[R.entero(G, d.length)]); const o = R.objetivosAtaque(G); if (o.length) R.atacar(G, o[0].z.id, R.armasDe(G, R.turnoActual(G))[0]?.uid); else R.saquear(G); R.terminarTurno(G); }
      else if (G.fase === 'zombi') { const z = R.fichaZombi(G, G.zturno.jugadorId); if (z) { const v = R.vecinos(z.pos).filter(k => G.casillas[k]); R.zMover(G, v[0]); } R.zTerminar(G); }
      else if (G.fase === 'decision') R.resolverDecision(G, false);
      else break;
    }
    assert.ok(G.fin, `${m} debe terminar (fase ${G.fase}, ronda ${G.ronda})`);
    JSON.stringify(G); // serializable
  }
});

const doce = ['elias', 'sunja', 'tomas', 'naima', 'ruy', 'marga', 'anselmo', 'kenji', 'beatriz', 'omar', 'lidia', 'ceniza'];
function partida10(misionId, semilla = 5) { return R.nuevaPartida({ jugadores: doce.slice(0, 10).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p })), misionId, semilla }); }
test('diez jugadores y doce personajes: la partida arranca con escalado alto', () => { const G = partida10('farmacia'); assert.equal(G.jugadores.length, 10); assert.equal(G.escalado.horda, 9); assert.equal(G.ruido, 3); assert.equal(G.escalado.ruidoTope, 16); });
test('cada misión genera sus casillas especiales', async () => {
  for (const [id, M] of Object.entries((await import('../src/datos.js')).MISIONES)) { const G = partida10(id, 77); if (M.especial) assert.ok(G.especiales[M.especial], id); if (M.suministros) assert.equal(Object.values(G.casillas).filter(c => c.marca === 'suministro').length, 5); }
});
test('barricadas: los zombis las derriban y los jugadores las cruzan', () => {
  const G = partida10('cuarentena', 8); const j = R.turnoActual(G); const v = R.vecinos(j.pos).find(k => G.casillas[k]); j.mano.push(R.carta(G, 'barricada'));
  const r = R.usar(G, j.mano.at(-1).uid, v); assert.ok(r.ok, r.motivo); assert.ok(R.hayBarricada(G, j.pos, v));
  const z = R.ponerZombi(G, 'caminante', 5, v); R.moverZombiHacia(G, z, j.pos, 1); assert.ok(!R.hayBarricada(G, j.pos, v), 'la barricada cae'); assert.equal(z.pos, v, 'el zombi no avanza esa ronda');
});
test('amputación salva al mordido a cambio de 2 heridas', () => {
  const G = partida10('farmacia', 9); const j = R.turnoActual(G); const otro = G.jugadores.find(x => x.id !== j.id); otro.pos = j.pos; R.herir(G, otro, 1, 'p'); assert.ok(otro.mordido);
  j.mano.push(R.carta(G, 'machete')); const r = R.amputar(G, otro.id); assert.ok(r.ok, r.motivo); assert.equal(otro.mordido, null); assert.ok(otro.sinDoble);
});
test('pasajeros viajan con el conductor y el convoy saca a la gente', () => {
  const G = partida10('convoy', 12); G.turno.jugadorId = G.jugadores.find(x => x.personajeId === 'elias').id; const j = R.turnoActual(G); const p = G.jugadores.find(x => x.id !== j.id && x.personajeId !== 'ruy'); p.pos = j.pos;
  j.mano.push(R.carta(G, 'coche_dep')); assert.ok(R.vehiculo(G, j.mano.at(-1).uid).ok);
  // el pasajero sube en su turno: simulamos cambiando el turno actual
  G.turno.jugadorId = p.id; G.turno.acciones = 2; assert.ok(R.subirPasajero(G, j.id).ok); G.turno.jugadorId = j.id; G.turno.acciones = 2;
  const dest = R.destinosPosibles(G)[0]; if (dest) { R.mover(G, dest); assert.equal(p.pos, j.pos); }
  const borde = Object.values(G.casillas).find(c => R.esBorde(G, c.k)); j.pos = borde.k; p.pos = borde.k; const r = R.salir(G); assert.ok(r.ok, r.motivo); assert.equal(r.grupo, 2); assert.equal(p.estado, 'salido');
});
test('Instinto: la noche se detiene para que Beatriz decida sobre el evento', () => {
  const G = partida10('invierno', 3); G.ronda = 2; R.faseNoche(G); assert.equal(G.fase, 'decision'); const r = R.resolverDecision(G, true); assert.ok(r.ok); assert.ok(G.banderas.instintoEventoUsado); assert.equal(G.ronda, 3);
});
test('protocolo: las muestras se toman al matar y se entregan en el laboratorio', () => {
  const G = partida10('protocolo', 4); const j = R.turnoActual(G); const z = R.ponerZombi(G, 'caminante', 1, j.pos); let n = 0; while (G.zombis[z.id] && n++ < 30) { G.turno.acciones = 2; R.atacar(G, z.id, null); }
  assert.ok(j.mano.some(c => c.id === 'muestra_caminante')); j.pos = G.especiales.laboratorio; G.turno.acciones = 0; R.terminarTurno(G); assert.equal(G.almacen.muestras, 1);
});
test('partidas automáticas con 10 jugadores en las 12 misiones terminan', async () => {
  for (const m of Object.keys((await import('../src/datos.js')).MISIONES)) {
    const G = partida10(m, 31); let pasos = 0;
    while (!G.fin && pasos++ < 6000) {
      if (G.fase === 'turno') { const d = R.destinosPosibles(G); if (d.length && R.rnd(G) < .7) R.mover(G, d[R.entero(G, d.length)]); const o = R.objetivosAtaque(G); if (o.length) R.atacar(G, o[0].z.id, R.armasDe(G, R.turnoActual(G))[0]?.uid); else R.saquear(G); R.terminarTurno(G, true); }
      else if (G.fase === 'zombi') { const z = R.fichaZombi(G, G.zturno.jugadorId); if (z) { const v = R.vecinos(z.pos).filter(k => G.casillas[k]); R.zMover(G, v[0]); } R.zTerminar(G); }
      else if (G.fase === 'decision') R.resolverDecision(G, false);
      else break;
    }
    assert.ok(G.fin, `${m} debe terminar (fase ${G.fase}, ronda ${G.ronda})`); JSON.stringify(G);
  }
});

test('variante hardcore tardío: el mordido se convierte en la noche siguiente', () => {
  const G = R.nuevaPartida({ jugadores: seis.slice(0, 4).map((p, i) => ({ nombre: 'J' + (i + 1), personajeId: p })), misionId: 'invierno', semilla: 13, opciones: { hardcoreTardio: true } });
  const j = G.jugadores[0]; R.herir(G, j, 1, 'prueba'); assert.equal(j.mordido.limite, 2);
  R.faseNoche(G); assert.equal(j.estado, 'vivo'); if (G.fase === 'decision') R.resolverDecision(G, false); G.fase = 'noche'; R.faseNoche(G); assert.equal(j.estado, 'zombi');
});
