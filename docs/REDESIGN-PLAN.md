# 改版方案 v9（待你确认）— Triniti 捐款愿望清单 → 蓝白 NGO 官网

> 只描述准备做什么，**站点文件一处未改**。你确认后我才动手。
>
> **v8 相对 v7 的变化**（按你 m00163 的答复）：
> 1. **站点从 2 页变 4 页**：导航 `Get Involved` → `volunteer.html`（新），`Contact` → `contact.html`（新）。
> 2. **首页四个统计数字不留**（items / remaining / fulfilled / urgent）：DOM 与 `renderStats()` 一并移除。
> 3. **演示数据横幅删除**（`#status-banner` / `#banner-text`）。
> 4. **About 里的课程署名块整块删除**（SULAM WIX2001 / 讲师 / 11 人名单）。
> 5. **D12 收窄**：只有**表单**零持久化，语言偏好照旧写 `localStorage`。
> 6. ~~匿名时连邮箱与电话也不存~~ → 已被下面的 v9 第 1 条取代（只删三个字段不够）。
> 7. 新增 **§14 实施步骤**、**§15 最终效果**（你要求的）。
>
> **v9 相对 v8 的变化**（按你 m00218「勾选匿名什么数据都不需要留」）：
> 1. **匿名 = 零留存，一个字节都不落盘。** 勾上匿名后表单整块禁用，**根本不发请求**，后端也收不到任何东西。
> 2. 因此匿名提交**没有编号**——编号意味着有一条记录在，与「什么都不留」互斥。
> 3. D13 / D13′ / D14 / D16 被 **D27 取代**（那四条只管三个字段，管不住 message / locale / UA / IP 哈希）。
> 4. 「避免刷新即丢」的范围随之收窄：**只保非匿名提交的记录**。
> 5. §12.3 / §12.4 / §12.6 / §12.7 / §12.9、§14 第 7 步、§15、§16 第 25–28 与 36 条、§17 决策表全部重写。

---

## 1. 目标（按你的原话重述）

以 draft <https://demons00041-bit.github.io/triniti-donation-wishlist/> 为底，参照 <https://www.shelterhome.org/> 的信息结构重做：

- 配色改**蓝白**；图片位置**留空**；NGO 简介**留空**；捐款 QR、bank account **留空**；
- 只交付**框架**；填的时候必须一眼知道去哪个文件哪个键改；
- 所有 donate 行为都进 `donate.html`，**进去就看见 QR 与银行账号**；
- 表单是**可选**的；提交落到真后端，避免已提交的记录随刷新蒸发；**但不存草稿**；
- **勾了匿名就什么数据都不留**：不发请求、不落库、不给编号；
- 导航 `Get Involved` 去志愿者页，`Contact` 去联系方式页。

---

## 2. 现状（实测）

```
index.html                    310 行   ← 单页
assets/css/style.css         1559 行   ← 17 个分区
assets/js/config.js            31 行   ← 唯一需要非开发者改的文件
assets/js/data.js             612 行   ← 抓 Sheet CSV + 解析 + 样例回退
assets/js/i18n.js             631 行   ← EN/ZH/MS 三语（258 键）
assets/js/app.js              395 行   ← 渲染卡片、筛选、统计、进度条
assets/data/sample-items.json  12 条
仓库文件总数：15（无任何后端代码、无 package.json、无 CI）
```

配色 token `--green/sand/ochre/clay` 在 `style.css` 被引用 28 处。目前单页静态站，没有任何服务端。

本次要动的关键位置（行号是实测，不是估计）：

| 位置 | 内容 | 处置 |
|---|---|---|
| `index.html` 31–38 | 导航四项 `#wishlist / #how-to-donate / #contact / #about` | 重写为 `About / Get Involved / Contact` + 独立 DONATE |
| `index.html` 40–44 | 语言切换三个 `data-locale="en\|zh\|ms"` | 删 `zh`，只留 en / ms |
| `index.html` 56–59 | Hero 两个 CTA | 收成 1 个 |
| `index.html` 64–69 | `#status-banner` / `#banner-text` | **删除**（m00163） |
| `index.html` 71–90 | `#stats` + 四个 `[data-stat]` | **删除**（m00163） |
| `index.html` 187–235 | `#contact` 板块 | 移到 `contact.html` |
| `index.html` 236–289 | `#about` 含 `about__facts` + `.team` 11 人 | **署名块删除**，只留留空的 NGO 简介 |
| `index.html` 293–303 | 页脚三行 | 改四栏骨架 |
| `assets/js/app.js` 191–206 | `renderStats()` | **删除**（无 `[data-stat]` 可写） |
| `assets/js/app.js` 208– | `renderBanner()` | **删除**（无 `#banner-text` 可写） |
| `assets/js/app.js` 299–328 | `applyOrg()` | 移到 `site.js`，四页共用 |
| `assets/js/i18n.js` 14 / 501–516 | `STORAGE_KEY="triniti.lang"` + `persist()` / `readStored()` | **保留**（见 D22） |
| `favicon.svg` | `rect fill="#1f4a3d"` 深绿 + `#e8d9b5` 沙色 | 改深海军蓝 + 白 |

---

## 3. 站点地图（4 页）

```
                     ┌──────────────┐
                     │  index.html  │  首页
                     └──────┬───────┘
   ┌────────────┬───────────┼────────────┬──────────────┐
   │            │           │            │              │
   ▼            ▼           ▼            ▼              ▼
About        Get Involved  Contact    DONATE        五卡第5张
#about       volunteer     contact    donate.html   Donate for us
(同页锚点)    .html         .html      (无金额)      donate.html
                                       │
                     ┌─────────────────┼──────────────────┐
                     ▼                 ▼                  ▼
                10/25/50/100/200   Other amount       Change amount
                donate.html        → DONATE NOW       → index.html#donate
                ?amount=X          ?amount=X
```

四页共享同一套 Header / Footer / 语言切换 / 留空占位逻辑（见 §13 的 `assets/js/site.js`）。

### 3.1 跳转关系总表

| 起点 | 元素 | 目标 |
|---|---|---|
| 任意页 Header | 品牌 Logo | `index.html` |
| 任意页 Header | `About` | `index.html#about` |
| 任意页 Header | `Get Involved` | `volunteer.html` |
| 任意页 Header | `Contact` | `contact.html` |
| 任意页 Header | `DONATE`（独立按钮） | `donate.html`（无金额，QR 照常显示） |
| 首页 Hero | 唯一 CTA | `content.hero.ctaHref`（空 → `donate.html`） |
| 首页五卡第 5 张 | `Donate for us` 整卡 | `donate.html` |
| 首页捐款带 | `10`…`200` | `donate.html?amount=X` |
| 首页捐款带 | `Other amount` → `DONATE NOW` | `donate.html?amount=<填的值，缺省 10>` |
| 捐款页 | `Change amount` | `index.html#donate` |
| 捐款页 | `PAY SECURELY ON <BANK>` | `content.donation.onlineUrl`（空 → disabled） |
| 捐款页 | `SEND DETAILS` | `POST {api.baseUrl}/donations` |
| 捐款页 / 联系页 | `OPEN MAP` | `org.mapsUrl`（空 → disabled） |
| 志愿者页 | `Contact us to volunteer` | `contact.html` |
| 联系页 | 电话 / WhatsApp / 邮箱 | `tel:` / `tel:` / `mailto:`（空 → 灰字「待填写」） |

**导航不设死链**：三个导航项各自有真实落点，没有一个指向 `#`。

---

## 4. 首页线框图（index.html）

