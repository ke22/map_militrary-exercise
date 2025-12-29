# 部署說明

## ✅ 已部署到 GitHub Pages

應用已成功部署到：
**https://ke22.github.io/map_militrary-exercise/**

---

## 📋 部署步驟（已完成）

1. ✅ 安裝 gh-pages
   ```bash
   npm install --save-dev gh-pages
   ```

2. ✅ 使用正確的 base path 構建
   ```bash
   VITE_BASE_PATH=/map_militrary-exercise/ npm run build
   ```

3. ✅ 部署到 GitHub Pages
   ```bash
   npx gh-pages -d dist
   ```

---

## 🔄 更新部署

當你需要更新部署時，只需重複步驟 2 和 3：

```bash
# 1. 構建（使用正確的 base path）
VITE_BASE_PATH=/map_militrary-exercise/ npm run build

# 2. 部署
npx gh-pages -d dist
```

---

## 📝 在網頁中嵌入

### 基本嵌入碼

```html
<iframe
  src="https://ke22.github.io/map_militrary-exercise/"
  width="100%"
  height="500"
  style="border: 0; border-radius: 8px;"
  loading="lazy"
></iframe>
```

### 響應式容器（推薦）

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://ke22.github.io/map_militrary-exercise/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
    loading="lazy"
  ></iframe>
</div>
```

### 16:9 比例容器

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000; border-radius: 8px;">
  <iframe
    src="https://ke22.github.io/map_militrary-exercise/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    loading="lazy"
    allowfullscreen
  ></iframe>
</div>
```

---

## ⚙️ GitHub Pages 設定

1. 前往 GitHub Repo: https://github.com/ke22/map_militrary-exercise
2. 點擊 **Settings** → **Pages**
3. 確認：
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages` / `root`
   - **Custom domain**: （可選）

---

## 🔍 驗證部署

訪問以下 URL 確認部署成功：
- https://ke22.github.io/map_militrary-exercise/

檢查項目：
- ✅ 地圖正常載入
- ✅ 軍演範圍圖層顯示
- ✅ 參考圖層顯示（ADIZ、海峽中線、領海基線、領海）
- ✅ 語言切換功能正常
- ✅ 圖層控制面板正常運作
- ✅ 響應式設計正常（手機/平板/桌面）

---

## 🐛 故障排除

### 如果頁面顯示空白

1. 檢查瀏覽器控制台（F12）是否有錯誤
2. 確認 `.env` 中的 `VITE_MAPBOX_TOKEN` 已設定
3. 確認 GitHub Pages 已啟用並指向 `gh-pages` branch

### 如果資源載入失敗

1. 確認 `VITE_BASE_PATH` 設定正確（必須是 `/map_militrary-exercise/`）
2. 清除瀏覽器快取並重新載入
3. 檢查 GitHub Pages 的部署狀態

---

## 📦 檔案結構

部署後的檔案結構：
```
gh-pages branch
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── cna_logo-[hash].svg
└── data/
    ├── events.json
    ├── exercises.geojson
    └── reference.geojson
```

---

## 🔐 環境變數

⚠️ **重要**：GitHub Pages 無法讀取 `.env` 檔案

如果需要在 GitHub Pages 上使用環境變數，有兩種方式：

1. **使用 GitHub Secrets**（需要 CI/CD）
2. **在代碼中直接設定**（不推薦，會暴露 token）

目前建議在本地構建時確保 `.env` 中的 `VITE_MAPBOX_TOKEN` 已設定，構建後的代碼會包含 token（已編譯進去）。

---

## 📞 支援

如有問題，請檢查：
- GitHub Actions（如果有設定 CI/CD）
- GitHub Pages 部署日誌
- 瀏覽器控制台錯誤訊息

