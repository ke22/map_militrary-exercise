# 鄰接區計算工具

此目錄包含用於計算和導出鄰接區 GeoJSON 數據的工具。

## 使用方法

### 方法 1：使用瀏覽器工具（推薦）⭐

1. **啟動本地服務器**（如果還沒有運行）：
   ```bash
   cd /Users/yulincho/Documents/GitHub/map_軍演
   python3 -m http.server 8000
   ```

2. **打開工具**：
   在瀏覽器中訪問：`http://localhost:8000/scripts/export-contiguous-zone.html`

3. **輸入 Mapbox Token**：
   - 從 `.env` 文件中複製 `VITE_MAPBOX_TOKEN` 的值
   - 或使用：`pk.eyJ1IjoiY25hZ3JhcGhpY2Rlc2lnbiIsImEiOiJjbHRxbXlnc28wODF6Mmltb2Rjb3g5a25kIn0.x73wo3gKurL6CivFUOjVeg`

4. **計算並導出**：
   - 點擊「初始化地圖」按鈕
   - 等待地圖載入完成（約 3-5 秒）
   - 點擊「計算並導出鄰接區」按鈕
   - 等待計算完成（約 5-10 秒）
   - 文件會自動下載為 `contiguous_zone.geojson`

5. **保存文件**：
   ```bash
   mv ~/Downloads/contiguous_zone.geojson data/contiguous_zone.geojson
   ```

### 方法 2：使用快捷腳本

運行：
```bash
./scripts/open-calculator.sh
```

這會自動從 `.env` 讀取 token 並打開工具（如果使用本地服務器）。

### 方法 3：直接打開 HTML 文件

```bash
open scripts/export-contiguous-zone.html
```

然後手動輸入 Mapbox Token。

## 計算邏輯

工具使用與之前相同的計算方式：

1. **查詢基線數據**：從 Mapbox tileset `cnagraphicdesign.bahwakzv` 查詢 "Taiwan Territorial Baselines (1999)"
2. **計算 24 海里緩衝區**：使用 `turf.buffer()` 計算 44.448 公里（24 海里）緩衝區
3. **合併多邊形**：使用 `turf.dissolve()` 合併所有緩衝區
4. **完整範圍**：使用完整的 24 海里緩衝區（包含領海和可能延伸到的陸地，不減去領海部分）
5. **導出 GeoJSON**：生成標準 GeoJSON FeatureCollection 格式

## 輸出格式

生成的 GeoJSON 文件格式：
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "鄰接區 (Contiguous Zone)",
        "description": "自領海基線向外 24 海浬（完整範圍，含領海及陸地）"
      },
      "geometry": {
        "type": "Polygon" | "MultiPolygon",
        "coordinates": [...]
      }
    }
  ]
}
```

## 疑難排解

### 問題：未找到基線數據

- 確保 Mapbox Token 正確且有效
- 嘗試在地圖上縮放或平移，讓 Mapbox 載入更多 tile
- 檢查網絡連接

### 問題：計算失敗

- 檢查瀏覽器控制台的錯誤信息
- 確保 turf.js 已正確載入
- 嘗試刷新頁面重新開始

### 問題：計算結果說明

- 工具現在會生成完整的 24 海里緩衝區（包含領海和陸地）
- 這是鄰接區的最大範圍定義

## 文件說明

- `export-contiguous-zone.html` - 瀏覽器計算工具（主要工具）
- `calculate-contiguous-zone.js` - Node.js 腳本（需要先準備基線數據）
- `open-calculator.sh` - 快捷啟動腳本
- `README.md` - 本說明文件

