// Z-2099 · datos del prototipo M0. Todo lo que se equilibra vive aquí.

export const PARAMS = {
  accionesPorRonda: 2, dadosBase: 2, capacidadBase: 6, vidaBase: 3,
  ruidoInicial: 2, ruidoTope: 8, ruidoTrasHorda: 4, ruidoPorNoche: 1,
  turnosContagio: 4, tratamientoTurnos: 2, saqueosPorCasilla: 2,
  distanciaDisparo: 3, gasolinaMoto: 3, gasolinaCoche: 4, radioMapa: 6, rondasEnlace: 4, percepcion: 4, impactosPorCaminanteHorda: 2,
};

export const CARAS = ['paso', 'paso', 'paso', 'doble', 'ruido', 'mordisco'];

export const OBJETOS = {
  cinta:        { nombre: 'Cinta americana', tipo: 'material', peso: 0 },
  clavos:       { nombre: 'Clavos', tipo: 'material', peso: 0 },
  pilas:        { nombre: 'Pilas', tipo: 'material', peso: 0 },
  trapo:        { nombre: 'Trapo', tipo: 'material', peso: 0 },
  botella:      { nombre: 'Botella', tipo: 'material', peso: 0 },
  tubo:         { nombre: 'Tubo de acero', tipo: 'material', peso: 1 },
  tablas:       { nombre: 'Tablas', tipo: 'material', peso: 2 },
  chapa:        { nombre: 'Chapa', tipo: 'material', peso: 2 },
  walkie:       { nombre: 'Walkie-talkie', tipo: 'material', peso: 1 },
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
  moto_dep:     { nombre: 'Moto con depósito', tipo: 'vehiculo', peso: 0, clase: 'moto', porGas: 2, ruido: 1, gasMax: 3, plazas: 1 },
  coche_dep:    { nombre: 'Coche con depósito', tipo: 'vehiculo', peso: 0, clase: 'coche', porGas: 1, ruido: 2, gasMax: 4, capacidad: 6, atropella: true, plazas: 3 },
  bidon:        { nombre: 'Bidón de gasolina', tipo: 'combustible', peso: 2 },
  radio:        { nombre: 'Radio', tipo: 'otro', peso: 1 },
  poncho:       { nombre: 'Poncho', tipo: 'otro', peso: 1 },
  visceras:     { nombre: 'Vísceras de zombi', tipo: 'material', peso: 0 },
  molotov:      { nombre: 'Molotov', tipo: 'otro', peso: 1 },
  senuelo:      { nombre: 'Señuelo sonoro', tipo: 'otro', peso: 1 },
  camuflaje:    { nombre: 'Camuflaje de vísceras', tipo: 'otro', peso: 1 },
  barricada:    { nombre: 'Barricada', tipo: 'otro', peso: 2 },
  enlace:       { nombre: 'Enlace (walkies con pilas)', tipo: 'otro', peso: 1 },
  semillas:     { nombre: 'Semillas', tipo: 'otro', peso: 1 },
  suministro:   { nombre: 'Suministro marcado', tipo: 'otro', peso: 1 },
  muestra_caminante: { nombre: 'Muestra de caminante', tipo: 'material', peso: 0 },
  muestra_corredor:  { nombre: 'Muestra de corredor', tipo: 'material', peso: 0 },
  muestra_acorazado: { nombre: 'Muestra de acorazado', tipo: 'material', peso: 0 },
  receta:       { nombre: 'Recetario', tipo: 'receta', peso: 0 },
};

// Composición del mazo de objetos. La comida sube a 12 para que Invierno sea posible sin Omar.
export const MAZO_OBJETOS = {
  cinta: 5, clavos: 5, pilas: 5, trapo: 4, botella: 4, tubo: 3, tablas: 3, chapa: 2, walkie: 3,
  bate: 3, machete: 2, pistola: 3, rifle: 1,
  botiquin: 5, antibioticos: 4, comida: 12,
  moto: 2, coche: 2, bidon: 3, radio: 2, poncho: 2, receta: 4,
};

