# 軍演範圍互動地圖

台灣周邊歷次軍演區域範圍互動地圖，支援 iframe 嵌入新聞頁面。

## 功能特色

- ✅ 檢視歷次軍演範圍（2022 裴洛西訪台、聯合利劍-2024A/B、空域保留區、正義使命-2025）
- ✅ 多選組合顯示，觀察重疊區域
- ✅ 手機優先設計，控制面板預設收合
- ✅ 滾輪縮放預設關閉，避免 scroll hijack
- ✅ 支援 Tileset / GeoJSON / Mixed 三種模式
- ✅ 可 iframe 嵌入

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env`：

```env
# 必填：Mapbox Token
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# 資料模式：mixed（推薦）| tileset | geojson
# mixed = 有 tileset 用 tileset，沒有用 geojson
VITE_DATA_MODE=mixed
```

### 3. 開發模式

```bash
npm run dev
```

### 4. 建置部署

```bash
npm run build
npm run preview  # 預覽建置結果
```

---

## Tileset 設定

本專案支援為每個軍演事件設定獨立的 Mapbox Tileset。

### 查詢 Source Layer 名稱

1. 進入 [Mapbox Studio](https://studio.mapbox.com/)
2. 找到你的 Tileset → 點擊查看詳情
3. 複製 **Tileset ID**（格式：`username.tilesetid`）
4. 複製 **Source Layer** 名稱（通常是原始檔案名稱）

### 設定 events.json

在 `data/events.json` 中為每個事件設定 tileset：

```json
{
  "eventId": "js_2024a",
  "title": "聯合利劍-2024A",
  "dateLabel": "2024/10/14",
  "defaultOn": true,
  "order": 2,
  "color": "#1e90ff",
  "sourceLabel": "中國人民解放軍東部戰區公告",
  "tilesetId": "cnagraphicdesign.6xygjfep",
  "sourceLayer": "your_source_layer_name"
}
```

> ⚠️ **重要**：`sourceLayer` 必須與 Mapbox Studio 中顯示的完全一致，否則圖層不會顯示。

### 沒有 Tileset 的事件

設定 `tilesetId: null` 和 `sourceLayer: null`，系統會自動使用 GeoJSON 備援資料：

```json
{
  "eventId": "pelosi_2022",
  "tilesetId": null,
  "sourceLayer": null
}
```

---

## 子路徑部署

若需部署至子路徑（如 `/exercises-map/`）：

```bash
VITE_BASE_PATH=/exercises-map/ npm run build
```

---

## iframe 嵌入

### 基本嵌入碼

```html
<iframe 
  src="https://your-domain.com/exercises-map/"
  width="100%"
  height="500"
  frameborder="0"
  style="border-radius: 8px;"
></iframe>
```

### 響應式容器

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="https://your-domain.com/exercises-map/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    allowfullscreen
  ></iframe>
</div>
```

### ⚠️ 安全提醒

部署端需設定 HTTP headers 允許 iframe 嵌入：

```
# Nginx
add_header Content-Security-Policy "frame-ancestors 'self' https://your-news-site.com";

# Apache
Header set Content-Security-Policy "frame-ancestors 'self' https://your-news-site.com"
```

---

## 資料格式

### events.json

| 欄位 | 必填 | 說明 |
|-----|-----|-----|
| eventId | ✅ | 唯一識別碼 |
| title | ✅ | 顯示名稱 |
| dateLabel | ✅ | 日期標籤 |
| defaultOn | ✅ | 預設是否勾選 |
| order | ✅ | 排序（數字大 = 較新） |
| color | ✅ | 顏色（hex） |
| tilesetId | | Mapbox Tileset ID |
| sourceLayer | | Tileset 的 source-layer 名稱 |

### exercises.geojson

GeoJSON 備援資料，每個 feature 需包含 `eventId` 屬性。

---

## 技術棧

- Vite + React + TypeScript
- Mapbox GL JS v3
- 無 UI 框架（輕量化）

---

## 授權

© 2025 中央通訊社 Central News Agency