```
════════════════════════════════════════════════════════════════════════════
 0 · HEADER   (sticky · 吸顶 · 白底深蓝字)
    [LOGO]     About      Get Involved      Contact       [EN|BM]   [DONATE]
    └ 图槽      └ 三项导航，无 Our Work / Media            └ 两语   └ → donate.html
════════════════════════════════════════════════════════════════════════════
 1 · HERO   (单屏 · 不轮播 · 无箭头无圆点)
      ┌──────────────────────────────────────────────────────────────────┐
      │              [ HERO IMAGE — 空 · 建议 1920x1080 ]                │
      │   [ MAIN TITLE — 空 ]                                            │
      │   [ ONE-LINE SUBTITLE — 空 ]                                     │
      │   ┌────────────────┐                                             │
      │   │  [ CTA LABEL ] │   ← 只有一个按钮                              │
      │   └────────────────┘                                             │
      └──────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 2 · FIVE CARDS   (桌面 5 列 · 平板 3+2 · 手机单列)
    ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
    │  [icon]   │ │  [icon]   │ │  [icon]   │ │  [icon]   │ │  [icon]   │
    │ Lend a    │ │ Sponsor   │ │ Volunteer │ │ Gift Of   │ │ Donate    │
    │ Hand      │ │ A Child   │ │           │ │ Love      │ │ for us    │
    │ [line—空] │ │ [line—空] │ │ [line—空] │ │ [line—空] │ │ [line—空] │
    └───────────┘ └───────────┘ └───────────┘ └───────────┘ └─────┬─────┘
                                                                   └→ donate.html
════════════════════════════════════════════════════════════════════════════
 3 · ABOUT  /  NGO 简介   (#about)
    ┌──────────────────────┐    [ SECTION TITLE — 空 ]
    │  [ IMAGE — 空 ]      │    [ BODY PARAGRAPH — 空 · 预留 3~5 行高度 ]
    └──────────────────────┘    Founded   [ 空 ]
                                Serves    [ 空 ]
    ※ 课程署名（SULAM / 讲师 / 11 人名单）已按 m00163 整块删除
════════════════════════════════════════════════════════════════════════════
 4 · TWO PROGRAMS   (左右交错)
    ┌──────────────────────┐    [ PROGRAM 1 TITLE — 空 ]
    │  [ IMAGE — 空 ]      │    [ PROGRAM 1 BODY — 空 ]
    └──────────────────────┘    [ LINK LABEL — 空 ]  ->
    [ PROGRAM 2 TITLE — 空 ]    ┌──────────────────────┐
    [ PROGRAM 2 BODY — 空 ]     │  [ IMAGE — 空 ]      │
    [ LINK LABEL — 空 ]  ->     └──────────────────────┘
════════════════════════════════════════════════════════════════════════════
 5 · WISHLIST   (保留 · 现有 JS 引擎不动)
    [ WISHLIST TITLE — 空 ]      ← 原四个统计数字已删除（m00163）
    [ search… ]  [ Category v ]  [ Status v ]  [ Sort v ]       12 items
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │ item name     │ │ item name     │ │ item name     │  ← 数据来自 Google Sheet
    │ [=====      ] │ │ [========== ] │ │ [============]│    （现为 12 条演示数据）
    │ 12 / 40 bags  │ │ 30 / 40 bags  │ │ 40 / 40 bags  │
    └───────────────┘ └───────────────┘ └───────────────┘
    ※ 原「这是示范数据」横幅已删除（m00163）
════════════════════════════════════════════════════════════════════════════
 6 · DONATION BAND   (深蓝底白字 · 全页唯一深色大块)   #donate
    ██████████████████████████████████████████████████████████████████████
    ██        [ SECTION TITLE — 空 ]                                    ██
    ██        [ ONE-LINE INTRO — 空 ]                                   ██
    ██      ┌──────────┐ ┌──────────┐ ┌──────────┐                      ██
    ██      │    10    │ │    25    │ │    50    │  第一排              ██
    ██      └────┬─────┘ └────┬─────┘ └────┬─────┘                      ██
    ██           └────────────┴────────────┘ 点一下就直接跳走            ██
    ██      ┌──────────┐ ┌──────────┐ ┌──────────┐                      ██
    ██      │   100    │ │   200    │ │  Other   │  第二排              ██
    ██      └────┬─────┘ └────┬─────┘ │  amount  │                      ██
    ██           └────────────┘       └────┬─────┘                      ██
    ██                                      │ 只有它不直接跳             ██
    ██      ┌───────────────────────────────▼──────────┐                ██
    ██      │  [ 输入自定义金额 · RM ____ ]              │ 就地展开       ██
    ██      └───────────────────────┬──────────────────┘                ██
    ██      ┌───────────────────────▼──────────────────┐                ██
    ██      │              DONATE NOW                  │ → donate.html  ██
    ██      └──────────────────────────────────────────┘                ██
    ██████████████████████████████████████████████████████████████████████
════════════════════════════════════════════════════════════════════════════
 7 · FOOTER   (四栏 · 骨架固定 · 栏内留白)
    [COL 1 TITLE]      [COL 2 TITLE]      [COL 3 TITLE]      [COL 4 TITLE]
    [ link — 空 ]      [ link — 空 ]      [ link — 空 ]      [ link — 空 ]
    [ link — 空 ]      [ link — 空 ]      [ link — 空 ]      [ link — 空 ]
    ────────────────────────────────────────────────────────────────────
    © 2026        Last updated: [自动]        [ EN | BM ]
════════════════════════════════════════════════════════════════════════════
```

### 4.1 点金额的行为

| 你点的东西 | 结果 |
|---|---|
| `10` / `25` / `50` / `100` / `200` | **立刻跳** `donate.html?amount=X`，落地即见 QR 与银行账号 |
| `Other amount` | **不跳**，就地展开数字输入框 |
| `DONATE NOW` | 带 Other amount 的值跳；没填则用第一档 `10` |

固定档位做成真正的 `<a href="donate.html?amount=10">`，键盘 Enter / 中键新标签 / 右键复制链接都能用。

**首页已删除**：Stories 列表、Hero 轮播、状态横幅、四个统计数字、课程署名块、原 Ways to donate 区块（挪进 donate.html）。

---

## 5. 捐款页线框图（donate.html）— 付款优先

```
════════════════════════════════════════════════════════════════════════════
 0 · HEADER   (与首页完全一致)
    [LOGO]     About      Get Involved      Contact       [EN|BM]   [DONATE]
════════════════════════════════════════════════════════════════════════════
 1 · PAGE HERO   (窄版 · 无大图)
    ┌──────────────────────────────────────────────────────────────────┐
    │   [ PAGE TITLE — 空 ]        ← 例如 "Ways to donate"             │
    │   [ PAGE SUBTITLE — 空 ]                                         │
    └──────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 2 · AMOUNT BAR   (只读回显 · 不选金额)
    ┌──────────────────────────────────────────────────────────────────┐
    │   You are donating   RM [ 25 ]        [ Change amount → ]        │
    │   └ 从 ?amount= 读；无参数 → 占位「未选择」，QR 照常显示          │
    └──────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 3 · PAY NOW   (★ 落地即可见 · 不需要填任何东西)
    ┌───────────────────────────┐ ┌───────────────────────────────┐
    │ ① E-WALLET QR             │ │ ② BANK HOSTED PAGE            │
    │ ────────────────────────  │ │ ───────────────────────────   │
    │  ┌─────────────────────┐  │ │ [ HOSTED PAGE LABEL — 空 ]    │
    │  │   [ QR — 空 ]       │  │ │ ┌───────────────────────────┐ │
    │  │   建议 400x400      │  │ │ │  PAY SECURELY ON <BANK>   │ │
    │  └─────────────────────┘  │ │ └───────────────────────────┘ │
    │  [ QR CAPTION — 空 ]      │ │  └ onlineUrl 空 → disabled     │
    │  [ E-WALLET NAME — 空 ]   │ │    + 灰字「尚未开通」           │
    └───────────────────────────┘ └───────────────────────────────┘
    ┌──────────────────────────────────────────────────────────────┐
    │ ③ BANK TRANSFER (manual)                                     │
    │   Bank name    [ 空 ]      Account name  [ 空 ]              │
    │   Account no.  [ 空 ]      SWIFT         [ 空 ]              │
    │   [ COPY ACCOUNT NO ]                                        │
    └──────────────────────────────────────────────────────────────┘
    ┌──────────────────────────────────────────────────────────────┐
    │ ※ 提示（i18n 文案，不是数据）：转账后可以在下方告诉我们（可选）│
    └──────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 4 · DETAILS — OPTIONAL   (★ 默认折叠 · <details> · 无草稿)
    ▸ Tell us about your donation (optional)
    ┌──────────────────────────────────────────────────────────────┐
    │  Full name     [ 空 ]                                        │
    │  Email         [ 空 ]        ← 必填 + 含 @（匿名时整块关掉）    │
    │  Phone         [ 空 ]                                        │
    │  Message       [ 空 · 多行 ]                                  │
    │  [x] Donate anonymously   ← 一勾，下面整块换成说明，不再是表单  │
    │  [ ] I agree to be contacted about this donation             │
    │  [ honeypot 隐藏字段 — 供后端挡机器人，界面不可见 ]             │
    │                                                              │
    │              ┌──────────────────────────────┐                │
    │              │        SEND DETAILS          │ → POST 后端     │
    │              └──────────────────────────────┘                │
    │  aria-live 状态区：                                            │
    │    · 提交中…                                                   │
    │    · ✔ 已收到，编号 DON-20261113-8F3A（真编号，后端返回）       │
    │    · ✘ 发送失败，请稍后重试 / 或直接转账                        │
    │  ※ 不存草稿：页面刷新后已填内容不保留（金额靠 URL 参数保留）    │
    └──────────────────────────────────────────────────────────────┘
    ┌──────────────────────────────────────────────────────────────┐
    │  ☑ 勾上 Donate anonymously 之后，整块变成这一句（不再是表单）： │
    │                                                              │
    │    「You chose to stay anonymous.                            │
    │      Nothing you type here is sent or stored —               │
    │      not your name, not your email, not even a message.      │
    │      There is no reference number, because no record exists. │
    │      Please pay with the details above.」                    │
    │                                                              │
    │    姓名 / 邮箱 / 电话 / 留言 / 同意 / 提交按钮 全部 disabled    │
    │    （不是隐藏：让人看得见自己失去了什么，也看得见还能转账）      │
    └──────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 5 · OTHER WAYS: DONATE ITEMS   (常驻)
    ┌──────────────────────────────────────────────────────────────┐
    │  Drop-off addr [ 空 ]   Contact [ 空 ]                       │
    │  Hours [ 空 ]           Item list [ 空 ]                      │
    │  [ OPEN MAP ] → org.mapsUrl（空则 disabled）                  │
    └──────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 6 · CONTACT STRIP
    Questions?   [ phone — 空 ]   [ whatsapp — 空 ]   [ email — 空 ]
    [ See the full contact page → contact.html ]
════════════════════════════════════════════════════════════════════════════
 7 · FOOTER   (与首页完全一致)
════════════════════════════════════════════════════════════════════════════
```

