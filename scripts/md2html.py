#!/usr/bin/env python3
"""Convierte un documento Markdown del proyecto en una página HTML con el estilo de Z-2099.
Uso: python3 scripts/md2html.py docs/06-plan-m1.md "Título" > salida.html
Admite encabezados, párrafos, listas, tablas, negrita, cursiva, código en línea y bloques de código."""
import re, sys, html
src = open(sys.argv[1], encoding='utf-8').read(); titulo = sys.argv[2] if len(sys.argv) > 2 else 'Z-2099'
def inline(t):
    t = html.escape(t, quote=False); t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t); t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    return re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', t)
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().translate(str.maketrans('áéíóúñ', 'aeioun'))).strip('-')
lines = src.split('\n'); out = []; toc = []; i = 0
while i < len(lines):
    l = lines[i]
    if l.startswith('```'):
        j = i + 1; buf = []
        while j < len(lines) and not lines[j].startswith('```'): buf.append(lines[j]); j += 1
        out.append('<pre><code>' + html.escape('\n'.join(buf)) + '</code></pre>'); i = j + 1; continue
    if l.startswith('# '): out.append(f'<h1>{inline(l[2:])}</h1>'); i += 1; continue
    if l.startswith('## '): t = l[3:]; s = slug(t); toc.append((t, s)); out.append(f'<h2 id="{s}">{inline(t)}</h2>'); i += 1; continue
    if l.startswith('### '): out.append(f'<h3>{inline(l[4:])}</h3>'); i += 1; continue
    if l.strip() == '---': out.append('<hr>'); i += 1; continue
    if l.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'): rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
        hdr = rows[0]; body = rows[2:] if len(rows) > 1 and set(''.join(rows[1])) <= set('-: ') else rows[1:]
        h = '' if all(c == '' for c in hdr) else '<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in hdr) + '</tr></thead>'
        out.append(f'<div class="tw"><table>{h}<tbody>' + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body) + '</tbody></table></div>'); continue
    if re.match(r'^\d+\. ', l):
        items = []
        while i < len(lines) and re.match(r'^\d+\. ', lines[i]): items.append(re.sub(r'^\d+\. ', '', lines[i])); i += 1
        out.append('<ol>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ol>'); continue
    if l.startswith('- '):
        items = []
        while i < len(lines) and lines[i].startswith('- '): items.append(lines[i][2:]); i += 1
        out.append('<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ul>'); continue
    if not l.strip(): i += 1; continue
    para = [l]; i += 1
    while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||- |\d+\. |---|```)', lines[i]): para.append(lines[i]); i += 1
    out.append(f'<p>{inline(" ".join(para))}</p>')
tocs = ''.join(f'<li><a href="#{s}">{inline(t)}</a></li>' for t, s in toc)
print(f'''<title>{html.escape(titulo)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#E4E5E0;--surface:#F2F2EE;--surface2:#E9EAE5;--ink:#16181A;--muted:#5A5F64;--line:#C6C9C2;--accent:#9B2C1C;--hazard:#D6A319;--focus:#2B5FA8;}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#131517;--surface:#1C1F22;--surface2:#23272B;--ink:#E8E6DF;--muted:#9BA1A5;--line:#33393E;--accent:#D0553F;--hazard:#E4B738;--focus:#7FA6E8;}}}}
:root[data-theme="dark"]{{--bg:#131517;--surface:#1C1F22;--surface2:#23272B;--ink:#E8E6DF;--muted:#9BA1A5;--line:#33393E;--accent:#D0553F;--hazard:#E4B738;--focus:#7FA6E8;}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font-family:"Source Sans 3",system-ui,sans-serif;font-size:17px;line-height:1.55}}
.hazard{{height:10px;background:repeating-linear-gradient(-45deg,var(--hazard) 0 18px,var(--ink) 18px 36px)}}
.layout{{max-width:1180px;margin:0 auto;padding:0 20px 80px;display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px}}
@media (max-width:900px){{.layout{{grid-template-columns:1fr;gap:0}}nav.toc{{position:static;max-height:none;border-bottom:1px solid var(--line);padding-bottom:16px}}}}
nav.toc{{position:sticky;top:0;align-self:start;max-height:100vh;overflow:auto;padding:28px 0}}nav.toc .eyebrow{{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}}
nav.toc ol{{margin:0;padding:0;list-style:none;counter-reset:s}}nav.toc li{{counter-increment:s;font-size:14px;line-height:1.35;padding:4px 0;border-top:1px solid var(--line)}}nav.toc li::before{{content:counter(s,decimal-leading-zero);font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--accent);margin-right:8px}}nav.toc a{{color:var(--ink);text-decoration:none}}nav.toc a:hover{{color:var(--accent)}}
main{{min-width:0;padding-top:28px}}h1{{font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-weight:800;font-size:clamp(44px,7vw,84px);line-height:.92;text-transform:uppercase;margin:0 0 14px;text-wrap:balance}}
h2{{font-family:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;font-weight:700;font-size:36px;line-height:1;text-transform:uppercase;margin:48px 0 12px;scroll-margin-top:16px}}h3{{font-size:19px;font-weight:600;margin:26px 0 8px}}
p{{margin:0 0 14px;max-width:72ch}}h1+p{{color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:13px}}hr{{border:0;border-top:1px solid var(--line);margin:36px 0 0}}
ul,ol{{margin:0 0 14px;padding-left:22px;max-width:72ch}}li{{margin-bottom:6px}}strong{{font-weight:600}}code{{font-family:"IBM Plex Mono",monospace;font-size:.88em;background:var(--surface2);padding:1px 5px}}
pre{{background:var(--surface);border:1px solid var(--line);padding:14px 16px;overflow-x:auto;font-size:14px;line-height:1.5}}pre code{{background:none;padding:0}}
.tw{{overflow-x:auto;margin:0 0 18px;border:1px solid var(--line);background:var(--surface)}}table{{border-collapse:collapse;width:100%;font-size:15px;line-height:1.4}}th,td{{text-align:left;vertical-align:top;padding:9px 12px;border-bottom:1px solid var(--line)}}
th{{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500;background:var(--surface2)}}tr:last-child td{{border-bottom:0}}
</style>
<div class="hazard"></div><div class="layout"><nav class="toc"><div class="eyebrow">{html.escape(titulo)}</div><ol>{tocs}</ol></nav><main>
{chr(10).join(out)}
</main></div>''')
