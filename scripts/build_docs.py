#!/usr/bin/env python3
"""把仓库根目录下的 Markdown 文档渲染成与网站风格一致的 HTML 页面。

用法：python3 scripts/build_docs.py
- 每个 *.md 生成同名 .html（如 配色趋势与图片核对-V2.md → 配色趋势与图片核对-V2.html）
- 文档之间的 .md 链接自动改为 .html
- 依赖：pip install markdown
"""
import html
import pathlib
import re

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent

TEMPLATE = """<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 君荣纺织</title>
<style>
:root{{--paper:#F7F5EF;--ink:#252923;--olive:#626A4B;--sand:#E8E3D8;--line:#DAD8CE;--muted:#6f7068}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.85 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}}
a{{color:var(--olive)}}
.top{{display:flex;justify-content:space-between;align-items:center;gap:16px;max-width:1100px;margin:auto;padding:22px 5%;border-bottom:1px solid var(--line)}}
.top .brand{{font:28px Georgia,"Times New Roman",serif;color:var(--ink);text-decoration:none}}
.top nav{{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}}
.top nav a{{color:var(--ink);text-decoration:none}}
.top nav a:hover{{color:var(--olive)}}
main{{max-width:900px;margin:auto;padding:40px 5% 80px}}
h1,h2,h3,h4{{font-family:"Songti SC",STSong,"Noto Serif SC",serif;font-weight:400;line-height:1.4}}
h1{{font-size:clamp(18px,4.4vw,40px);margin:16px 0 28px;white-space:nowrap}}
main h1+p{{font-size:14px;color:var(--muted);letter-spacing:.02em}}
h2{{font-size:28px;margin:56px 0 18px;padding-top:24px;border-top:1px solid var(--line)}}
h3{{font-size:22px;margin:36px 0 12px}}
p,li{{max-width:820px}}
table{{width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;display:block;overflow-x:auto}}
th,td{{border-bottom:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}}
th{{background:var(--sand);font-weight:500;white-space:nowrap}}
code{{background:var(--sand);padding:1px 6px;font-size:.9em;font-family:Menlo,Consolas,monospace}}
pre{{background:#fff;border:1px solid var(--line);padding:20px;overflow-x:auto;line-height:1.7}}
pre code{{background:none;padding:0;white-space:pre-wrap;word-break:break-word}}
blockquote{{margin:20px 0;padding:4px 20px;border-left:3px solid var(--olive);background:#fff}}
hr{{border:0;border-top:1px solid var(--line);margin:40px 0}}
.swatch{{display:inline-block;width:14px;height:14px;margin-right:6px;vertical-align:-2px;border:1px solid rgba(0,0,0,.12)}}
.palette-strip{{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--line);border:1px solid var(--line);margin:24px 0}}
.ps-item{{background:var(--paper);padding:14px;display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted);line-height:1.6}}
.ps-item strong{{font:400 17px/1.4 "Songti SC",STSong,"Noto Serif SC",serif;color:var(--ink)}}
.ps-item code{{background:none;padding:0;font-size:11px}}
.ps-chip{{display:block;height:56px;border:1px solid rgba(0,0,0,.08);margin-bottom:8px}}
.color-head{{display:flex;align-items:center;gap:16px;margin:-4px 0 16px}}
.ch-chip{{width:72px;height:40px;border:1px solid rgba(0,0,0,.08)}}
.color-head code{{background:none;padding:0;margin-right:12px}}
.ch-count{{font-size:13px;color:var(--muted)}}
.img-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0 8px}}
.img-card{{display:flex;flex-direction:column;text-decoration:none;color:var(--ink)}}
.img-card img{{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:var(--sand)}}
.img-name{{font-size:14px;margin-top:10px}}
.img-meta{{font-size:12px;color:var(--muted)}}
.img-card:hover .img-name{{color:var(--olive)}}
.scene-card img{{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;margin:8px 0 4px}}
main h3{{display:block}}
@media(max-width:700px){{.palette-strip{{grid-template-columns:repeat(2,1fr)}}.img-grid{{grid-template-columns:repeat(2,1fr);gap:14px}}}}
footer{{max-width:1100px;margin:auto;padding:24px 5%;border-top:1px solid var(--line);color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}}
@media(max-width:700px){{main h1+p{{font-size:12px}}h2{{font-size:24px}}.top{{flex-direction:column;align-items:flex-start}}}}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="index.html">JUNRONG</a>
  <nav>
    <a href="index.html">交互网站</a>
    <a href="design-gallery.html">设计总览</a>
    <a href="image-audit-v2.html">图片核对</a>
    <a href="https://github.com/jonsonwu2012/jrfz-web/blob/main/{md_name}" target="_blank" rel="noopener">Markdown 原文</a>
  </nav>
</header>
<main>
{body}
</main>
<footer><span>上海君荣纺织品有限公司 · 网站设计提案</span><span>由 {md_name} 自动生成</span></footer>
<script>
// 标题保持一行：放不下时逐步缩小字号（最小 18px），仍放不下则允许换行
(function(){{var h=document.querySelector('main h1');if(!h)return;function fit(){{h.style.fontSize='';h.style.whiteSpace='nowrap';var s=parseFloat(getComputedStyle(h).fontSize);while(h.scrollWidth>h.clientWidth&&s>18){{s-=1;h.style.fontSize=s+'px';}}if(h.scrollWidth>h.clientWidth)h.style.whiteSpace='normal';}}fit();addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fit);}})();
</script>
</body>
</html>
"""

HEX_CELL = re.compile(r"<td>(#[0-9A-Fa-f]{6})</td>")


def render(md_path: pathlib.Path) -> None:
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"^#\s+(.+)$", text, re.M)
    title = m.group(1).strip() if m else md_path.stem
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists", "toc"])
    # 文档间链接：xxx.md → xxx.html（不改外部链接）
    body = re.sub(r'href="(?!https?://)([^"#]+?)\.md(#[^"]*)?"', r'href="\1.html\2"', body)
    # 外部链接新窗口打开
    body = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', body)
    # 配色表中的 HEX 显示色块
    body = HEX_CELL.sub(r'<td><span class="swatch" style="background:\1"></span>\1</td>', body)
    out = TEMPLATE.format(title=html.escape(title), body=body, md_name=html.escape(md_path.name))
    md_path.with_suffix(".html").write_text(out, encoding="utf-8")
    print("built", md_path.with_suffix(".html").name)


if __name__ == "__main__":
    for p in sorted(ROOT.glob("*.md")):
        render(p)