---

## 6. 志愿者页线框图（volunteer.html）— 新增

```
════════════════════════════════════════════════════════════════════════════
 0 · HEADER   (与首页完全一致)
════════════════════════════════════════════════════════════════════════════
 1 · PAGE HERO   (窄版 · 无大图)
    ┌──────────────────────────────────────────────────────────────────┐
    │   [ PAGE TITLE — 空 ]        ← 例如 "Volunteer with us"          │
    │   [ PAGE SUBTITLE — 空 ]                                         │
    └──────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 2 · WHY VOLUNTEER   (左图右文 · 与首页 About 同款版式)
    ┌──────────────────────┐    [ BODY PARAGRAPH — 空 · 3~5 行 ]
    │  [ IMAGE — 空 ]      │    [ BODY PARAGRAPH 2 — 空 ]
    └──────────────────────┘
════════════════════════════════════════════════════════════════════════════
 3 · ROLES   (桌面 3 列 · 手机单列)
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  [icon]      │ │  [icon]      │ │  [icon]      │
    │ [ ROLE 1 —空]│ │ [ ROLE 2 —空]│ │ [ ROLE 3 —空]│
    │ [ BODY — 空 ]│ │ [ BODY — 空 ]│ │ [ BODY — 空 ]│
    │ [ TIME — 空 ]│ │ [ TIME — 空 ]│ │ [ TIME — 空 ]│
    └──────────────┘ └──────────────┘ └──────────────┘
    ※ [ TIME ] 是"每周几小时 / 长期或单次"，config.js 里 content.volunteer.roles[n].commitment
════════════════════════════════════════════════════════════════════════════
 4 · HOW IT WORKS   (三步骤 · 编号 1 2 3)
    ① [ STEP 1 TITLE — 空 ]   ② [ STEP 2 TITLE — 空 ]   ③ [ STEP 3 TITLE — 空 ]
       [ STEP 1 BODY — 空 ]      [ STEP 2 BODY — 空 ]      [ STEP 3 BODY — 空 ]
════════════════════════════════════════════════════════════════════════════
 5 · CTA BAND   (浅蓝底 · 一行字 + 一个按钮)
    ┌──────────────────────────────────────────────────────────────┐
    │  [ CTA LINE — 空 ]                    [ CONTACT US → ]        │
    │                                        └ → contact.html       │
    └──────────────────────────────────────────────────────────────┘
    ※ 本页不做报名表单：志愿者登记走联系页（见 A5）
════════════════════════════════════════════════════════════════════════════
 6 · FOOTER   (与首页完全一致)
════════════════════════════════════════════════════════════════════════════
```

---

## 7. 联系页线框图（contact.html）— 新增

```
════════════════════════════════════════════════════════════════════════════
 0 · HEADER   (与首页完全一致)
════════════════════════════════════════════════════════════════════════════
 1 · PAGE HERO   (窄版 · 无大图)
    ┌──────────────────────────────────────────────────────────────────┐
    │   [ PAGE TITLE — 空 ]        ← 例如 "Contact us"                 │
    │   [ PAGE SUBTITLE — 空 ]                                         │
    └──────────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 2 · CONTACT CHANNELS   (★ 直接读 org.* · 全部来自 config.js)
    ┌──────────────────────────────────────────────────────────────┐
    │  📍 Address      [ org.address  — 空 ]                       │
    │  ☎  Phone        [ org.phone    — 空 ]                       │
    │  💬 WhatsApp     [ org.whatsapp — 空 ]                       │
    │  ✉  Email        [ org.email    — 空 ]                       │
    │  🕐 Hours        [ org.hours    — 空 ]                       │
    │  [ OPEN MAP ] → org.mapsUrl（空则 disabled）                  │
    └──────────────────────────────────────────────────────────────┘
    ※ 这五项与旧 #contact 板块同源，只是从首页搬到这里
════════════════════════════════════════════════════════════════════════════
 3 · MAP SLOT
    ┌──────────────────────────────────────────────────────────────┐
    │          [ MAP EMBED / IMAGE — 空 · 建议 1200x400 ]           │
    │          （不嵌 Google iframe：无 CDN 约束，改为图槽）          │
    └──────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════════════════
 4 · WHO TO CONTACT   (表格 · 行数与内容都留空)
    ┌────────────────┬────────────────┬──────────────────────────┐
    │ [ COL 1 — 空 ] │ [ COL 2 — 空 ] │ [ COL 3 — 空 ]           │
    ├────────────────┼────────────────┼──────────────────────────┤
    │ [ — 空 ]       │ [ — 空 ]       │ [ — 空 ]                 │
    │ [ — 空 ]       │ [ — 空 ]       │ [ — 空 ]                 │
    └────────────────┴────────────────┴──────────────────────────┘
    ※ 例：General enquiries / Donations / Volunteering / Media
════════════════════════════════════════════════════════════════════════════
 5 · FOOTER   (与首页完全一致)
════════════════════════════════════════════════════════════════════════════
```

---

## 8. 留空的四种状态

`config.js` 顶层开关（本次定为 `"hint"`）：

```js
placeholders: "hint"    // "hint" = 灰字「待填写」；"blank" = 完全空白但保留高度
```

| 你写的值 | `"hint"`（本次采用） | `"blank"` |
|---|---|---|
| `""` | 浅蓝虚线框 + 「待填写」 | 完全空白，**高度不变**，布局不塌 |
| `"实际文字"` | 正常显示 | 正常显示 |
| `null` | 节点从 DOM 移除 | 同左 |

例外：**图片槽永远显示虚线框 + 建议尺寸**；**页脚四栏骨架永远存在**；**表单 `<label>` 永远显示**，只有 input 的 placeholder 走占位词。

占位词键：`placeholder.todo` / `placeholder.image` / `placeholder.size` / `placeholder.customAmount` / `placeholder.notSelected`。

---

## 9. 填写索引表（在哪改）

**一条规矩**：内容全在 `assets/js/config.js` 的 `content` 块；界面用词全在 `assets/js/i18n.js`。没有第三个地方。

### 9.1 全站共用（Header / Footer）

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| Header `[LOGO]` | config.js | `content.logo` | `"assets/img/logo.svg"` |
| 导航 About / Get Involved / Contact | i18n.js | `nav.about` / `nav.getInvolved` / `nav.contact` | `"Tentang Kami"` |
| 导航 Donate 按钮 | i18n.js | `nav.donate` | `"Derma"` |
| 页脚四栏 | config.js | `content.footer.col1Title`…`col4Links` | `[{label:"Our history", href:"#" }]` |
| 版权行 | i18n.js | `footer.copyright` | `"© {year} Triniti"` |

### 9.2 首页

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| Hero 图 + alt | config.js | `content.hero.image` / `.imageAlt` | `"assets/img/hero.jpg"` |
| Hero 标题 / 副文 / CTA | config.js | `content.hero.title` / `.subtitle` / `.ctaLabel` / `.ctaHref` | `"Every child deserves a home"` |
| 五卡标题 ×5 | i18n.js | `card.lendHand` / `card.sponsorChild` / `card.volunteer` / `card.giftOfLove` / `card.donateForUs` | `"Pinjam Tangan"` |
| 五卡 icon / 正文 / 链接 | config.js | `content.cards[0..4].icon` / `.body` / `.href` | 第 5 张 `.href="donate.html"` |
| About 标题 | i18n.js | `about.title` | `"Who we are"` |
| About 正文 / Founded / Serves | config.js | `content.about.body` / `.founded` / `.residents` | `"1998"` / `"40 children"` |
| About 图 + alt | config.js | `content.about.image` / `.imageAlt` | `"assets/img/about.jpg"` |
| Program 1/2 全部字段 | config.js | `content.programs[0]` / `[1]` | title/body/image/imageAlt/linkLabel/linkHref |
| Wishlist 标题 | i18n.js | `nav.wishlist` | `"Senarai Keperluan"` |
| Wishlist 条目 | Google Sheet | `sheetCsvUrl` | 见 `docs/SHEET-SETUP.md` |
| 捐款带标题 / 简介 | config.js | `content.donation.title` / `.intro` | `"Make a difference"` |
| 金额档位 / 币种 | config.js | `content.donation.amounts` / `.currency` | `[10,25,50,100,200]` / `"RM"` |
| Other amount / DONATE NOW 文案 | i18n.js | `donate.customAmount` / `donate.now` | `"Jumlah lain"` / `"Derma sekarang"` |

