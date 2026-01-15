'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  lat: number;
  lon: number;
  onLocationSelect: (lat: number, lon: number) => void;
  activeLayer?: string | null;
  baseLayer?: string;
}

function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lon: number) => void, position: { lat: number, lon: number } }) {
  const map = useMap();
  const lastPosRef = useRef<{lat: number, lon: number} | null>(null);
  
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    // Only fly if the coordinates have actually changed
    // and if we have a valid position
    if (position && (
        !lastPosRef.current || 
        lastPosRef.current.lat !== position.lat || 
        lastPosRef.current.lon !== position.lon
    )) {
        map.flyTo([position.lat, position.lon], 13);
        lastPosRef.current = position;
    }
  }, [position.lat, position.lon, map]);

  return position === null ? null : (
    <Marker position={[position.lat, position.lon]}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  );
}

// Sub-component to handle layer switching via prop
function ExternalLayerController({ activeLayer, apiKey }: { activeLayer?: string | null, apiKey: string }) {
    if (!activeLayer || !apiKey) return null;

    const layers: Record<string, string> = {
        'temp': 'temp_new',
        'precip': 'precipitation_new',
        'wind': 'wind_new',
        'clouds': 'clouds_new',
    };

    const layerName = layers[activeLayer];
    if (!layerName) return null;

    // Use a unique key per layer to force Leaflet to recreate the layer correctly
    const url = `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${apiKey}`;

    return (
        <TileLayer
            key={`owm-${activeLayer}`}
            url={url}
            attribution='&copy; OpenWeatherMap'
            opacity={0.8}
        />
    );
}

export default function Map({ lat, lon, onLocationSelect, activeLayer, baseLayer }: MapProps) {
  // We need an API Key for OWM layers. 
  // Free alternatives for Tiles are scarce. RainViewer is good for precip.
  // We'll use OWM structure but user must provide key.
  const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''; 

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[lat, lon]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
            <LayersControl.BaseLayer checked={baseLayer !== 'satellite'} name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer checked={baseLayer === 'satellite'} name="Satélite (Esri)">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
            </LayersControl.BaseLayer>

            {/* Hidden IGN layers but kept for manual control if needed */}
            <LayersControl.BaseLayer name="IGN - Ortofotos">
                <TileLayer
                  attribution='&copy; <a href="https://www.ign.es/">Instituto Geográfico Nacional de España</a>'
                  url="https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg"
                  maxZoom={20}
                />
            </LayersControl.BaseLayer>
        </LayersControl>

        {/* Dynamic TileLayer based on baseLayer prop (for external dashboard toggle) */}
        {baseLayer === 'satellite' && (
            <>
                <TileLayer
                    attribution='Tiles &copy; Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    zIndex={1}
                />
                <TileLayer
                    attribution='&copy; CartoDB'
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    zIndex={2}
                    opacity={0.9}
                />
            </>
        )}
        {baseLayer === 'osm' && (
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                zIndex={1}
            />
        )}
        
        {/* External Control from Dashboard - Rendered in a high z-index Pane to ensure visibility */}
        {activeLayer && (
            <Pane name="weatherLayers" style={{ zIndex: 650 }}>
                <ExternalLayerController activeLayer={activeLayer} apiKey={OWM_KEY} />
            </Pane>
        )}

        <LocationMarker onLocationSelect={onLocationSelect} position={{ lat, lon }} />
      </MapContainer>
    </div>
  );
}
