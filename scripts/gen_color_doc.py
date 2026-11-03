#!/usr/bin/env python3
"""生成《2025–2026 酒店布草配色趋势与图片核对》Markdown（含 HTML 色卡与图片网格）。
产品—颜色—图片对应关系直接读取 data.js，保证与网站产品中心一致。"""
import json, subprocess, html

import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parent.parent)
js = r"""
const vm=require('vm'),fs=require('fs');const ctx={};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);const J=ctx.JR;
console.log(JSON.stringify({products:J.products.map(p=>({id:p.id,name:p.name,category:p.category,color:p.color,image:p.image})),
categories:J.categories.map(c=>({id:c.id,name:c.name})),colors:J.colors,scenes:J.scenes.map(s=>({id:s.id,name:s.name,image:s.image,palette:s.palette,selection:s.selection}))}));
"""
D = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
cat = {c['id']: c['name'] for c in D['categories']}
prod = {p['id']: p for p in D['products']}
esc = html.escape

# 每个颜色的趋势依据与使用建议（依据见文末来源）
NOTE = {
 '本白': ('暖白回到主角位置。Pantone 把 2026 年度色定为柔和暖白 Cloud Dancer，这是它首次选择白色；雅高酒店也以“Natural is the New White”向宾客说明改用本色布草的原因。',
        '芯类、经典床品基础；保持干净的材质识别，与彩色布草搭配时作为“留白”。'),
 '沙色': ('Heimtextil Trends 26/27 的自然色组以沙、黏土、烟炭、橄榄、树皮为核心，沙色是其中最容易落地的中性底色。',
        '自然风格客房、度假酒店、低对比空间；床单、浴巾、浴袍、窗帘均可大面积使用。'),
 '摩卡棕': ('Pantone 2025 年度色 Mocha Mousse 带动暖棕走入室内；Heimtextil 26/27 的“树皮”色也指向同一方向。',
          '用于增加层次与触感：枕套、SPA 用巾、功能收纳等局部或小件。'),
 '鼠尾草绿': ('低饱和绿是近两年家居织物中出现频率较高的彩色；Garnier-Thiebaut 2025 春夏系列中也出现米绿、蓝绿的床品与餐桌织物。',
           '精品民宿、自然系客房；床品套件、方巾面巾、毛圈浴袍。'),
 '橄榄绿': ('橄榄色同样列在 Heimtextil 26/27 的自然色组中，饱和度和明度都比鼠尾草绿更沉稳。',
          '餐饮与公共空间：餐垫桌旗、沙发布艺，适合与木色、石材搭配。'),
 '雾蓝': ('Messe Frankfurt 2026 秋季配色观察把浅蓝灰列为配色线索之一；它和沙色、本白搭配时对比柔和。',
         '需要安静、清爽感的客房与卫浴；被套、割绒浴袍。'),
 '海军蓝': ('海军蓝不属于本轮趋势色，是酒店泳池和宴会场景常用的经典功能色，耐看、不易显旧。',
          '泳池与沙滩巾、鸡尾酒桌套等功能性织物；不建议用于大面积客房床品。'),
 '陶土色': ('黏土色在 Heimtextil 26/27 自然色组中；2026 年 9 月发布的 Heimtextil Trends 27/28 中，“Hyper Presence”方向又以深铁锈、焦橙、赭石延续暖土色系。',
          '暖调餐饮空间与床尾点缀：桌布口布、床尾巾、靠垫。'),
 '酒红': ('Messe Frankfurt 2026 秋季配色观察列出酒红；Heimtextil Trends 27/28 的“Inside, Out”方向也包含饱和红。',
         '宴会、餐饮与装饰重点：宴会台布、椅背饰带、靠垫套；以点缀为主。'),
 '暖灰': ('Heimtextil 26/27 的“烟炭”与 27/28 的炭灰、石墨色指向深灰；君荣取其提亮后的暖灰，作为商务空间的中性色。',
         '商务酒店与中性空间：床笠床裙、地巾、客房拖鞋。'),
}

def img_card(p):
    return (f'<a class="img-card" href="index.html#/product/{p["id"]}">'
            f'<img src="assets/{p["image"]}.webp" alt="{esc(p["name"])} · {esc(p["color"])}" loading="lazy">'
            f'<span class="img-name">{esc(p["name"])}</span><span class="img-meta">{esc(cat[p["category"]])}</span></a>')

