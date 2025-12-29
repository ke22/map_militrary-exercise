import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ExerciseEvent, DataMode } from '../types'
import { useMapLayers } from '../hooks/useMapLayers'
import { LanguageCode } from './LanguageSwitcher'
import './MapView.css'

interface MapViewProps {
    events: ExerciseEvent[]
    selectedEventIds: string[]
    dataMode: DataMode
    mapboxToken: string
    language: LanguageCode
}

export function MapView({
    events,
    selectedEventIds,
    dataMode,
    mapboxToken,
    language,
}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
    const [error, setError] = useState<string | null>(null)

    // 1. Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return

        let map: mapboxgl.Map | null = null

        try {
            if (mapContainerRef.current) {
                mapContainerRef.current.innerHTML = ''
            }
            mapboxgl.accessToken = mapboxToken

            map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [121.0, 23.5],
                zoom: 5.5,
                cooperativeGestures: true,
                attributionControl: true,
            })

            map.addControl(new mapboxgl.NavigationControl(), 'top-right')

            map.on('load', () => {
                if (map) {
                    mapRef.current = map
                    setMapInstance(map)
                }
            })

            map.on('error', (e) => {
                console.error('Mapbox error:', e)
                // Only set error if it's a fatal initialization error
                if (e.error?.message?.includes('token') || (e.error as any)?.status === 401) {
                    setError('Mapbox Token 無效或已過期')
                }
            })

        } catch (err) {
            console.error('Map init error:', err)
            setError('地圖初始化失敗')
        }

        return () => {
            if (map) {
                map.remove()
                mapRef.current = null
                setMapInstance(null)
            }
        }
    }, [mapboxToken])

    // 2. Update map language
    useEffect(() => {
        const map = mapInstance
        if (!map || !map.isStyleLoaded()) return

        const updateLang = () => {
            const layers = map.getStyle().layers
            if (!layers) return

            // Mapbox language field mapping
            const langFieldMap: Record<string, string> = {
                'zh-Hant': 'name_zh-Hant',
                'en': 'name_en',
                'ja': 'name_ja'
            }
            
            const langField = langFieldMap[language] || 'name'

            layers.forEach((layer) => {
                if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                    try {
                        // Try the language-specific field first
                        map.setLayoutProperty(layer.id, 'text-field', [
                            'coalesce',
                            ['get', langField],
                            ['get', 'name']
                        ])
                    } catch {
                        try {
                            map.setLayoutProperty(layer.id, 'text-field', ['get', 'name'])
                        } catch (e) {
                            // Non-translatable layer
                        }
                    }
                }
            })
        }

        updateLang()
        
        // Also update when style data changes
        const handleStyleData = () => {
            if (map.isStyleLoaded()) {
                updateLang()
            }
        }
        
        map.on('styledata', handleStyleData)
        
        return () => {
            map.off('styledata', handleStyleData)
        }
    }, [mapInstance, language])

    // 3. Use map layers hook
    useMapLayers({
        map: mapInstance,
        selectedEventIds,
        events,
        dataMode,
    })

    if (error) {
        return (
            <div className="map-error ios-style">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>重新載入</button>
            </div>
        )
    }

    return (
        <div className="map-wrapper">
            {!mapInstance && (
                <div className="map-loading">
                    <div className="loading-spinner"></div>
                    <p>載入地圖中...</p>
                </div>
            )}
            <div ref={mapContainerRef} className="map-container" />
        </div>
    )
}
