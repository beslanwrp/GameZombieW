// Z-2099 · datos del prototipo M0. Todo lo que se equilibra vive aquí.

export const PARAMS = {
  accionesPorRonda: 2, dadosBase: 2, capacidadBase: 6, vidaBase: 3,
  ruidoInicial: 2, ruidoTope: 8, ruidoTrasHorda: 4, ruidoPorNoche: 1,
  turnosContagio: 4, tratamientoTurnos: 2, saqueosPorCasilla: 2,
  distanciaDisparo: 3, gasolinaMoto: 3, gasolinaCoche: 4, radioMapa: 6,
};

export const CARAS = ['paso', 'paso', 'paso', 'doble', 'ruido', 'mordisco'];

export const OBJETOS = {
  cinta:        { nombre: 'Cinta americana', tipo: 'material', peso: 0 },
  clavos:       { nombre: 'Clavos', tipo: 'material', peso: 0 },
  pilas:        { nombre: 'Pilas', tipo: 'material', peso: 0 },
  trapo:        { nombre: 'Trapo', tipo: 'material', peso: 0 },
  botella:      { nombre: 'Botella', tipo: 'material', peso: 0 },
  tubo:         { nombre: 'Tubo de acero', tipo: 'material', peso: 1 },
  bate:         { nombre: 'Bate', tipo: 'arma', peso: 1, dados: 2, durabilidad: 3 },
  bate_clavos:  { nombre: 'Bate con clavos', tipo: 'arma', peso: 1, dados: 2, extra: 1, durabilidad: 4 },
  machete:      { nombre: 'Machete', tipo: 'arma', peso: 1, dados: 2, durabilidad: 4, amputa: true },
  katana:       { nombre: 'Katana', tipo: 'arma', peso: 1, dados: 3, amputa: true },
  pistola:      { nombre: 'Pistola', tipo: 'arma', peso: 1, dados: 2, distancia: 3, fuego: true, ruido: 2 },
  rifle:        { nombre: 'Rifle', tipo: 'arma', peso: 1, dados: 2, distancia: 3, fuego: true, ruido: 2, mataCorredor: true },
  ballesta:     { nombre: 'Ballesta', tipo: 'arma', peso: 1, dados: 2, distancia: 3, ruido: 0 },
  silenciador:  { nombre: 'Silenciador improvisado', tipo: 'otro', peso: 0, usos: 3 },
  botiquin:     { nombre: 'Botiquín', tipo: 'consumible', peso: 1, cura: 2 },
  antibioticos: { nombre: 'Antibióticos', tipo: 'consumible', peso: 1, cura: 1, contagio: 1 },
  tratamiento:  { nombre: 'Tratamiento', tipo: 'consumible', peso: 1, contagio: 2 },
  comida:       { nombre: 'Comida', tipo: 'consumible', peso: 1 },
  moto:         { nombre: 'Moto (sin gasolina)', tipo: 'vehiculo', peso: 0, clase: 'moto' },
  coche:        { nombre: 'Coche (sin gasolina)', tipo: 'vehiculo', peso: 0, clase: 'coche' },
  moto_dep:     { nombre: 'Moto con depósito', tipo: 'vehiculo', peso: 0, clase: 'moto', porGas: 2, ruido: 1, gasMax: 3 },
  coche_dep:    { nombre: 'Coche con depósito', tipo: 'vehiculo', peso: 0, clase: 'coche', porGas: 1, ruido: 2, gasMax: 4, capacidad: 6, atropella: true },
  bidon:        { nombre: 'Bidón de gasolina', tipo: 'combustible', peso: 2 },
  radio:        { nombre: 'Radio', tipo: 'otro', peso: 1 },
  poncho:       { nombre: 'Poncho', tipo: 'otro', peso: 1 },
  visceras:     { nombre: 'Vísceras de zombi', tipo: 'material', peso: 0 },
  molotov:      { nombre: 'Molotov', tipo: 'otro', peso: 1, usable: 'adyacente' },
  senuelo:      { nombre: 'Señuelo sonoro', tipo: 'otro', peso: 1, usable: 'aqui' },
  camuflaje:    { nombre: 'Camuflaje de vísceras', tipo: 'otro', peso: 1, usable: 'propio' },
  receta:       { nombre: 'Recetario', tipo: 'receta', peso: 0 },
};

// Composición del mazo de objetos (60). La comida sube a 12 para probar Invierno sin Omar.
export const MAZO_OBJETOS = {
  cinta: 5, clavos: 4, pilas: 4, trapo: 4, botella: 4, tubo: 3,
  bate: 3, machete: 2, pistola: 3, rifle: 1,
  botiquin: 4, antibioticos: 2, comida: 12,
  moto: 2, coche: 2, bidon: 3, radio: 2, poncho: 2, receta: 4,
};

