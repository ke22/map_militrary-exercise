import './MapLegend.css'

export function MapLegend() {
    return (
        <div className="map-legend">
            {/* 參考圖層圖例 - 固定顯示 */}
            <div className="legend-section reference-legend">
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-line adiz" />
                        <span className="legend-label">ADIZ 防空識別區</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line median" />
                        <span className="legend-label">海峽中線</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line territorial-sea" />
                        <span className="legend-label">領海</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line contiguous-zone" />
                        <span className="legend-label">鄰接區</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

