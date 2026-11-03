window.JR = {
 categories: [
  {id:'bed',name:'客房床品',en:'BED LINEN',image:'hero',description:'床单 · 被套 · 枕套 · 床笠 · 床裙',items:['纯棉缎纹床品套件','酒店床单','酒店被套','酒店枕套','床笠与床裙']},
  {id:'core',name:'被芯与枕芯',en:'DUVETS & PILLOWS',image:'duvet',description:'被芯 · 枕芯 · 床垫保护垫 · 枕芯保护套',items:['酒店被芯','酒店枕芯','床垫保护垫','枕芯保护套','季节被芯选型']},
  {id:'bath',name:'卫浴布草',en:'BATH LINEN',image:'towels',description:'方巾 · 面巾 · 浴巾 · 地巾 · 泳池巾',items:['酒店毛浴巾','酒店方巾与面巾','酒店地巾','泳池与沙滩巾','SPA 理疗用巾']},
  {id:'robe',name:'浴袍与拖鞋',en:'ROBES & SLIPPERS',image:'robe',description:'毛圈浴袍 · 华夫格浴袍 · 割绒浴袍 · 拖鞋',items:['浴袍与拖鞋','毛圈浴袍','华夫格浴袍','割绒浴袍','客房拖鞋']},
  {id:'dining',name:'餐饮布草',en:'TABLE LINEN',image:'table',description:'台布 · 口布 · 桌旗 · 椅套 · 宴会布草',items:['餐桌布与口布','宴会台布','餐垫与桌旗','宴会椅套与椅背饰带','鸡尾酒桌套']},
  {id:'decor',name:'装饰与配套',en:'INTERIOR TEXTILES',image:'decor',description:'床尾巾 · 靠垫 · 窗帘纱帘 · 布袋配套',items:['床尾巾与靠垫','装饰靠垫套','窗帘与纱帘','沙发布艺配套','洗衣袋与布艺收纳']}
 ],
 scenes: [
  {id:'business',name:'商务酒店',image:'hero',title:'日常运营，也值得细致考量。',desc:'围绕客房周转、日常洗涤和补货需求，梳理统一的布草选型。',focus:['统一规格与识别','日常洗涤适配','分批补货规划'],selection:['bed-1','core-1','core-2','bath-1'],brief:'商务酒店配套：床品、被芯枕芯、毛浴巾，需结合运营周转确认数量。'},
  {id:'boutique',name:'精品民宿',image:'suite',title:'触感、色彩与尺寸，回应空间的独特气质。',desc:'以房间风格与宾客体验为起点，让床品、巾类与装饰织物形成连贯的空间语言。',focus:['与空间色彩协调','按床型匹配尺寸','小型项目需求沟通'],selection:['bed-1','bath-1','decor-1'],brief:'精品民宿配套：床品、毛浴巾、床尾巾靠垫，需确认空间风格与床型。'},
  {id:'luxury',name:'高端酒店',image:'suite',title:'细节之中，延续款待的分寸。',desc:'从客房、卫浴到餐饮空间，协同考虑面料触感、外观细节与使用场景。',focus:['全空间织物协调','样品触感与外观评估','品牌细节定制沟通'],selection:['bed-1','core-1','bath-1','robe-1','dining-1','decor-1'],brief:'高端酒店全空间配套：床品、芯类、卫浴、浴袍、餐饮、装饰，需样品与预算沟通。'}
 ]
};
JR.products=JR.categories.flatMap(c=>c.items.map((name,i)=>({
 id:c.id+'-'+(i+1),category:c.id,name,image:c.image,unit:c.id==='bed'&&i===0?'套':'件',
 material:c.id==='bed'||c.id==='bath'||c.id==='robe'?'棉类':c.id==='core'?'填充类':c.id==='dining'?'棉类 / 混纺':'多材质',
 intro:({
 bed:'以简洁的织物语言，为客房营造安静、舒适的睡眠氛围。',
 core:'从蓬松度、支撑感与季节需求出发，寻找适合客房的芯类配置。',
 bath:'关注触感、规格与使用场景，让卫浴织物融入日常款待。',
 robe:'从浴袍到拖鞋，让离开床铺后的舒适体验自然延续。',
 dining:'让桌面的颜色、垂坠与织物肌理，呼应餐饮空间的氛围。',
 decor:'以色彩与纹理衔接空间细节，完善酒店的织物表达。'
 })[c.id],
 options:c.id==='bed'||c.id==='core'?['1.2m床','1.5m床','1.8m床','其他尺寸']:c.id==='bath'?['方巾 / 面巾','浴巾','其他规格']:c.id==='robe'?['成人款','其他规格']:c.id==='dining'?['常规选型','定制尺寸']:['常规选型','定制配套']
})));

