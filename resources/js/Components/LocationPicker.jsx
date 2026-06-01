import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

function DraggableMarker({ position, onPositionChange }) {
    const markerRef = useRef(null);

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng);
        },
    });

    return (
        <Marker
            draggable={true}
            position={position || INDONESIA_CENTER}
            ref={markerRef}
            eventHandlers={{
                dragend() {
                    const marker = markerRef.current;
                    if (marker) {
                        onPositionChange(marker.getLatLng());
                    }
                },
            }}
        />
    );
}

function FlyToCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { duration: 0.5 });
        }
    }, [center, map]);
    return null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange, onAddressResolve, onResolvingChange, height = 300 }) {
    const position = (latitude && longitude) ? [latitude, longitude] : null;
    const [isResolving, setIsResolving] = useState(false);

    const resolveAddress = useCallback(async (lat, lng) => {
        setIsResolving(true);
        onResolvingChange?.(true);
        try {
            const res = await fetch(`${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&accept-language=id`, {
                headers: { 'User-Agent': 'SITAMI/1.0' },
            });
            const data = await res.json();
            if (data?.display_name) {
                onAddressResolve?.(data.display_name);
            }
        } catch {
            // reverse geocoding failure is non-critical — silently ignore
        } finally {
            setIsResolving(false);
            onResolvingChange?.(false);
        }
    }, [onAddressResolve, onResolvingChange]);

    const handlePositionChange = useCallback((latlng) => {
        onLocationChange(latlng.lat, latlng.lng);
        if (onAddressResolve) {
            resolveAddress(latlng.lat, latlng.lng);
        }
    }, [onLocationChange, onAddressResolve, resolveAddress]);

    return (
        <div style={{ borderRadius: 9, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
            <MapContainer
                center={position || INDONESIA_CENTER}
                zoom={position ? 13 : 5}
                style={{ height, width: '100%', zIndex: 1 }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                    position={position}
                    onPositionChange={handlePositionChange}
                />
                {position && <FlyToCenter center={position} />}
            </MapContainer>
            {isResolving && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    ⏳ Mencari alamat...
                </div>
            )}
            {!isResolving && !position && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: '#94a3b8', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontStyle: 'italic' }}>
                    Klik atau geser pin di peta untuk menentukan lokasi
                </div>
            )}
        </div>
    );
}
