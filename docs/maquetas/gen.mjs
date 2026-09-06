import { writeFileSync, readFileSync } from 'node:fs';
import { board } from './board.mjs';
const base = readFileSync('_base.css', 'utf8');
const head = (extra = '') => `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n  <style>\n${base}\n${extra}\n  </style>\n</helmet>\n`;
const tail = `</x-dc>\n</body>\n</html>\n`;
const ico = {
  ruido: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  ronda: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mision: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16v16H4z"/><path d="M8 12l3 3 5-6"/></svg>',
  ojo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  mapa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  ficha: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
  mesa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 5h18v10H3z"/><path d="M8 20h8M12 15v5"/></svg>',
  clip: '<svg width="26" height="60" viewBox="0 0 26 60" fill="none" stroke="#8a8478" stroke-width="3" stroke-linecap="round"><path d="M8 18v28a5 5 0 0 0 10 0V12a8 8 0 0 0-16 0v30"/></svg>',
};
const header = (mision, ronda, ruido, tope, obj) => `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#1d201c;border-bottom:1px solid #2c302c;font-size:13px">
  <div style="flex:1;display:flex;flex-direction:column;gap:2px"><div style="display:flex;align-items:center;gap:6px;color:#e6e3da;font-weight:600">${ico.mision}<span>${mision}</span></div><div style="color:#9aa096">${obj}</div></div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><div style="display:flex;align-items:center;gap:6px;color:#9aa096" class="mono"><span style="display:flex">${ico.ruido}</span><div style="display:flex;gap:2px">${Array.from({length:tope},(_,i)=>`<i style="display:block;width:8px;height:12px;background:${i<ruido?(ruido>=tope-3?'#c9553d':'#e0b43a'):'#262a25'};border:1px solid #33393e"></i>`).join('')}</div><b style="color:#e6e3da">${ruido}/${tope}</b></div><div style="display:flex;align-items:center;gap:6px;color:#9aa096" class="mono">${ico.ronda}<span>Ronda ${ronda}</span></div></div>
</div>`;
const dado = (cara) => { const f = { paso: ['#e6e3da', '#151714', 'M6 12h10M12 8l4 4-4 4'], doble: ['#9db060', '#151714', 'M3 12h8M8 8l4 4-4 4M13 12h8M18 8l4 4-4 4'], ruido: ['#e0b43a', '#151714', 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7'], mordisco: ['#c9553d', '#fff', 'M12 3a8 8 0 0 0-8 8v3l3 3 2-2 3 2 3-2 2 2 3-3v-3a8 8 0 0 0-8-8zM9 10h.01M15 10h.01'] }[cara]; return `<div style="width:46px;height:46px;border-radius:6px;background:${f[0]};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25),0 2px 4px rgba(0,0,0,.5)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${f[1]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${f[2]}"/></svg></div>`; };
const polaroid = (titulo, nota, w, rot, foto) => `<div style="width:${w}px;padding:8px 8px 10px;background:#f1ece0;box-shadow:0 6px 14px rgba(0,0,0,.5);transform:rotate(${rot}deg);display:flex;flex-direction:column;gap:6px;flex:none"><div style="height:${Math.round(w*.72)}px;background:${foto};position:relative;overflow:hidden"><div class="grano"></div></div><div class="mono" style="font-size:${w>140?14:11}px;color:#2a2622;line-height:1.2">${titulo}</div><div class="mono" style="font-size:${w>140?12:10}px;color:#6a5a48">${nota}</div></div>`;
const tabbar = (activa) => `<div style="display:flex;background:#1d201c;border-top:1px solid #2c302c;padding:6px 6px 10px">${[['mapa','Tablero'],['ficha','Personaje'],['mesa','Mesa'],['ojo','Registro']].map(([k,l])=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;color:${l===activa?'#e0b43a':'#9aa096'};font-size:11px">${ico[k]}<span>${l}</span></div>`).join('')}</div>`;

/* ---- Main: tablero y planificación ---- */
writeFileSync('Main.dc.html', head(`.tablero3d{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) perspective(620px) rotateX(46deg) rotateZ(-18deg);transform-style:preserve-3d;filter:drop-shadow(0 30px 30px rgba(0,0,0,.6))}`) + `<div class="phone">
${header('Farmacia Central', '4 / 10', 6, 10, 'Antibióticos en refugio 1/3')}
<div style="position:relative;flex:1;overflow:hidden;background:radial-gradient(ellipse at 70% 15%, #6a4a33 0%, #2b2f29 38%, #111311 80%)">
  <div class="grano"></div>
  <div class="tablero3d">${board(560, 460, { s: 24 })}</div>
  <div style="position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:6px">
    <div class="tag" style="background:rgba(20,22,20,.75);border-color:#c9553d;color:#c9553d">Horda ×5 al noreste</div>
    <div class="tag" style="background:rgba(20,22,20,.75)">Loseta oculta · toca para explorar</div>
  </div>
  <div style="position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:6px">
    <div style="width:44px;height:44px;border-radius:2px;background:rgba(20,22,20,.8);border:1px solid #3a3f3a;display:flex;align-items:center;justify-content:center;color:#e6e3da">${ico.ojo}</div>
    <div style="width:44px;height:44px;border-radius:2px;background:rgba(20,22,20,.8);border:1px solid #3a3f3a;display:flex;align-items:center;justify-content:center;color:#e6e3da">${ico.ficha}</div>
  </div>
  <div style="position:absolute;right:12px;bottom:12px;width:92px;height:74px;background:rgba(20,22,20,.85);border:1px solid #3a3f3a;padding:4px"><div style="font-size:9px;color:#9aa096;text-transform:uppercase;letter-spacing:.1em" class="mono">Minimapa</div>${board(84, 58, { s: 4.2 })}</div>
  <div style="position:absolute;left:12px;bottom:12px;display:flex;align-items:center;gap:8px;background:rgba(20,22,20,.85);border-left:3px solid #5f8fb4;padding:6px 10px"><div style="width:26px;height:26px;border-radius:50%;background:#5f8fb4;display:flex;align-items:center;justify-content:center;color:#151714;font-weight:700;font-size:13px">1</div><div><div style="font-weight:600;font-size:14px">Elías Vega</div><div style="font-size:11px;color:#9aa096">Tu turno · 0:42 para planificar</div></div></div>
