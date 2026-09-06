// Empaqueta datos + reglas + interfaz en un único HTML.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const limpiar = s => s.split('\n').filter(l => !/^import\s/.test(l)).join('\n').replace(/^export\s+/gm, '');
const js = ['datos', 'reglas', 'ui'].map(n => `/* ---- ${n}.js ---- */\n` + limpiar(readFileSync(new URL(`./src/${n}.js`, import.meta.url), 'utf8'))).join('\n');
let html = readFileSync(new URL('./plantilla.html', import.meta.url), 'utf8').replace('/*__SCRIPT__*/', () => js);
// el modal usa `hidden` en #modal-fondo pero el código alterna #modal: unificamos
html = html.replace('<div id="modal-fondo" hidden><div id="modal" class="modal" role="dialog">', '<div id="modal-fondo"><div id="modal" class="modal" role="dialog" hidden>');
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/artifact.html', import.meta.url), html);
writeFileSync(new URL('./dist/index.html', import.meta.url), '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' + html.replace(/^(<title>.*<\/title>\n<meta[^\n]*\n)/, '$1</head>\n<body>\n') + '\n</body>\n</html>\n');
console.log('dist listo', html.length, 'bytes');