### 9.3 donate.html — 付款区（落地即可见）

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| `[ PAGE TITLE ]` | i18n.js | `donatePage.title` | `"Ways to donate"` |
| `[ PAGE SUBTITLE ]` | config.js | `content.donation.pageSubtitle` | `"Choose the way that suits you."` |
| `You are donating` 标签 | i18n.js | `donatePage.amountLabel` | `"You are donating"` |
| `未选择` | i18n.js | `placeholder.notSelected` | `"No amount selected"` |
| `Change amount` | i18n.js | `donatePage.changeAmount` | `"Change amount"` |
| `① E-WALLET / QR` 标题 | i18n.js | `pay.qrTitle` | `"Scan with your e-wallet"` |
| QR 图 | config.js | `content.donation.qrImage` | `"assets/img/qr.png"` |
| QR 说明 | config.js | `content.donation.qrCaption` | `"Scan with any banking app"` |
| E-wallet 名 | config.js | `content.donation.ewalletName` | `"DuitNow · Touch 'n Go · GrabPay"` |
| `② BANK HOSTED PAGE` 标题 | i18n.js | `pay.hostedTitle` | `"Pay on the bank page"` |
| `[ HOSTED PAGE LABEL ]` | config.js | `content.donation.onlineLabel` | `"Prefer to pay online?"` |
| 托管页按钮文字 | i18n.js | `pay.hostedCta` | `"Bayar dengan selamat"` |
| 托管页 URL | config.js | `content.donation.onlineUrl` | `"https://..."`（空 → disabled） |
| `尚未开通` | i18n.js | `pay.hostedUnavailable` | `"Not available yet"` |
| `③ BANK TRANSFER` 标题 | i18n.js | `otherWays.bankTitle` | `"Bank transfer"` |
| Bank name / Account name / Account no. / SWIFT | config.js | `content.donation.bankName` / `.accountName` / `.accountNumber` / `.swift` | `"Maybank"` / `"5123 4567 8901"` / `"MBBEMYKL"` |
| `COPY ACCOUNT NO` / `Copied` | i18n.js | `otherWays.copy` / `.copied` | `"Salin nombor akaun"` / `"Disalin"` |
| 转账后提示 | i18n.js | `pay.afterNote` | `"After transferring, you may tell us below (optional)"` |

### 9.4 donate.html — Details（可选表单）

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| 折叠标题 | i18n.js | `form.summary` | `"Tell us about your donation (optional)"` |
| 字段标签 ×5 | i18n.js | `form.fullName` / `form.email` / `form.phone` / `form.message` / `form.anonymous` | `"Nama penuh"` |
| 匿名说明（勾上后整块替换） | i18n.js | `form.anonymousNote` | `"Nothing you type here is sent or stored. There is no reference number, because no record exists."` |
| 同意勾选 | i18n.js | `form.agree` | `"I agree to be contacted"` |
| 同意未勾 | i18n.js | `form.errAgree` | `"Please tick the box, or choose to stay anonymous."` |
| 隐私说明 | i18n.js | `form.privacy` | `"Used only to contact you about this donation."` |
| 提交按钮 | i18n.js | `form.send` | `"Send details"` |
| 提交中 | i18n.js | `form.sending` | `"Sending…"` |
| 成功（带编号） | i18n.js | `form.success` | `"Received. Reference {ref}"` |
| 校验：必填 / 邮箱 | i18n.js | `form.errRequired` / `form.errEmail` | `"Please enter your email"` |
| 匿名被后端拒绝（正常前端不会发生） | i18n.js | `form.errAnonymous` | `"This should not happen; please reload the page."` |
| 限流 / 服务端 / 网络 | i18n.js | `form.errRate` / `form.errServer` / `form.errNetwork` | `"Too many attempts, try later"` |
| 后端未配置 | i18n.js | `form.backendMissing` | `"Server not configured yet"` |
| 不存草稿提示 | i18n.js | `form.noDraftNote` | `"This form is not saved; refreshing clears it."` |

### 9.5 donate.html — Other ways / 联系

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| `DONATE ITEMS` 标题 | i18n.js | `otherWays.itemsTitle` | `"Donate items"` |
| Drop-off / Contact / Hours / Item list | config.js | `content.donation.itemDropoff` / `.itemContact` / `.itemHours` / `.itemList` | `"Mon–Sat, 9am–5pm"` |
| `OPEN MAP` | i18n.js + config.js | `otherWays.map` + `org.mapsUrl` | `"Buka dalam peta"`（空则 disabled） |
| Questions? 联系方式 | config.js | `org.phone` / `org.whatsapp` / `org.email` | — |

### 9.6 volunteer.html

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| `[ PAGE TITLE ]` | i18n.js | `volunteer.title` | `"Volunteer with us"` |
| `[ PAGE SUBTITLE ]` | config.js | `content.volunteer.subtitle` | `"Give a few hours a month."` |
| Why 图 + alt | config.js | `content.volunteer.image` / `.imageAlt` | `"assets/img/volunteer.jpg"` |
| Why 正文 ×2 段 | config.js | `content.volunteer.body1` / `.body2` | — |
| 角色卡标题 ×3 | i18n.js | `volunteer.role1` / `role2` / `role3` | `"Tutor"` |
| 角色卡 icon / 正文 / 时长 | config.js | `content.volunteer.roles[0..2].icon` / `.body` / `.commitment` | `"2 hours / week"` |
| 步骤标题 ×3 | i18n.js | `volunteer.step1` / `step2` / `step3` | `"Apply"` |
| 步骤正文 ×3 | config.js | `content.volunteer.steps[0..2]` | — |
| CTA 一行字 / 按钮 | config.js + i18n.js | `content.volunteer.ctaLine` + `volunteer.ctaButton` | `"Contact us →"` |

### 9.7 contact.html

| 线框图标记 | 文件 | 键 | 示例值 |
|---|---|---|---|
| `[ PAGE TITLE ]` | i18n.js | `contactPage.title` | `"Contact us"` |
| `[ PAGE SUBTITLE ]` | config.js | `content.contactPage.subtitle` | `"We reply within two working days."` |
| Address / Phone / WhatsApp / Email / Hours | config.js | `org.address` / `.phone` / `.whatsapp` / `.email` / `.hours` | 与旧 `#contact` 同源 |
| 字段标签 ×5 | i18n.js | `contactPage.address` / `.phone` / `.whatsapp` / `.email` / `.hours` | `"Alamat"` |
| 地图槽 | config.js | `content.contactPage.mapImage` / `.mapAlt` | `"assets/img/map.png"` |
| `OPEN MAP` | i18n.js + config.js | `otherWays.map` + `org.mapsUrl` | 空则 disabled |
| 部门表表头 ×3 | i18n.js | `contactPage.col1` / `col2` / `col3` | `"Department"` |
| 部门表内容 | config.js | `content.contactPage.rows` | `[{a:"General", b:"—", c:"hello@…"}]` |

### 9.8 config.js 完整骨架

```js
window.WISHLIST_CONFIG = {
  /* ---- 现有字段，保持不变 ---- */
  sheetCsvUrl: "",
  defaultLocale: "en",
  refreshSeconds: 300,
  org: { name, address, phone, whatsapp, email, hours, mapsUrl },

  /* ---- 空值长什么样 ---- */
  placeholders: "hint",

  /* ---- 后端 ---- */
  api: { baseUrl: "", submitPath: "/donations", timeoutMs: 8000 },

  /* ---- 页面内容 ---- */
  content: {
    logo: "",
    hero:    { image:"", imageAlt:"", title:"", subtitle:"", ctaLabel:"", ctaHref:"" },
    about:   { body:"", founded:"", residents:"", image:"", imageAlt:"" },
    programs:[ { image:"", imageAlt:"", title:"", body:"", linkLabel:"", linkHref:"" },
               { image:"", imageAlt:"", title:"", body:"", linkLabel:"", linkHref:"" } ],
    cards:   [ { icon:"", body:"", href:"" },   // 0 Lend a Hand
               { icon:"", body:"", href:"" },   // 1 Sponsor A Child
               { icon:"", body:"", href:"" },   // 2 Volunteer
               { icon:"", body:"", href:"" },   // 3 Gift Of Love
               { icon:"", body:"", href:"donate.html" } ], // 4 Donate for us
    donation:{ title:"", intro:"", amounts:[10,25,50,100,200], currency:"",
               pageSubtitle:"",
               /* --- 付款区（落地即可见） --- */
               qrImage:"", qrCaption:"", ewalletName:"",
               onlineLabel:"", onlineUrl:"",     // 空 → 按钮 disabled
               bankName:"", accountName:"", accountNumber:"", swift:"",
               /* --- 寄物品 --- */
               itemDropoff:"", itemContact:"", itemHours:"", itemList:"",
               donateHref:"donate.html" },
    volunteer:{ subtitle:"", image:"", imageAlt:"", body1:"", body2:"",
                roles:[ { icon:"", body:"", commitment:"" },
                        { icon:"", body:"", commitment:"" },
                        { icon:"", body:"", commitment:"" } ],
                steps:[ "", "", "" ],
                ctaLine:"" },
    contactPage:{ subtitle:"", mapImage:"", mapAlt:"",
                  rows:[ { a:"", b:"", c:"" }, { a:"", b:"", c:"" } ] },
    footer:  { col1Title:"", col1Links:[], col2Title:"", col2Links:[],
               col3Title:"", col3Links:[], col4Title:"", col4Links:[] }
  }
};
```

