# Architecture

## 1. Presentation

`index.html`、`styles.css`、`v1.2.css`、`v1.3.css`：輸入、排盤、判斷、伏神顯示、來源追溯、事後回測、歷史與 Debug。

## 2. Application orchestration

- `src/app.js`：收集輸入、呼叫 engine、渲染及協調 storage/export。
- `src/data-loader.js`：載入結構化資料、規則包與來源目錄。
- `src/storage.js`：最近 30 卦與回饋的本機保存。
- `src/feedback.js`：回饋正規化、`liuyao-case-v1` 案例紀錄與 CSV。
- `src/export.js`：摘要、單一案例 JSON、全案例 JSON／CSV。

## 3. Domain engines

```text
calendar → hexagram → najia/elements/sixSpirits
         → hiddenSpirits → relations/strength → useGod
         → judgement → timing → chart snapshot
```

各 engine 只處理自己的領域規則；`chart.js` 組裝不可變的排盤快照，UI 不直接承擔術數規則。

## 4. Data / Rules split

- `data/`：六十四卦、八宮、納甲、干支、六神、旬空、地支關係等基礎資料。
- `rules/`：問事分類、旺衰權重、判斷原則與推理流程。
- `rules/source-catalog.json`：來源層級、連結、支持範圍與限制。
- `rules/rule-pack.json`：可重現的規則包 ID、版本、狀態與來源集合。

來源追溯證明「規則從哪裡來」，不等同科學有效性或專家共識。

## 5. Chart JSON contract

每次排盤輸出完整 snapshot，可存入 localStorage、匯出或交給離線分析。`rules` 記錄 pipeline、問事分類、旺衰權重、判斷規則與規則包版本；`sourceRefs` 記錄來源 ID，讓結果可以重現與稽核。

## 6. Feedback / dataset contract

排盤歷史與回饋使用不同 localStorage key，以 chart ID 關聯。匯出格式為：

```json
{
  "schemaVersion": "liuyao-case-v1",
  "chart": {},
  "review": null
}
```

`review` 可包含實際結果、準確度、解讀幫助度、實際日期、評語與更新時間。沒有回饋時為 `null`，因此原始推理快照不會被事後資料覆寫。

## 7. Deployment flow

GitHub Actions 先執行完整測試，再發布靜態 Pages artifact。根目錄為目前版本；`/v1.0/` 是不可變的舊版備份。