export const RECETAS = {
  moto_dep:    { nombre: 'Moto con depósito', ing: ['bidon', 'moto'], res: 'moto_dep', inicial: true,
                 texto: 'Mueve 2 casillas por gasolina en lugar de tirar. +1 ruido por turno en marcha.' },
  coche_dep:   { nombre: 'Coche con depósito', ing: ['bidon', 'coche'], res: 'coche_dep',
                 texto: 'Mueve 1 casilla por gasolina. +6 de capacidad. Atropella caminantes. +2 ruido en marcha.' },
  molotov:     { nombre: 'Molotov', ing: ['botella', 'trapo', 'bidon'], res: 'molotov',
                 texto: 'Elimina todos los zombis de una casilla adyacente. Arde 2 rondas. La horda más cercana avanza 1 hacia el fuego.' },
  bate_clavos: { nombre: 'Bate con clavos', ing: ['tubo', 'clavos', 'cinta'], res: 'bate_clavos', inicial: true,
                 texto: '2 dados y +1 impacto en cuerpo a cuerpo. Durabilidad 4.' },
  silenciador: { nombre: 'Silenciador improvisado', ing: ['pistola', 'botella', 'cinta'], res: ['pistola', 'silenciador'],
                 texto: 'Los siguientes 3 disparos no generan ruido.' },
  senuelo:     { nombre: 'Señuelo sonoro', ing: ['radio', 'pilas'], res: 'senuelo',
                 texto: 'Se deja en tu casilla: 2 rondas atrayendo a las hordas a 3 casillas. +2 ruido.' },
  tratamiento: { nombre: 'Tratamiento', ing: ['antibioticos', 'botiquin'], res: 'tratamiento', inicial: true,
                 texto: 'Cuenta atrás: +2 turnos al mordido. Sin contagio: anula un mordisco de esta ronda.' },
  camuflaje:   { nombre: 'Camuflaje de vísceras', ing: ['visceras', 'poncho'], res: 'camuflaje',
                 texto: '2 turnos atravesando casillas con caminantes. Se anula con lluvia o al disparar.' },
};

export const ZOMBIS = {
  caminante: { nombre: 'Caminante', fuerza: 1, mov: 1, letra: 'C' },
  corredor:  { nombre: 'Corredor', fuerza: 2, mov: 2, letra: 'R' },
  acorazado: { nombre: 'Acorazado', fuerza: 3, mov: 1, letra: 'A', inmuneDistancia: true },
  nino:      { nombre: 'Niño', fuerza: 1, mov: 1, letra: 'N', panico: 1 },
  horda:     { nombre: 'Horda', fuerza: 3, mov: 1, letra: 'H' },
  jugador:   { nombre: 'Jugador zombi', fuerza: 2, mov: 1, letra: 'Z' },
};
export const MAZO_ZOMBIS = { caminante: 24, corredor: 8, acorazado: 4, nino: 4 };

export const PERSONAJES = {
  elias:   { nombre: 'Elías Vega', alias: 'el Alguacil', vida: 4, iniciativa: 7, capacidad: 6, dados: 2, inicial: ['pistola'],
             habilidad: 'Orden: una vez por ronda, un superviviente a 3 casillas repite un dado.', pro: 'Tira 3 dados con armas de fuego.',
             contra: 'Mando: no se beneficia de habilidades de otros.', color: '#5f8fb4' },
  sunja:   { nombre: 'Sunja Park', alias: 'la Hoja', vida: 3, iniciativa: 9, capacidad: 5, dados: 2, inicial: ['katana'],
             habilidad: 'Filo silencioso: sus combates cuerpo a cuerpo no generan ruido y matan hasta 2 caminantes de una horda por acción.', pro: 'Katana sin durabilidad.',
             contra: 'Loba solitaria: no puede recibir cartas de otros.', color: '#c9a24a' },
  tomas:   { nombre: 'Tomás Iriarte', alias: 'Gancho', vida: 3, iniciativa: 6, capacidad: 6, dados: 2, inicial: ['ballesta'],
             habilidad: 'Rastreo: tras moverse, revela una loseta adyacente sin entrar.', pro: 'Ballesta sin ruido.',
             contra: 'Cojera: -1 paso en cada tirada.', color: '#7aa06a' },
  naima:   { nombre: 'Naima Haddad', alias: 'la Doctora', vida: 3, iniciativa: 5, capacidad: 6, dados: 2, inicial: ['botiquin'],
             habilidad: 'Triaje: una vez por ronda cura 1 herida a un adyacente sin gastar carta. Su Tratamiento suma 3.', pro: 'Botiquín inicial.',
             contra: 'Juramento: no ataca a zombis que fueron jugadores.', color: '#b4553f' },
  kenji:   { nombre: 'Kenji Ōta', alias: 'el Cartero', vida: 3, iniciativa: 8, capacidad: 5, dados: 3, inicial: [],
             habilidad: 'Zancada: el bosque le cuesta 1 paso.', pro: '3 dados de movimiento.',
             contra: 'Pánico a la horda: con una horda a 2 casillas, no puede acercarse a ella.', color: '#9a7fb8' },
  beatriz: { nombre: 'Beatriz Lorca', alias: 'la Superviviente', vida: 3, iniciativa: 6, capacidad: 6, dados: 2, inicial: [],
             habilidad: 'Instinto: 2 dados de defensa y repite una cara de mordisco una vez por ronda. Una vez por partida descarta el evento recién revelado.', pro: 'Difícil de morder.',
             contra: 'Desconfiada: solo se cura sola.', color: '#d0865a' },
};

