'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { MapPin, Loader2, Save, ArrowLeftRight, Clock, Trash2, Wind, ShieldAlert, Building2, ExternalLink, Info, FileDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PDFExportButton from '../report/PDFExportButton';

interface ChatProps {
  selectedLocation: { lat: number; lon: number } | null;
  onLocationSelect: (location: { lat: number; lon: number } | null) => void;
}

interface AnalysisReport {
  resumen: string;
  analisisMediaoambiental: {
    calidadAire: string;
    clima: string;
    recomendacion: string;
  };
  infraestructura: {
    servicios: string[];
    analisis: string;
  };
  riesgos: {
    inundabilidad: string;
    satelital: string;
    nivelRiesgo: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  };
  conclusion: string;
  recomendacionFinal: string;
  enlaces: {
    ign: string;
    copernicus: string;
    osm: string;
  };
}

export default function Chat({ selectedLocation, onLocationSelect }: ChatProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Persistence logic
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const locations = JSON.parse(localStorage.getItem('saved_locations') || '[]');
    setSavedLocations(locations);
  }, []);

  const generateReport = async (location: { lat: number; lon: number }) => {
    setIsLoading(true);
    setReport(null);
    toast.loading("Iniciando análisis geoespacial profundo...", { id: "analysis" });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedLocation: location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al generar el informe");
      }

      const data = await response.json();
      setReport(data);
      toast.success("Informe generado con éxito", { id: "analysis" });
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Error al generar el informe técnico", { id: "analysis" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedLocation || !report) return;
    const note = (document.getElementById('location-note') as HTMLTextAreaElement)?.value || '';
    
    const newSaved = {
      id: Date.now(),
      lat: selectedLocation.lat,
      lon: selectedLocation.lon,
      report,
      note,
      date: new Date().toLocaleDateString()
    };

    const updated = [...savedLocations, newSaved];
    setSavedLocations(updated);
    localStorage.setItem('saved_locations', JSON.stringify(updated));
    toast.success("Informe guardado en tu historial");
  };

  const deleteSaved = (id: number) => {
    const updated = savedLocations.filter(loc => loc.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('saved_locations', JSON.stringify(updated));
    toast.info("Informe eliminado");
  }

  const loadSaved = (saved: any) => {
    setReport(saved.report);
    onLocationSelect({ lat: saved.lat, lon: saved.lon });
    setShowSaved(false);
    toast.success("Informe cargado desde el historial");
  };

  return (
    <Card id="analysis-section" className="flex flex-col h-full overflow-hidden border-0 rounded-none shadow-none bg-background/95 backdrop-blur-xl">
      <CardHeader className="border-b px-4 py-3 flex flex-row justify-between items-center bg-white/80 dark:bg-black/40 sticky top-0 z-10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-primary p-1.5 rounded-lg text-primary-foreground text-xs">AI</span> 
            Analizador
        </CardTitle>
        <div className="flex gap-2">
            <Button id="history-button" variant="outline" size="sm" onClick={() => setShowSaved(!showSaved)} className="h-8 px-2">
                <Clock className="h-4 w-4 mr-1" />
                {savedLocations.length}
            </Button>
            {report && !isLoading && (
                <>
                    <Button id="save-report-button" variant="ghost" size="sm" onClick={handleSave} className="h-8 px-2 text-primary">
                        <Save className="h-4 w-4" />
                    </Button>
                    <PDFExportButton report={report} />
                </>
            )}
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 w-full min-h-0" ref={scrollRef}>
        <div id="report-dashboard" className="p-4 space-y-6 max-w-3xl mx-auto">
          
          {/* Saved Locations Panel */}
          {showSaved && (
              <div className="bg-muted/50 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 animate-in fade-in slide-in-from-top-4">
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" /> Historial de Análisis
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowSaved(false)}>Cerrar</Button>
                  </div>
                  {savedLocations.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No hay análisis guardados.</p>
                  ) : (
                      <div className="space-y-2">
                          {savedLocations.map((loc) => (
                              <div key={loc.id} className="bg-background p-3 rounded-lg border shadow-sm group">
                                  <div className="flex justify-between items-start mb-1">
                                      <p className="text-xs font-bold truncate max-w-[150px]">{loc.note || 'Sin nota'}</p>
                                      <div className="flex gap-1">
                                          <Button variant="ghost" size="sm" onClick={() => loadSaved(loc)} className="h-6 px-1 text-primary hover:text-primary/80">
                                              Ver
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => deleteSaved(loc.id)} className="h-6 px-1 text-red-600">
                                              <Trash2 className="h-3 w-3" />
                                          </Button>
                                      </div>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">
                                      {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)} • {loc.date}
                                  </p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* Empty State */}
          {!report && !isLoading && !selectedLocation && (
            <div className="flex flex-col items-center justify-center text-center mt-20 space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/40 blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-primary/20 dark:border-primary/40">
                        <MapPin className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Generador de Informes</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                        Selecciona un punto en el mapa para obtener un informe técnico completo.
                    </p>
                </div>
            </div>
          )}

          {selectedLocation && !report && !isLoading && (
            <div className="mt-8 p-6 bg-accent/15 dark:bg-accent/15 rounded-2xl border border-accent/40 dark:border-accent/40 w-full animate-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                        <ArrowLeftRight className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold text-primary uppercase">Ubicación Seleccionada</p>
                        <p className="text-sm font-medium">Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}</p>
                    </div>
                </div>
                <Button id="start-analysis-button" onClick={() => generateReport(selectedLocation)} size="lg" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                    Iniciar Análisis Completo
                </Button>
            </div>
          )}

          {/* Structured Report Content */}
          {report && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
                
                {/* Resumen */}
                <div id="report-summary" className="bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Resumen Ejecutivo
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Síntesis generada por IA basada en todos los factores analizados.</TooltipContent>
                        </Tooltip>
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {report.resumen}
                    </p>
                </div>

                {/* Medio Ambiente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50/50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
                        <h4 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                            <Wind className="h-4 w-4" /> Medio Ambiente
                        </h4>
                        <div className="space-y-3 text-sm">
                            <p><strong>Calidad Aire:</strong> {report.analisisMediaoambiental.calidadAire}</p>
                            <p><strong>Clima:</strong> {report.analisisMediaoambiental.clima}</p>
                            <p className="italic text-gray-600">"{report.analisisMediaoambiental.recomendacion}"</p>
                        </div>
                    </div>

                    <div className="bg-accent/15 dark:bg-accent/15 p-5 rounded-2xl border border-accent/40 dark:border-accent/40">
                        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Infraestructura
                        </h4>
                        <div className="space-y-3 text-sm">
                            <ul className="list-disc ml-4 space-y-1">
                                {report.infraestructura.servicios.slice(0, 4).map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                            <p className="text-gray-600">{report.infraestructura.analisis}</p>
                        </div>
                    </div>
                </div>

                {/* Riesgos */}
                <div id="report-risks" className={`p-6 rounded-2xl border ${
                    report.riesgos.nivelRiesgo === 'Bajo' ? 'bg-gray-50 border-gray-100' :
                    report.riesgos.nivelRiesgo === 'Moderado' ? 'bg-yellow-50 border-yellow-100' :
                    'bg-red-50 border-red-100'
                }`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-1 ${
                        report.riesgos.nivelRiesgo === 'Bajo' ? 'text-gray-700' :
                        report.riesgos.nivelRiesgo === 'Moderado' ? 'text-yellow-700' :
                        'text-red-700'
                    }`}>
                        <ShieldAlert className="h-5 w-5 mr-1" /> Evaluación de Riesgos: {report.riesgos.nivelRiesgo}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Cálculo basado en proximidad a masas de agua y análisis Sentinel-2.</TooltipContent>
                        </Tooltip>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="font-bold mb-1">Inundabilidad:</p>
                            <p>{report.riesgos.inundabilidad}</p>
                        </div>
                        <div>
                            <p className="font-bold mb-1">Satelital (Copernicus):</p>
                            <p>{report.riesgos.satelital}</p>
                        </div>
                    </div>
                </div>

                {/* Conclusión */}
                <div id="report-conclusion" className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        Conclusión Técnica
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Recomendación experta sobre la idoneidad del terreno.</TooltipContent>
                        </Tooltip>
                    </h3>
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                        {report.conclusion}
                    </p>
                    <div className="bg-primary/20 p-4 rounded-xl border border-primary/40">
                        <p className="text-primary/80 font-bold text-xs uppercase tracking-wider mb-1">Recomendación Final</p>
                        <p className="text-sm">{report.recomendacionFinal}</p>
                    </div>
                </div>

                {/* Enlaces */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="ghost" size="sm" asChild className="text-primary">
                        <a href={report.enlaces.ign} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-2" /> IGN</a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary">
                        <a href={report.enlaces.copernicus} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-2" /> Copernicus</a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary">
                        <a href={report.enlaces.osm} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-2" /> OSM</a>
                    </Button>
                </div>

                {/* Personal Actions & Notes */}
                <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-2xl border border-dashed border-muted-foreground/30">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Anotaciones del Proyecto</label>
                        <textarea 
                            id="location-note"
                            className="w-full bg-transparent border-0 text-sm focus:ring-0 outline-none min-h-[80px] py-1"
                            placeholder="Escribe tus observaciones técnicas aquí..."
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={handleSave} className="rounded-xl h-12 bg-primary hover:bg-primary/90">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Informe
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setReport(null)} 
                            className="rounded-xl h-12 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Borrar Informe
                        </Button>
                    </div>
                </div>
            </div>
          )}

          {/* Loader */}
          {isLoading && (
              <div className="flex flex-col items-center justify-center p-20 space-y-6">
                  <div className="relative">
                      <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-8 w-8 bg-primary rounded-lg animate-pulse"></div>
                      </div>
                  </div>
                  <div className="text-center space-y-2">
                      <p className="text-lg font-bold">Analizando Zona...</p>
                      <p className="text-xs text-muted-foreground animate-pulse max-w-[250px]">
                          Consultando satélites Sentinel, registros de OpenStreetMap y sensores de calidad de aire.
                      </p>
                  </div>
              </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