// 展示顺序优先呈现六大品类，随后展开各系列细分选型。
JR.products.sort((a,b)=>Number(a.id.split('-')[1])-Number(b.id.split('-')[1]));
JR.products.forEach(p=>{
 p.optionLabel=(p.category==='bed'||['core-1','core-3'].includes(p.id))?'床型需求':'规格需求';
 if(p.id==='core-2')p.options=['常规枕型','支撑需求沟通','其他枕型'];
 if(p.id==='core-4')p.options=['常规枕芯适配','其他尺寸'];
 if(p.id==='core-5')p.options=['夏季使用','全年使用','冬季使用'];
 if(p.category==='bath'&&p.id!=='bath-1')p.options=['常规规格','其他尺寸'];
});

// V2: 每个产品、分类和场景使用独立资产；同一产品详情与缩略图保持一致。
JR.colors=[{"id": "white", "name": "本白", "hex": "#F1EEE5", "use": "芯类与经典基础"}, {"id": "sand", "name": "沙色", "hex": "#C7B397", "use": "自然客房与卫浴"}, {"id": "mocha", "name": "摩卡棕", "hex": "#90715E", "use": "SPA、装饰与层次"}, {"id": "sage", "name": "鼠尾草绿", "hex": "#9CA98D", "use": "民宿床品与浴袍"}, {"id": "olive", "name": "橄榄绿", "hex": "#74794D", "use": "餐饮与空间织物"}, {"id": "blue", "name": "雾蓝", "hex": "#9DAFBF", "use": "床品与卫浴"}, {"id": "navy", "name": "海军蓝", "hex": "#30435A", "use": "泳池与宴会配套"}, {"id": "clay", "name": "陶土色", "hex": "#B67860", "use": "餐饮与床尾点缀"}, {"id": "wine", "name": "酒红", "hex": "#743E49", "use": "宴会与装饰点缀"}, {"id": "grey", "name": "暖灰", "hex": "#99958B", "use": "商务与中性搭配"}];
const assetMap={"bed-1": {"image": "bed-1", "color": "鼠尾草绿", "colorId": "sage"}, "bed-2": {"image": "bed-2", "color": "沙色", "colorId": "sand"}, "bed-3": {"image": "bed-3", "color": "雾蓝", "colorId": "blue"}, "bed-4": {"image": "bed-4", "color": "摩卡棕", "colorId": "mocha"}, "bed-5": {"image": "bed-5", "color": "暖灰", "colorId": "grey"}, "core-1": {"image": "core-1", "color": "本白", "colorId": "white"}, "core-2": {"image": "core-2", "color": "本白", "colorId": "white"}, "core-3": {"image": "core-3", "color": "本白", "colorId": "white"}, "core-4": {"image": "core-4", "color": "本白", "colorId": "white"}, "core-5": {"image": "core-5", "color": "本白", "colorId": "white"}, "bath-1": {"image": "bath-1", "color": "沙色", "colorId": "sand"}, "bath-2": {"image": "bath-2", "color": "鼠尾草绿", "colorId": "sage"}, "bath-3": {"image": "bath-3", "color": "暖灰", "colorId": "grey"}, "bath-4": {"image": "bath-4", "color": "海军蓝", "colorId": "navy"}, "bath-5": {"image": "bath-5", "color": "摩卡棕", "colorId": "mocha"}, "robe-1": {"image": "robe-1", "color": "沙色", "colorId": "sand"}, "robe-2": {"image": "robe-2", "color": "鼠尾草绿", "colorId": "sage"}, "robe-3": {"image": "robe-3", "color": "沙色", "colorId": "sand"}, "robe-4": {"image": "robe-4", "color": "雾蓝", "colorId": "blue"}, "robe-5": {"image": "robe-5", "color": "暖灰", "colorId": "grey"}, "dining-1": {"image": "dining-1", "color": "陶土色", "colorId": "clay"}, "dining-2": {"image": "dining-2", "color": "酒红", "colorId": "wine"}, "dining-3": {"image": "dining-3", "color": "橄榄绿", "colorId": "olive"}, "dining-4": {"image": "dining-4", "color": "酒红", "colorId": "wine"}, "dining-5": {"image": "dining-5", "color": "海军蓝", "colorId": "navy"}, "decor-1": {"image": "decor-1", "color": "陶土色", "colorId": "clay"}, "decor-2": {"image": "decor-2", "color": "酒红", "colorId": "wine"}, "decor-3": {"image": "decor-3", "color": "沙色", "colorId": "sand"}, "decor-4": {"image": "decor-4", "color": "橄榄绿", "colorId": "olive"}, "decor-5": {"image": "decor-5", "color": "摩卡棕", "colorId": "mocha"}, "category-bed": {"image": "category-bed", "color": "鼠尾草绿", "colorId": "sage"}, "category-core": {"image": "category-core", "color": "本白", "colorId": "white"}, "category-bath": {"image": "category-bath", "color": "雾蓝", "colorId": "blue"}, "category-robe": {"image": "category-robe", "color": "暖灰", "colorId": "grey"}, "category-dining": {"image": "category-dining", "color": "橄榄绿", "colorId": "olive"}, "category-decor": {"image": "category-decor", "color": "陶土色", "colorId": "clay"}, "scene-business": {"image": "scene-business", "color": "暖灰", "colorId": "grey"}, "scene-boutique": {"image": "scene-boutique", "color": "鼠尾草绿", "colorId": "sage"}, "scene-luxury": {"image": "scene-luxury", "color": "摩卡棕", "colorId": "mocha"}};
JR.products.forEach(p=>Object.assign(p,assetMap[p.id]));
JR.categories.forEach(c=>c.image='category-'+c.id);
JR.scenes.forEach(s=>{s.image='scene-'+s.id;s.palette=assetMap[s.image].color;});
JR.scenes.find(s=>s.id==='business').selection=['bed-5','core-1','core-2','bath-3'];
JR.scenes.find(s=>s.id==='boutique').selection=['bed-1','robe-2','decor-1','decor-3'];
JR.scenes.find(s=>s.id==='luxury').selection=['bed-4','core-1','bath-1','robe-1','dining-2','decor-2'];

JR.products.find(p=>p.id==="bed-4").options=["常规枕套","其他成品尺寸"];
JR.products.find(p=>p.id==="bed-4").optionLabel="枕套规格";
// 明确组合计量与场景配色，供询价沟通使用。
JR.products.forEach(p=>{
 if(p.category==='bath')p.unit=p.id==='bath-1'||p.id==='bath-2'?'组':'条';
 if(p.id==='robe-1'||p.id==='dining-1'||p.id==='dining-3'||p.id==='dining-4'||p.id==='decor-1'||p.id==='decor-5')p.unit='套';
 if(p.id==='robe-5')p.unit='双';
 if(p.id==='core-2')p.unit='只';
});
JR.scenes.forEach(s=>s.brief+=' 配色方向：'+s.palette+'与中性色；以实物色样确认。');