</div>
<div style="padding:10px 14px 6px;background:#1d201c;border-top:3px solid #5f8fb4;display:flex;flex-direction:column;gap:10px">
  <div style="display:flex;align-items:center;gap:12px"><div style="display:flex;gap:8px">${dado('paso')}${dado('doble')}${dado('ruido')}</div><div style="display:flex;gap:14px;color:#9aa096;font-size:14px"><span><b style="color:#e6e3da;font-size:20px">3</b> pasos</span><span><b style="color:#e6e3da;font-size:20px">2</b> acciones</span></div><div style="margin-left:auto;display:flex;gap:3px;color:#c9553d;font-size:18px;letter-spacing:2px">♥♥♥<span style="color:#3a3f3a">♥</span></div></div>
  <div style="display:flex;gap:8px"><div class="btn ghost" style="flex:1">Saquear</div><div class="btn ghost" style="flex:1">Atacar</div><div class="btn ghost" style="flex:1">Craftear</div><div class="btn" style="flex:1.5;font-size:15px">Confirmar</div></div>
</div>
<div style="display:flex;gap:10px;padding:12px 14px 6px;overflow:hidden;background:#141614;align-items:flex-end">
  ${polaroid('Pistola', '2 dados · dist 3 · ruido +2', 96, -3, 'linear-gradient(160deg,#3a3d3a,#1f2220)')}${polaroid('Bidón de gasolina', 'peso 2', 96, 2, 'linear-gradient(160deg,#7a5a2e,#3a2a14)')}${polaroid('Botiquín', 'cura 2', 96, -1, 'linear-gradient(160deg,#6e4a4a,#2f1f1f)')}${polaroid('Cinta americana', 'material', 96, 3, 'linear-gradient(160deg,#5b5a6a,#2a2a30)')}
</div>
${tabbar('Tablero')}
</div>\n` + tail);

/* ---- Sala ---- */
writeFileSync('Sala.dc.html', head() + `<div class="phone">
<div class="hazard"></div>
<div style="padding:26px 22px 10px;display:flex;flex-direction:column;gap:6px">
  <div class="tag" style="align-self:flex-start;border-color:#c9553d;color:#c9553d">Protocolo de cuarentena</div>
  <div class="display" style="font-size:72px;line-height:.9;color:#e6e3da">Z-<span style="color:#c9553d">2099</span></div>
  <div style="color:#9aa096">Sala de partida. Comparte el código o enséñalo en la mesa.</div>
