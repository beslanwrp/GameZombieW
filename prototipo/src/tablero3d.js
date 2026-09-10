// Z-2099 · tablero 3D con cámara libre (Three.js). Sin modelos de personaje: fichas estilizadas, escenografía procedural.
const T3D = (() => {
  let renderer, scene, camera, cont = null, capaEtiquetas, raf = 0, activo = false, G0 = null, opts = {}, callback = null, firmaProps = '', encuadrado = false;
  const celdas = new Map(); let gProps, gFichas, gResaltes, gCeldas, suelo;
  const cam = { az: Math.PI / 4, el: 0.95, dist: 20, target: null };
  const COL = { calle: 0x45484a, edificio: 0x6a6152, bosque: 0x3d4a30, gasolinera: 0x7a5a2e, farmacia: 0x6e4a4a, taller: 0x5b5a6a, refugio: 0x7a5a45, entrada: 0x5a2d2d, helipuerto: 0x3d5a6a, torre: 0x3d5a6a, laboratorio: 0x5a4d6a, generador: 0x6a5a2a, oculta: 0x1b1d19 };
  const COLJ = ['#5f8fb4', '#c9a24a', '#7aa06a', '#b4553f', '#e0b43a', '#6fb1a6', '#a9a06e', '#9a7fb8', '#d0865a', '#c56d8a', '#8b96c5', '#9aa096'];
  const geos = {}, mats = {};
  const geo = (k, f) => geos[k] || (geos[k] = f());
  const mat = (k, f) => mats[k] || (mats[k] = f());
  const std = (color, extra = {}) => mat('std' + color + JSON.stringify(extra), () => new THREE.MeshStandardMaterial({ color, roughness: .9, metalness: .05, ...extra }));
  const hash = k => { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) | 0; return ((h >>> 0) % 1000) / 1000; };
  const pos = k => { const [q, r] = k.split(',').map(Number); return [Math.sqrt(3) * (q + r / 2), 1.5 * r]; };

  function disponible() { try { if (!window.THREE) return false; const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  function iniciar() {
    if (activo || !disponible()) return activo;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = 'lienzo3d'; renderer.domElement.style.touchAction = 'none';
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1c19); scene.fog = new THREE.Fog(0x1a1c19, 26, 70);
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300); cam.target = new THREE.Vector3(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0x8a7a66, 0x1e2420, 0.85));
    const sol = new THREE.DirectionalLight(0xffb478, 1.35); sol.position.set(18, 9, -14); scene.add(sol);
    const relleno = new THREE.DirectionalLight(0x6a7a9a, 0.35); relleno.position.set(-12, 10, 10); scene.add(relleno);
    suelo = new THREE.Mesh(new THREE.CircleGeometry(80, 48), std(0x121411)); suelo.rotation.x = -Math.PI / 2; suelo.position.y = -0.25; scene.add(suelo);
    gCeldas = new THREE.Group(); gProps = new THREE.Group(); gFichas = new THREE.Group(); gResaltes = new THREE.Group(); scene.add(gCeldas, gProps, gFichas, gResaltes);
    capaEtiquetas = document.createElement('div'); capaEtiquetas.className = 'etiquetas3d';
    gestos(renderer.domElement); activo = true; bucle(); return true;
  }
  function montarEn(c) { if (!activo || !c) return; if (cont !== c) { cont = c; c.appendChild(renderer.domElement); c.appendChild(capaEtiquetas); } redimensionar(); }
  function redimensionar() { if (!activo || !cont) return; const w = cont.clientWidth || 1, h = cont.clientHeight || 1; renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = w / h; camera.updateProjectionMatrix(); }

  /* ---------- construcción de la escena ---------- */
  function construirCeldas(G) {
    gCeldas.clear(); celdas.clear();
    for (const c of Object.values(G.casillas)) {
      const h = c.tipo === 'calle' ? 0.14 : 0.24; const g = geo('hex' + h, () => new THREE.CylinderGeometry(0.965, 0.965, h, 6));
      const m = new THREE.Mesh(g, std(c.revelada ? COL[c.tipo] : COL.oculta)); const [x, z] = pos(c.k); m.position.set(x, h / 2, z); m.userData.k = c.k; gCeldas.add(m); celdas.set(c.k, m);
    }
  }
  function refrescarCeldas(G) { for (const c of Object.values(G.casillas)) { const m = celdas.get(c.k); if (!m) continue; const col = c.revelada ? COL[c.tipo] : COL.oculta; if (m.material.color.getHex() !== col) m.material = std(col); } }
  function caja(w, h, d, color, x, y, z, grupo) { const m = new THREE.Mesh(geo(`box${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), std(color)); m.position.set(x, y, z); grupo.add(m); return m; }
  function cilindro(rt, rb, h, seg, color, x, y, z, grupo, extra) { const m = new THREE.Mesh(geo(`cyl${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), std(color, extra)); m.position.set(x, y, z); grupo.add(m); return m; }
  function construirProps(G) {
    gProps.clear(); const rv = c => c.revelada;
    for (const c of Object.values(G.casillas)) {
      if (!rv(c)) continue; const [x, z] = pos(c.k); const base = c.tipo === 'calle' ? 0.14 : 0.24; const r = hash(c.k); const gr = new THREE.Group(); gr.position.set(x - 0.22, base, z - 0.22); gr.scale.setScalar(0.72); gr.rotation.y = (r - 0.5) * 0.6;
      switch (c.tipo) {
        case 'edificio': { const hb = 0.7 + r * 1.1; caja(1.0, hb, 0.8, c.saqueos >= 2 ? 0x4a453d : 0x5e5649, 0, hb / 2, 0, gr); caja(1.06, 0.06, 0.86, 0x2f2a24, 0, hb + 0.03, 0, gr); if (r > .5) caja(0.4, 0.3, 0.4, 0x3a3630, 0.25, hb + 0.2, -0.15, gr); break; }
        case 'bosque': for (let i = 0; i < 3; i++) { const a = i * 2.1 + r; const tx = Math.cos(a) * 0.4, tz = Math.sin(a) * 0.4; cilindro(0.05, 0.07, 0.5, 5, 0x3a2e22, tx, 0.25, tz, gr); cilindro(0, 0.34, 0.9, 6, 0x36452a, tx, 0.85, tz, gr); } break;
        case 'gasolinera': caja(0.9, 0.5, 0.7, 0x6b6a62, 0, 0.25, 0, gr); cilindro(0.04, 0.04, 1.1, 6, 0x8a8478, 0.55, 0.55, 0.3, gr); caja(0.5, 0.25, 0.08, 0xd07a2a, 0.55, 1.15, 0.3, gr); break;
        case 'farmacia': caja(0.9, 0.7, 0.8, 0x7a7068, 0, 0.35, 0, gr); caja(0.36, 0.1, 0.06, 0xc9553d, 0, 0.55, 0.43, gr); caja(0.1, 0.36, 0.06, 0xc9553d, 0, 0.55, 0.43, gr); break;
        case 'taller': caja(1.0, 0.6, 0.8, 0x5b5a66, 0, 0.3, 0, gr); cilindro(0.22, 0.22, 0.6, 10, 0x8a8a90, 0.5, 0.3, -0.3, gr); break;
        case 'refugio': cilindro(0.5, 0.55, 0.7, 6, 0x7a6a52, 0, 0.35, 0, gr); cilindro(0, 0.62, 0.5, 6, 0x7a2a1e, 0, 0.95, 0, gr); break;
        case 'entrada': cilindro(0.06, 0.06, 0.9, 6, 0x7a2a1e, -0.5, 0.45, 0.3, gr); cilindro(0.06, 0.06, 0.9, 6, 0x7a2a1e, 0.5, 0.45, -0.3, gr); caja(0.9, 0.05, 0.05, 0xe0b43a, 0, 0.7, 0, gr); break;
        case 'helipuerto': { const m = new THREE.Mesh(geo('anillo', () => new THREE.RingGeometry(0.55, 0.7, 24)), std(0xe6e3da)); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; gr.add(m); break; }
        case 'torre': cilindro(0.05, 0.12, 2.4, 6, 0x8a8478, 0, 1.2, 0, gr); cilindro(0.1, 0.1, 0.1, 8, 0xc9553d, 0, 2.5, 0, gr, { emissive: 0xc9553d, emissiveIntensity: .8 }); break;
        case 'generador': caja(0.8, 0.5, 0.6, 0x6a6a5a, 0, 0.25, 0, gr); cilindro(0.18, 0.18, 0.7, 10, 0xe0b43a, 0.35, 0.35, 0.3, gr, { emissive: 0x6a4a00, emissiveIntensity: G.almacen && G.almacen.bidon ? .6 : 0 }); break;
        case 'laboratorio': caja(1.0, 0.8, 0.8, 0xd8d6cc, 0, 0.4, 0, gr); caja(0.3, 0.3, 0.3, 0x5a4d6a, 0.25, 0.95, 0, gr); break;
      }
      if (c.objetos && c.objetos.length) caja(0.3, 0.3, 0.3, c.objetos.includes('suministro') ? 0xe0b43a : 0x8a8478, -0.45, 0.15, 0.45, gr);
      if (c.fuego) { const f = cilindro(0, 0.45, 0.8, 7, 0xff7a2a, 0, 0.4, 0, gr, { emissive: 0xff5a1a, emissiveIntensity: 1.2 }); f.userData.fuego = true; }
      if (c.senuelo) { const m = new THREE.Mesh(geo('anilloS', () => new THREE.RingGeometry(0.45, 0.6, 24)), std(0xe0b43a, { emissive: 0xe0b43a, emissiveIntensity: .8, transparent: true, opacity: .9 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.userData.pulso = true; gr.add(m); }
      gProps.add(gr);
    }
    for (const ar of G.barricadas || []) { const [a, b] = ar.split('|'); const [ax, az] = pos(a), [bx, bz] = pos(b); const m = caja(0.9, 0.42, 0.12, 0xb08a3a, (ax + bx) / 2, 0.45, (az + bz) / 2, gProps); m.rotation.y = Math.atan2(bx - ax, bz - az) + Math.PI / 2; }
  }
  function firma(G) { let s = (G.barricadas || []).join(';'); for (const c of Object.values(G.casillas)) if (c.revelada) s += c.k + c.tipo[0] + c.saqueos + (c.fuego ? 'f' + c.fuego : '') + (c.senuelo ? 's' : '') + (c.objetos.length ? 'o' : ''); return s + (G.almacen && G.almacen.bidon); }
  function ficha(color, x, z, alto = 1, cabeza = 0xd8b79a) { const gr = new THREE.Group(); const cuerpo = cilindro(0.2, 0.24, 0.5 * alto, 12, color, 0, 0.25 * alto, 0, gr); const cab = new THREE.Mesh(geo('esf', () => new THREE.SphereGeometry(0.17, 12, 10)), std(cabeza)); cab.position.y = 0.62 * alto; gr.add(cab); const sombra = new THREE.Mesh(geo('sombra', () => new THREE.CircleGeometry(0.3, 16)), mat('sombra', () => new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35 }))); sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.005; gr.add(sombra); gr.position.set(x, 0, z); void cuerpo; return gr; }
  const etiquetas = [];
  function construirFichas(G, o) {
    gFichas.clear(); etiquetas.length = 0; const porCelda = {};
    for (const j of G.jugadores) { if (!['vivo', 'caido'].includes(j.estado) || j.pasajeroDe != null) continue; (porCelda[j.pos] = porCelda[j.pos] || []).push(j); }
    for (const [k, js] of Object.entries(porCelda)) { const [x, z] = pos(k); const base = G.casillas[k].tipo === 'calle' ? 0.14 : 0.24; js.forEach((j, i) => { const a = js.length > 1 ? (i / js.length) * Math.PI * 2 : 0; const off = js.length > 1 ? 0.38 : 0; const fx = x + 0.28 + Math.cos(a) * off * 0.6, fz = z + 0.28 + Math.sin(a) * off * 0.6; const col = new THREE.Color(o.colores ? o.colores[j.id] : COLJ[j.id % 12]).getHex(); const f = ficha(col, fx, fz); f.position.y = base; if (j.estado === 'caido') { f.rotation.z = Math.PI / 2; f.position.y = base + 0.2; }
      if (o.actual === j.id) { const an = new THREE.Mesh(geo('anilloA', () => new THREE.RingGeometry(0.3, 0.38, 24)), std(0xffffff, { emissive: 0xffffff, emissiveIntensity: .9 })); an.rotation.x = -Math.PI / 2; an.position.y = 0.01; an.userData.pulso = true; f.add(an); }
      if (j.mordido) { const m = new THREE.Mesh(geo('esfM', () => new THREE.SphereGeometry(0.07, 8, 6)), std(0xc9553d, { emissive: 0xc9553d, emissiveIntensity: 1 })); m.position.y = 0.9; f.add(m); }
      if (j.vehiculo) caja(0.55, 0.14, 0.35, 0x3a3f4a, 0, 0.07, 0, f);
      gFichas.add(f); etiquetas.push({ x: fx, y: base + 1.0, z: fz, dy: -i * 16, texto: `${j.id + 1} ${j.nombre}`, clase: 'sup', color: o.colores ? o.colores[j.id] : COLJ[j.id % 12] }); }); }
    for (const zb of Object.values(G.zombis)) { const c = G.casillas[zb.pos]; if (!c || !c.revelada) continue; if (zb.tipo === 'jugador' && zb.oculto && !o.verOculto) continue; const [x, z] = pos(zb.pos); const base = c.tipo === 'calle' ? 0.14 : 0.24; const n = Math.min(zb.n, 5); const col = zb.tipo === 'jugador' ? 0x8fa86a : zb.tipo === 'acorazado' ? 0x3a3f4a : zb.tipo === 'corredor' ? 0x7a5a3a : zb.tipo === 'nino' ? 0x6a5a6a : 0x4f5a3a;
      for (let i = 0; i < n; i++) { const a = n > 1 ? (i / n) * Math.PI * 2 + 0.7 : 0; const off = n > 1 ? 0.3 : 0; const f = ficha(col, x + 0.3 + Math.cos(a) * off * 0.7, z + 0.05 + Math.sin(a) * off * 0.7, zb.tipo === 'nino' ? 0.7 : 0.95, 0x8a9a7a); f.rotation.x = 0.18; f.position.y = base; gFichas.add(f); }
      if (zb.n > 1 || zb.tipo !== 'caminante') etiquetas.push({ x: x + 0.3, y: base + 0.95, z: z + 0.05, texto: (zb.tipo === 'jugador' ? G.jugadores[zb.jugadorId].nombre + ' zombi' : { caminante: 'caminantes', corredor: 'corredores', acorazado: 'acorazado', nino: 'niño' }[zb.tipo]) + (zb.n > 1 ? ' ×' + zb.n : ''), clase: 'zom' }); }
  }
  function hexAnillo() { return geo('hexAnillo', () => { const g = new THREE.RingGeometry(0.76, 0.93, 6, 1, 0, Math.PI * 2); g.rotateZ(Math.PI / 6); g.rotateX(-Math.PI / 2); return g; }); }
  function construirResaltes(G, o) {
    gResaltes.clear(); const pon = (k, color) => { const c = G.casillas[k]; if (!c) return; const [x, z] = pos(k); const m = new THREE.Mesh(hexAnillo(), mat('res' + color, () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, side: THREE.DoubleSide }))); m.position.set(x, (c.tipo === 'calle' ? 0.14 : 0.24) + 0.03, z); m.material.depthWrite = false; gResaltes.add(m); };
    (o.destinos || []).forEach(k => pon(k, o.colorDestinos || 0x9db060)); (o.objetivos || []).forEach(k => pon(k, 0xc9553d)); if (o.seleccion) pon(o.seleccion, 0xe0b43a);
  }
  function actualizar(G, o = {}) {
    if (!activo) return; opts = o; const nuevaPartida = !G0 || G0.semilla !== G.semilla && Object.keys(G.casillas).length !== celdas.size || celdas.size !== Object.keys(G.casillas).length;
    if (nuevaPartida) { construirCeldas(G); firmaProps = ''; encuadrado = false; } else refrescarCeldas(G);
    const f = firma(G); if (f !== firmaProps) { construirProps(G); firmaProps = f; }
    construirFichas(G, o); construirResaltes(G, o); G0 = G; if (!encuadrado) { encuadrar(G); encuadrado = true; }
  }

  /* ---------- cámara ---------- */
  function radioMapa() { let r = 6; if (G0) for (const c of Object.values(G0.casillas)) { const [x, z] = pos(c.k); r = Math.max(r, Math.hypot(x, z)); } return r; }
  function encuadrar() { cam.target.set(0, 0, 0); cam.dist = radioMapa() * 2.35; cam.el = 0.98; }
  function centrarEn(k, dist = 8) { if (!k) return; const [x, z] = pos(k); cam.target.set(x, 0, z); cam.dist = dist; cam.el = Math.max(cam.el, 0.7); }
  function vistaMesa() { cam.az = Math.PI / 4; cam.el = 0.95; }
  function colocarCamara() { const { az, el, dist, target } = cam; camera.position.set(target.x + dist * Math.cos(el) * Math.sin(az), target.y + dist * Math.sin(el), target.z + dist * Math.cos(el) * Math.cos(az)); camera.lookAt(target); }
  function gestos(dom) {
    const punteros = new Map(); let inicio = null, movido = false, pinza = null, ultimoTap = 0;
    dom.addEventListener('pointerdown', e => { punteros.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (punteros.size === 1) { inicio = { x: e.clientX, y: e.clientY }; movido = false; } else if (punteros.size === 2) { const [a, b] = [...punteros.values()]; pinza = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; } dom.setPointerCapture(e.pointerId); });
    dom.addEventListener('pointermove', e => { const p = punteros.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (punteros.size === 1) { if (Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 8) movido = true; if (movido) { cam.az -= dx * 0.006; cam.el = Math.min(1.42, Math.max(0.35, cam.el + dy * 0.005)); } }
      else if (punteros.size === 2 && pinza) { const [a, b] = [...punteros.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; cam.dist = Math.min(60, Math.max(4, cam.dist * pinza.d / d)); const k = cam.dist * 0.0022; const mx = cx - pinza.cx, my = cy - pinza.cy; cam.target.x -= (mx * Math.cos(cam.az) - my * Math.sin(cam.az)) * k; cam.target.z -= (-mx * Math.sin(cam.az) - my * Math.cos(cam.az)) * k; pinza = { d, cx, cy }; movido = true; } });
    const fin = e => { punteros.delete(e.pointerId); if (punteros.size < 2) pinza = null; if (punteros.size === 0 && inicio && !movido) { const ahora = performance.now(); const k = celdaBajo(e.clientX, e.clientY); if (k && ahora - ultimoTap < 320) { centrarEn(k); } else if (callback) callback(k); ultimoTap = ahora; } if (punteros.size === 0) inicio = null; };
    dom.addEventListener('pointerup', fin); dom.addEventListener('pointercancel', fin);
    dom.addEventListener('wheel', e => { e.preventDefault(); cam.dist = Math.min(60, Math.max(4, cam.dist * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });
  }
  const rayo = new THREE.Raycaster(); const nd = new THREE.Vector2();
  function celdaBajo(cx, cy) { const r = renderer.domElement.getBoundingClientRect(); nd.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); rayo.setFromCamera(nd, camera); const hits = rayo.intersectObjects(gCeldas.children, false); return hits.length ? hits[0].object.userData.k : null; }

  /* ---------- bucle ---------- */
  const tmp = new THREE.Vector3();
  function bucle(t = 0) {
    raf = requestAnimationFrame(bucle); if (!cont || !cont.isConnected || cont.closest('.pantalla[hidden]')) return;
    const pulso = 0.75 + 0.25 * Math.sin(t / 220);
    gResaltes.children.forEach(m => { m.material.opacity = 0.55 + 0.4 * pulso; }); gFichas.traverse(m => { if (m.userData.pulso) m.scale.setScalar(0.9 + 0.2 * pulso); }); gProps.traverse(m => { if (m.userData.fuego) m.scale.set(0.9 + 0.2 * Math.sin(t / 90), 0.85 + 0.3 * Math.sin(t / 70 + 1), 0.9 + 0.2 * Math.cos(t / 110)); if (m.userData.pulso) m.scale.setScalar(0.9 + 0.25 * pulso); });
    colocarCamara(); renderer.render(scene, camera);
    // etiquetas en espacio de pantalla
    const r = renderer.domElement; const w = r.clientWidth, h = r.clientHeight; let html = '';
    for (const e of etiquetas) { tmp.set(e.x, e.y, e.z).project(camera); if (tmp.z > 1) continue; const sx = (tmp.x + 1) / 2 * w, sy = (1 - tmp.y) / 2 * h + (e.dy || 0); html += `<div class="et ${e.clase}" style="transform:translate(${sx.toFixed(0)}px,${sy.toFixed(0)}px)${e.color ? ';border-color:' + e.color : ''}">${e.texto}</div>`; }
    if (capaEtiquetas.innerHTML !== html) capaEtiquetas.innerHTML = html;
  }
  return { disponible, iniciar, montarEn, redimensionar, actualizar, encuadrar: () => { encuadrar(); }, centrarEn, vistaMesa, onTocar: f => { callback = f; }, activo: () => activo };
})();