---

## 10. 蓝白配色 token

| 旧 token | 旧值 | 新 token | 新值 |
|---|---|---|---|
| `--green-900` | #0c2f25 | `--navy-900` | #0b2138 |
| `--green-800` | #123f31 | `--navy-800` | #123a63 |
| `--green-700` | #175039 | `--blue-700` | #17569c |
| `--green-600` | #1f6b4a | `--blue-600` | #1d6fc4 |
| `--green-500` | #2e8a63 | `--blue-500` | #3a8fdc |
| `--green-100` | #dceee2 | `--blue-100` | #dcebf9 |
| `--sand-50` | #fdfbf6 | `--ice-50` | #ffffff |
| `--sand-100` | #f6efe1 | `--ice-100` | #f4f8fd |
| `--sand-200` | #eaddc6 | `--ice-200` | #e6eef8 |
| `--sand-300` | #d9c7a6 | `--ice-300` | #cfdeee |
| `--ochre-600` | #935b16 | `--accent-600` | #12559b |
| `--ochre-500` | #c08a2e | `--accent-500` | #4a9bdc |
| `--ink` | #16211c | `--ink` | #0e1c2b |
| `--line` | #e2d8c6 | `--line` | #dbe6f2 |
| `--focus` / `--link` | #1f6b4a / #175039 | 同名 | #1d6fc4 / #12559b |
| `--footer-bg` | #0c2f25 | 同名 | #0b2138 |

- token 名一并改（`green/sand/ochre` → `navy/blue/ice/accent`）。
- **保留语义状态色**：urgent 红 `--alert-700` #b3261e、fulfilled 绿 #0f6b52。状态色不是品牌色，全蓝会让「已完成/紧急」失去区分。
- 暗色模式改深海军蓝底（#0a1622 / #0f2233），不是纯黑。
- `favicon.svg`：`fill="#1f4a3d"` → `#0b2138`；`stroke/fill="#e8d9b5"` → `#ffffff`。

---

## 11. 语言：English + Bahasa Melayu（中文移除）

- `i18n.js`：删掉 `zh` 整个语言对象，保留 `en` / `ms`。
- 切换器从 3 项变 2 项：`EN | BM`；`<html lang>` 同步。
- `defaultLocale` 保持 `"en"`。
- 新增的键**只写 en + ms 两份**。
- 删掉的键：`banner.*`（横幅没了）、`stats.*`（统计没了）、`about.course` / `about.partner` / `about.lecturer` / `about.date` / `about.dateValue` / `about.workshopTitle` / `about.workshopBody` / `about.wishlistTitle` / `about.wishlistBody` / `about.teamTitle` / `about.teamNote`（署名块没了）。
- 文档里「三语 / trilingual」改为「双语 / bilingual」：`README.md`、`docs/BUILD-CONTRACT.md`、`docs/CARETAKER-GUIDE.md`。

---

## 12. 后端

### 12.1 为什么必须单独部署

GitHub Pages 只发静态文件，**不能跑服务端代码**。所以后端放在别处，前端仍是纯静态；两者通过一个 HTTPS 接口说话。

这构成对 `docs/BUILD-CONTRACT.md` §0「Pure static site, no build step, no npm」的**一次修订**：前端依旧纯静态、无构建、无 npm；后端是**独立部署的一个文件**，不进前端构建链。修订条款写进 §12.9。

### 12.2 方案（已定：Cloudflare Worker + KV）

| | **采用 A：Cloudflare Worker + KV** | 备选 B：Google Apps Script + Sheet | 备选 C：Supabase |
|---|---|---|---|
| 新账号 | Cloudflare 免费账号 | 不需要 | Supabase 免费账号 |
| 能否读回响应（真编号） | **能** | **不能**（不回 CORS 头） | 能 |
| CORS | 自己写，完全可控 | 不可控 | 自带 |
| 数据落在哪 | KV（可再转发到 Sheet） | Google Sheet | Postgres |
| 免费额度 | 10 万请求/天 | 约 2 万次/天 | 500MB 库 |

**为什么不用 B**：Apps Script 部署成 Web App 后不返回 `Access-Control-Allow-Origin`，跨域 `fetch` **拿不到响应体**。只能 `mode:"no-cors"` 发出去，结果是**不知道成功还是失败**，也无法回显编号。

### 12.3 接口契约

```
POST {api.baseUrl}/donations
Content-Type: application/json
```

请求体（前端只发这些，多余字段后端丢弃）：

```json
{
  "amount": 25,
  "currency": "RM",
  "name": "",
  "email": "",
  "phone": "",
  "message": "",
  "agree": true,
  "locale": "en",
  "hp": "",
  "ts": "2026-11-13T19:51:31.000Z"
}
```

**匿名时前端根本不发这个请求。** 不是删字段、不是发空串、不是后端置 null——是**一次网络请求都不产生**（D27）。勾上匿名，表单整块变 disabled，`SEND DETAILS` 不可点，页面只留一句说明和付款信息。

理由：`name`/`email`/`phone` 只是最容易想到的三个字段。一条记录里还有 `message`、`locale`、`ua`、`ip_hash`、`ts`、`amount`——删掉三个字段、留着另外六个，仍然是一条能指向某个人的记录。**「什么数据都不需要留」只有一种实现：不写。**

成功 `201`：`{ "ok": true, "ref": "DON-20261113-8F3A" }`

| 码 | 含义 | 前端表现 |
|---|---|---|
| `400` | 校验失败（`{ok:false, error:"email"}`） | 定位到该字段显示 `form.errEmail` |
| `429` | 触发限流 | `form.errRate` |
| `500` | 服务端错 | `form.errServer` |
| 网络错误 | 断网 / CORS | `form.errNetwork` |

**服务端校验**（不信前端）：`email` 必须匹配 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`；`name` ≤ 120 字符；`message` ≤ 1000；`amount` 为 0–100000 的数字或 `null`；`hp` 非空即当机器人**静默返回 201 但不存**；每 IP 每小时 ≤ 5 次。

**第三道防线**：`anonymous === true` 的请求，后端**直接返回 `400 {ok:false,error:"anonymous"}`，不落库、不占限流额度**。正常前端永远不会发出这种请求；收到就说明有人手工构造了它。这是「匿名 = 零留存」在服务端的落地方式——不靠前端自觉，也不靠字段裁剪。

### 12.4 存储结构（Worker + KV）

```
KV namespace  DONATIONS
key   donation:<ISO 时间戳>:<8 位随机>
value {
  ref, amount, currency,
  name, email, phone, message,
  locale, ua, ip_hash, created_at
}
```

**KV 里不存在 anonymous 这个字段**，因为匿名提交从不进 KV。凡是在 KV 里的记录，都必然带姓名与联系方式——这让导出表一眼可读，也不会出现「一半字段是 null」的行。

- `ip_hash` = `SHA-256(ip + SALT)` 前 16 位，**不存原始 IP**。
- `ref` = `DON-` + `YYYYMMDD` + `-` + 4 位大写十六进制。
- 导出：Cloudflare 控制台可列 KV 并下载；也可在 Worker 里加一个带 `ADMIN_TOKEN` 的 `GET /donations` 供运营导出（默认关闭）。

### 12.5 config.js 后端字段

```js
api: {
  baseUrl: "",              // 例 "https://triniti-donations.example.workers.dev"
  submitPath: "/donations",
  timeoutMs: 8000
}
```

`baseUrl` 为空 → details 表单可展开可填，但提交按钮 `disabled`，状态区显示 `form.backendMissing`。**不会假装成功。**

### 12.6 前端提交逻辑（`donate.js` 里约 55 行）

```js
/* 匿名 = 不发请求。整块 disabled + 换成说明，不构造 payload，不调 fetch。 */
function onAnonymousChange(form) {
  const on = form.anonymous.checked;
  ["name", "email", "phone", "message", "agree", "send"].forEach(function (k) {
    form[k].disabled = on;                       // disabled 而非 hidden：看得见自己放弃了什么
  });
  form.privacy.hidden = on;                      // 隐私说明对匿名者不适用
  form.anonymousNote.hidden = !on;               // 换成「什么都没发送、也没有编号」
  if (on) {
    ["name", "email", "phone", "message"].forEach(function (k) { form[k].value = ""; });
    form.agree.checked = false;
    setStatus("idle", "");
  }
}