export const RECETAS = {
  moto_dep:    { nombre: 'Moto con depósito', ing: ['bidon', 'moto'], res: 'moto_dep', inicial: true,
                 texto: 'Mueve 2 casillas por gasolina en lugar de tirar. Un pasajero. +1 ruido por turno en marcha.' },
  coche_dep:   { nombre: 'Coche con depósito', ing: ['bidon', 'coche'], res: 'coche_dep',
                 texto: 'Mueve 1 casilla por gasolina. 3 pasajeros. +6 de capacidad. Atropella caminantes. +2 ruido en marcha.' },
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
  barricada:   { nombre: 'Barricada', ing: ['tablas', 'clavos', 'chapa'], res: 'barricada',
                 texto: 'Bloquea una arista de tu casilla. Las hordas tardan una ronda en derribarla (+1 ruido). Los supervivientes la cruzan.' },
  enlace:      { nombre: 'Enlace', ing: ['walkie', 'walkie', 'pilas'], res: 'enlace',
                 texto: 'Une a dos supervivientes 4 rondas: pueden darse cartas a distancia.' },
};

export const ZOMBIS = {
  caminante: { nombre: 'Caminante', fuerza: 1, mov: 1, letra: 'C' },
  corredor:  { nombre: 'Corredor', fuerza: 2, mov: 2, letra: 'R' },
  acorazado: { nombre: 'Acorazado', fuerza: 3, mov: 1, letra: 'A', inmuneDistancia: true },
  nino:      { nombre: 'Niño', fuerza: 1, mov: 1, letra: 'N', panico: 1 },
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
  ruy:     { nombre: 'Ruy', alias: 'el Niño', vida: 2, iniciativa: 10, capacidad: 3, dados: 2, inicial: [],
             habilidad: 'Pequeño: los zombis lo ignoran si hay un adulto en su casilla. Colarse: saquea 2 cartas.', pro: 'Las hordas nunca lo eligen como objetivo.',
             contra: 'Débil: capacidad 3, no usa armas de fuego ni conduce.', color: '#e0b43a' },
  marga:   { nombre: 'Marga Solís', alias: 'la Mecánica', vida: 3, iniciativa: 4, capacidad: 7, dados: 2, inicial: ['coche'],
             habilidad: 'Chapuza: una vez por partida craftea con un ingrediente menos. Su primer movimiento en vehículo cada ronda no gasta gasolina.', pro: 'Coche inicial (sin gasolina).',
             contra: 'Claustrofobia: no puede terminar la ronda dentro de un edificio.', color: '#6fb1a6' },
  anselmo: { nombre: 'Anselmo Ruiz', alias: 'el Padre', vida: 3, iniciativa: 3, capacidad: 6, dados: 2, inicial: [],
             habilidad: 'Sermón: quita 1 pánico a todos los supervivientes a 2 casillas.', pro: 'Los eventos de otros supervivientes son más generosos con él.',
             contra: 'Pacifista: solo combate contra zombis en su propia casilla.', color: '#a9a06e' },
  kenji:   { nombre: 'Kenji Ōta', alias: 'el Cartero', vida: 3, iniciativa: 8, capacidad: 5, dados: 3, inicial: [],
             habilidad: 'Zancada: el bosque le cuesta 1 paso.', pro: '3 dados de movimiento.',
             contra: 'Pánico a la horda: con una horda a 2 casillas, no puede acercarse a ella.', color: '#9a7fb8' },
  beatriz: { nombre: 'Beatriz Lorca', alias: 'la Superviviente', vida: 3, iniciativa: 6, capacidad: 6, dados: 2, inicial: [],
             habilidad: 'Instinto: 2 dados de defensa y repite una cara de mordisco una vez por ronda. Una vez por partida descarta el evento recién revelado.', pro: 'Difícil de morder.',
             contra: 'Desconfiada: solo se cura sola.', color: '#d0865a' },
  omar:    { nombre: 'Omar Benali', alias: 'el Cocinero', vida: 3, iniciativa: 2, capacidad: 7, dados: 2, inicial: ['machete'],
             habilidad: 'Racionar: cada comida que deposita cuenta doble. Compartir comida quita 1 pánico a todos en su casilla.', pro: 'Machete inicial.',
             contra: 'Mala vista: -1 dado con armas a distancia.', color: '#c56d8a' },
  lidia:   { nombre: 'Lidia Castaño', alias: 'la Tiradora', vida: 3, iniciativa: 5, capacidad: 6, dados: 2, inicial: ['rifle'],
             habilidad: 'Cobertura: dispara a 4 casillas y mata corredores de un tiro con cualquier arma de fuego.', pro: 'Rifle inicial.',
             contra: 'Insomnio: al inicio de cada turno tira 1 dado; mordisco = pierde una acción.', color: '#8b96c5' },
  ceniza:  { nombre: 'Ceniza', alias: 'nadie sabe su nombre', vida: 3, iniciativa: 1, capacidad: 6, dados: 2, inicial: ['poncho'],
             habilidad: 'Nadie: las hordas no lo eligen si hay otro superviviente a igual distancia. Atraviesa casillas con caminantes gastando 2 pasos extra.', pro: 'Poncho inicial.',
             contra: 'Mudo: no puede usar Enlace ni dar cartas fuera del refugio.', color: '#9aa096' },
};

