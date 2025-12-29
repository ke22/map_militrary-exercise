export interface ExerciseEvent {
    eventId: string
    title: string
    dateLabel: string
    defaultOn: boolean
    order: number
    color: string
    sourceLabel: string
    // Individual tileset support
    tilesetId?: string | null
    sourceLayer?: string | null
}

export interface ExerciseFeatureProperties {
    eventId: string
    name: string
    dateStart?: string
    dateEnd?: string
    zoneName?: string
    source?: string
}

export interface ReferenceFeatureProperties {
    id: string
    name: string
    type: 'reference'
}

export type DataMode = 'tileset' | 'geojson' | 'mixed'

export interface MapConfig {
    dataMode: DataMode
    tilesetId?: string
    sourceLayer?: string
    mapboxToken: string
}
