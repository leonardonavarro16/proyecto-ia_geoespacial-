async function fetchWithTimeout(url: string, query: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: query,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (e) {
        clearTimeout(timeoutId);
        throw e;
    }
}

export async function getUrbanInfrastructure(lat: number | string, lon: number | string) {
    // Overpass Query: Search for amenities, public buildings, and transport within 500m
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"school|hospital|pharmacy|police|fire_station"](around:500,${lat},${lon});
          way["amenity"~"school|hospital|pharmacy|police|fire_station"](around:500,${lat},${lon});
          node["public_transport"~"platform|station"](around:500,${lat},${lon});
          node["highway"~"bus_stop"](around:500,${lat},${lon});
        );
        out body 10;
        >;
        out skel qt;
    `;
    
    try {
        const response = await fetchWithTimeout('https://overpass.kumi.systems/api/interpreter', query);
        
        if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.elements || data.elements.length === 0) {
            return { 
                info: 'No se encontraron servicios públicos o infraestructuras importantes en un radio de 500m.',
                raw_count: 0 
            };
        }

        // Summarize results
        const amenities = data.elements.map((el: any) => {
            const type = el.tags?.amenity || el.tags?.public_transport || el.tags?.highway || 'servicio';
            const name = el.tags?.name || 'Sin nombre';
            return `- ${type}: ${name}`;
        }).slice(0, 8); // Limit to top 8

        return {
            summary: `Se encontraron ${data.elements.length} puntos de interés cercanos.`,
            details: amenities,
            source: 'OpenStreetMap (Overpass API)'
        };
    } catch (error) {
        console.error("OSM Infrastructure Error:", error);
        return { error: 'No se pudo obtener datos de infraestructura' };
    }
}

export async function getFloodRisks(lat: number | string, lon: number | string) {
       // Overpass Query: Search for water bodies within 1000m
       const query = `
        [out:json][timeout:25];
        (
          way["waterway"="river"](around:1000,${lat},${lon});
          way["natural"="water"](around:1000,${lat},${lon});
          way["natural"="coastline"](around:1000,${lat},${lon});
        );
        out body 5;
        >;
        out skel qt;
    `;

    try {
        const response = await fetchWithTimeout('https://overpass.kumi.systems/api/interpreter', query);
        
        if (!response.ok) {
            throw new Error(`Overpass API Error: ${response.statusText}`);
        }

        const data = await response.json();

        const waterBodies = data.elements.filter((el: any) => el.tags?.name).map((el: any) => el.tags.name);
        const uniqueWaterBodies = [...new Set(waterBodies)];
        const hasWaterNearby = data.elements.length > 0;

        if (hasWaterNearby) {
            return {
                riskLevel: 'MODERADO / ALTO',
                description: 'Se detectaron cuerpos de agua importantes en un radio de 1km.',
                factors: uniqueWaterBodies.length > 0 ? `Cuerpos de agua identificados: ${uniqueWaterBodies.join(', ')}` : 'Cuerpos de agua no nombrados detectados.',
                recommendation: 'Se recomienda consultar mapas oficiales de inundabilidad (SNCZI) para detalles precisos.'
            };
        } else {
            return {
                riskLevel: 'BAJO',
                description: 'No se detectaron ríos principales ni grandes cuerpos de agua en un radio de 1km.',
                factors: 'Sin hidrografía relevante cercana.',
                recommendation: 'Riesgo de inundación fluvial bajo según proximidad.'
            };
        }
    } catch (error) {
        console.error("OSM Flood Risk Error:", error);
        return { 
            riskLevel: 'EN ESPERA',
            description: 'No se pudo verificar la hidrografía en este momento.',
            factors: 'Error de conexión con base de datos geoespacial.',
            recommendation: 'Reintentar análisis en unos minutos.'
        };
    }
}
