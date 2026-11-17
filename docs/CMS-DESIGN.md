# 君荣纺织内容管理 · 设计说明

## 目标

让站点拥有者在后台修改前台每一块可见内容，同时保持现在的版式。部署分三步走：先在 GitHub Pages 上看静态结果，平时在本机或 Codespaces 里改内容，以后把同一套程序放到自己的 Linux 服务器上。

## 为什么用这个技术栈

仓库原来是不带构建步骤的静态 HTML。后台需要登录、保存和上传图片，GitHub Pages 又不能跑服务，所以分成「内容文件」和「一个 Node 进程」：

- **Node.js 22 + Express**。本机、Codespaces 和 Docker 都是 `npm install && npm start`，没有数据库服务，也没有需要编译的原生模块。
- **`content/*.json` 作为唯一内容源**。后台写入这些文件；Git 可以审阅差异；GitHub Actions 不启动服务器也能据此生成静态站。
- **签名 Cookie 做登录**。密码用 scrypt 存在 `content/auth.json`（不提交到 Git）。未设置 `SESSION_SECRET` 时，密钥也写在这个文件里，重启后登录状态还在。修改密码会使旧的登录状态失效。适合单人维护，不另装会话数据库。
- **前台仍是原来的 `index.html`、`app.js`、`styles.css`**。构建或服务启动时，把内容生成成 `data.js`、`clients.js`、`site-content.js`。页面脚本按这些数据渲染，类名和版式不变。

静态发布（Pages）和动态服务（本机 / VPS）读的是同一份 JSON。VPS 上保存后刷新即可看到；Pages 上要等 Actions 用这份 JSON 重新构建。

## 架构

```
content/site.json        文案、导航、SEO、联系方式
content/catalog.json     分类、产品、配色、方案
content/clients.json     品牌、代表酒店、地区名录
content/media.json       上传记录
content/inquiries.json   询盘（不提交）
content/auth.json        密码散列（不提交）

server/                  API、校验、生成网站文件
admin/                   后台界面（简体中文）
app.js                   前台渲染，文案来自 JR_COPY，目录来自 JR / JR_CLIENTS

npm start                提供网站、/admin 和 /api，并在保存时重新生成前台数据
npm run build            把同一份内容做成 dist/，供 GitHub Pages 上传
```

前台图片路径有两种写法，页面都能显示：

- 资源键，例如 `bed-1`，对应 `assets/bed-1.webp`
- 相对路径，例如 `uploads/xxx.webp` 或 `assets/logos/shangrila.svg`

上传只接受真实的 JPG、PNG、WEBP、GIF，单张不超过 8MB。文件名由服务器生成。仍被页面或产品引用的图片不能删除。要在 GitHub Pages 上显示新图片，需要把 `uploads/` 和 `content/` 一起提交；只部署在 VPS 上时，图片留在数据卷里。

隐藏一个分类时，该分类下的产品也不会出现在前台，避免产品中心因缺少分类而打不开。

登录和询盘的频率限制默认按连接地址计算。只有前面有反向代理、并设置 `TRUST_PROXY=1` 时，才信任 `X-Forwarded-For`。生产环境如果 `SESSION_SECRET` 缺失、过短或仍是示例值，进程会拒绝启动。

## 数据模型

`site.json` 按页面分区，而不是按数据库表。每个分区对应后台的一页：

| 分区 | 内容 |
| --- | --- |
| seo | 标题、描述、主题色、内页标题后缀 |
| contact | 电话、邮箱、地址、时间。全空时页脚不增加一行 |
| chrome | 导航、页脚标语、公司名、版权、免责声明、页脚链接 |
| shared | 多页共用的底部号召和四步流程 |
| home / catalog / detail / solutions / custom / about / factory / clientsPage / inquiry / notFound / toasts / receipt | 各页文案、按钮、空状态和询价单模板 |

带 `{count}`、`{five}` 这类占位符的句子，数字仍由名录和目录实时计算，避免手改统计。