</div>
<div style="margin:6px 22px;padding:16px 18px;background:#1d201c;border:1px solid #2c302c;display:flex;align-items:center;justify-content:space-between">
  <div><div class="mono" style="font-size:11px;color:#9aa096;letter-spacing:.14em;text-transform:uppercase">Código de sala</div><div class="display" style="font-size:52px;line-height:1;letter-spacing:.12em;color:#e0b43a">KRMA</div></div>
  <div style="width:84px;height:84px;background:#e6e3da;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:6px">${Array.from({length:49},(_,i)=>`<i style="display:block;background:${[0,1,2,4,6,7,9,12,13,14,16,18,20,21,23,24,27,28,30,31,33,35,36,38,40,42,43,44,46,48].includes(i)?'#151714':'transparent'}"></i>`).join('')}</div>
</div>
<div style="padding:14px 22px 6px;display:flex;align-items:baseline;justify-content:space-between"><div class="mono" style="font-size:11px;color:#9aa096;letter-spacing:.14em;text-transform:uppercase">Supervivientes · 6 de 10</div><div style="font-size:12px;color:#9db060">3 en la misma wifi</div></div>
<div style="display:flex;flex-direction:column;gap:6px;padding:0 22px">
  ${[['#5f8fb4','Beslan','Anfitrión · Elías Vega'],['#c9a24a','Marta','Sunja Park'],['#b4553f','Iker','Eligiendo personaje…'],['#7aa06a','Nora','Tomás Iriarte'],['#9a7fb8','Dani','Kenji Ōta'],['#d0865a','Lucía','Conectando…']].map(([c,n,p])=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#1d201c;border-left:3px solid ${c}"><div style="width:34px;height:34px;border-radius:50%;background:${c};flex:none"></div><div style="flex:1"><div style="font-weight:600">${n}</div><div style="font-size:12px;color:#9aa096">${p}</div></div></div>`).join('')}
</div>
<div style="margin:14px 22px 0;padding:12px 14px;background:#1d201c;border:1px dashed #3a3f3a;display:flex;align-items:center;gap:12px;color:#9aa096"><span style="display:flex">${ico.mesa}</span><div style="flex:1;font-size:13px">Pantalla compartida: abre <b style="color:#e6e3da">z2099.app/mesa</b> en la TV y escribe el código.</div></div>
<div style="margin-top:auto;padding:14px 22px 22px;display:flex;flex-direction:column;gap:10px">
  <div style="display:flex;justify-content:space-between;font-size:13px;color:#9aa096"><span>Misión</span><b style="color:#e6e3da">Al azar · contagio según carta</b></div>
  <div class="btn" style="min-height:54px">Repartir personajes</div>
</div>
</div>\n` + tail);

/* ---- Personaje: expediente ---- */
writeFileSync('Personaje.dc.html', head() + `<div class="phone" style="background:#1a1c19;align-items:center;justify-content:center">
<div class="grano"></div>
<div style="position:absolute;left:0;right:0;top:0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9aa096"><span>Elige tu personaje · 1 de 2</span><span class="mono">Beslan</span></div>
<div class="papel" style="width:342px;height:640px;position:relative;padding:22px 22px 18px;margin-bottom:70px;box-shadow:0 20px 40px rgba(0,0,0,.65);transform:rotate(-1deg);display:flex;flex-direction:column;gap:12px">
  <div style="position:absolute;left:-6px;top:22px">${ico.clip}</div>
  <div class="sello" style="right:14px;top:6px">Z-2099 · Sujeto 07</div>
  <div style="display:flex;gap:14px;align-items:flex-start;margin-top:40px">
    <div style="width:104px;height:128px;background:linear-gradient(180deg,#8a8478,#4a463f);position:relative;box-shadow:0 2px 4px rgba(0,0,0,.4);flex:none"><div class="grano" style="opacity:.3"></div><svg viewBox="0 0 104 128" width="104" height="128" style="position:absolute;inset:0"><circle cx="52" cy="48" r="22" fill="#2a2622"/><path d="M14 128c4-30 20-42 38-42s34 12 38 42z" fill="#2a2622"/></svg><div class="mono" style="position:absolute;bottom:4px;left:6px;font-size:9px;color:#e6e3da;letter-spacing:.1em">FRENTE · 2099</div></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <div class="mono" style="font-size:11px;color:#6a5a48;letter-spacing:.12em;text-transform:uppercase">Nombre</div>
      <div class="display" style="font-size:34px;line-height:.95;color:#2a2622">Elías Vega</div>
      <div class="mono" style="font-size:13px;color:#6a5a48">alias «el Alguacil» · 58 años · ex policía rural</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;border-top:1px solid #b9ae95;border-bottom:1px solid #b9ae95;padding:10px 0">
    ${[['Vida','4'],['Iniciativa','7'],['Capacidad','6'],['Dados','2']].map(([k,v])=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span class="mono" style="font-size:10px;color:#6a5a48;letter-spacing:.1em;text-transform:uppercase">${k}</span><span class="display" style="font-size:30px;line-height:1;color:#2a2622">${v}</span></div>`).join('')}
  </div>
  <div class="mono" style="font-size:14px;color:#2a2622;line-height:1.5;display:flex;flex-direction:column;gap:8px">
    <div><span style="color:#8a2a1e">HABILIDAD.</span> Orden: una vez por ronda, un superviviente a 3 casillas repite un dado.</div>
    <div><span style="color:#5f6e36">PRO.</span> Tira 3 dados con armas de fuego. Empieza con pistola.</div>
    <div><span style="color:#8a2a1e">CONTRA.</span> Mando: no se beneficia de habilidades de otros.</div>
  </div>
  <div class="mono" style="margin-top:auto;font-size:12px;color:#6a5a48;border-top:1px dashed #b9ae95;padding-top:8px;display:flex;justify-content:space-between"><span>Último avistamiento: refugio</span><span>Ficha 1/12</span></div>
</div>
<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 18px 20px;display:flex;gap:10px;background:linear-gradient(180deg,rgba(26,28,25,0),#1a1c19 40%)"><div class="btn ghost" style="flex:1">Ver la otra carta</div><div class="btn" style="flex:1.4">Quedarme con Elías</div></div>
</div>\n` + tail);

/* ---- Carta: polaroid a pantalla completa ---- */
writeFileSync('Carta.dc.html', head() + `<div class="phone" style="background:#1a1c19;align-items:center;justify-content:center">
<div class="grano"></div>
<div style="position:absolute;left:0;right:0;top:0;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#9aa096"><span>Tu mano · 4 cartas · peso 4/6</span><span class="mono">Cerrar</span></div>
<div style="width:320px;padding:14px 14px 18px;background:#f1ece0;box-shadow:0 24px 44px rgba(0,0,0,.7);transform:rotate(1.5deg);display:flex;flex-direction:column;gap:12px;position:relative">
  <div style="position:absolute;right:26px;top:-14px;width:90px;height:26px;background:rgba(224,180,58,.55);transform:rotate(-4deg);box-shadow:0 1px 2px rgba(0,0,0,.2)"></div>
  <div style="height:250px;background:radial-gradient(ellipse at 40% 30%,#8a5a34 0%,#3a2814 55%,#160f08 100%);position:relative;overflow:hidden"><div class="grano" style="opacity:.25"></div>
    <svg viewBox="0 0 292 250" width="292" height="250" style="position:absolute;inset:0"><path d="M146 40c-18 0-30 14-30 34v90h60V74c0-20-12-34-30-34z" fill="#3b6b4a" opacity=".85"/><rect x="132" y="24" width="28" height="22" fill="#b9ae95"/><path d="M118 164h56l-6 40h-44z" fill="#2a3a2c"/><path d="M146 12c6 8 10 14 6 18-3 3-9 1-12-2-3-4 0-10 6-16z" fill="#e0b43a"/><path d="M148 6c3 6 5 10 3 12-2 1-5 0-6-2-1-3 0-6 3-10z" fill="#c9553d"/></svg>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:baseline"><div class="display" style="font-size:36px;line-height:1;color:#2a2622;font-weight:700">Molotov</div><span class="tag" style="border-color:#8a2a1e;color:#8a2a1e">objeto · peso 1</span></div>
  <div class="mono" style="font-size:14px;color:#2a2622;line-height:1.45">Elimina todos los zombis de una casilla adyacente. La casilla arde 2 rondas. La horda más cercana avanza 1 hacia el fuego.</div>
  <div class="mono" style="font-size:12px;color:#6a5a48;border-top:1px dashed #b9ae95;padding-top:8px;display:flex;justify-content:space-between"><span>botella + trapo + gasolina</span><span>no hace ruido</span></div>
</div>
<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 18px 20px;display:flex;gap:10px;background:linear-gradient(180deg,rgba(26,28,25,0),#1a1c19 40%)"><div class="btn ghost" style="flex:1">Dar a…</div><div class="btn" style="flex:1.4">Lanzar (1 acción)</div></div>
</div>\n` + tail);

/* ---- Zombi ---- */
writeFileSync('Zombi.dc.html', head(`.tablero3d{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) perspective(620px) rotateX(46deg) rotateZ(-18deg);filter:saturate(.2) contrast(1.2) drop-shadow(0 30px 30px rgba(0,0,0,.7))}`) + `<div class="phone" style="background:#0d100c">
${header('Invierno', '7 / 10', 8, 10, 'Comida en refugio 6/10 · tú ya no cuentas')}
<div style="position:relative;flex:1;overflow:hidden;background:radial-gradient(ellipse at 50% 60%, #263022 0%, #0d100c 70%)">
  <div class="grano"></div>
  <div class="tablero3d">${board(560, 460, { s: 24 })}</div>
  <div style="position:absolute;left:50%;top:50%;width:70px;height:70px;transform:translate(-64px,-88px);border-radius:50%;background:radial-gradient(circle,rgba(157,176,96,.55),rgba(157,176,96,0) 70%)"></div>
  <div style="position:absolute;left:50%;top:50%;width:110px;height:110px;transform:translate(10px,-40px);border-radius:50%;background:radial-gradient(circle,rgba(201,85,61,.5),rgba(201,85,61,0) 70%)"></div>
  <div style="position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:6px"><div class="tag" style="background:rgba(13,16,12,.8);border-color:#9db060;color:#9db060">Oculto entre la horda</div><div class="tag" style="background:rgba(13,16,12,.8)">Huelen a 2: Marta, Nora</div></div>
  <div style="position:absolute;left:12px;bottom:12px;display:flex;align-items:center;gap:8px;background:rgba(13,16,12,.85);border-left:3px solid #9db060;padding:6px 10px"><div style="width:26px;height:26px;border-radius:50%;background:#4f5a3a;border:2px solid #9db060"></div><div><div style="font-weight:600;font-size:14px">Iker · convertido</div><div style="font-size:11px;color:#9aa096">Nivel 1 · 2 acciones · 3 de 6 para ganar</div></div></div>
</div>
<div style="padding:12px 14px;background:#12160f;border-top:3px solid #9db060;display:flex;flex-direction:column;gap:10px">
  <div style="font-size:13px;color:#9aa096">El equipo no sabe cuál de los seis caminantes eres. Habla con ellos. Miente si hace falta.</div>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"><div class="btn ghost" style="border-color:#3a4a33">Empujar horda</div><div class="btn ghost" style="border-color:#3a4a33">Oler una mano</div><div class="btn ghost" style="border-color:#3a4a33">Moverme</div><div class="btn" style="background:#9db060">Atacar a Marta</div></div>
</div>
${tabbar('Tablero').replace('#e0b43a','#9db060')}
</div>\n` + tail);

/* ---- Pantalla compartida (TV 1440x810) ---- */
writeFileSync('Pantalla.dc.html', head(`.tv{width:1440px;height:810px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 65% 10%, #6a4a33 0%, #2b2f29 35%, #0f110f 85%);display:flex}.tablero3d{position:absolute;left:44%;top:54%;transform:translate(-50%,-50%) perspective(1400px) rotateX(42deg) rotateZ(-14deg);filter:drop-shadow(0 50px 50px rgba(0,0,0,.65))}`) + `<div class="tv">
<div class="grano"></div>
<div class="tablero3d">${board(1120, 900, { s: 46 })}</div>
<div style="position:absolute;left:28px;top:24px;display:flex;align-items:center;gap:16px"><div class="display" style="font-size:44px;line-height:1">Z-<span style="color:#c9553d">2099</span></div><div style="height:30px;width:1px;background:#3a3f3a"></div><div><div style="font-weight:600;font-size:20px">Farmacia Central</div><div style="color:#9aa096;font-size:14px">Ronda 4 de 10 · Antibióticos en el refugio 1/3 · Cuenta atrás de contagio</div></div></div>
<div style="position:absolute;left:28px;bottom:24px;display:flex;align-items:center;gap:14px;background:rgba(20,22,20,.8);border:1px solid #3a3f3a;padding:14px 18px"><span style="display:flex;color:#e0b43a">${ico.ruido}</span><div style="display:flex;gap:4px">${Array.from({length:10},(_,i)=>`<i style="display:block;width:22px;height:30px;background:${i<6?(i>=7?'#c9553d':'#e0b43a'):'#262a25'};border:1px solid #33393e"></i>`).join('')}</div><div><div class="display" style="font-size:30px;line-height:1">Ruido 6 / 10</div><div style="font-size:13px;color:#9aa096">A 4 de la horda. Se oyen gemidos al noreste.</div></div></div>
<div style="position:absolute;right:0;top:0;bottom:0;width:340px;background:rgba(20,22,20,.86);border-left:1px solid #2c302c;padding:24px 22px;display:flex;flex-direction:column;gap:10px">
  <div class="mono" style="font-size:11px;color:#9aa096;letter-spacing:.14em;text-transform:uppercase">Planificando · 0:42</div>
  ${[['#5f8fb4','Beslan · Elías','♥♥♥♥','Plan confirmado','#9db060'],['#c9a24a','Marta · Sunja','♥♥♥','Planificando…','#e0b43a'],['#b4553f','Iker · Naima','♥♥','Mordida · 2 turnos','#c9553d'],['#7aa06a','Nora · Tomás','♥♥♥','Plan confirmado','#9db060'],['#9a7fb8','Dani · Kenji','♥♥♥','En coche · gas 2','#9aa096'],['#d0865a','Lucía · Beatriz','♥','En el suelo','#c9553d']].map(([c,n,v,e,ec])=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#1d201c;border-left:3px solid ${c}"><div style="width:30px;height:30px;border-radius:50%;background:${c};flex:none"></div><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</div><div style="font-size:12px;color:${ec}">${e}</div></div><div style="color:#c9553d;letter-spacing:1px;font-size:15px">${v}</div></div>`).join('')}
  <div style="margin-top:auto;padding:12px;border:1px dashed #3a3f3a;color:#9aa096;font-size:13px;display:flex;flex-direction:column;gap:4px"><span class="mono" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#e0b43a">Cámara directora</span><span>Plano general durante la planificación. Toca la pantalla para tomar el control 20 segundos.</span></div>
</div>
</div>\n` + tail);

writeFileSync('canvas.json', JSON.stringify({
  artboards: [
    { file: 'Sala.dc.html', x: 0, y: 0, w: 390, h: 844, title: 'Sala' },
    { file: 'Personaje.dc.html', x: 480, y: 0, w: 390, h: 844, title: 'Personaje · expediente' },
    { file: 'Main.dc.html', x: 960, y: 0, w: 390, h: 844, title: 'Tablero · planificación' },
    { file: 'Carta.dc.html', x: 1440, y: 0, w: 390, h: 844, title: 'Carta · polaroid' },
    { file: 'Zombi.dc.html', x: 1920, y: 0, w: 390, h: 844, title: 'Jugador zombi' },
    { file: 'Pantalla.dc.html', x: 0, y: 1000, w: 1440, h: 810, title: 'Pantalla compartida · TV' },
  ],
  annotations: [
    { id: 'nota-direccion', x: 2400, y: 0, w: 300, text: 'Dirección: crudo fotorealista, tono 3/5. Paleta: asfalto #141614, oliva #4f5a3a, óxido #c9553d, cinta de peligro #e0b43a, papel de expediente #e9e2cf.\n\nTipos: Big Shoulders Display (titulares), Special Elite (expedientes y notas a máquina), Source Sans 3 (interfaz).\n\nEl tablero es un boceto en perspectiva para la maqueta; en Unity será la escena 3D con cámara libre.' },
    { id: 'nota-decisiones', x: 2400, y: 320, w: 300, text: 'Decisiones que hay que tomar viendo esto:\n1. ¿Las cartas de la mano se ven como polaroids pequeñas (como en Tablero) o como una tira uniforme?\n2. ¿La barra inferior con 4 pestañas o solo el tablero a pantalla completa con botones flotantes?\n3. ¿La pantalla del zombi en verde (como aquí) o en rojo?\n4. ¿Nombres reales de los jugadores o solo el personaje en la TV?' },
  ],
  launch: { view: 'canvas' },
}, null, 2));
console.log('artboards listos');
