# 零日危機｜2D 資安密室逃脫

React 19 + TypeScript + Phaser 3 + Vite 製作的完整網站專案。繁體中文、五道資安謎題、2D 橫向移動、手機觸控、提示、進度儲存、通關與重新挑戰。

## 本機執行

安裝 Node.js 20.19+ 或 22.12+，在本資料夾執行：

```bash
npm install
npm run dev
```

瀏覽終端機提供的本機網址。

## 驗證題目

```bash
npm test
npm run build
```

題目邏輯位於 `src/puzzles/logic.mjs`，題面位於 `src/puzzles/data.ts`，測試位於 `tests/puzzles.test.mjs`。正確答案在程式中以固定規則自動產生。這是教育用簡化密碼學模型，不是生產環境密碼系統。

## Cloudflare Pages 部署

1. 將專案推送到 GitHub（不要上傳 `node_modules` 或 `dist`）。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git。
3. 選擇 GitHub 儲存庫，Framework preset 選 **Vite**，Build command 設 `npm run build`，Build output directory 設 `dist`。
4. Deploy 後取得 `*.pages.dev` 公開網址。日後推送程式碼可自動部署。

也可以先本機執行 `npm install && npm run build`，再把 **dist 資料夾** 透過 Cloudflare Pages Direct Upload 上傳。**不要直接上傳本專案的 src 資料夾作為網站。**

## 注意

- 遊戲資料以 localStorage 保存在玩家自己的瀏覽器，不是雲端帳號或多人即時同步。
- 手機上使用觸控方向鍵，桌面可用 A/D、左右方向鍵、E。
- `src/game/scene.ts` 以 Phaser 繪製場景，不依賴外部圖片 CDN。
- 若要多人排行榜，需另外接後端資料庫。

## 探索改版（2026-11-02）
- 返回大廳保留進度；重新開始與再挑戰一次皆清除進度並回大廳。
- 五種場景，每區四個探索物件。移除提示次數，線索由探索取得並收入筆記。
- 道具、供電、授權台校準具有前置條件。多數探索順序自由。
- 答對僅解鎖安全門，人物須走到右側出口並互動後換關；最後一關也須走出出口才通關。
- 本版使用新的瀏覽器存檔格式，首次開啟會從大廳開始；舊版存檔不會被覆蓋。
- 保留原本五關密碼題與完整解題條件。探索提示不直接給完整答案。

### 更新現有 Cloudflare Pages 網址
本壓縮檔包含完整 `src` 原始碼與已建置的 `dist`。
1. 若原站使用 Git 整合，更新原儲存庫檔案（保留你原有的部署設定），推送後使用建置命令 `npm run build`、輸出目錄 `dist`。
2. 若使用 Direct Upload，在原本 Pages 專案建立新部署，上傳 `dist` 資料夾內容（確保 index.html 位於上傳根目錄）。
3. 本次交付未直接修改 zero-day-escape.pages.dev，需在原本專案完成部署。

### 已驗證
- `npm test`：五關答案、正誤驗證、探索物件數量與所有前置條件可達性。
- `npm run build`：TypeScript 與正式建置。
- 瀏覽器實測第一關探索、筆記、解鎖後留在原場景、人物移動至出口換關、返回大廳保留進度，以及重置後停留大廳。
- 其餘關卡尚未逐一完成瀏覽器全流程試玩。
