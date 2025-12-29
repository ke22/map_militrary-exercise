import { useEffect, useCallback } from 'react'
import mapboxgl, { Map, LngLatLike } from 'mapbox-gl'
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

        // 1. Reference Layers
        const addRefLayer = (id: string, url: string, sourceLayer: string, dash: number[], width: number, opacity: number, filter?: any[]) => {
            const sid = `source-${id}`
            if (!map.getSource(sid)) {
                map.addSource(sid, { type: 'vector', url })
            }
            if (!map.getLayer(id)) {
                map.addLayer({
                    id,
                    type: 'line',
                    source: sid,
                    'source-layer': sourceLayer,
                    ...(filter && { filter }),
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': width,
                        'line-dasharray': dash,
                        'line-opacity': opacity,
                    },
                })
            }
        }

        addRefLayer('ref-adiz-line', 'mapbox://cnagraphicdesign.6aqd2wlm', 'Taiwans_ADIZ-3uff2b', [4, 2], 2, 0.8)
        addRefLayer('ref-median-line', 'mapbox://cnagraphicdesign.2ktysf7p', 'true', [8, 4], 2.5, 0.9)
        addRefLayer('ref-maritime-line', 'mapbox://cnagraphicdesign.bahwakzv', 'cartodb-query_1-90kmsi', [1, 2], 1.5, 0.7, ['==', ['get', 'name'], 'Taiwan'])

        // 2. Exercise Source (GeoJSON)
        if (dataMode === 'geojson' || dataMode === 'mixed') {
            if (!map.getSource('exercises-geojson')) {
                map.addSource('exercises-geojson', {
                    type: 'geojson',
                    data: './data/exercises.geojson',
                })
            }
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
                        paint: { 'fill-color': event.color, 'fill-opacity': 0.35 }
                    })
                }
                if (!map.getLayer(lineId)) {
                    map.addLayer({
                        id: lineId,
                        type: 'line',
                        source: sid,
                        'source-layer': event.sourceLayer!,
                        paint: { 'line-color': event.color, 'line-width': 2 }
                    })
                }
            } else {
                if (!map.getLayer(fillId) && map.getSource('exercises-geojson')) {
                    map.addLayer({
                        id: fillId,
                        type: 'fill',
                        source: 'exercises-geojson',
                        filter: ['==', ['get', 'eventId'], event.eventId],
                        paint: { 'fill-color': event.color, 'fill-opacity': 0.35 }
                    })
                }
                if (!map.getLayer(lineId) && map.getSource('exercises-geojson')) {
                    map.addLayer({
                        id: lineId,
                        type: 'line',
                        source: 'exercises-geojson',
                        filter: ['==', ['get', 'eventId'], event.eventId],
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

        const handleLoad = () => syncLayers()

        if (map.isStyleLoaded()) {
            syncLayers()
        } else {
            map.on('load', handleLoad)
        }

        return () => {
            map.off('load', handleLoad)
        }
    }, [map, syncLayers])

    // Setup Popup (Independant of sync but shares map/events)
    useEffect(() => {
        if (!map) return

        const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })

        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            const layerIds = events.map((ev) => `exercises-fill-${ev.eventId}`)
            const existingLayers = layerIds.filter((id) => map.getLayer(id))
            if (existingLayers.length === 0) return

            const features = map.queryRenderedFeatures(e.point, { layers: existingLayers })
            if (features.length === 0) { popup.remove(); return }

            const feature = features[0]
            if (!feature.layer) return
            const eventId = feature.layer.id.replace('exercises-fill-', '')
            const event = events.find((ev) => ev.eventId === eventId)
            if (!event) return

            const props = feature.properties || {}
            const zoneName = props.zoneName || props.name || props.Name || ''

            const html = `
                <div style="padding: 10px; max-width: 240px; font-family: -apple-system, sans-serif;">
                    <h4 style="margin: 0 0 8px 0; color: ${event.color}; font-size: 13px; font-weight: 600;">${event.title}</h4>
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #a0a0b0;">📅 ${event.dateLabel}</p>
                    ${zoneName ? `<p style="margin: 0 0 4px 0; font-size: 11px; color: #a0a0b0;">📍 ${zoneName}</p>` : ''}
                    <p style="margin: 0; font-size: 10px; color: #606070;">${event.sourceLabel}</p>
                </div>
            `
            popup.setLngLat(e.lngLat as LngLatLike).setHTML(html).addTo(map)
        }

        const enterHandler = () => { map.getCanvas().style.cursor = 'pointer' }
        const leaveHandler = () => { map.getCanvas().style.cursor = '' }

        map.on('click', handleClick)

        // Add hover effects for all potential exercise layers
        events.forEach(event => {
            const id = `exercises-fill-${event.eventId}`
            map.on('mouseenter', id, enterHandler)
            map.on('mouseleave', id, leaveHandler)
        })

        return () => {
            map.off('click', handleClick)
            popup.remove()
            events.forEach(event => {
                const id = `exercises-fill-${event.eventId}`
                map.off('mouseenter', id, enterHandler)
                map.off('mouseleave', id, leaveHandler)
            })
        }
    }, [map, events])

    return null
}
