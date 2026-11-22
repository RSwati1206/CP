import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category color palettes for custom SVG markers
const CATEGORY_COLORS = {
  'Restaurants & Cafes': '#ea580c', // Orange
  'Grocery & Supermarket': '#16a34a', // Green
  'Salons & Spas': '#db2777', // Pink
  'Fitness & Gym': '#7c3aed', // Purple
  'Electronics & Repair': '#2563eb', // Blue
  'Healthcare & Pharmacy': '#dc2626', // Red
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
      .bindPopup('<div class="text-xs font-semibold text-slate-800">Your Current Location</div>')
      .addTo(map);
    }

    // Add business markers
    businesses.forEach(b => {
      if (!b.latitude || !b.longitude) return;

      const isSelected = selectedBusinessId === b.id;
      const color = CATEGORY_COLORS[b.category] || CATEGORY_COLORS['default'];
      const icon = createCustomPin(color, isSelected);

      const marker = L.marker([b.latitude, b.longitude], { icon }).addTo(map);

      const popupHtml = `
        <div style="min-width: 190px;" class="p-1">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span style="background-color: ${color}20; color: ${color};" class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              ${b.category}
            </span>
            <span class="text-xs font-bold text-amber-500">★ ${b.average_rating || 'New'}</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 mb-1 leading-snug">${b.name}</h4>
          <p class="text-xs text-slate-500 mb-2 leading-tight">${b.address}</p>
          ${b.distance_km !== undefined ? `<div class="text-xs font-medium text-slate-600 mb-2">📍 ${b.distance_km} km away</div>` : ''}
          ${b.active_offers_count ? `<div class="text-[11px] font-semibold text-emerald-600 mb-2">🎁 ${b.active_offers_count} Active Promotion(s)</div>` : ''}
          <a href="/business/${b.id}" class="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg no-underline transition-colors">
            View Store Details
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
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold text-slate-700 border border-slate-200 z-20 pointer-events-none">
          Click map or drag marker to set business pin
        </div>
      )}
    </div>
  );
}
