import { useEffect, useCallback } from 'react'
import type { Map } from 'mapbox-gl'
import { ExerciseEvent, DataMode } from '../types'

interface UseMapLayersProps {
    map: Map | null
    selectedEventIds: string[]
    events: ExerciseEvent[]
    dataMode: DataMode
}

export function useMapLayers({
    map,
    selectedEventIds,
    events,
    dataMode,
}: UseMapLayersProps) {

    // Core function to add or update layers
    const syncLayers = useCallback(() => {
        if (!map || !map.isStyleLoaded()) return

        // 0. Base Map Enhancements (White boundaries & Mapbox Countries)
        if (!map.getSource('mapbox-countries')) {
            map.addSource('mapbox-countries', {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1'
            });
        }
        if (!map.getLayer('country-boundaries-white')) {
            map.addLayer({
                id: 'country-boundaries-white',
                type: 'line',
                source: 'mapbox-countries',
                'source-layer': 'country_boundaries',
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 0.3,
                    'line-opacity': 0.5
                }
            }, 'admin-0-boundary-disputed'); // Try to place before admin boundaries if possible
        }

        const style = map.getStyle()
        if (style && style.layers) {
            style.layers.forEach(layer => {
                if (layer.id.includes('admin-0-boundary') || layer.id.includes('admin-1-boundary') || layer.id.includes('admin-2-boundary') || layer.id.includes('maritime')) {
                    try {
                        map.setPaintProperty(layer.id, 'line-color', '#ffffff')
                        map.setPaintProperty(layer.id, 'line-width', 0.2)
                        map.setPaintProperty(layer.id, 'line-opacity', 0.4)
                        map.setLayoutProperty(layer.id, 'visibility', 'visible')
                    } catch (e) { }
                }
                if (layer.id.includes('country-label')) {
                    try {
                        map.setPaintProperty(layer.id, 'text-color', '#ffffff')
                        map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0,0,0,0.9)')
                        map.setPaintProperty(layer.id, 'text-halo-width', 2)
                    } catch (e) { }
                }

            })
        }

        // 1. Reference Layers (always visible by default)
        const addRefLayer = (id: string, url: string, sourceLayer: string, dash: number[], width: number, opacity: number, filter?: any[]) => {
            try {
                const sid = `source-${id}`
                
                // Add source if it doesn't exist
                if (!map.getSource(sid)) {
                    map.addSource(sid, { type: 'vector', url })
                }
                
                // Try to add layer immediately
                if (!map.getLayer(id)) {
                    try {
                        map.addLayer({
                            id,
                            type: 'line',
                            source: sid,
                            'source-layer': sourceLayer,
                            ...(filter && { filter }),
                            layout: {
                                visibility: 'visible'
                            },
                            paint: {
                                'line-color': '#ffffff',
                                'line-width': width,
                                ...(dash.length > 0 && { 'line-dasharray': dash }),
                                'line-opacity': opacity,
                            },
                        })
                    } catch (e) {
                        // If layer add fails (source not ready), wait for source to load
                        const sourceLoadHandler = () => {
                            try {
                                if (!map.getLayer(id)) {
                                    map.addLayer({
                                        id,
                                        type: 'line',
                                        source: sid,
                                        'source-layer': sourceLayer,
                                        ...(filter && { filter }),
                                        layout: {
                                            visibility: 'visible'
                                        },
                                        paint: {
                                            'line-color': '#ffffff',
                                            'line-width': width,
                                            'line-dasharray': dash,
                                            'line-opacity': opacity,
                                        },
                                    })
                                }
                                map.off('sourcedata', sourceLoadHandler)
                            } catch (err) {
                                // Source still not ready, keep waiting
                            }
                        }
                        map.on('sourcedata', sourceLoadHandler)
                    }
                } else {
                    // Ensure visibility is set to visible if layer already exists
                    try {
                        map.setLayoutProperty(id, 'visibility', 'visible')
                    } catch (e) {
                        // Layer might not be ready yet
                    }
                }
            } catch (e) {
                console.warn(`Failed to add reference layer ${id}:`, e)
                // Continue with other layers even if this one fails
            }
        }

        addRefLayer('ref-adiz-line', 'mapbox://cnagraphicdesign.6aqd2wlm', 'Taiwans_ADIZ-3uff2b', [4, 2], 0.8, 0.6)
        addRefLayer('ref-median-line', 'mapbox://cnagraphicdesign.2ktysf7p', 'true', [8, 4], 0.8, 0.6)
        
        // Maritime boundaries - Territorial Sea
        // Tileset: cnagraphicdesign.bahwakzv
        // Source layer: cartodb-query_1-90kmsi (note: underscore, not hyphen)
        // Field name: name (lowercase)
        // Note: Territorial Baselines are no longer needed since contiguous zone is loaded from GeoJSON
        
        // Filter for Taiwan Territorial Sea - warning color (red)
        // We need to add the layer manually to set custom color
        const territorialSeaSourceId = 'source-ref-territorial-sea'
        if (!map.getSource(territorialSeaSourceId)) {
            map.addSource(territorialSeaSourceId, { 
                type: 'vector', 
                url: 'mapbox://cnagraphicdesign.bahwakzv' 
            })
        }
        
        // Add territorial sea layer with warning color (red)
        if (!map.getLayer('ref-territorial-sea')) {
            try {
                map.addLayer({
                    id: 'ref-territorial-sea',
                    type: 'line',
                    source: territorialSeaSourceId,
                    'source-layer': 'cartodb-query_1-90kmsi',
                    filter: ['==', ['get', 'name'], 'Taiwan Territorial Sea'],
                    layout: {
                        visibility: 'visible'
                    },
                    paint: {
                        'line-color': '#ff4444', // Warning color (red)
                        'line-width': 1.2,
                        'line-opacity': 0.8
                    }
                })
            } catch (e) {
                // If layer add fails (source not ready), wait for source to load
                const sourceLoadHandler = () => {
                    try {
                        if (!map.getLayer('ref-territorial-sea')) {
                            map.addLayer({
                                id: 'ref-territorial-sea',
                                type: 'line',
                                source: territorialSeaSourceId,
                                'source-layer': 'cartodb-query_1-90kmsi',
                                filter: ['==', ['get', 'name'], 'Taiwan Territorial Sea'],
                                layout: {
                                    visibility: 'visible'
                                },
                                paint: {
                                    'line-color': '#ff4444', // Warning color (red)
                                    'line-width': 1.2,
                                    'line-opacity': 0.8
                                }
                            })
                        }
                        map.off('sourcedata', sourceLoadHandler)
                    } catch (err) {
                        // Source still not ready, keep waiting
                    }
                }
                map.on('sourcedata', sourceLoadHandler)
            }
        } else {
            // Ensure visibility and color are set correctly if layer already exists
            try {
                map.setLayoutProperty('ref-territorial-sea', 'visibility', 'visible')
                map.setPaintProperty('ref-territorial-sea', 'line-color', '#ff4444')
            } catch (e) {
                // Layer might not be ready yet
            }
        }
        
        // Contiguous Zone - load from GeoJSON file (not calculated from baselines)
        const setupContiguousZone = () => {
            try {
                // Load contiguous zone from GeoJSON file
                if (!map.getSource('contiguous-zone-geojson')) {
                    map.addSource('contiguous-zone-geojson', {
                        type: 'geojson',
                        data: './data/contiguous_zone.geojson'
                    })
                }
                
                // Add fill layer (subtle fill to show area)
                if (!map.getLayer('ref-contiguous-zone-fill')) {
                    map.addLayer({
                        id: 'ref-contiguous-zone-fill',
                        type: 'fill',
                        source: 'contiguous-zone-geojson',
                        layout: { visibility: 'visible' },
                        paint: {
                            'fill-color': 'rgba(255, 255, 255, 0.05)',
                            'fill-opacity': 0.05
                        }
                    }, 'ref-territorial-sea') // Insert before territorial sea layer
                }
                
                // Add line layer (solid line for boundary - thinnest, semi-transparent)
                if (!map.getLayer('ref-contiguous-zone-line')) {
                    map.addLayer({
                        id: 'ref-contiguous-zone-line',
                        type: 'line',
                        source: 'contiguous-zone-geojson',
                        layout: { visibility: 'visible' },
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 0.8,
                            'line-opacity': 0.6
                        }
                    }, 'ref-territorial-sea') // Insert before territorial sea layer
                }
            } catch (err) {
                console.warn('Failed to load contiguous zone:', err)
            }
        }
        
        // Setup contiguous zone calculation
        setupContiguousZone()

        // 2. Exercise Source (GeoJSON)
        // Always register GeoJSON source so that events without tileset (e.g. justice_2025)
        // can still顯示 even when dataMode === 'tileset'
        if (!map.getSource('exercises-geojson')) {
            map.addSource('exercises-geojson', {
                type: 'geojson',
                data: './data/exercises.geojson',
            })
        }

        // 3. Exercise Layers (Per Event)
        events.forEach((event) => {
            const hasTileset = event.tilesetId && event.sourceLayer
            const useTileset = (dataMode === 'tileset' || dataMode === 'mixed') && hasTileset
            const isVisible = selectedEventIds.includes(event.eventId)
            const visibility = isVisible ? 'visible' : 'none'

            const fillId = `exercises-fill-${event.eventId}`
            const lineId = `exercises-line-${event.eventId}`

            if (useTileset) {
                const sid = `exercises-tileset-${event.eventId}`
                if (!map.getSource(sid)) {
                    map.addSource(sid, { type: 'vector', url: `mapbox://${event.tilesetId}` })
                }

            if (!map.getLayer(fillId)) {
                map.addLayer({
                    id: fillId,
                    type: 'fill',
                    source: sid,
                    'source-layer': event.sourceLayer!,
                    layout: {
                        visibility: visibility
                    },
                    paint: { 'fill-color': event.color, 'fill-opacity': 0.35 }
                })
            }
            if (!map.getLayer(lineId)) {
                map.addLayer({
                    id: lineId,
                    type: 'line',
                    source: sid,
                    'source-layer': event.sourceLayer!,
                    layout: {
                        visibility: visibility
                    },
                    paint: { 'line-color': event.color, 'line-width': 2 }
                })
            }
            } else {
                if (!map.getLayer(fillId)) {
                    map.addLayer({
                        id: fillId,
                        type: 'fill',
                        source: 'exercises-geojson',
                        filter: ['==', ['get', 'eventId'], event.eventId],
                        layout: {
                            visibility: visibility
                        },
                        paint: { 'fill-color': event.color, 'fill-opacity': 0.35 }
                    })
                }
                if (!map.getLayer(lineId)) {
                    map.addLayer({
                        id: lineId,
                        type: 'line',
                        source: 'exercises-geojson',
                        filter: ['==', ['get', 'eventId'], event.eventId],
                        layout: {
                            visibility: visibility
                        },
                        paint: { 'line-color': event.color, 'line-width': 2 }
                    })
                }
            }

            // Update Visibility
            if (map.getLayer(fillId)) map.setLayoutProperty(fillId, 'visibility', visibility)
            if (map.getLayer(lineId)) map.setLayoutProperty(lineId, 'visibility', visibility)
        })
    }, [map, events, selectedEventIds, dataMode])

    // Effect to run sync
    useEffect(() => {
        if (!map) return

        const handleLoad = () => {
            // Wait a bit for sources to load, then sync layers
            setTimeout(() => {
                syncLayers()
            }, 100)
        }

        if (map.isStyleLoaded()) {
            // If style is already loaded, wait for sources
            map.once('sourcedata', () => {
                setTimeout(() => {
                    syncLayers()
                }, 100)
            })
            syncLayers()
        }

        map.on('load', handleLoad)
        map.on('styledata', handleLoad)
        map.on('sourcedata', handleLoad)

        return () => {
            map.off('load', handleLoad)
            map.off('styledata', handleLoad)
            map.off('sourcedata', handleLoad)
        }
    }, [map, syncLayers])

    // Popup functionality removed as requested

    return null
}
