import { useState, useEffect } from 'react'
import { MapView } from './components/MapView'
import { LayerControl } from './components/LayerControl'
import { LanguageSwitcher, LanguageCode } from './components/LanguageSwitcher'
import { ExerciseEvent, DataMode } from './types'
import eventsData from '../data/events.json'
import './App.css'

function App() {
    const [events] = useState<ExerciseEvent[]>(eventsData as ExerciseEvent[])
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
    const [configError, setConfigError] = useState<string | null>(null)
    const [language, setLanguage] = useState<LanguageCode>('zh-Hant')

    // Configuration from environment variables
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
    const dataMode: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || 'mixed'

    // Initialize with all events selected (defaultOn = true)
    useEffect(() => {
        const defaultSelected = events
            .filter((e) => e.defaultOn)
            .map((e) => e.eventId)
        setSelectedEventIds(defaultSelected)
    }, [events])

    // Validate configuration
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

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1>軍演範圍互動地圖</h1>
                    <p>台灣周邊歷次軍演區域範圍控制面板</p>
                </div>
                <div className="header-actions">
                    <LanguageSwitcher
                        currentLanguage={language}
                        onLanguageChange={setLanguage}
                    />
                </div>
            </header>

            <main className="app-main">
                <div className="map-section">
                    <MapView
                        events={events}
                        selectedEventIds={selectedEventIds}
                        dataMode={dataMode}
                        mapboxToken={mapboxToken}
                        language={language}
                    />
                    <LayerControl
                        events={events}
                        selectedEventIds={selectedEventIds}
                        onSelectionChange={setSelectedEventIds}
                        dataMode={dataMode}
                    />
                </div>
            </main>

            <footer className="app-footer">
                <p>© 2025 中央通訊社 Central News Agency</p>
            </footer>
        </div>
    )
}

export default App