function buildPayload(form) {
  /* 走到这里说明没勾匿名；勾了匿名的话按钮是 disabled，根本进不来 */
  return {
    amount: readAmount(),
    currency: WISHLIST_CONFIG.content.donation.currency,
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    message: form.message.value.trim(),
    agree: form.agree.checked,
    locale: I18N.getLocale(),
    hp: form.hp.value,
    ts: new Date().toISOString()
  };
}

function validate(form) {
  if (form.anonymous.checked) return null;       // 匿名：无表单可校验
  const email = form.email.value.trim();
  if (!email) return { field: "email", error: "required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: "email", error: "email" };
  if (!form.agree.checked) return { field: "agree", error: "agree" };
  return null;
}

async function submitDetails(payload) {
  const { baseUrl, submitPath, timeoutMs } = WISHLIST_CONFIG.api;
  if (!baseUrl) return { ok: false, error: "backendMissing" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs || 8000);
  try {
    const res = await fetch(baseUrl.replace(/\/$/, "") + (submitPath || "/donations"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || "server" };
    return { ok: true, ref: data.ref };
  } catch (e) {
    return { ok: false, error: e.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
```

### 12.7 刷新时的行为（只有记录层，没有草稿层）

| 层 | 存什么 | 存哪 | 状态 |
|---|---|---|---|
| 草稿层 | 未提交的表单字段 | ~~localStorage~~ | **不做**（m00110）。刷新即清空 |
| 记录层（非匿名） | 已提交的完整记录 | 后端 KV | 做。刷新、关标签、换设备都能在导出里查到 |
| 记录层（匿名） | —— | —— | **不存在**（m00218）。没有请求，没有记录，没有编号 |

「避免刷新即丢」的准确范围：**非匿名提交的捐款资料不丢**。匿名提交本来就没有资料，所以谈不上丢。这两句必须一起说，否则「加后端防丢」与「匿名什么都不留」会读成互相矛盾。

### 12.8 失败与降级

- 后端挂了 → QR 与银行账号**照常显示**（静态内容，不依赖后端）。捐款人永远能转账。
- 提交失败 → 状态区给可操作建议：重试 / 直接转账 / 邮件联系 `org.email`。
- 后端未配置 → 表单可见但按钮禁用，附 `docs/BACKEND-SETUP.md` 指引。

### 12.9 隐私

| 你勾了匿名吗 | 服务器收到什么 | 服务器存什么 |
|---|---|---|
| **没勾** | 金额、币种、姓名、邮箱、电话、留言、语言、时间、UA、加盐 IP 哈希 | 上面全部（IP 只存哈希） |
| **勾了** | **什么都收不到——没有任何请求发出** | **什么都没有** |

**绝不收集**：卡号、CVV、银行登录、身份证号。

页面上的两段说明（`form.privacy` 与 `form.anonymousNote`）要写实话：

> **没勾匿名时**：我们会保存你填写的姓名与联系方式，仅用于就这笔捐款联系你。
>
> **勾了匿名时**：你在这里输入的任何内容都不会被发送、也不会被保存——姓名、邮箱、电话、留言，一个字都不发。因此也不会生成编号，我们无法确认你转过账，也无法给你回执。付款信息就在上面，请直接使用。

**代价讲明白**：勾了匿名，NGO 端唯一能看到的只有银行流水里的一条入账，无法与任何表单记录对应，同一小时两笔同额也分不开。这是「什么数据都不需要留」的必然结果，我按决定执行并在此留痕。

### 12.10 部署步骤（Cloudflare Worker，六步）

1. 注册免费 Cloudflare 账号 → Workers & Pages → Create → Worker，命名 `triniti-donations`。
2. 粘入 `backend/worker.js`（约 120 行，随代码一起交付）。
3. Storage → KV → 新建 namespace `DONATIONS`，在 Worker 设置里绑定为变量 `DONATIONS`。
4. Settings → Variables：`ALLOWED_ORIGIN` = `https://demons00041-bit.github.io`；`SALT` = 随机串。
5. Deploy，得到 `https://triniti-donations.<sub>.workers.dev`。
6. 把该地址填进 `assets/js/config.js` 的 `api.baseUrl`，提交推送。

### 12.11 对 BUILD-CONTRACT 的修订

在 `docs/BUILD-CONTRACT.md` §0 追加一条例外：

> §0 amendment: the front end stays pure static (no build, no npm, no framework). The donation details endpoint is a separately deployed single-file service (`backend/worker.js`) and is never part of the front-end build. `assets/js/donate.js` talks to it over HTTPS only; every payment instruction (QR, bank account, hosted page) renders from static config and must keep working when the endpoint is unreachable. The front end stores no form state locally: no localStorage, no sessionStorage, no cookies for form state. The language preference key `triniti.lang` is the only localStorage write and is unrelated to donations.

---

## 13. 要动的文件

| 文件 | 动作 | 原因 |
|---|---|---|
| `index.html` | 重写结构；删 `#stats` / `#status-banner` / `#contact` / 课程署名；捐款带改「点金额即跳」 | 板块地图变了 |
| **`donate.html`（新）** | 付款区 + 可选 details + 寄物品 + 联系条 | 独立捐款页 |
| **`volunteer.html`（新）** | 志愿者页：图文 + 3 角色卡 + 3 步骤 + CTA | `Get Involved` 的落点 |
| **`contact.html`（新）** | 联系方式页：五通道 + 地图槽 + 部门表 | `Contact` 的落点 |
| `assets/css/style.css` | token 改名 + 重写首页 + 新增 `.pay-grid` `.amount-bar` `.details-panel` `.form-row` `.status` `.roles` `.steps` `.contact-table` `.page-hero` | 配色与版式 |
| `assets/js/config.js` | 新增 `placeholders` / `api` / `content`（含 volunteer、contactPage） | 集中填内容 |
| `assets/js/i18n.js` | **删 zh** + 新增键 × en/ms + 删 banner/stats/about 署名键 | 语言调整 + 板块增删 |
| **`assets/js/site.js`（新，约 150 行）** | 四页共用：占位逻辑、`content` 渲染、`applyOrg()`、页脚、导航高亮 | 避免 wishlist 代码跑到非 wishlist 页 |
| `assets/js/app.js` | **删** `renderStats()` / `renderBanner()` 及其调用；`applyOrg()` 移出；新增 Other amount 就地输入 | 统计与横幅取消 |
| **`assets/js/donate.js`（新，约 200 行）** | 读 `?amount=`、匿名整块禁用（不发请求）、校验、POST 后端、状态区、复制账号、禁用态 | 捐款页逻辑（无草稿逻辑） |
| `assets/js/data.js` | **不动** | 数据层与版式无关 |
| `assets/data/sample-items.json` | **不动** | 演示数据够用 |
| **`backend/worker.js`（新，约 120 行）** | CORS、校验、限流、写 KV、返回 ref；`anonymous:true` 直接 400 不落库 | 你要求加后端 |
| **`docs/BACKEND-SETUP.md`（新）** | 六步部署 + KV 绑定 + 环境变量 + 导出数据 | 交接必需 |
| `docs/BUILD-CONTRACT.md` | 追加 §0 amendment + 四页 DOM 契约 + 删「credit the CodeSparks team」要求 | 契约必须与代码一致 |
| `docs/CARETAKER-GUIDE.md` | 「三语」→「双语」；补捐款页字段与后端导出 | 交接文档 |
| `README.md` | 四页结构 + 捐款流程 + 后端一段；删署名相关表述 | 交接文档 |
| `favicon.svg` | 深绿→深海军蓝，沙色→白 | 配色 |

前端仍无构建、无 npm、无框架；后端是一个独立文件，单独部署。

---

## 14. 实施步骤（按顺序做，每步自带自查）

**第 0 步 · 开工前**
`git status` 确认工作区干净；开一份 `docs/REDESIGN-PLAN.md` 在侧边对照。
自查：没有未提交改动，出问题能 `git checkout -- .` 回到原样。

**第 1 步 · 地基：token 与配色（只改 `style.css` 顶部 + `favicon.svg`）**
把 §10 的 16 组 token 一次性改名改值，全文件替换引用；favicon 换两个色值。
自查：`grep -i "green\|sand\|ochre\|clay" assets/css/style.css` 只剩语义状态色注释；首页此刻仍是旧版式但已经是蓝白。

**第 2 步 · `site.js`：把四页共用的东西抽出来**
新建 `assets/js/site.js`，从 `app.js` 搬入 `applyOrg()` 与占位渲染；新增 `renderContent()` 读 `config.content`、`applyPlaceholders()` 按 `placeholders` 开关决定虚线框或空白。
自查：旧 `index.html` 仍能正常显示联系方式（说明 `applyOrg()` 搬家没坏）；`app.js` 里不再有 `applyOrg` 定义。

**第 3 步 · `config.js`：一次性铺好所有空位**
按 §9.8 骨架写入 `placeholders` / `api` / `content`（含 `volunteer`、`contactPage`）。所有字符串先留 `""`。
自查：`node -e "require('./assets/js/config.js')"` 之类不适用（浏览器全局），改为浏览器打开控制台 `WISHLIST_CONFIG.content` 能看到完整对象、无 `undefined` 键。

**第 4 步 · `i18n.js`：删 zh、删废弃键、加新键**
删 `zh` 对象；删 `banner.*` / `stats.*` / about 署名相关键；加 §9 表里所有新键（en + ms 两份）。
自查：切到 BM，页面无裸 key（形如 `nav.about` 的字符串）；`grep -i "zh" assets/js/i18n.js` 无残留。

**第 5 步 · 首页 `index.html` 重写**
按 §4 线框重排：Header 三项导航 + DONATE、单屏 Hero、五卡、About（无署名）、两个项目、Wishlist（无统计无横幅）、捐款带 6 格、四栏页脚。
自查：`#stats` / `#status-banner` / `#banner-text` / `.team` 在文件里搜不到；控制台无报错。

**第 6 步 · `app.js` 收尾**
删 `renderStats()` / `renderBanner()` 及调用点；加 Other amount 就地展开与 `DONATE NOW` 拼 `?amount=`。
自查：筛选、排序、搜索、进度条、`aria-live` 结果数**全部照旧可用**；点 `Other amount` 地址不变、出输入框；点 `25` 直接跳走。

**第 7 步 · `donate.html` + `donate.js`**
按 §5 线框搭页；`donate.js` 实现读金额、复制账号、**匿名一勾整块 disabled 且不发请求**、表单校验、POST、状态区、各种 disabled 态。
自查：`donate.html` 不带参数打开 → QR 与银行账号**立刻可见**，金额显示「未选择」；`api.baseUrl` 为空时提交按钮 disabled；勾匿名后开 Network 面板，**一条请求都没有**。

**第 8 步 · `volunteer.html` + `contact.html`**
按 §6 / §7 线框搭两页，只引 `site.js`（不引 `app.js`）。
自查：导航三个链接各自都能到、都能从落点回首页；两页无 wishlist 相关 JS 报错。

**第 9 步 · 后端**
写 `backend/worker.js` + `docs/BACKEND-SETUP.md`；本地可用 `wrangler dev` 或部署后 `curl` 验证。
自查：§16 第 27–33 条全过。

**第 10 步 · 文档与全量回归**
更新 `README.md` / `docs/BUILD-CONTRACT.md` / `docs/CARETAKER-GUIDE.md`；跑 `python -m http.server` 走完 §16 全部验收。
自查：§16 每一条都有对应证据（截图 / 控制台输出 / curl 结果）。

**不做**：不 `git commit`、不 `git push`，除非你说一句「push」。

---

## 15. 最终效果（做完你看到什么）

**打开首页**
白底、深海军蓝 Header 吸顶，左边 Logo 位置是一个虚线图槽，中间三项导航 `About / Get Involved / Contact`，右边 `EN | BM` 和一枚深蓝实心 `DONATE` 按钮。往下是全宽 Hero：一个大虚线框写着「建议 1920x1080」，下面三行留空位（标题、副文、按钮），按钮是一个空白的蓝色圆角块。再往下五张白卡横排，每张只有图标位、标题（Lend a Hand / Sponsor A Child / Volunteer / Gift Of Love / Donate for us）和一行留空正文，第五张卡整张可点，直接进捐款页。然后 About：左边图槽右边三段留空正文加两行 `Founded / Serves`，**没有课程署名，没有 11 人名单**。接着两个项目板块左右交错，图片与文字全留空。再往下是 wishlist：搜索框、三个下拉、结果计数都在，下面 12 张物资卡带进度条（数据还是样例），**顶部没有统计数字，也没有「这是示范数据」横幅**。最后是全页唯一的深蓝大块：6 个金额格，第一排 10 / 25 / 50，第二排 100 / 200 / Other amount，底下一条宽按钮 `DONATE NOW`。页脚四栏，每栏一个标题位两条链接位，全是虚线空框。

**点 25**
直接跳到 `donate.html?amount=25`。落地第一眼：金额条写「You are donating RM 25」，右边一个 `Change amount` 回首页捐款带；紧接着三块付款方式并排——左 QR 大虚线框（建议 400x400）+ 电子钱包名，中「PAY SECURELY ON <BANK>」按钮是灰的写着「尚未开通」，右银行转账四项全空 + 一个 `COPY ACCOUNT NO` 灰按钮。**一行字都不用填，付款信息已经全在眼前。**

**往下滚到 details**
一个折叠条「Tell us about your donation (optional)」，不点开什么也看不到。点开才有姓名 / 邮箱 / 电话 / 留言 / 匿名 / 同意，底下 `SEND DETAILS`。**勾上匿名，整块表单立刻变灰清空，换成一句「你输入的东西不会被发送、也不会被保存，因此没有编号」——连提交按钮都是灰的，按下去什么也不会发生**，付款信息仍在上面。填一半按 F5，全空、折叠条收回，只有 URL 里的 25 还在。`api.baseUrl` 没填时按钮也是灰的，写着「Server not configured yet」，**不会假装发送成功**。

**点导航 Get Involved**
进 `volunteer.html`：窄标题带、左图右文两段、三张角色卡（图标 + 标题 + 正文 + 时长）、三步流程、一条浅蓝 CTA 带，按钮进联系页。

**点导航 Contact**
进 `contact.html`：五个联系项（地址 / 电话 / WhatsApp / 邮箱 / 时间）全是虚线「待填写」，一个 `OPEN MAP` 灰按钮，一个大地图槽，底下一张部门表，表头和两行内容都空着。

**任何一页切到 BM**
所有固定文案变马来语，留空位仍然是「待填写」，没有裸 key。刷新后仍是 BM（`localStorage` 记着 `triniti.lang`，这是全站唯一的本地存储写入）。

**把 `config.js` 填满**
每个虚线框变成正常文字，虚线消失。图片键填上路径就显示图。不想要哪块就把那个键写成 `null`，节点整个从页面消失。切 `placeholders: "blank"` 则虚线框和「待填写」字样都消失、版面高度不变。

**手机 375px**
单列堆叠，无横向滚动条；捐款带 6 格变 2 列；页脚四栏变单列。系统开暗色模式时底色变深海军蓝，不是纯黑。

---

## 16. 验收标准（逐条自查并给证据）

**通用**
1. `python -m http.server` 打开四页，控制台无报错、无 404。
2. `"hint"` 下每个占位块可见（虚线框 + 「待填写」），无一塌成 0 高度。
3. 临时切 `"blank"` → 占位文字消失但**高度不变**（对比元素 y 坐标）。
4. 填一个值 → 刷新后变正常文本、虚线消失；填 `null` → 节点消失。
5. `grep -i "green\|sand\|ochre\|clay" assets/css/style.css` 只命中语义状态色注释。
6. 语言切换只有 EN / BM；`grep -i "zh" assets/js/i18n.js` 无残留；BM 下无裸 key。
7. 375px 无横向滚动；1280px 栅格正常；暗色模式可读；进度条 `role="progressbar"` 仍在。
8. 页脚四栏骨架四页都在，空栏不塌陷。

**导航与跳转**
9. `About` → `index.html#about` 并滚到 About；`Get Involved` → `volunteer.html`；`Contact` → `contact.html`；`DONATE` → `donate.html`。
10. 三个导航项都真实可达，页面里搜不到 `href="#"` 的死链。
11. 四页 Header / Footer 完全一致（同一份 `site.js` 渲染）。

**首页**
12. `#stats` / `[data-stat]` / `#status-banner` / `#banner-text` / `.team` / `about__facts` 在 `index.html` 里全部搜不到。
13. `app.js` 里搜不到 `renderStats` / `renderBanner`。
14. Hero 只有 1 屏 1 CTA；无轮播箭头/圆点；Stories 不存在。
15. 捐款带 3 列 × 2 行、6 格、`Other amount` 在第 6 格、`DONATE NOW` 独占一行。
16. **点 `25` → 地址变 `donate.html?amount=25`，落地即见 QR 与银行账号**（无需任何点击）。
17. 点 `Other amount` → 地址不变，就地出输入框；填 `75` 再点 `DONATE NOW` → `donate.html?amount=75`。
18. wishlist 的搜索 / 分类 / 状态 / 排序 / 结果计数 / 进度条**全部照旧可用**（回归项）。

**捐款页 — 付款区**
19. Header `DONATE` 与五卡 `Donate for us` → `donate.html`（无金额），QR 与银行账号仍可见，金额显示「未选择」。
20. `qrImage` 为空 → QR 槽虚线框 + 「建议 400x400」，不塌陷。
21. `onlineUrl` 为空 → 托管页按钮 `disabled` + `aria-disabled="true"` + 灰字；填了 → 可点、`target="_blank"` `rel="noopener"`。
22. `COPY ACCOUNT NO` 点击变 `Copied`，2 秒复原；账号为空则 `disabled`。
23. `org.mapsUrl` 为空 → `OPEN MAP` `disabled`。

**捐款页 — 可选 details 与无草稿**
24. 默认折叠；点开才见字段。**不填任何字段也能读完付款信息**（付款区不被遮挡、不被禁用）。
25. **填几个字段后按 F5 → 字段全清、`<details>` 回到折叠、URL 金额仍在**；`document.cookie` 为空，且 `localStorage` 里**只有** `triniti.lang` 一个键。
26. **勾 anonymous → 姓名 / 邮箱 / 电话 / 留言 / 同意 / 提交按钮全部 `disabled`，四格值被清空**，说明文字替换成 `form.anonymousNote`；取消勾选 → 全部恢复可编辑（值不回来，因为没存）。
27. 勾 anonymous 后**打开 Network 面板提交 → 面板里一条请求都没有**（不是请求体少字段，是根本没有 `POST`）；页面也没有编号出现。
28. 未勾匿名且邮箱格式错 → 提交被拦，显示 `form.errEmail`，焦点移到该字段；未勾同意 → 显示 `form.errAgree`。
29. 合法提交 → `POST` 到 `api.baseUrl`，状态区显示后端返回的**真编号**；按钮进入禁用态。
30. `api.baseUrl` 为空 → 提交按钮 `disabled` + `form.backendMissing`，**不假装成功**。
31. 断网提交 → `form.errNetwork`，QR 与银行账号仍可见。
32. 连续提交 6 次 → 第 6 次收到 `429`，显示 `form.errRate`。

**志愿者页 / 联系页**
33. `volunteer.html`：三张角色卡、三步流程、CTA 按钮 → `contact.html`；无报名表单。
34. `contact.html`：五个 `org.*` 项与旧首页 `#contact` 显示一致；部门表两行可增删；地图槽不塌陷。

**后端**
35. `curl -X POST .../donations -H "Content-Type: application/json" -d '{"email":"a@b.co","amount":25}'` → `201` + `{"ok":true,"ref":"DON-…"}`。
36. `curl ... -d '{"email":"a@b.co","anonymous":true,"name":"Ali","phone":"0123"}'` → **`400 {ok:false,error:"anonymous"}`**，且 KV 里**没有新增记录**（前端不发之外的第二道防线；这一条是手工构造请求才会触发的路径）。
37. `OPTIONS` 预检返回 `Access-Control-Allow-Origin: https://demons00041-bit.github.io`，方法含 `POST`。
38. 非法 email → `400`；`hp` 非空 → `201` 但 KV 无新记录。
39. KV 里 `ip_hash` 是哈希不是原始 IP。
40. 关掉 Worker（或断网）后打开 `donate.html` → QR 与银行账号照常显示。

**Tab 顺序**
41. Header → 页标题 → 金额条 → QR → 托管页 → 银行转账 → COPY → details 折叠标题 →（展开后）字段 → 提交 → 寄物品 → 联系条 → 页脚。

---

## 17. 决策记录

**你已定的（m00094 / m00100 / m00110 / m00118 / m00163 / m00218，不再问）**

| # | 决策 | 结论 |
|---|---|---|
| D1 | wishlist 卡片网格 | 保留 |
| D2 | 现有 JS 引擎 | 保留，只换版式 |
| D3 | 语言 | English + Bahasa Melayu，中文移除 |
| D4 | 占位模式 | `"hint"` |
| D5 | 捐款页选金额 | 不做 |
| D6 | 支付网关 | 只做跳转，不提交卡数据 |
| D8 | 点金额 | 除 Other amount 外直接跳 |
| D9 | 落地后看到什么 | QR + 银行账号 + 银行托管页，立即可见 |
| D10 | 原 Stage 1 表单 | 降为可选，默认折叠 |
| D11 | 后端 | 要，**非匿名**提交的记录不随刷新蒸发 |
| D12 | 草稿 | **不存**。表单零持久化（无 localStorage / sessionStorage / cookie） |
| D13 | ~~匿名不存姓名~~ | **已被 D27 取代**（只删三个字段不够，其余六个仍在） |
| D13′ | ~~匿名后 email 不必填~~ | **已被 D27 取代**（匿名时压根没有表单可填） |
| D14 | ~~匿名不存邮箱电话~~ | **已被 D27 取代** |
| D15 | 误刷新 | **就重填**，页面用 `form.noDraftNote` 提前告知 |
| D16 | ~~匿名后三个输入框 disabled~~ | **已被 D27 取代**：整块表单 disabled + 清空 |
| D17 | 导航 `Get Involved` | → `volunteer.html`（新页） |
| D18 | 导航 `Contact` | → `contact.html`（新页） |
| D19 | 首页四个统计 | **不留**，DOM 与 `renderStats()` 一并删 |
| D20 | 演示数据横幅 | **删** |
| D21 | About 课程署名块 | **删**（SULAM / 讲师 / 11 人名单） |
| D22 | 语言偏好持久化 | **保留** `localStorage["triniti.lang"]`；D12 只约束表单 |
| D23 | 后端方案 | Cloudflare Worker + KV |
| D24 | 编号回显 | 回显后端真编号 |
| D25 | 后端未配置时 | 按钮禁用 + 明示「未配置」，不假装成功 |
| D26 | 限流 | 每 IP 5 次/小时 |
| D27 | **匿名 = 零留存** | 勾匿名 → 整块 disabled、不发请求、无记录、无编号；后端收到 anonymous:true 直接 400 不落库 |

**我按假设先写的（错了你说，改起来都是一两行）**

| # | 假设 | 若你要改 |
|---|---|---|
| A1 | 志愿者页**不做报名表单**，登记走联系页 | 要表单 → `worker.js` 加 `kind:"volunteer"`，`donate.js` 拆一份 |
| A2 | 联系页**不嵌 Google Maps iframe**（无 CDN 约束），改图片槽 + `OPEN MAP` 外链 | 要嵌入 → 需破 §0 的 no-CDN 条款 |
| A3 | 四页共用 `site.js`，`app.js` 只留 wishlist 逻辑 | 不拆也行，代价是每页都跑一次数据抓取 |
| A4 | 图片槽**不创建** `assets/img/` 目录，纯 CSS 虚线框 | 建空目录反而让人以为有图 |
| A5 | 地图/图片都当图槽处理，不预置任何占位图文件 | 同 A4 |
| A6 | 本次**不 commit、不 push** | 你说「push」我就推 |

---

## 18. 本次不做的事

- 不写任何真实 NGO 简介、地址、账号、QR 图片、E-wallet 号 —— 全部留空。
- **不收、不存、不转发任何支付卡数据**；不接 Stripe/Billplz 的收款 API（只放托管页链接）。
- **表单零持久化**：不写 localStorage、sessionStorage、cookie（草稿功能已按 m00110 取消）。语言偏好 `triniti.lang` 是唯一例外（D22）。
- **匿名零留存**：勾匿名不产生任何网络请求，服务器端既收不到也存不下（D27）。不做「匿名但留一条脱敏记录」这种中间态。
- 不生成假单号、假收据、不显示「支付成功」。
- 不做后台管理界面（导出走 Cloudflare 控制台或 `docs/BACKEND-SETUP.md` 的命令）。
- 不做第五页；本次固定四页。
- 不动 `.git`、不提交、不推送，除非你明确要求。

## 19. 我已知会你的四个副作用（决定已生效，这里只记录后果）

1. **删掉横幅后，页面不再声明「这是演示数据」。** 12 条样例物资会看起来像真实需求。缓解：`assets/data/sample-items.json` 文件名与 `README` 仍标明示例；你一填 `sheetCsvUrl`，数据就是真的。这条是你 m00163 的明确选择，我按决定执行并在此留痕。
2. **删掉课程署名与仓库现有文档冲突。** 最新一次提交（`5260560`）的标题就是 "About: credit the CodeSparks team and rewrite the copy from the proposal"，`README.md` 与 `docs/BUILD-CONTRACT.md` 都写着要署名。因此第 10 步必须同步修订这两份文档，否则代码与文档互相打脸。
3. **四页共用 `site.js` 是一次搬迁，不是重写。** 风险在于 `applyOrg()` 从 `app.js` 移出时容易漏掉 `i18n:changed` 事件的重渲染。第 2 步的自查与验收第 6、11 条专门盯这个。
4. **匿名捐款对 NGO 完全不可见。** 勾了匿名，NGO 手里没有任何一条记录能对上银行流水，发不出回执，也统计不进「本月多少笔」。这是 m00218 的必然结果——页面必须把这句话讲出来（form.anonymousNote），否则捐款人以为 NGO 知道，NGO 以为捐款人会填表，两边都落空。
