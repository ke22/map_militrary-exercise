/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MAPBOX_TOKEN: string
    readonly VITE_DATA_MODE: 'tileset' | 'geojson'
    readonly VITE_TILESET_ID?: string
    readonly VITE_SOURCE_LAYER?: string
    readonly VITE_BASE_PATH?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
