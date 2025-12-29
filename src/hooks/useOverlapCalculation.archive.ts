import { useState, useEffect, useCallback } from 'react'
import * as turf from '@turf/turf'
import { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson'
import { ExerciseEvent } from '../types'

interface OverlapResult {
    overlapCount: number
    eventIds: string[]
    geometry: Polygon | MultiPolygon
}

interface UseOverlapCalculationProps {
    selectedEventIds: string[]
    events: ExerciseEvent[]
    exerciseFeatures: FeatureCollection | null
}

export function useOverlapCalculation({
    selectedEventIds,
    events,
    exerciseFeatures,
}: UseOverlapCalculationProps) {
    const [overlaps, setOverlaps] = useState<OverlapResult[]>([])
    const [isCalculating, setIsCalculating] = useState(false)

    const calculateOverlaps = useCallback(() => {
        if (!exerciseFeatures || selectedEventIds.length < 2) {
            setOverlaps([])
            return
        }

        setIsCalculating(true)

        try {
            // Group features by eventId
            const featuresByEvent: Record<string, Feature<Polygon | MultiPolygon>[]> = {}

            exerciseFeatures.features.forEach((feature) => {
                const eventId = feature.properties?.eventId
                if (eventId && selectedEventIds.includes(eventId)) {
                    if (!featuresByEvent[eventId]) {
                        featuresByEvent[eventId] = []
                    }
                    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                        featuresByEvent[eventId].push(feature as Feature<Polygon | MultiPolygon>)
                    }
                }
            })

            const eventIds = Object.keys(featuresByEvent)
            if (eventIds.length < 2) {
                setOverlaps([])
                setIsCalculating(false)
                return
            }

            // Merge features for each event into a single polygon
            const mergedPolygons: Record<string, Feature<Polygon | MultiPolygon>> = {}

            eventIds.forEach((eventId) => {
                const features = featuresByEvent[eventId]
                if (features.length === 1) {
                    mergedPolygons[eventId] = features[0]
                } else if (features.length > 1) {
                    try {
                        const fc = turf.featureCollection(features)
                        const dissolved = turf.dissolve(fc as turf.FeatureCollection<turf.Polygon>)
                        if (dissolved.features.length > 0) {
                            mergedPolygons[eventId] = dissolved.features[0] as Feature<Polygon | MultiPolygon>
                        }
                    } catch {
                        // If dissolve fails, use first feature
                        mergedPolygons[eventId] = features[0]
                    }
                }
            })

            // Calculate pairwise intersections and track overlap counts
            const overlapResults: OverlapResult[] = []
            const processedPairs = new Set<string>()

            // For each point on the map, count how many polygons contain it
            // We'll use a grid-based approach for visualization
            const allPolygons = Object.entries(mergedPolygons)

            // Calculate overlapping regions
            for (let i = 0; i < allPolygons.length; i++) {
                for (let j = i + 1; j < allPolygons.length; j++) {
                    const [eventId1, poly1] = allPolygons[i]
                    const [eventId2, poly2] = allPolygons[j]
                    const pairKey = [eventId1, eventId2].sort().join('-')

                    if (processedPairs.has(pairKey)) continue
                    processedPairs.add(pairKey)

                    try {
                        const intersection = turf.intersect(
                            turf.featureCollection([poly1, poly2])
                        )

                        if (intersection &&
                            (intersection.geometry.type === 'Polygon' ||
                                intersection.geometry.type === 'MultiPolygon')) {
                            overlapResults.push({
                                overlapCount: 2,
                                eventIds: [eventId1, eventId2],
                                geometry: intersection.geometry,
                            })
                        }
                    } catch {
                        // Intersection calculation failed, skip
                    }
                }
            }

            // Calculate 3+ overlaps
            if (allPolygons.length >= 3) {
                // Find regions where 3+ events overlap
                for (let i = 0; i < allPolygons.length; i++) {
                    for (let j = i + 1; j < allPolygons.length; j++) {
                        for (let k = j + 1; k < allPolygons.length; k++) {
                            const [eventId1, poly1] = allPolygons[i]
                            const [eventId2, poly2] = allPolygons[j]
                            const [eventId3, poly3] = allPolygons[k]

                            try {
                                const int12 = turf.intersect(
                                    turf.featureCollection([poly1, poly2])
                                )
                                if (int12 &&
                                    (int12.geometry.type === 'Polygon' ||
                                        int12.geometry.type === 'MultiPolygon')) {
                                    const int123 = turf.intersect(
                                        turf.featureCollection([
                                            int12 as Feature<Polygon | MultiPolygon>,
                                            poly3
                                        ])
                                    )
                                    if (int123 &&
                                        (int123.geometry.type === 'Polygon' ||
                                            int123.geometry.type === 'MultiPolygon')) {
                                        overlapResults.push({
                                            overlapCount: 3,
                                            eventIds: [eventId1, eventId2, eventId3],
                                            geometry: int123.geometry,
                                        })
                                    }
                                }
                            } catch {
                                // Skip on error
                            }
                        }
                    }
                }
            }

            // Calculate 4+ overlaps  
            if (allPolygons.length >= 4) {
                for (let i = 0; i < allPolygons.length; i++) {
                    for (let j = i + 1; j < allPolygons.length; j++) {
                        for (let k = j + 1; k < allPolygons.length; k++) {
                            for (let l = k + 1; l < allPolygons.length; l++) {
                                const [eventId1, poly1] = allPolygons[i]
                                const [eventId2, poly2] = allPolygons[j]
                                const [eventId3, poly3] = allPolygons[k]
                                const [eventId4, poly4] = allPolygons[l]

                                try {
                                    const int12 = turf.intersect(
                                        turf.featureCollection([poly1, poly2])
                                    )
                                    if (!int12 || !['Polygon', 'MultiPolygon'].includes(int12.geometry.type)) continue

                                    const int123 = turf.intersect(
                                        turf.featureCollection([
                                            int12 as Feature<Polygon | MultiPolygon>,
                                            poly3
                                        ])
                                    )
                                    if (!int123 || !['Polygon', 'MultiPolygon'].includes(int123.geometry.type)) continue

                                    const int1234 = turf.intersect(
                                        turf.featureCollection([
                                            int123 as Feature<Polygon | MultiPolygon>,
                                            poly4
                                        ])
                                    )
                                    if (int1234 &&
                                        (int1234.geometry.type === 'Polygon' ||
                                            int1234.geometry.type === 'MultiPolygon')) {
                                        overlapResults.push({
                                            overlapCount: 4,
                                            eventIds: [eventId1, eventId2, eventId3, eventId4],
                                            geometry: int1234.geometry,
                                        })
                                    }
                                } catch {
                                    // Skip on error
                                }
                            }
                        }
                    }
                }
            }

            setOverlaps(overlapResults)
        } catch (error) {
            console.error('Error calculating overlaps:', error)
            setOverlaps([])
        } finally {
            setIsCalculating(false)
        }
    }, [selectedEventIds, exerciseFeatures])

    useEffect(() => {
        calculateOverlaps()
    }, [calculateOverlaps])

    // Convert overlaps to GeoJSON for saving
    const getOverlapsAsGeoJSON = useCallback((): FeatureCollection => {
        return {
            type: 'FeatureCollection',
            features: overlaps.map((overlap, index) => ({
                type: 'Feature' as const,
                id: `overlap-${index}`,
                properties: {
                    overlapCount: overlap.overlapCount,
                    eventIds: overlap.eventIds.join(','),
                    eventTitles: overlap.eventIds
                        .map(id => events.find(e => e.eventId === id)?.title || id)
                        .join(', '),
                },
                geometry: overlap.geometry,
            })),
        }
    }, [overlaps, events])

    // Filter overlaps by level (1, 2-3, 4+)
    const getFilteredOverlaps = useCallback((filterLevel: number | null): OverlapResult[] => {
        if (filterLevel === null) return overlaps

        if (filterLevel === 1) {
            // Return overlaps with exactly 2 (which means 2 overlapping areas)
            return overlaps.filter(o => o.overlapCount === 2)
        } else if (filterLevel === 2) {
            return overlaps.filter(o => o.overlapCount >= 2 && o.overlapCount <= 3)
        } else if (filterLevel === 3) {
            return overlaps.filter(o => o.overlapCount >= 4)
        }
        return overlaps
    }, [overlaps])

    return {
        overlaps,
        isCalculating,
        getOverlapsAsGeoJSON,
        getFilteredOverlaps,
        recalculate: calculateOverlaps,
    }
}
