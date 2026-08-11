# Architecture

## 1. Presentation
`index.html + styles.css + mobile-fixes.css + src/app.js`

## 2. Application orchestration
`src/engine/chart.js` 統一產生一張 immutable-ish chart snapshot。

## 3. Domain engines
- calendar.js：日干支、旬空入口、太陽視黃經節氣月建、應期日期掃描
- validation.js：排盤輸入的集中驗證與正規化
- hexagram.js：本變卦 code
- najia.js：內外卦納甲
- elements.js：五行關係、六親、用神角色
- sixSpirits.js：六神
- relations.js：沖合刑害破、回頭生剋
- strength.js：月日/空破/動靜狀態與可配置分數
- useGod.js：用神候選與排序
- judgement.js：可解釋決策規則
- timing.js：條件觸發型應期候選

## 4. Data / Rules split
固定資料不塞在 UI；具流派爭議的判定與工程權重放 rules。

- `question-categories.json`：用神六親候選，移除非六親提示詞後交給 `useGod.js` 排序。
- `strength-weights.json`：月建、日辰、空破與動靜權重。
- `judgement-rules.json`：綜合判斷權重、結果門檻與說明。
- `engine-pipeline.json`：固定執行流程的版本化宣告；`chart.js` 仍是實際 orchestrator。

## 5. Chart JSON contract
每次排盤輸出完整 snapshot，可直接存 localStorage、匯出 JSON、之後送給其他前端模組或離線 AI。`rules` 欄位記錄 pipeline、問事分類、旺衰權重及判斷規則版本，方便重現結果。
