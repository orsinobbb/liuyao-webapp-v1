# 六爻玄機引擎 v1.0.1 — 100% 純前端

零後端、零資料庫、零第三方 runtime 依賴。靜態檔即可部署 GitHub Pages。

## 已完成
- 六爻 6/7/8/9 → 本卦／動爻／變卦
- 64 卦、八宮、宮五行、世應
- 納甲天干地支、爻五行
- 六親、六神
- Gregorian → 日干支離線計算；手動日柱覆寫
- 節氣月建快速輔助；手動月建覆寫
- 旬空
- 生剋、六沖、六合、刑害破資料
- 旺衰工程化可配置分數＋標籤（月破、日沖、空亡、暗動候選）
- 問事分類／手動用神
- 用神／原神／忌神／仇神角色
- 動爻、變爻、回頭生／回頭剋
- 可解釋綜合判斷
- 應期地支觸發條件＋最近日期候選
- localStorage 最近 30 卦
- 複製摘要、匯出完整 JSON
- 手機版 UI
- Node 單元＋整合測試
- GitHub Pages workflow

## 本機啟動
瀏覽器不能直接用 `file://` fetch JSON，請開靜態 HTTP server：

```bash
# 需要 Node.js 18+
npm run serve
# 開 http://127.0.0.1:8080
```

## 測試
```bash
npm test
```

## GitHub Pages
1. 建立 repository，把本資料夾內容 push 到 `main`。
2. Repository → Settings → Pages → Source 選 `GitHub Actions`。
3. `.github/workflows/pages.yml` 會部署整個靜態站。

## 核心資料流
`input → calendar → hexagram → palace/世應 → 納甲 → 六親 → 六神 → 日月/空破 → 用神 → 動變 → judgement → timing`

## 重要設計
- `data/`：較固定的排盤資料。
- `rules/`：可依流派調整的權重、問事分類與判斷原則。
- `question-categories.json` 與 `judgement-rules.json` 已直接驅動用神及判斷；每份 Chart JSON 會記錄實際規則版本。
- `src/engine/`：純函式引擎；UI 不直接硬寫排盤規則。
- 變爻六親仍以前卦卦宮五行為基準。
- 月建自動值是節氣「節」的離線快速輔助；交界日/時務必手動覆寫。
- 日界預設民用午夜；採子初換日者請手動覆寫日柱。

## v1.0.1 修正與驗證
- 修正手機結果表格撐寬整頁的橫向溢位。
- 修正起卦後最近紀錄要重新整理才顯示。
- `npm run serve` 改用零依賴 Node 靜態伺服器，Windows 可直接執行。
- 問事分類、判斷權重／門檻及規則版本已接入實際執行路徑。
- `npm test` 包含引擎、整合、64 卦資料及 HTTP smoke test。

## 下一版可擴充但不破壞架構
伏神／飛神、墓絕、十二長生、進退神、反吟伏吟、三合局成局條件、不同流派 Rule Pack、案例回測與人工標註。
