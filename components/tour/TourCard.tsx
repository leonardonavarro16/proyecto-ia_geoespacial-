"use client";
import React from "react";
import { useOnborda, type CardComponentProps } from "onborda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export const TourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
}) => {
  const { closeOnborda } = useOnborda();

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center p-4">
      <Card className="w-full max-w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-blue-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 pointer-events-auto relative overflow-hidden">
        {/* Progress Bar background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <CardHeader className="pb-3 pt-6 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl filter drop-shadow-sm">{step.icon}</span>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {step.title}
                </CardTitle>
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                Guía de Usuario • Paso {currentStep + 1} de {totalSteps}
              </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => closeOnborda()} 
            className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
              <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-2">
            {step.content}
          </p>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? 'w-4 bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevStep} 
                className="h-9 px-3 text-xs font-bold border-slate-200 hover:bg-white dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
            )}
            <Button 
                size="sm" 
                onClick={nextStep} 
                className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              {currentStep === totalSteps - 1 ? (
                "Finalizar Tour"
              ) : (
                <>Siguiente <ChevronRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
