/**
 * 直接計算並保存鄰接區 GeoJSON 到文件
 * 
 * 這個腳本需要 Node.js 環境，並且需要能夠訪問 Mapbox tileset
 * 由於無法直接從 Node.js 訪問 Mapbox vector tiles，建議使用瀏覽器工具
 * 
 * 使用方法：
 * 1. 使用 scripts/export-contiguous-zone.html 工具（推薦）
 * 2. 或使用瀏覽器控制台運行計算代碼
 */

console.log('⚠️  注意：此腳本需要瀏覽器環境來訪問 Mapbox tileset');
console.log('請使用以下方法之一：');
console.log('');
console.log('方法 1：使用 HTML 工具（推薦）');
console.log('  1. 打開 scripts/export-contiguous-zone.html');
console.log('  2. 輸入 Mapbox Token');
console.log('  3. 點擊「計算並導出鄰接區」');
console.log('  4. 將下載的文件移動到 data/contiguous_zone.geojson');
console.log('');
console.log('方法 2：在瀏覽器控制台運行');
console.log('  1. 打開應用（npm run dev）');
console.log('  2. 打開瀏覽器開發者工具');
console.log('  3. 運行計算代碼（見 CALCULATE_CONTIGUOUS_ZONE.md）');

