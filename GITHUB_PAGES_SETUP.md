# GitHub Pages 設定指南

## 🔧 設定步驟

### 1. 前往 GitHub Repository 設定

1. 打開：https://github.com/ke22/map_militrary-exercise
2. 點擊 **Settings**（設定）
3. 在左側選單找到 **Pages**（頁面）

### 2. 設定 Source

在 **Source** 區塊：
- 選擇 **Deploy from a branch**
- **Branch** 選擇：`gh-pages`
- **Folder** 選擇：`/ (root)`
- 點擊 **Save**（儲存）

### 3. 等待部署

- GitHub Pages 通常需要 **1-5 分鐘** 才會生效
- 部署完成後，你會看到綠色的勾勾 ✅
- 網址會顯示在頁面上方

---

## 🔍 驗證部署

### 檢查 gh-pages branch

確認 `gh-pages` branch 有正確的檔案：

```bash
git checkout gh-pages
ls -la
# 應該看到 index.html 和 assets/ 目錄
```

### 檢查檔案路徑

確認 `index.html` 中的路徑正確：

```bash
cat dist/index.html
# 應該看到路徑以 /map_militrary-exercise/ 開頭
```

---

## 🐛 常見問題

### 問題 1: 404 錯誤

**原因：** GitHub Pages 設定未啟用或 source branch 錯誤

**解決：**
1. 確認 Settings → Pages → Source 選擇了 `gh-pages` branch
2. 等待 1-5 分鐘讓 GitHub 處理
3. 清除瀏覽器快取並重新載入

### 問題 2: 資源載入失敗

**原因：** base path 設定錯誤

**解決：**
```bash
# 重新構建並部署
VITE_BASE_PATH=/map_militrary-exercise/ npm run build
npx gh-pages -d dist
```

### 問題 3: 頁面空白

**原因：** JavaScript 路徑錯誤或 Mapbox Token 未設定

**解決：**
1. 檢查瀏覽器控制台（F12）錯誤訊息
2. 確認構建時 `.env` 中的 `VITE_MAPBOX_TOKEN` 已設定
3. 重新構建並部署

---

## 📝 重新部署

如果修改了代碼，需要重新部署：

```bash
# 方法 1: 使用 npm script（推薦）
npm run deploy

# 方法 2: 手動部署
VITE_BASE_PATH=/map_militrary-exercise/ npm run build
npx gh-pages -d dist
```

---

## 🔗 預期網址

設定完成後，應用應該可以在以下網址訪問：

**https://ke22.github.io/map_militrary-exercise/**

如果還是 404，請：
1. 確認 GitHub Pages 設定已儲存
2. 等待幾分鐘
3. 檢查 `gh-pages` branch 是否有檔案
4. 查看 GitHub Actions（如果有設定）的部署狀態

