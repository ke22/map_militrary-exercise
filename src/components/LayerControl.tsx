import { ExerciseEvent } from '../types'
import './LayerControl.css'

interface LayerControlProps {
    events: ExerciseEvent[]
    selectedEventIds: string[]
    onSelectionChange: (ids: string[]) => void
    dataMode: 'tileset' | 'geojson' | 'mixed'
}

export function LayerControl({
    events,
    selectedEventIds,
    onSelectionChange,
    dataMode,
}: LayerControlProps) {
    const handleSelectAll = () => {
        onSelectionChange(events.map((e) => e.eventId))
    }

    const handleClearAll = () => {
        onSelectionChange([])
    }

    const handleSelectLatest = () => {
        const latest = events.reduce((prev, curr) =>
            curr.order > prev.order ? curr : prev
        )
        onSelectionChange([latest.eventId])
    }

    const handleToggle = (eventId: string) => {
        if (selectedEventIds.includes(eventId)) {
            onSelectionChange(selectedEventIds.filter((id) => id !== eventId))
        } else {
            onSelectionChange([...selectedEventIds, eventId])
        }
    }

    const sortedEvents = [...events].sort((a, b) => b.order - a.order)

    return (
        <div className="layer-control ios-style">
            {/* Header */}
            <div className="control-header">
                <h3>軍演範圍</h3>
                <span className="selection-count">
                    {selectedEventIds.length} / {events.length}
                </span>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="apple-chip" onClick={handleSelectAll}>全部</button>
                <button className="apple-chip" onClick={handleClearAll}>清除</button>
                <button className="apple-chip primary" onClick={handleSelectLatest}>最近</button>
            </div>

            {/* Checkbox List */}
            <div className="checkbox-list scrollable">
                {sortedEvents.map((event) => (
                    <div key={event.eventId} className="apple-row" onClick={() => handleToggle(event.eventId)}>
                        <div className="apple-checkbox-container">
                            <input
                                type="checkbox"
                                className="apple-checkbox"
                                checked={selectedEventIds.includes(event.eventId)}
                                readOnly
                            />
                        </div>
                        <div className="row-content">
                            <div className="title-row">
                                <span className="dot" style={{ backgroundColor: event.color }} />
                                <span className="title">{event.title}</span>
                            </div>
                            <span className="subtitle">{event.dateLabel}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="section-divider" />

            {/* Reference Legend */}
            <div className="reference-section">
                <span className="section-title">參考圖層</span>
                <div className="ref-items">
                    <div className="ref-item">
                        <span className="ref-line adiz" />
                        <span>ADIZ 防空識別區</span>
                    </div>
                    <div className="ref-item">
                        <span className="ref-line median" />
                        <span>海峽中線</span>
                    </div>
                    <div className="ref-item">
                        <span className="ref-line maritime" />
                        <span>領海/鄰接區</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="control-footer">
                <p>模式：{dataMode === 'mixed' ? 'Tileset + GeoJSON' : dataMode === 'tileset' ? 'Tileset' : 'GeoJSON'}</p>
                <p>最後更新：2025/12/29</p>
            </div>
        </div>
    )
}
