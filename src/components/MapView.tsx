import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { ExerciseEvent, DataMode } from '../types'
import { useMapLayers } from '../hooks/useMapLayers'
import { LanguageCode } from './LanguageSwitcher'
import { MapLegend } from './MapLegend'
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
    const japanMarkerRef = useRef<mapboxgl.Marker | null>(null)

    // 1. Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return

        // Check WebGL support before initializing map
        if (!mapboxgl.supported()) {
            setError('您的瀏覽器不支援 WebGL，請使用更新的瀏覽器（Chrome、Firefox、Safari、Edge）')
            return
        }

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
                cooperativeGestures: false, // 允许单指拖动地图
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
                const error = e.error as any
                console.error('Error details:', {
                    message: error?.message,
                    type: error?.type,
                    status: error?.status,
                    url: error?.url,
                    originalError: error
                })
                // Check for WebGL support
                if (error?.message?.includes('WebGL') || error?.message?.includes('webgl')) {
                    setError('您的瀏覽器不支援 WebGL，請使用更新的瀏覽器（Chrome、Firefox、Safari、Edge）')
                }
                // Only set error if it's a fatal initialization error
                else if (error?.message?.includes('token') || error?.status === 401) {
                    setError('Mapbox Token 無效或已過期')
                }
                // Don't set error for non-fatal errors (like style/source loading issues)
                // These are usually handled gracefully by Mapbox
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

    // 4. Add Japan label marker
    useEffect(() => {
        const map = mapInstance
        if (!map) {
            console.log('⚠️ Map instance not ready for Japan marker')
            return
        }
        
        // 创建带样式的标记元素
        const createLabelElement = (text: string) => {
            const el = document.createElement('div')
            el.className = 'japan-label-marker'
            el.textContent = text
            
            // 应用样式
            Object.assign(el.style, {
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '0.3px',
                zIndex: '1000',
                transition: 'all 0.3s ease'
            })
            
            return el
        }

        // 根据语言获取文本
        const getLabelText = () => {
            switch (language) {
                case 'ja': return '日本'
                case 'en': return 'Japan'
                case 'zh-Hant': return '日本'
                default: return '日本'
            }
        }

        // 等待地图完全加载后添加标记
        const addMarker = () => {
            console.log('🔄 Attempting to add Japan marker, map.isStyleLoaded():', map.isStyleLoaded())
            
            if (!map.isStyleLoaded()) {
                console.log('⏳ Map style not loaded, waiting for load event...')
                map.once('load', () => {
                    console.log('✅ Map load event fired, adding marker...')
                    setTimeout(addMarker, 100) // 小延迟确保样式完全加载
                })
                return
            }
            
            // 如果标记已存在，先移除
            if (japanMarkerRef.current) {
                console.log('🗑️ Removing existing Japan marker')
                japanMarkerRef.current.remove()
                japanMarkerRef.current = null
            }

            try {
                // 创建标记
                const labelText = getLabelText()
                const markerElement = createLabelElement(labelText)
                const marker = new mapboxgl.Marker({
                    element: markerElement,
                    anchor: 'center'
                })
                    .setLngLat([123.7835716901955, 24.345665031336857]) // [经度, 纬度]
                    .addTo(map)

                japanMarkerRef.current = marker
                
                // 验证标记是否成功添加
                const markerEl = marker.getElement()
                if (markerEl && markerEl.parentElement) {
                    console.log('✅ Japan marker added successfully at:', [123.7835716901955, 24.345665031336857])
                    console.log('📍 Marker element:', markerEl)
                    console.log('📍 Marker parent:', markerEl.parentElement)
                } else {
                    console.error('❌ Japan marker element not found in DOM')
                }
            } catch (error) {
                console.error('❌ Error adding Japan marker:', error)
            }
        }
        
        // 语言切换时更新文本
        const updateMarkerText = () => {
            if (japanMarkerRef.current) {
                const el = japanMarkerRef.current.getElement()
                if (el) {
                    el.textContent = getLabelText()
                    console.log('🔄 Updated Japan marker text to:', getLabelText())
                }
            }
        }
        
        // 使用多种方式确保地图加载完成
        const tryAddMarker = () => {
            if (map.isStyleLoaded()) {
                // 地图样式已加载，延迟一点确保完全准备好
                setTimeout(addMarker, 100)
            } else {
                // 如果地图还没加载，监听多个事件
                const onLoad = () => {
                    setTimeout(() => {
                        if (map.isStyleLoaded()) {
                            addMarker()
                        }
                    }, 200)
                }
                map.once('load', onLoad)
                map.once('styledata', onLoad)
            }
        }
        
        // 立即尝试添加
        tryAddMarker()
        
        // 语言切换时更新文本
        updateMarkerText()

        return () => {
            if (japanMarkerRef.current) {
                japanMarkerRef.current.remove()
                japanMarkerRef.current = null
            }
        }
    }, [mapInstance, language])

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
            {/* 地圖內參考圖層圖例 - 固定顯示 */}
            <MapLegend />
        </div>
    )
}
