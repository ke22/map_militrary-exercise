# 計算鄰接區 GeoJSON 數據

本文檔說明如何計算並導出鄰接區的 GeoJSON 數據。

## 方法 1：使用瀏覽器工具（推薦）

我們提供了一個 HTML 工具，可以直接在瀏覽器中計算並導出鄰接區數據。

### 使用步驟

1. **打開工具頁面**
   ```bash
   # 在瀏覽器中打開
   open scripts/export-contiguous-zone.html
   # 或直接雙擊文件
   ```

2. **輸入 Mapbox Token**
   - 在頁面頂部輸入框中輸入你的 Mapbox Access Token
   - Token 會自動保存到瀏覽器的 localStorage

3. **初始化地圖**
   - 點擊「初始化地圖」按鈕
   - 等待地圖載入完成

4. **計算並導出**
   - 點擊「計算並導出鄰接區」按鈕
   - 等待計算完成（可能需要幾秒鐘）
   - 文件會自動下載為 `contiguous_zone.geojson`

5. **替換數據文件**
   ```bash
   # 將下載的文件移動到 data 目錄
   mv ~/Downloads/contiguous_zone.geojson data/contiguous_zone.geojson
   ```

### 注意事項

- 如果提示「未找到基線數據」，請嘗試在地圖上縮放或平移，讓 Mapbox 載入更多 tile
- 計算過程可能需要幾秒鐘，請耐心等待
- 導出的 GeoJSON 文件會包含完整的鄰接區幾何數據

## 方法 2：使用 Node.js 腳本（需要基線數據）

如果你已經有基線的 GeoJSON 數據文件，可以使用 Node.js 腳本來計算。

### 準備數據

1. 從 Mapbox Studio 導出基線數據：
   - 登入 [Mapbox Studio](https://studio.mapbox.com/)
   - 找到 tileset: `cnagraphicdesign.bahwakzv`
   - 導出 "Taiwan Territorial Baselines (1999)" 為 GeoJSON
   - 保存為 `data/baselines.geojson`

2. （可選）導出領海數據：
   - 導出 "Taiwan Territorial Sea" 為 GeoJSON
   - 保存為 `data/territorial_sea.geojson`

### 運行腳本

```bash
node scripts/calculate-contiguous-zone.js
```

腳本會：
1. 讀取基線數據
2. 計算 24 海里（44.448 公里）緩衝區
3. 如果有領海數據，減去領海部分（只保留外推部分）
4. 輸出結果到 `data/contiguous_zone.geojson`

## 計算邏輯說明

鄰接區的計算遵循以下步驟：

1. **基線緩衝區**
   - 從領海基線計算 24 海里（44.448 公里）緩衝區
   - 使用 `turf.buffer()` 函數

2. **合併多邊形**
   - 如果有多個基線段，將所有緩衝區合併為單一多邊形
   - 使用 `turf.dissolve()` 函數

3. **減去領海**（可選）
   - 從 24 海里緩衝區中減去領海部分
   - 只保留外推部分（鄰接區 = 24海里 - 領海）
   - 使用 `turf.difference()` 函數

4. **輸出 GeoJSON**
   - 生成標準 GeoJSON FeatureCollection
   - 包含 Polygon 或 MultiPolygon 幾何數據

## 驗證結果

計算完成後，可以：

1. **在地圖應用中驗證**
   - 啟動應用：`npm run dev`
   - 檢查鄰接區是否正確顯示
   - 確認與領海的關係（鄰接區應該在領海外側）

2. **使用 GeoJSON 查看器**
   - 在線工具：https://geojson.io/
   - 上傳 `data/contiguous_zone.geojson` 查看

3. **檢查文件格式**
   ```bash
   # 使用 jq 驗證 JSON 格式（如果已安裝）
   jq . data/contiguous_zone.geojson
   ```

## 疑難排解

### 問題：計算結果不正確

- **檢查基線數據**：確保基線數據完整且正確
- **檢查單位**：確認使用的是公里（kilometers）而非米（meters）
- **檢查緩衝距離**：24 海里 = 44.448 公里

### 問題：減去領海失敗

- 這是常見情況，可能是因為幾何複雜度過高
- 腳本會自動回退到使用完整的 24 海里緩衝區
- 如果需要精確的外推部分，可能需要手動調整

### 問題：瀏覽器工具無法載入數據

- 檢查 Mapbox Token 是否有效
- 確認網絡連接正常
- 嘗試縮放或平移地圖以載入更多 tile
- 檢查瀏覽器控制台的錯誤信息

## 參考資料

- [Turf.js Buffer 文檔](https://turfjs.org/docs/#buffer)
- [Turf.js Difference 文檔](https://turfjs.org/docs/#difference)
- [GeoJSON 規範](https://geojson.org/)
- [Mapbox GL JS 文檔](https://docs.mapbox.com/mapbox-gl-js/)