// contagio: cuenta_atras | sin_contagio | hardcore | ambos (hardcore y sin contagio a la vez)
export const MISIONES = {
  farmacia: { nombre: 'Farmacia Central', etiquetas: ['R'], contagio: 'cuenta_atras', rondas: 10,
    texto: 'Traed 3 antibióticos al refugio. Hay 2 farmacias garantizadas en bordes opuestos. Un mordisco da 4 turnos para curarlo.',
    objetivo: 'antibioticos_refugio', cantidad: 3, farmacias: 2 },
  sin_gota: { nombre: 'Sin una gota', etiquetas: ['SC', 'T'], contagio: 'sin_contagio', rondas: 10,
    texto: 'Llegad todos vivos al helipuerto antes de la ronda 10. Un mordisco que no se anule en la misma ronda hace fracasar la misión.',
    objetivo: 'todos_helipuerto', especial: 'helipuerto' },
  granja:   { nombre: 'La granja', etiquetas: ['HC', 'R'], contagio: 'hardcore', rondas: 12,
    texto: 'Conseguid las semillas (llegan por evento) y 2 bidones, dejadlos en el refugio y aguantad hasta la ronda 12 con al menos la mitad del equipo.',
    objetivo: 'granja', semillas: true },
  emisora:  { nombre: 'La emisora', etiquetas: ['R', 'T'], contagio: 'cuenta_atras', rondas: 10,
    texto: 'Craftead un Señuelo, llevadlo a la torre de radio y mantened a un superviviente allí con el señuelo sonando 2 noches.',
    objetivo: 'torre', especial: 'torre', cantidad: 2 },
  convoy:   { nombre: 'El convoy', etiquetas: ['R', 'T'], contagio: 'cuenta_atras', rondas: 9,
    texto: 'Craftead vehículos con depósito y sacad a 6 supervivientes (o a todos si sois menos) por cualquier borde del mapa, a bordo.',
    objetivo: 'convoy', cantidad: 6 },
  cuarentena: { nombre: 'Cuarentena', etiquetas: ['SC', 'T'], contagio: 'sin_contagio', rondas: 8,
    texto: 'Levantad barricadas en las 6 aristas del refugio antes de la ronda 8 sin un solo contagio.',
    objetivo: 'cuarentena', cantidad: 6 },
  invierno: { nombre: 'Invierno', etiquetas: ['HC', 'T'], contagio: 'hardcore', rondas: 10,
    texto: 'Acumulad 10 cartas de comida en el refugio antes de la ronda 10. Un mordisco convierte al terminar la ronda.',
    objetivo: 'comida_refugio', cantidad: 10 },
  deposito: { nombre: 'El depósito', etiquetas: ['R'], contagio: 'cuenta_atras', rondas: 12,
    texto: 'Llevad 4 bidones de gasolina al generador del norte.',
    objetivo: 'deposito', especial: 'generador', cantidad: 4 },
  ultima:   { nombre: 'Última llamada', etiquetas: ['HC', 'T'], contagio: 'hardcore', rondas: 12,
    texto: 'Sobrevivid 12 rondas con al menos la mitad del equipo. Desde la ronda 6, cada dos noches llega una carta de horda extra.',
    objetivo: 'sobrevivir', hordaDesde: 6 },
  suministros: { nombre: 'Los suministros del puente', etiquetas: ['R', 'T'], contagio: 'cuenta_atras', rondas: 10,
    texto: 'Recoged los 5 suministros marcados, repartidos por las losetas de borde.',
    objetivo: 'suministros', cantidad: 5, suministros: 5 },
  cero:     { nombre: 'Cero contagios', etiquetas: ['SC', 'T'], contagio: 'sin_contagio', rondas: 12,
    texto: 'Revelad las 8 losetas de borde con entrada de horda sin un solo contagio.',
    objetivo: 'cero' },
  protocolo: { nombre: 'Protocolo Z-2099', etiquetas: ['HC', 'SC', 'T'], contagio: 'ambos', rondas: 12,
    texto: 'Recoged una muestra de caminante, de corredor y de acorazado (al matarlos) y llevadlas al laboratorio. Un mordisco convierte y además hace fracasar la misión.',
    objetivo: 'protocolo', especial: 'laboratorio', muestras: true },
};