L = []
A = L.append
A('# 2025–2026 酒店布草配色趋势与图片核对')
A('')
A('上海君荣纺织品有限公司 · 酒店布草选型参考 · 更新于 2026 年 11 月')
A('')
A('> 本页把近两年纺织与室内配色趋势，转化为一套适合酒店布草的十色选型体系，并逐一列出网站产品中心里每个颜色对应的产品图片，方便采购和设计团队对照选色。')
A('')
A('## 一、趋势概览：三个方向')
A('')
A('**1. 暖白回到基础。** Pantone 2026 年度色 Cloud Dancer（PANTONE 11-4201）是一种柔和暖白，也是 Pantone 首次把白色选为年度色。酒店端同样有呼应：雅高酒店把布草从漂白亮白改为本色，并以“Natural is the New White”向宾客说明原因。对布草来说，“白”不再只有冷白一种，温润的本白正在成为新的基础色。')
A('')
A('**2. 大地中性色成为底色。** Heimtextil Trends 26/27 以“Craft is a verb”为主题，色板中沙、黏土、烟炭、橄榄、树皮等自然色提供稳定感，再与少量鲜明的数字色形成对照。酒店布草需要长期耐看，因此君荣只采纳其中的自然色组作为主推，没有把荧光、数字色列为整床颜色。')
A('')
A('**3. 温暖触感与点缀色。** 2026 年 9 月发布的 Heimtextil Trends 27/28（主题“Home-Maxxing”）中，“Hyper Presence”方向强调织物手感与岁月痕迹，配色为深铁锈、焦橙、赭石、灰粉和暖白；Pantone 2025 年度色 Mocha Mousse 也带动了暖棕。这类颜色更适合以靠垫、床尾巾、餐饮织物等小面积出现。')
A('')
A('**证据边界：** 以上来源是纺织展趋势、色彩机构年度色、品牌系列和酒店集团实践，不是中国酒店布草采购的颜色销量统计。君荣据此提出选型建议，不宣称某种颜色“最畅销”，实际选色以项目空间、洗涤条件和实物色样为准。')
A('')
A('## 二、君荣十色配色体系')
A('')
A('十个颜色分三层使用：**基础色**（本白、沙色、暖灰）用于大面积床品与巾类；**主题色**（鼠尾草绿、雾蓝、摩卡棕、橄榄绿）用于营造空间性格；**点缀与功能色**（陶土色、酒红、海军蓝）用于餐饮、装饰与泳池等场景。')
A('')
cols = D['colors']
A('<div class="palette-strip">' + ''.join(
    f'<div class="ps-item"><span class="ps-chip" style="background:{c["hex"]}"></span><strong>{esc(c["name"])}</strong><code>{c["hex"]}</code><span>{esc(c["use"])}</span></div>'
    for c in cols) + '</div>')
A('')
A('色块的 HEX 值只是网页上的示意色，不是染色工艺标准，也不对应精确的 Pantone 色号。')
A('')
A('## 三、逐色产品图片对照')
A('')
A('下面按颜色列出网站产品中心里对应的全部产品，点击图片可以打开产品详情页。每张产品图都是单独生成的，画面中的颜色与产品标注颜色一致，没有用滤镜给同一张照片换色。')
A('')
for c in cols:
    ps = [p for p in D['products'] if p['color'] == c['name']]
    trend, use = NOTE[c['name']]
    A(f'### {c["name"]}')
    A('')
    A(f'<div class="color-head"><span class="ch-chip" style="background:{c["hex"]}"></span><div><code>{c["hex"]}</code><span class="ch-count">{len(ps)} 个产品</span></div></div>')
    A('')
    A(f'**趋势依据：** {trend}')
    A('')
    A(f'**使用建议：** {use}')
    A('')
    A('<div class="img-grid">' + ''.join(img_card(p) for p in ps) + '</div>')
    A('')
A('## 四、三类酒店配色方案')
A('')
SC = {
 'business': '本白的睡眠基础加暖灰局部，减少视觉噪声，适合高周转、统一管理的客房。',
 'boutique': '鼠尾草绿床品配沙色窗帘与陶土色装饰，适合自然木色、灰泥墙面的空间。',
 'luxury': '本白与摩卡棕叠加少量酒红，配合深色家具，强调层次与质感。',
}
for s in D['scenes']:
    sel = '、'.join(f'{prod[i]["name"]}（{prod[i]["color"]}）' for i in s['selection'])
    A(f'### {s["name"]} · 主色 {s["palette"]}')
    A('')
    A(f'<a class="scene-card" href="index.html#/solutions?scene={s["id"]}"><img src="assets/{s["image"]}.webp" alt="{esc(s["name"])}配色场景" loading="lazy"></a>')
    A('')
    A(f'{SC[s["id"]]} 推荐选型：{sel}。')
    A('')
