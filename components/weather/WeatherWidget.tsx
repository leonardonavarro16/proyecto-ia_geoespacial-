'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CloudSun, Wind, Droplets, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
    lat: number;
    lon: number;
    className?: string;
}

export default function WeatherWidget({ lat, lon, className }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchWeather = async () => {
        if (!lat || !lon) return;
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setWeather(data);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, [lat, lon]);

    if (error) return null;

    return (
        <div 
            className={cn("cursor-pointer transition-all hover:scale-105 active:scale-95", className)} 
            onClick={fetchWeather}
            title="Click para actualizar clima"
        >
            <Card className="bg-white/90 dark:bg-black/80 backdrop-blur border-none shadow-lg w-auto min-w-[140px]">
                <CardContent className="p-3 flex items-center gap-3">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : weather ? (
                        <>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <CloudSun className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold leading-none">
                                    {weather.temp}
                                </span>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-0.5" title="Viento">
                                        <Wind className="h-3 w-3" />
                                        {weather.wind}
                                    </span>
                                    <span className="flex items-center gap-0.5" title="Precipitación">
                                        <Droplets className="h-3 w-3" />
                                        {weather.precip}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">Cargando clima...</span>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
