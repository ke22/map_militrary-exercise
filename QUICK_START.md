# 🚀 快速開始

## 📍 線上版本

**已部署：** https://ke22.github.io/map_militrary-exercise/

---

## 🔧 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 構建
npm run build

# 預覽構建結果
npm run preview
```

---

## 📤 部署到 GitHub Pages

```bash
# 一鍵部署（已設定好 base path）
npm run deploy
```

或手動部署：

```bash
# 構建（使用 GitHub Pages base path）
npm run build:gh-pages

# 部署
npx gh-pages -d dist
```

---

## 📝 嵌入網頁

### 簡單版
```html
<iframe
  src="https://ke22.github.io/map_militrary-exercise/"
  width="100%"
  height="500"
  style="border: 0; border-radius: 8px;"
  loading="lazy"
></iframe>
```

### 響應式版（推薦）
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://ke22.github.io/map_militrary-exercise/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
    loading="lazy"
  ></iframe>
</div>
```

---

## ⚙️ 環境設定

創建 `.env` 檔案：

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
VITE_DATA_MODE=mixed
```

---

## 📚 更多資訊

- 詳細部署說明：`DEPLOYMENT.md`
- 瀏覽器兼容性：`BROWSER_COMPATIBILITY.md`
- 完整文件：`README.md`