export const EVENTOS = [
  { id: 'lluvia', nombre: 'Lluvia', texto: 'Ruido -1. El camuflaje de vísceras se anula.' },
  { id: 'silencio', nombre: 'Silencio', texto: 'Ruido -1. Los muertos se quedan quietos un momento.' },
  { id: 'motor', nombre: 'Motor lejano', texto: 'Aparece un coche abandonado en una calle revelada.' },
  { id: 'estampida', nombre: 'Estampida', texto: 'Todos los zombis se mueven una casilla extra ahora.' },
  { id: 'recuerdo', nombre: 'Recuerdo', texto: 'Cada jugador cuenta algo de su personaje. Todos pierden 1 de pánico.' },
  { id: 'tardio', nombre: 'Mordisco tardío', texto: 'Un jugador que curó un mordisco esta partida vuelve a estar mordido con 2 turnos.' },
  { id: 'otros', nombre: 'Otros supervivientes', texto: 'El que menos cartas tiene recibe 2 objetos (3 si es Anselmo). Ruido +2.' },
  { id: 'niebla', nombre: 'Niebla', texto: 'Durante la próxima ronda, las armas a distancia solo alcanzan 1 casilla.' },
  { id: 'lluvia', nombre: 'Lluvia', texto: 'Ruido -1. El camuflaje de vísceras se anula.' },
  { id: 'estampida', nombre: 'Estampida', texto: 'Todos los zombis se mueven una casilla extra ahora.' },
  { id: 'semillas', nombre: 'Semillas', texto: 'Un superviviente encuentra un saco de semillas. Solo en La granja.' },
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

// El tope de ruido crece con los jugadores: cada dado extra en la mesa es una cara de ruido más por ronda.
export function escalado(n) {
  const ruidoTope = 10 + Math.max(0, n - 4); const base = { ruidoTope, ruidoTrasHorda: ruidoTope - 7 };
  if (n <= 3) return { ...base, horda: 3, extraLoseta: 0, ruidoInicial: 2 };
  if (n <= 6) return { ...base, horda: 5, extraLoseta: 0, ruidoInicial: 2 };
  if (n <= 8) return { ...base, horda: 7, extraLoseta: 1, ruidoInicial: 2 };
  return { ...base, horda: 9, extraLoseta: 1, ruidoInicial: 3 };
}
