import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = ({ address, height = '300px' }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        // Initialize map
        if (!mapContainerRef.current) return;
        
        if (mapRef.current) {
            mapRef.current.remove();
        }
        
        const map = L.map(mapContainerRef.current).setView([0, 0], 2);
        mapRef.current = map;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Check for GeoJSON location format first
        if (address?.location?.coordinates && address.location.coordinates.length === 2) {
            // GeoJSON format is [longitude, latitude]
            const [lng, lat] = address.location.coordinates;
            map.setView([lat, lng], 15);
            L.marker([lat, lng]).addTo(map);
            return;
        } 
        
        // Fallback to old format for backward compatibility
        if (address?.coordinates?.lat && address?.coordinates?.lng) {
            const { lat, lng } = address.coordinates;
            map.setView([lat, lng], 15);
            L.marker([lat, lng]).addTo(map);
            return;
        }

        // Otherwise, geocode the address if we have address components
        const addressComponents = [
            address?.street,
            address?.city,
            address?.state,
            address?.zipCode,
            address?.country || 'Philippines'
        ].filter(Boolean);
        
        if (addressComponents.length > 1) {
            const addressStr = addressComponents.join(', ');
            
            // Use Nominatim for geocoding with proper headers
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'YourApp/1.0',  // Required by Nominatim policy
                        'Referer': window.location.origin
                    },
                    mode: 'cors'
                }
            )
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    map.setView([lat, lon], 15);
                    L.marker([lat, lon]).addTo(map);
                }
            })
            .catch(error => console.error('Geocoding error:', error));
        }

        // Clean up on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [address]);

    return (
        <div 
            ref={mapContainerRef} 
            style={{ 
                height, 
                width: '100%', 
                borderRadius: '0.375rem',
                position: 'relative',
                zIndex: 1 // Lower z-index for the map container
            }}
        ></div>
    );
};

export default MapView;