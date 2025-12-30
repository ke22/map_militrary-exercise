/**
 * Script to calculate contiguous zone GeoJSON from territorial baselines
 * 
 * This script calculates the contiguous zone (24nm from baselines, excluding territorial sea)
 * and exports it as a GeoJSON file.
 * 
 * Usage:
 *   node scripts/calculate-contiguous-zone.js
 * 
 * Requirements:
 *   - Mapbox access token (set via MAPBOX_TOKEN environment variable or .env file)
 *   - @turf/turf package installed
 */

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

// Note: This script requires actual baseline data
// Since we don't have direct access to the Mapbox tileset features,
// we need to either:
// 1. Use Mapbox Tileset API to download the data
// 2. Or manually provide the baseline coordinates

console.log('⚠️  注意：此脚本需要基线数据');
console.log('由于无法直接访问 Mapbox tileset 的原始数据，');
console.log('建议使用以下方法之一：');
console.log('');
console.log('方法 1：使用 Mapbox Studio 导出基线数据');
console.log('  1. 在 Mapbox Studio 中打开 tileset: cnagraphicdesign.bahwakzv');
console.log('  2. 导出 "Taiwan Territorial Baselines (1999)" 数据为 GeoJSON');
console.log('  3. 保存为 data/baselines.geojson');
console.log('');
console.log('方法 2：使用浏览器控制台');
console.log('  1. 打开应用');
console.log('  2. 在浏览器控制台运行以下代码来导出计算好的鄰接區');
console.log('');

const browserScript = `
// 在浏览器控制台运行此代码来导出鄰接區 GeoJSON

// 首先需要计算鄰接區（这部分需要临时添加回代码中）
// 或者从现有的计算结果导出

// 假设你已经有了计算结果，可以从 map source 获取：
const source = map.getSource('contiguous-zone-geojson');
if (source && source._data) {
  const geojson = source._data;
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contiguous_zone.geojson';
  a.click();
  console.log('✅ 鄰接區 GeoJSON 已下载');
}
`;

console.log(browserScript);
console.log('');
console.log('方法 3：如果您有基线的坐标数据，可以修改此脚本');
console.log('  1. 将基线坐标数据添加到 baselines.json');
console.log('  2. 运行此脚本');

// 示例：如果有基线数据，计算鄰接區的函数
function calculateContiguousZone(baselinesGeoJSON, territorialSeaGeoJSON = null) {
  try {
    // 假设 baselinesGeoJSON 是 LineString 或 MultiLineString
    const features = baselinesGeoJSON.features || [baselinesGeoJSON];
    
    // 计算 24 海里缓冲区 (44.448 公里)
    const buffered24nm = [];
    
    features.forEach(feature => {
      if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
        const buffered = turf.buffer(feature, 44.448, { units: 'kilometers' });
        if (buffered && (buffered.geometry.type === 'Polygon' || buffered.geometry.type === 'MultiPolygon')) {
          buffered24nm.push(buffered);
        }
      }
    });
    
    if (buffered24nm.length === 0) {
      throw new Error('No buffered features found');
    }
    
    // 合并所有缓冲區
    let contiguous24nm;
    if (buffered24nm.length === 1) {
      contiguous24nm = buffered24nm[0];
    } else {
      const fc = turf.featureCollection(buffered24nm);
      const dissolved = turf.dissolve(fc);
      contiguous24nm = dissolved.features[0];
    }
    
    // 如果有领海数据，减去领海部分
    let result = contiguous24nm;
    if (territorialSeaGeoJSON) {
      const seaFeature = territorialSeaGeoJSON.features?.[0] || territorialSeaGeoJSON;
      try {
        const difference = turf.difference(
          turf.featureCollection([contiguous24nm, seaFeature])
        );
        if (difference) {
          result = difference;
        }
      } catch (err) {
        console.warn('Failed to subtract territorial sea:', err.message);
      }
    }
    
    return turf.featureCollection([result]);
  } catch (error) {
    console.error('Error calculating contiguous zone:', error);
    throw error;
  }
}

// 如果提供了基线数据文件，进行计算
const baselinesPath = path.join(__dirname, '..', 'data', 'baselines.geojson');
if (fs.existsSync(baselinesPath)) {
  console.log('📖 读取基线数据...');
  const baselinesGeoJSON = JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
  
  let territorialSeaGeoJSON = null;
  const seaPath = path.join(__dirname, '..', 'data', 'territorial_sea.geojson');
  if (fs.existsSync(seaPath)) {
    console.log('📖 读取领海数据...');
    territorialSeaGeoJSON = JSON.parse(fs.readFileSync(seaPath, 'utf8'));
  }
  
  console.log('🔄 计算鄰接區...');
  const contiguousZone = calculateContiguousZone(baselinesGeoJSON, territorialSeaGeoJSON);
  
  const outputPath = path.join(__dirname, '..', 'data', 'contiguous_zone.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(contiguousZone, null, 2), 'utf8');
  console.log('✅ 鄰接區 GeoJSON 已保存到:', outputPath);
} else {
  console.log('ℹ️  未找到基线数据文件，请先准备数据');
}

