import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { LayerControl } from './components/LayerControl'
import { LanguageSwitcher, LanguageCode } from './components/LanguageSwitcher'
import { ExerciseEvent, DataMode } from './types'
import eventsData from '../data/events.json'
// 暫時隱藏 CNA logo
// import cnaLogo from '../cna_logo.svg'
import './App.css'
import './components/MapControls.css'

function App() {
    const [events] = useState<ExerciseEvent[]>(eventsData as ExerciseEvent[])
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>(() => {
        if (!eventsData || (eventsData as any[]).length === 0) return []
        const data = eventsData as ExerciseEvent[]
        const latest = data.reduce((prev, curr) =>
            curr.order > prev.order ? curr : prev
        )
        return [latest.eventId]
    })
    const [configError, setConfigError] = useState<string | null>(null)
    const [language, setLanguage] = useState<LanguageCode>('zh-Hant')

    // Configuration from environment variables
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
    const dataMode: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || 'mixed'

    // Validation
    useEffect(() => {
        if (!mapboxToken) {
            setConfigError('缺少 VITE_MAPBOX_TOKEN 環境變數，請檢查 .env 設定')
            return
        }
        setConfigError(null)
    }, [mapboxToken])

    if (configError) {
        return (
            <div className="app">
                <div className="config-error">
                    <div className="error-icon">⚙️</div>
                    <h2>設定錯誤</h2>
                    <p>{configError}</p>
                    <pre>
                        {`# .env 範例
VITE_MAPBOX_TOKEN=pk.your_mapbox_token

# 資料模式：
# mixed = 有 tileset 用 tileset，沒有用 geojson（推薦）
# tileset = 只用 tileset（需要每個事件都有 tileset）
# geojson = 只用本機 geojson
VITE_DATA_MODE=mixed`}
                    </pre>
                </div>
            </div>
        )
    }

    // Get latest event date for update date
    const latestEvent = events.reduce((prev, curr) =>
        curr.order > prev.order ? curr : prev
    )
    // Extract date from dateLabel (format: "2025/12/29-30" -> "2025/12/29")
    const updateDate = latestEvent.dateLabel.split('-')[0].trim() || latestEvent.dateLabel

    return (
        <div className="app">
            <main className="app-main">
                <div className="map-section">
                    <MapView
                        events={events}
                        selectedEventIds={selectedEventIds}
                        dataMode={dataMode}
                        mapboxToken={mapboxToken}
                        language={language}
                    />
                    {/* 地圖內覆蓋層控件 */}
                    <div className="map-controls-overlay">
                        <div className="language-switcher-overlay">
                            <LanguageSwitcher
                                currentLanguage={language}
                                onLanguageChange={setLanguage}
                            />
                        </div>
                        {/* Footer - 覆蓋在地圖 canvas 上 */}
                        <footer className="app-footer">
                            <div className="footer-content">
                                {/* 暫時隱藏 CNA logo */}
                                {/* <img src={cnaLogo} alt="CNA" className="cna-logo" /> */}
                                <span className="update-date">更新日期：{updateDate}</span>
                            </div>
                        </footer>
                    </div>
                </div>
                {/* 軍演範圍操作界面 - 地圖下方 */}
                <LayerControl
                    events={events}
                    selectedEventIds={selectedEventIds}
                    onSelectionChange={setSelectedEventIds}
                    dataMode={dataMode}
                />
            </main>
        </div>
    )
}

export default App
