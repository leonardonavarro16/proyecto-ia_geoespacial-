'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Chat from '@/components/chat/Chat';
import EnvironmentDashboard from '@/components/dashboard/EnvironmentDashboard';
import { Onborda, useOnborda } from "onborda";
import { TourCard } from "@/components/tour/TourCard";

// Helper component to handle auto-start logic (One-time only)
function TourAutoStart() {
  const { startOnborda } = useOnborda();
  
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("geo_tour_completed");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startOnborda("geo-tour");
        localStorage.setItem("geo_tour_completed", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [startOnborda]);

  return null;
}

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Cargando mapa...</div>
});

const tourSteps = [
  {
    tour: "geo-tour",
    steps: [
      {
        icon: "🗺️",
        title: "Paso 1: Análisis Territorial",
        content: "Haz click en cualquier punto del mapa para seleccionar una parcela. El sistema registrará las coordenadas exactas para el análisis.",
        selector: "#map-section",
        side: "top" as const,
        showPointer: false, // Card stays centered, no arrow
      },
      {
        icon: "🔍",
        title: "Paso 2: Localización Directa",
        content: "Utiliza este buscador para situarte en cualquier dirección o municipio del mundo de forma instantánea.",
        selector: "#search-form",
        side: "bottom" as const,
        showPointer: false,
      },
      {
        icon: "🌏",
        title: "Paso 3: Imagen de Satélite",
        content: "Cambia a la vista de satélite para observar el estado real del suelo, vegetación e infraestructuras existentes.",
        selector: "#map-view-toggle",
        side: "bottom" as const,
        showPointer: false,
      },
      {
        icon: "📊",
        title: "Paso 4: Variables del Entorno",
        content: "Aquí verás el clima actual, riesgos de inundación según el terreno y servicios urbanos cercanos.",
        selector: "#dashboard-section",
        side: "left" as const,
        showPointer: false,
      },
      {
        icon: "🤖",
        title: "Paso 5: Reporte Pericial IA",
        content: "Pulsa el botón de 'Iniciar Análisis' para que nuestra IA redacte un informe técnico profesional basado en todas las fuentes consultadas.",
        selector: "#analysis-section",
        side: "right" as const,
        showPointer: false,
      },
    ]
  }
];

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<string>('osm');

  // Default Focus (Madrid center)
  const defaultLat = 40.416775;
  const defaultLon = -3.703790;

  const handleLayerToggle = (layer: string) => {
    setActiveLayer(prevLayer => prevLayer === layer ? null : layer);
  };

  return (
    <Onborda 
        steps={tourSteps} 
        cardComponent={TourCard} 
        shadowOpacity="0.8" 
        shadowRgb="0,0,0"
    >
      <TourAutoStart />
      <main className="flex h-screen w-screen flex-col md:flex-row overflow-hidden bg-background">
        {/* Sidebar / Chat Area */}
        <div id="analysis-section" className="w-full md:w-[320px] lg:w-[450px] shrink-0 border-r z-10 h-[50vh] md:h-full order-2 md:order-1 relative bg-white dark:bg-slate-950">
          <Chat selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
        </div>

        {/* Map Area */}
        <div id="map-section" className="flex-1 relative h-[50vh] md:h-full order-1 md:order-2 z-0">
          <Map 
            lat={selectedLocation?.lat || defaultLat} 
            lon={selectedLocation?.lon || defaultLon} 
            onLocationSelect={(lat, lon) => setSelectedLocation({ lat, lon })} 
            activeLayer={activeLayer}
            baseLayer={baseLayer}
          />
          
          {/* Environment Dashboard Overlay */}
          <div id="dashboard-section" className="absolute top-4 right-4 z-[1001] w-[320px]">
              <EnvironmentDashboard 
                  lat={selectedLocation?.lat || defaultLat} 
                  lon={selectedLocation?.lon || defaultLon} 
                  onLayerChange={handleLayerToggle}
                  onLocationSelect={(loc) => setSelectedLocation(loc)}
                  activeLayer={activeLayer}
                  baseLayer={baseLayer}
                  onBaseLayerChange={setBaseLayer}
              />
          </div>
          
          {!selectedLocation && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-black/95 p-4 rounded-2xl shadow-xl z-[1001] max-w-xs text-sm text-center border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="font-bold text-blue-600">📍 Haz click en el mapa para iniciar</p>
            </div>
          )}
        </div>
      </main>
    </Onborda>
  );
}
