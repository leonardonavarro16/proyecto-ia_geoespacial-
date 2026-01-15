'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { CloudSun, Waves, Building2, Wind, Droplets, Thermometer, AlertTriangle, Search, Loader2, Bookmark, BookmarkPlus, List, Trash2, MapPin, Info, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EnvironmentDashboardProps {
  lat: number;
  lon: number;
  className?: string;
  onLayerChange?: (layer: string) => void;
  onLocationSelect?: (location: { lat: number; lon: number }) => void;
  activeLayer?: string | null;
  baseLayer?: string;
  onBaseLayerChange?: (layer: string) => void;
}

export default function EnvironmentDashboard({ 
    lat, 
    lon, 
    className, 
    onLayerChange, 
    onLocationSelect, 
    activeLayer,
    baseLayer,
    onBaseLayerChange
}: EnvironmentDashboardProps) {
  const [data, setData] = useState<any>({ weather: null, risks: null, urban: null });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('weather');

  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('geo_bookmarks');
    if (saved) setSavedLocations(JSON.parse(saved));
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (searchQuery.length > 2) {
            try {
                const res = await fetch(`/api/geocoding/suggestions?q=${encodeURIComponent(searchQuery)}`);
                const results = await res.json();
                setSuggestions(results);
            } catch (e) {
                console.error("Error fetching suggestions", e);
            }
        } else {
            setSuggestions([]);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveCurrentLocation = () => {
    const name = prompt("Nombre para esta ubicación:", `Lugar en ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    if (!name) return;

    const newLoc = { id: Date.now(), name, lat, lon, date: new Date().toLocaleDateString() };
    const updated = [...savedLocations, newLoc];
    setSavedLocations(updated);
    localStorage.setItem('geo_bookmarks', JSON.stringify(updated));
    toast.success("Ubicación guardada en favoritos");
  };

  const deleteLocation = (id: number) => {
    const updated = savedLocations.filter(l => l.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('geo_bookmarks', JSON.stringify(updated));
    toast.info("Ubicación eliminada");
  };

  const loadLocation = (loc: any) => {
    if (onLocationSelect) {
        onLocationSelect({ lat: loc.lat, lon: loc.lon });
    }
    setIsDialogOpen(false);
    setSuggestions([]);
    toast.success(`Cargando ${loc.name}`);
  };

  const handleSuggestionSelect = (loc: any) => {
    if (onLocationSelect) {
        onLocationSelect({ lat: loc.lat, lon: loc.lon });
    }
    setSearchQuery('');
    setSuggestions([]);
    toast.info("Viajando a la nueva ubicación");
  };

  const fetchData = async () => {
      setLoading(true);
      try {
          // Fetch in parallel
          const [weatherRes, risksRes, urbanRes] = await Promise.all([
              fetch(`/api/weather?lat=${lat}&lon=${lon}`).then(r => r.json()),
              fetch(`/api/risks?lat=${lat}&lon=${lon}`).then(r => r.json()),
              fetch(`/api/urban-data?lat=${lat}&lon=${lon}`).then(r => r.json())
          ]);

          setData({
              weather: weatherRes.error ? null : weatherRes,
              risks: risksRes.error ? null : risksRes,
              urban: urbanRes.error ? null : urbanRes
          });
          
          if (weatherRes.error || risksRes.error) {
              toast.warning("Algunos datos no están disponibles para esta zona");
          }
      } catch (error) {
          console.error("Dashboard fetch error", error);
          toast.error("Error al conectar con los servicios geoespaciales");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (lat && lon) {
        fetchData();
    }
  }, [lat, lon]);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      try {
          const res = await fetch(`/api/geocoding?address=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();

          if (data.lat && data.lon) {
              if (onLocationSelect) {
                onLocationSelect({ lat: data.lat, lon: data.lon });
                setSearchQuery('');
                setSuggestions([]);
                toast.success("Dirección encontrada");
              }
          } else {
              toast.error("No se encontró esa dirección");
          }
      } catch (error) {
          console.error("Search failed", error);
          toast.error("Error en el servicio de geocodificación");
      } finally {
          setIsSearching(false);
      }
  };

  const toggleLayer = (layer: string) => {
      if (onLayerChange) {
          onLayerChange(layer);
      }
  };

  if (!lat || !lon) return null;

  return (
    <Card className={cn("w-[320px] bg-background/95 backdrop-blur shadow-xl border-primary/20", className)}>
        <CardHeader className="p-3 pb-0 border-b space-y-3">
             {/* Search Bar */}
             <div className="relative">
                <form onSubmit={handleSearch} className="flex gap-2 relative z-10">
                    <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar ciudad..."
                        className="h-9 pr-8 text-sm"
                        disabled={isSearching}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="h-9 w-9 absolute right-0 top-0 rounded-l-none" 
                        variant="ghost" 
                        disabled={isSearching}
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                    </Button>
                </form>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-1">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionSelect(s)}
                                    className="w-full text-left p-2 hover:bg-accent rounded-md text-xs transition-colors flex items-start gap-2 border-b last:border-0 border-muted"
                                >
                                    <MapPin className="h-3 w-3 mt-0.5 text-red-500 shrink-0" />
                                    <span className="truncate">{s.display_name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>

            {/* Header Actions */}
            <div id="location-actions" className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            onClick={saveCurrentLocation} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-[10px] font-bold uppercase tracking-tight"
                        >
                            <BookmarkPlus className="h-3 w-3 mr-1 text-blue-600" /> Guardar Ubicación
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Guardar estas coordenadas en tus favoritos</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            id="map-view-toggle"
                            onClick={() => {
                                const newLayer = baseLayer === 'satellite' ? 'osm' : 'satellite';
                                onBaseLayerChange?.(newLayer);
                                if (newLayer === 'satellite') {
                                    setActiveTab('risks');
                                    toast.info("Cargando análisis satelital Sentinel-2");
                                }
                            }} 
                            variant={baseLayer === 'satellite' ? 'default' : 'outline'} 
                            size="sm" 
                            className={cn("h-8 px-2", baseLayer === 'satellite' && "bg-blue-600 hover:bg-blue-700")}
                        >
                            <Globe className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vista de Satélite + Análisis Sentinel</TooltipContent>
                </Tooltip>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button id="favorites-button" variant="outline" size="sm" className="h-8 px-2">
                            <List className="h-4 w-4" />
                            <span className="ml-1 text-xs font-bold">{savedLocations.length}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Ubicaciones Guardadas</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="flex-1 pr-4">
                            {savedLocations.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground italic">No hay ubicaciones guardadas</div>
                            ) : (
                                <div className="space-y-2 py-4">
                                    {savedLocations.map(loc => (
                                        <div key={loc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                                            <div 
                                                className="flex-1 cursor-pointer" 
                                                onClick={() => loadLocation(loc)}
                                            >
                                                <div className="font-bold text-sm">{loc.name}</div>
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="h-2 w-2" /> {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)} • {loc.date}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteLocation(loc.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <CardTitle className="text-sm font-medium flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <span>📍 Datos de Zona</span>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="w-48 text-xs">Datos obtenidos de OpenWeatherMap, OpenStreetMap y sensores locales.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                {loading && <span className="text-xs text-muted-foreground animate-pulse">Actualizando...</span>}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="weather" className="text-[10px] uppercase font-bold">Clima</TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Temperatura, viento y capas meteorológicas.</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="risks" className="text-[10px] uppercase font-bold">Riesgos</TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Análisis de inundabilidad e incendios.</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TabsTrigger value="urban" className="text-[10px] uppercase font-bold">Urbano</TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Servicios de interés y equipamiento cercano.</TooltipContent>
                    </Tooltip>
                </TabsList>

                {/* Weather Content */}
                <TabsContent value="weather" className="mt-3 space-y-3 animate-in fade-in slide-in-from-left-2">
                    {data.weather ? (
                        <div className="flex flex-col gap-3">
                            {/* Grupo de Capas Principales */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capas Térmicas e Hídricas</label>
                                <div className="flex flex-col gap-2">
                                    <DataCard 
                                        icon={<Thermometer className="h-4 w-4 text-orange-500"/>} 
                                        label="Temperatura" 
                                        value={data.weather.temp} 
                                        onClick={() => toggleLayer('temp')}
                                        isActive={activeLayer === 'temp'}
                                        className="w-full flex-row justify-start gap-4 h-12"
                                    />
                                    <DataCard 
                                        icon={<Droplets className="h-4 w-4 text-cyan-500"/>} 
                                        label="Precipitación" 
                                        value={data.weather.precip} 
                                        onClick={() => toggleLayer('precip')}
                                        isActive={activeLayer === 'precip'}
                                        className="w-full flex-row justify-start gap-4 h-12"
                                    />
                                </div>
                            </div>

                            {/* Grupo de Capas secundarias */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Otros Sensores</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <DataCard 
                                        icon={<Wind className="h-4 w-4 text-blue-400"/>} 
                                        label="Viento" 
                                        value={data.weather.wind} 
                                        onClick={() => toggleLayer('wind')}
                                        isActive={activeLayer === 'wind'}
                                    />
                                    <DataCard 
                                        icon={<CloudSun className="h-4 w-4 text-gray-500"/>} 
                                        label="Nubes" 
                                        value="Ver Capa" 
                                        onClick={() => toggleLayer('clouds')}
                                        isActive={activeLayer === 'clouds'}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : <div className="text-xs text-muted-foreground">Cargando clima...</div>}
                </TabsContent>

                {/* Risks Content */}
                <TabsContent value="risks" className="mt-3 space-y-2 animate-in fade-in slide-in-from-right-2">
                     {data.risks ? (
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 transition-colors">
                                <Waves className="h-4 w-4 text-blue-600 mt-0.5"/>
                                <div>
                                    <p className="text-xs font-semibold">Riesgo Inundación</p>
                                    <p className="text-xs text-muted-foreground">{data.risks.floodRisk.split('-')[0]}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 transition-colors">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5"/>
                                <div>
                                    <p className="text-xs font-semibold">Riesgo Incendio</p>
                                    <p className="text-xs text-muted-foreground">{data.risks.fireRisk.split('(')[0]}</p>
                                </div>
                            </div>

                            {/* Copernicus Satellite Data Section */}
                            {data.risks.satellite && (
                                <div className="mt-4 pt-4 border-t border-muted-foreground/10">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 block">Análisis por Satélite (Sentinel-2)</label>
                                    {data.risks.satellite.status.includes('available') || data.risks.satellite.status.includes('Demo') ? (
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2 animate-in zoom-in-95">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold">Estado:</span>
                                                <span className="text-blue-600 font-bold">{data.risks.satellite.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold">Nubosidad:</span>
                                                <span className={cn(
                                                    data.risks.satellite.cloudCoverage < 20 ? "text-green-600" : "text-orange-600"
                                                )}>{data.risks.satellite.cloudCoverage}%</span>
                                            </div>
                                            {data.risks.satellite.thumbnail && (
                                                <img 
                                                    src={data.risks.satellite.thumbnail} 
                                                    alt="Sentinel-2 Thumbnail" 
                                                    className="w-full h-20 object-cover rounded-lg border border-white/20 shadow-sm"
                                                />
                                            )}
                                            <ul className="text-[9px] space-y-1 pt-1">
                                                {data.risks.satellite.riskFactors.map((f: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-1.5 font-medium">
                                                        <div className="h-1 w-1 rounded-full bg-blue-400" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                            <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium">
                                                {data.risks.satellite.status === 'Error accessing Copernicus' 
                                                    ? "Configuración técnica requerida para análisis espectral (Sentinel-2)."
                                                    : data.risks.satellite.status}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                     ) : <div className="text-xs text-muted-foreground">Analizando riesgos...</div>}
                </TabsContent>

                {/* Urban Content */}
                <TabsContent value="urban" className="mt-3 space-y-2 animate-in fade-in zoom-in">
                    {data.urban ? (
                        <div className="space-y-2">
                            <div className="p-2 bg-muted/50 rounded-md">
                                <p className="text-xs font-semibold mb-1">Clasificación</p>
                                <p className="text-xs text-muted-foreground">{data.urban.classification}</p>
                            </div>
                             <div className="p-2 bg-muted/50 rounded-md">
                                <p className="text-xs font-semibold mb-1">Usos</p>
                                <p className="text-xs text-muted-foreground">{data.urban.usage}</p>
                            </div>
                        </div>
                    ) : <div className="text-xs text-muted-foreground">Consultando catastro...</div>}
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}

function DataCard({ icon, label, value, onClick, isActive, className }: any) {
    const isRow = className?.includes('flex-row');
    return (
        <div 
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-2 bg-card border rounded-md cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all active:scale-95 group",
                isActive && "border-primary bg-primary/10 ring-2 ring-primary/30",
                className
            )}
        >
            {icon}
            <div className={cn("flex flex-col", isRow ? "items-start" : "items-center")}>
                <span className="text-sm font-bold leading-none">{value}</span>
                <span className={cn(
                    "text-[10px] uppercase font-bold transition-colors mt-0.5",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}>{label}</span>
            </div>
        </div>
    );
}
