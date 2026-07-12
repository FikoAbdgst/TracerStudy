import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const INDONESIA_CENTER = [-2.5, 117.0];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

function MapClickHandler({ onClick }) {
    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;

    useMapEvents({
        click(e) {
            onClickRef.current(e.latlng);
        },
    });
    return null;
}

function DraggableMarker({ position, onPositionChange }) {
    const markerRef = useRef(null);
    const onPositionChangeRef = useRef(onPositionChange);
    onPositionChangeRef.current = onPositionChange;

    return (
        <Marker
            draggable={true}
            position={position}
            ref={markerRef}
            eventHandlers={{
                dragend() {
                    const marker = markerRef.current;
                    if (marker) {
                        onPositionChangeRef.current(marker.getLatLng());
                    }
                },
            }}
        />
    );
}

function MapController({ position, hasBeenSet }) {
    const map = useMap();
    const initial = useRef(true);

    useEffect(() => {
        if (position && hasBeenSet && initial.current) {
            map.flyTo(position, 13, { duration: 0.5 });
            initial.current = false;
        }
    }, [position, hasBeenSet, map]);

    return null;
}

function ReadOnlyMarker({ position, label }) {
    return (
        <Marker position={position}>
            {label && <Popup>{label}</Popup>}
        </Marker>
    );
}

export default function LocationPicker({ latitude, longitude, onLocationChange, onAddressResolve, onAddressData, onResolvingChange, height = 300, readOnly = false, label }) {
    const position = (latitude && longitude) ? [latitude, longitude] : null;
    const [isResolving, setIsResolving] = useState(false);
    const hasBeenSet = useRef(false);
    if (position) hasBeenSet.current = true;

    const resolveAddress = useCallback(async (lat, lng) => {
        setIsResolving(true);
        onResolvingChange?.(true);
        try {
            const res = await fetch(`${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&accept-language=id`, {
                headers: { 'User-Agent': 'SITAMI/1.0' },
            });
            const data = await res.json();
            if (data?.display_name) {
                onAddressResolve?.(lat, lng, data.display_name);
            }
            if (data?.address) {
                onAddressData?.(data.address, data.display_name);
            }
        } catch {
        } finally {
            setIsResolving(false);
            onResolvingChange?.(false);
        }
    }, [onAddressResolve, onAddressData, onResolvingChange]);

    const handlePositionChange = useCallback((latlng) => {
        onLocationChange(latlng.lat, latlng.lng);
        if (onAddressResolve) {
            resolveAddress(latlng.lat, latlng.lng);
        }
    }, [onLocationChange, onAddressResolve, resolveAddress]);

    const mapCenter = position || INDONESIA_CENTER;
    const mapZoom = position ? 13 : 5;

    return (
        <div style={{ borderRadius: 9, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height, width: '100%', zIndex: 1 }}
                scrollWheelZoom={readOnly ? false : true}
                dragging={!readOnly}
                doubleClickZoom={!readOnly}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {readOnly ? (
                    position && <ReadOnlyMarker position={position} label={label} />
                ) : (
                    <>
                        <MapController position={position} hasBeenSet={hasBeenSet.current} />
                        <MapClickHandler onClick={handlePositionChange} />
                        {position && (
                            <DraggableMarker
                                position={position}
                                onPositionChange={handlePositionChange}
                            />
                        )}
                    </>
                )}
            </MapContainer>
            {!readOnly && isResolving && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    ⏳ Mencari alamat...
                </div>
            )}
            {!readOnly && !isResolving && !position && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: '#94a3b8', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontStyle: 'italic' }}>
                    Klik atau geser pin di peta untuk menentukan lokasi
                </div>
            )}
        </div>
    );
}
