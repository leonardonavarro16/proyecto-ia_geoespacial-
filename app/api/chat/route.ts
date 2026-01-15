import { model } from '@/lib/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getWeatherData, getAirQuality } from '@/lib/weather';
import { getUrbanInfrastructure, getFloodRisks } from '@/lib/osm';
import { getCopernicusRiskAnalysis } from '@/lib/copernicus';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { selectedLocation, direccion } = await req.json();

    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lon) {
      return new Response(JSON.stringify({ error: "Faltan coordenadas para el análisis" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { lat, lon } = selectedLocation;

    // 1. RECOPILACIÓN DE DATOS EN PARALELO
    // Usamos try/catch individual para que si uno falla, el resto siga funcionando
    const [clima, contaminacion, infraestructura, riesgos, satelite] = await Promise.all([
      getWeatherData(lat, lon).catch(err => ({ error: err.message })),
      getAirQuality(lat, lon).catch(err => ({ error: err.message })),
      getUrbanInfrastructure(lat, lon).catch(err => ({ error: err.message })),
      getFloodRisks(lat, lon).catch(err => ({ error: err.message })),
      getCopernicusRiskAnalysis(lat, lon).catch(err => ({ error: err.message }))
    ]);

    // 2. GENERACIÓN DEL INFORME ESTRUCTURADO CON IA
    const { object } = await generateObject({
      model: model,
      schema: z.object({
        resumen: z.string().describe('Resumen ejecutivo de la zona'),
        analisisMediaoambiental: z.object({
          calidadAire: z.string(),
          clima: z.string(),
          recomendacion: z.string()
        }),
        infraestructura: z.object({
          servicios: z.array(z.string()),
          analisis: z.string()
        }),
        riesgos: z.object({
          inundabilidad: z.string(),
          satelital: z.string(),
          nivelRiesgo: z.enum(['Bajo', 'Moderado', 'Alto', 'Crítico'])
        }),
        conclusion: z.string(),
        recomendacionFinal: z.string(),
        enlaces: z.object({
          ign: z.string(),
          copernicus: z.string(),
          osm: z.string()
        })
      }),
      system: `Eres un Sistema Experto en Análisis Geoespacial y Urbanístico. 
      Tu objetivo es generar un informe técnico basado estrictamente en los datos proporcionados.
      Utiliza un tono profesional y técnico.`,
      prompt: `Genera un informe detallado para la ubicación:
      ${direccion ? `Dirección: ${direccion}` : ''}
      Coordenadas: ${lat}, ${lon}

      DATOS TÉCNICOS OBTENIDOS:
      - Clima: ${JSON.stringify(clima)}
      - Contaminación: ${JSON.stringify(contaminacion)}
      - Infraestructura (OSM): ${JSON.stringify(infraestructura)}
      - Riesgos Hídricos: ${JSON.stringify(riesgos)}
      - Satélite (Copernicus): ${JSON.stringify(satelite)}

      El informe debe ser riguroso y basado en estos datos. Si algún dato falta o tiene error, menciónalo profesionalmente.`
    });

    // 3. RETORNAR EL OBJETO CON ENLACES DINÁMICOS FORMATEADOS
    const finalReport = {
      ...object,
      enlaces: {
        ign: `https://www.ign.es/iberpix/visor/#lat=${lat}&lon=${lon}&zoom=15`,
        copernicus: `https://dataspace.copernicus.eu/browser/?zoom=14&lat=${lat}&lng=${lon}`,
        osm: `https://www.openstreetmap.org/#map=17/${lat}/${lon}`
      }
    };

    return new Response(JSON.stringify(finalReport), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Error en el análisis geoespacial:", error);
    return new Response(JSON.stringify({ error: "Error procesando el análisis de la ubicación" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