export const MISIONES = {
  farmacia: { nombre: 'Farmacia Central', etiquetas: ['R'], contagio: 'cuenta_atras', rondas: 10,
    texto: 'Traed 3 antibióticos al refugio. Hay 2 farmacias garantizadas en bordes opuestos. Un mordisco da 4 turnos para curarlo.',
    objetivo: 'antibioticos_refugio', cantidad: 3, farmacias: 2 },
  sin_gota: { nombre: 'Sin una gota', etiquetas: ['SC', 'T'], contagio: 'sin_contagio', rondas: 10,
    texto: 'Llegad todos vivos al helipuerto antes de la ronda 10. Un mordisco que no se anule en la misma ronda hace fracasar la misión.',
    objetivo: 'todos_helipuerto', helipuerto: true },
  invierno: { nombre: 'Invierno', etiquetas: ['HC', 'T'], contagio: 'hardcore', rondas: 10,
    texto: 'Acumulad 10 cartas de comida en el refugio antes de la ronda 10. Un mordisco convierte al terminar la ronda.',
    objetivo: 'comida_refugio', cantidad: 10 },
  ultima:   { nombre: 'Última llamada', etiquetas: ['HC', 'T'], contagio: 'hardcore', rondas: 12,
    texto: 'Sobrevivid 12 rondas con al menos la mitad del equipo. Desde la ronda 6 se roba una carta de horda cada noche.',
    objetivo: 'sobrevivir', hordaDesde: 6 },
};

export const EVENTOS = [
  { id: 'lluvia', nombre: 'Lluvia', texto: 'Ruido -1. El camuflaje de vísceras se anula.' },
  { id: 'silencio', nombre: 'Silencio', texto: 'Ruido -1. Los muertos se quedan quietos un momento.' },
  { id: 'motor', nombre: 'Motor lejano', texto: 'Aparece un coche abandonado en una calle revelada.' },
  { id: 'estampida', nombre: 'Estampida', texto: 'Todos los zombis se mueven una casilla extra ahora.' },
  { id: 'recuerdo', nombre: 'Recuerdo', texto: 'Cada jugador cuenta algo de su personaje. Todos pierden 1 de pánico.' },
  { id: 'tardio', nombre: 'Mordisco tardío', texto: 'Un jugador que curó un mordisco esta partida vuelve a estar mordido con 2 turnos.' },
  { id: 'otros', nombre: 'Otros supervivientes', texto: 'El que menos cartas tiene recibe 2 objetos. Ruido +2.' },
  { id: 'niebla', nombre: 'Niebla', texto: 'Durante la próxima ronda, las armas a distancia solo alcanzan 1 casilla.' },
  { id: 'lluvia', nombre: 'Lluvia', texto: 'Ruido -1. El camuflaje de vísceras se anula.' },
  { id: 'estampida', nombre: 'Estampida', texto: 'Todos los zombis se mueven una casilla extra ahora.' },
];

export const HORDAS = [
  { donde: 'ruido', que: 'horda', texto: 'Una horda entra por la entrada más cercana al ruido.' },
  { donde: 'lejana', que: 'horda', texto: 'Una horda entra por la entrada más lejana a los supervivientes.' },
  { donde: 'ruido', que: 'corredores', texto: 'Tres corredores entran por la entrada más cercana al ruido.' },
  { donde: 'aleatoria', que: 'acorazado', texto: 'Un acorazado y tres caminantes entran por una entrada al azar.' },
  { donde: null, que: 'estampida', texto: 'Los zombis del tablero se mueven una casilla extra.' },
  { donde: null, que: 'edificios', texto: 'Un caminante aparece en cada edificio revelado sin supervivientes.' },
  { donde: 'aleatoria', que: 'horda', texto: 'Una horda entra por una entrada al azar.' },
  { donde: 'ruido', que: 'horda', texto: 'Una horda entra por la entrada más cercana al ruido.' },
];

export function escalado(n) {
  if (n <= 3) return { horda: 3, extraLoseta: 0, ruidoInicial: 2 };
  if (n <= 6) return { horda: 5, extraLoseta: 0, ruidoInicial: 2 };
  if (n <= 8) return { horda: 7, extraLoseta: 1, ruidoInicial: 2 };
  return { horda: 9, extraLoseta: 1, ruidoInicial: 3 };
}