A('场景图展示的是整体配色方向，图中每件物品不一定是上面列出产品的同款，实际配置需要按项目确认。')
A('')
A('## 五、图片核对方法')
A('')
A('网站共使用 39 张独立图片：30 个产品各一张、6 个分类封面、3 个酒店场景。核对时逐张检查以下四项：')
A('')
A('1. **品类正确**：画面主体就是标注的产品，例如地巾要体现地面用途，枕芯保护套要看得到拉链。')
A('2. **组合齐全**：名称中包含多件物品的（如“餐桌布与口布”“浴袍与拖鞋”），画面中都要出现。')
A('3. **颜色一致**：画面主色与产品标注颜色相符，芯类保持本白。')
A('4. **结构可辨**：华夫格、毛圈、割绒等织物表面能看出区别，鸡尾酒桌套要表现高脚桌的形态。')
A('')
A('同一产品在目录、详情、方案推荐和询价清单里使用同一张图；不同产品、分类和场景之间不共用图片。逐张核对结果见 [图片核对页](image-audit-v2.html)，每张图的对应关系保存在 [image-manifest-v2.json](image-manifest-v2.json)。')
A('')
A('**说明：** 所有产品与酒店图片都是 AI 生成的选型概念图，用于沟通风格和配色，不是实拍，也不代表实际库存或客户案例。图片能核对的是品类、用途和颜色，无法证明面料成分、工艺或性能。')
A('')
A('## 六、彩色布草的采购确认事项')
A('')
A('- **色样确认**：以实物色样和洗后样确认颜色，屏幕显示与 AI 图片只作参考。')
A('- **洗涤适配**：彩色布草需要和洗涤服务商确认分色洗涤流程、洗涤剂与漂洗工艺；深色不能按白色布草的方式漂白。')
A('- **色牢度与尺寸**：确认色牢度和洗后尺寸变化，不能默认深色更耐脏或更耐洗。')
A('- **补货色差**：彩色布草分批补货时可能出现批次色差，建议在合同中约定色差标准和留样方式。')
A('')
A('需要具体建议，可以[发起项目询价](index.html#/inquiry)，告诉我们酒店类型、空间风格和洗涤条件。')
A('')
A('## 参考来源')
A('')
A('- [Pantone 2026 年度色 Cloud Dancer（Interior Design 报道）](https://interiordesign.net/designwire/pantone-2026-color-of-the-year-cloud-dancer/)')
A('- [Pantone 2025 年度色 Mocha Mousse](https://connect.pantone.com/color-insider/color-of-the-year-2025-feelings-of-contentment)')
A('- [Heimtextil Trends 27/28「Home-Maxxing」官方新闻稿（2026 年 9 月）](https://heimtextil.messefrankfurt.com/content/dam/messefrankfurt-redaktion/heimtextil/2027/press/09-2026/heimtextil2027-trends27-28-home-maxxing-en.pdf)')
A('- [Heimtextil Trends 26/27 官方趋势新闻稿](https://heimtextil.messefrankfurt.com/frankfurt/en/press/press-releases/heimtextil/trend-preview-26-27.html)')
A('- [Heimtextil 2025 展后报告](https://www.tw.messefrankfurt.com/content/dam/messefrankfurt-redaktion/corporatehongkong/for-journalist/press/textiles/htl/HTL25-FR-EN.pdf)')
A('- [Messe Frankfurt 2026 秋季配色观察](https://conzoom-solutions.messefrankfurt.com/frankfurt/de/themenuebersicht/trend-produkte/herbsttrends.html)')
A('- [Garnier-Thiebaut 2025 春夏系列](https://www.garnier-thiebaut.com/188465-home-linen-spring-summer-2025)')
A('- [Lodging Magazine：酒店可持续布草选择（雅高“Natural is the New White”）](https://lodgingmagazine.com/six-considerations-for-choosing-sustainable-hotel-towels-and-linens/)')
A('')
open(f'{ROOT}/配色趋势与图片核对-V2.md', 'w', encoding='utf-8').write('\n'.join(L))
print('ok', len('\n'.join(L)))
