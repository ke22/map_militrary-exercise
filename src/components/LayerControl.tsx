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
}: LayerControlProps) {


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
            <div className="control-content">
                {/* Header */}
                <div className="control-header">
                    <h3>軍演範圍</h3>
                    <span className="selection-count">
                        {selectedEventIds.length} / {events.length}
                    </span>
                </div>

                {/* Checkbox List */}
                <div className="checkbox-list scrollable">
                {sortedEvents.map((event) => {
                    const isSelected = selectedEventIds.includes(event.eventId)
                    return (
                        <div key={event.eventId} className="apple-row" onClick={() => handleToggle(event.eventId)}>
                            <div className="title-row">
                                <button
                                    className="color-toggle-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggle(event.eventId)
                                    }}
                                    style={{
                                        backgroundColor: isSelected ? event.color : 'rgba(100, 100, 100, 0.5)',
                                        borderColor: isSelected ? event.color : 'rgba(150, 150, 150, 0.5)'
                                    }}
                                    aria-label={event.title}
                                />
                                <span className="title">{event.title}</span>
                            </div>
                            <span className="subtitle">{event.dateLabel}</span>
                        </div>
                    )
                })}
                </div>

            </div>
        </div>
    )
}