`catalog.json`：

- 分类：`id, name, en, image, description, sort, enabled`
- 产品：`id, category, name, image, unit, material, intro, options, optionLabel, color, colorId, sort, enabled`
- 配色：`id, name, hex, use, sort`
- 方案：`id, name, image, title, desc, focus, selection, brief, palette, sort, enabled`

`clients.json`：

- `source`：名录来源说明
- 品牌：`id, name, cn, logo, ar, sort`
- 代表酒店：`id, name, en, city, sort`
- 地区：`id, name, sort, hotels[{name, stars}]`

标识只用小写英文、数字和短横线。分类下还有产品时不能删除分类；配色或方案仍被引用时不能删除对应项。

原稿是从当前 `data.js` 和 `clients.js` 整理进来的：6 个分类、30 个产品、10 个配色、3 套方案、14 个品牌、18 家代表酒店、112 家名录酒店。

## 前台如何读内容

`app.js` 在渲染前读取 `window.JR_COPY`。没有某段文案时，仍使用原稿句子，所以缺字段不会把版式打成空白。允许出现在标题里的 HTML 只有换行：`<br>` 和 `<br class="mobile-break">`，其余字符会转义。

`runtime.js` 区分两种运行方式：

- 静态站：`inquiryEndpoint` 为空，询价单只在浏览器里生成并下载
- 服务器：`inquiryEndpoint` 为 `api/public/inquiries`，生成询价单的同时提交到后台

## API

除健康检查、公开内容和公开询盘外，写操作都要带登录 Cookie，以及请求头 `X-Requested-With: JRAdmin`。错误响应为 `{ "error": "…", "details": [{ "path", "message" }] }`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 存活检查 |
| GET | `/api/public/content` | 公开内容（不含询盘和密码） |
| POST | `/api/public/inquiries` | 提交询盘，按 IP 限流 |
| POST | `/api/auth/login` | 登录，失败限流 |
| POST | `/api/auth/logout` | 退出 |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/admin/schema` | 后台表单结构 |
| GET | `/api/admin/bootstrap` | 打开后台所需的全部内容 |
| PUT | `/api/admin/site/:section` | 保存一个文案分区 |
| PUT | `/api/admin/password` | 修改密码 |
| POST/PUT/DELETE | `/api/admin/categories` | 分类 |
| POST/PUT/DELETE | `/api/admin/products` | 产品 |
| POST/PUT/DELETE | `/api/admin/colors` | 配色 |
| POST/PUT/DELETE | `/api/admin/scenes` | 配套方案 |
| POST | `/api/admin/reorder` | `{ collection, ids }` 调整顺序 |
| PUT | `/api/admin/clients/source` | 名录来源 |
| POST/PUT/DELETE | `/api/admin/brands` | 品牌 |
| POST/PUT/DELETE | `/api/admin/landmarks` | 代表酒店 |
| POST/PUT/DELETE | `/api/admin/regions` | 地区及其酒店 |
| GET/DELETE | `/api/admin/inquiries` | 询盘 |
| POST/DELETE | `/api/admin/media` | 上传或删除图片 |

校验失败返回 400，未登录 401，缺少后台请求头或来源不匹配 403，标识冲突 409。

## 部署

1. **GitHub Pages**。`pages.yml` 执行 `npm run build`，只上传 `dist/`。其中的 `runtime.js` 不会把询盘发到不存在的接口。
2. **本机 / Codespaces**。`npm start`，默认端口 8080。`.devcontainer/devcontainer.json` 会安装依赖并启动。
3. **VPS**。`Dockerfile` 与 `docker-compose.yml`。内容卷第一次是空的时候，从镜像内的 `SEED_DIR`（`/app/seed/content`）复制原稿。Nginx 示例写在 README。生产环境必须自行设置 `SESSION_SECRET`。

后台默认只给一个管理员。密码文件不进 Git。生产环境如果 `SESSION_SECRET` 仍是示例值，启动时会警告。
