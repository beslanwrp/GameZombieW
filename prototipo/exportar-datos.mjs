// Exporta la hoja de equilibrio (src/datos.js) a JSON para el importador de Unity (Z2099.Datos).
//   node prototipo/exportar-datos.mjs  → datos/*.json en la raíz del repositorio
import * as D from './src/datos.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'datos'); mkdirSync(dir, { recursive: true });
const tablas = { parametros: D.PARAMS, caras: D.CARAS, objetos: D.OBJETOS, mazo_objetos: D.MAZO_OBJETOS, recetas: D.RECETAS, zombis: D.ZOMBIS, mazo_zombis: D.MAZO_ZOMBIS, personajes: D.PERSONAJES, misiones: D.MISIONES, eventos: D.EVENTOS, hordas: D.HORDAS, escalado: Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, D.escalado(n)])) };
for (const [k, v] of Object.entries(tablas)) writeFileSync(join(dir, k + '.json'), JSON.stringify(v, null, 2) + '\n');
writeFileSync(join(dir, 'README.md'), `# Datos de Z-2099\n\nGenerados desde \`prototipo/src/datos.js\` con \`node prototipo/exportar-datos.mjs\`. No se editan a mano: la hoja de equilibrio es el archivo JavaScript y este directorio es su exportación para Unity.\n\n| Archivo | Contenido |\n| --- | --- |\n${Object.keys(tablas).map(k => `| \`${k}.json\` | ${k.replace('_', ' de ')} |`).join('\n')}\n`);
console.log('exportados', Object.keys(tablas).length, 'archivos en', dir);
