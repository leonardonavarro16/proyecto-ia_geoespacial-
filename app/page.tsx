'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Chat from '@/components/chat/Chat';
import EnvironmentDashboard from '@/components/dashboard/EnvironmentDashboard';
import { HelpMenu } from "@/components/ui/HelpMenu";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Cargando mapa...</div>
});


export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<string>('osm');
  const [showAnalyzer, setShowAnalyzer] = useState(true);

  // Default Focus (Madrid center)
  const defaultLat = 40.416775;
  const defaultLon = -3.703790;

  const handleLayerToggle = (layer: string) => {
    setActiveLayer(prevLayer => prevLayer === layer ? null : layer);
  };

  return (
      <main className="flex h-screen w-screen flex-col md:flex-row overflow-hidden bg-background">
        {/* Sidebar / Chat Area */}
        <div
          className={`shrink-0 border-r z-10 h-[50vh] md:h-full order-2 md:order-1 relative bg-white dark:bg-slate-950 overflow-hidden transition-all duration-500 ease-in-out ${
            showAnalyzer ? "w-full md:w-[320px] lg:w-[450px]" : "w-10 md:w-12"
          }`}
        >
          <div
            className={`h-full transition-transform duration-500 ease-in-out ${
              showAnalyzer ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Chat selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowAnalyzer(prev => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setShowAnalyzer(prev => !prev);
              }
            }}
            className="toggle-handle absolute top-1/2 right-0 -translate-y-1/2 flex h-24 w-10 items-center justify-center rounded-l-2xl border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200"
            aria-label={showAnalyzer ? "Ocultar analizador" : "Mostrar analizador"}
          >
            {showAnalyzer ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>

        {/* Map Area */}
        <div id="map-section" className="flex-1 relative h-[50vh] md:h-full order-1 md:order-2 z-0">
          <Map 
            lat={selectedLocation?.lat || defaultLat} 
            lon={selectedLocation?.lon || defaultLon} 
            onLocationSelect={(lat, lon) => setSelectedLocation({ lat, lon })} 
            activeLayer={activeLayer}
            baseLayer={baseLayer}
            resizeToken={showAnalyzer}
          />
          
          {/* Environment Dashboard Overlay */}
          <div id="dashboard-section" className="absolute top-4 right-4 z-1001 w-[320px]">
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
          
          {/* Help Menu Button */}
          <HelpMenu />

          {!selectedLocation && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-black/95 p-4 rounded-2xl shadow-xl z-[1001] max-w-xs text-sm text-center border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="font-bold text-blue-600">📍 Haz click en el mapa para iniciar</p>
            </div>
          )}
        </div>
      </main>
  );
}
