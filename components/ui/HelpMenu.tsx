"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, BookOpen, Map as MapIcon, Info } from "lucide-react";

export function HelpMenu() {
  return (
    <div className="absolute bottom-6 right-6 z-[1001]">
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 shadow-2xl bg-white dark:bg-slate-900 text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-blue-100 dark:border-blue-900 group transition-all duration-300 hover:scale-110"
          >
            <HelpCircle className="h-8 w-8 transition-transform group-hover:rotate-12" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
          <div className="bg-blue-600 p-8 text-white relative shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <MapIcon size={120} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <BookOpen className="h-8 w-8" /> Manual de Uso
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-lg font-medium opacity-90">
                Aprende a dominar el Asistente Geoespacial IA
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 w-full overflow-y-auto">
              <div className="p-8 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">1</div>
                    Exploración Sugerida
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Haz clic en cualquier punto del mapa para obtener coordenadas exactas. El marcador azul indica la zona que la IA analizará.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">2</div>
                    Buscador e Historial
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Utiliza la barra de búsqueda para localizar direcciones. Puedes guardar tus ubicaciones favoritas y los informes generados en el panel de historial.
                  </p>
                </section>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">3</div>
                    Análisis por Satélite
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "Activa la capa de satélite para acceder a datos reales de Sentinel-2 sobre el estado del suelo y vegetación."
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                        <Info className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100">Dato importante</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Asegúrate siempre de haber seleccionado un punto en el mapa antes de iniciar un Análisis Completo para que la IA tenga el contexto correcto.
                            </p>
                        </div>
                    </div>
                </section>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
              <DialogTrigger asChild>
                <Button variant="outline" className="h-14 px-8 font-bold text-lg rounded-2xl border-slate-200 dark:border-slate-800">
                  Entendido
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
