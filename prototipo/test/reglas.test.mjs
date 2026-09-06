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
test('la horda pierde un caminante por cada 3 impactos', () => {
  const G = partida(4, 'farmacia', 11); const j = R.turnoActual(G); const k = G.jugadores.find(x => x.personajeId === 'sunja');
  const z = R.ponerZombi(G, 'caminante', 5, j.pos); assert.ok(R.esHorda(z));
  G.turno.acciones = 1; const r = R.atacar(G, z.id, null); assert.ok(r.ok); assert.equal(r.muertos, Math.min(5, Math.floor(r.impactos / 3)));
  void k;
});
test('crafteo consume ingredientes y produce el resultado', () => {
  const G = partida(4, 'farmacia', 2); const j = R.turnoActual(G); j.mano.push(R.carta(G, 'bidon'), R.carta(G, 'moto'));
  const r = R.craftear(G, 'moto_dep'); assert.ok(r.ok, r.motivo); assert.ok(j.mano.some(c => c.id === 'moto_dep')); assert.ok(!j.mano.some(c => c.id === 'moto'));
  assert.equal(R.craftear(G, 'coche_dep').ok, false, 'receta desconocida');
});
test('la noche sube el ruido y en el tope llega una horda', () => {
  const G = partida(4, 'farmacia', 8); G.ruido = 7; const zombisAntes = Object.values(G.zombis).reduce((s, z) => s + z.n, 0);
  R.faseNoche(G); assert.equal(G.ruido, PARAMS.ruidoTrasHorda); assert.ok(Object.values(G.zombis).reduce((s, z) => s + z.n, 0) > zombisAntes); assert.equal(G.ronda, 2);
});
test('hardcore convierte al mordido en la noche y crea la ficha zombi', () => {
  const G = partida(4, 'invierno', 13); const j = G.jugadores[0]; R.herir(G, j, 1, 'prueba'); assert.ok(j.mordido.hc);
  R.faseNoche(G); assert.equal(j.estado, 'zombi'); assert.ok(R.fichaZombi(G, j.id));
});
test('sin contagio: un mordisco sin anular hace fracasar; el tratamiento lo anula', () => {
  let G = partida(4, 'sin_gota', 21); let j = G.jugadores[0]; R.herir(G, j, 1, 'prueba'); R.faseNoche(G); assert.equal(G.fin.resultado, 'derrota');
  G = partida(4, 'sin_gota', 21); j = R.turnoActual(G); R.herir(G, j, 1, 'prueba'); j.mano.push(R.carta(G, 'tratamiento')); G.turno.acciones = 1;
  const r = R.curar(G, j.mano.find(c => c.id === 'tratamiento').uid, j.id); assert.ok(r.ok, r.motivo); assert.equal(j.mordido, null); R.faseNoche(G); assert.equal(G.fin, null);
});
test('el bando zombi gana al alcanzar la mitad del equipo (o a todos con menos de 4)', () => {
  let G = partida(4, 'invierno', 1); R.convertir(G, G.jugadores[0], 'p'); R.comprobarFin(G); assert.equal(G.fin, null); R.convertir(G, G.jugadores[1], 'p'); R.comprobarFin(G); assert.equal(G.fin.resultado, 'derrota');
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
      else break;
    }
    assert.ok(G.fin, `${m} debe terminar (fase ${G.fase}, ronda ${G.ronda})`);
    JSON.stringify(G); // serializable
  }
});
