import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category color palettes for custom SVG markers (No pharmacy/medical)
const CATEGORY_COLORS = {
  'Restaurants & Cafes': '#ea580c', // Orange
  'Grocery & Supermarket': '#16a34a', // Green
  'Salons & Spas': '#db2777', // Pink
  'Fitness & Gym': '#7c3aed', // Purple
  'Electronics & Repair': '#2563eb', // Blue
  'Retail & Fashion': '#0891b2', // Cyan
  'Bakery & Sweets': '#d97706', // Amber
  'default': '#4f46e5'
};

function createCustomPin(color = '#2563eb', isSelected = false) {
  const size = isSelected ? 38 : 30;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-map-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

function createUserLocationPin() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.25"/>
      <circle cx="12" cy="12" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'user-location-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function LeafletMap({
  businesses = [],
  selectedBusinessId = null,
  onSelectBusiness = () => {},
  centerCoords = { lat: 12.8988, lng: 77.5186 },
  zoom = 13,
  pickerMode = false,
  pickedCoords = null,
  onCoordsPicked = () => {},
  className = "h-[450px] w-full rounded-2xl shadow-inner"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const pickerMarkerRef = useRef(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Free OpenStreetMap CartoDB Positron / OSM standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Picker mode click listener
      map.on('click', (e) => {
        if (pickerMode) {
          const { lat, lng } = e.latlng;
          onCoordsPicked(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Picker Mode Pin updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickerMode) return;

    if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickedCoords.lat, pickedCoords.lng]);
      } else {
        const pin = L.marker([pickedCoords.lat, pickedCoords.lng], {
          draggable: true,
          icon: createCustomPin('#dc2626', true)
        }).addTo(map);

        pin.on('dragend', () => {
          const pos = pin.getLatLng();
          onCoordsPicked(pos.lat, pos.lng);
        });

        pickerMarkerRef.current = pin;
      }
      map.panTo([pickedCoords.lat, pickedCoords.lng]);
    }
  }, [pickerMode, pickedCoords]);

  // 3. Render Business Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || pickerMode) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // User location marker
    if (centerCoords.lat && centerCoords.lng) {
      L.marker([centerCoords.lat, centerCoords.lng], {
        icon: createUserLocationPin()
      })
      .bindPopup('<div class="text-xs font-semibold text-slate-800 dark:text-slate-100">Your Current Location</div>')
      .addTo(map);
    }

    // Add business markers
    businesses.forEach(b => {
      if (!b.latitude || !b.longitude) return;

      const isSelected = selectedBusinessId === b.id;
      const color = CATEGORY_COLORS[b.category] || CATEGORY_COLORS['default'];
      const icon = createCustomPin(color, isSelected);

      const marker = L.marker([b.latitude, b.longitude], { icon }).addTo(map);

      // High contrast, WCAG AA compliant popup HTML (Screenshot 5 Fix)
      const popupHtml = `
        <div style="min-width: 220px; max-width: 260px;" class="bizconnect-map-popup p-1">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <span class="popup-category" style="background-color: ${color}20; color: ${color}; border: 1.5px solid ${color}66; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
              ${b.category}
            </span>
            <span class="popup-rating" style="font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 2px;">
              ★ ${b.average_rating || 'New'}
            </span>
          </div>
          <h4 class="popup-title" style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; line-height: 1.25;">
            ${b.name}
          </h4>
          <p class="popup-address" style="font-size: 11px; margin: 0 0 6px 0; line-height: 1.35;">
            ${b.address}
          </p>
          ${b.distance_km !== undefined ? `
            <div class="popup-distance" style="font-size: 11px; font-weight: 700; margin-bottom: 6px;">
              📍 ${b.distance_km} km away
            </div>` : ''}
          ${b.active_offers_count ? `
            <div class="popup-offers" style="font-size: 11px; font-weight: 800; margin-bottom: 8px;">
              🎁 ${b.active_offers_count} Active Deal(s)
            </div>` : ''}
          <a href="/business/${b.id}" class="popup-button" style="display: block; width: 100%; text-align: center; background-color: #2563eb !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; font-weight: 800; font-size: 12px; padding: 9px 12px; border-radius: 10px; text-decoration: none; margin-top: 6px; box-shadow: 0 2px 5px rgba(37,99,235,0.35);">
            <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; font-weight: 800;">View Store Details →</span>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectBusiness(b.id);
      });

      markersRef.current[b.id] = marker;
    });

    // Auto fit bounds if businesses exist
    if (businesses.length > 0) {
      const bounds = L.latLngBounds(businesses.map(b => [b.latitude, b.longitude]));
      if (centerCoords.lat && centerCoords.lng) {
        bounds.extend([centerCoords.lat, centerCoords.lng]);
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [businesses, centerCoords, pickerMode]);

  // 4. Pan to selected business when selectedBusinessId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBusinessId || !markersRef.current[selectedBusinessId]) return;

    const marker = markersRef.current[selectedBusinessId];
    map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
    marker.openPopup();
  }, [selectedBusinessId]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className={className} style={{ minHeight: '380px' }} />
      {pickerMode && (
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 z-20 pointer-events-none">
          Click map or drag marker to set business pin
        </div>
      )}
    </div>
  );
}
