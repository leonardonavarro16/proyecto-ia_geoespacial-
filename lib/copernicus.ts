/**
 * Copernicus Data Space Ecosystem API Integration
 * 
 * This module handles authentication and data retrieval from Copernicus Sentinel satellites.
 * Requires OAuth2 credentials from https://dataspace.copernicus.eu/
 */

interface CopernicusCredentials {
  clientId: string;
  clientSecret: string;
}

interface AccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface SentinelProduct {
  id: string;
  name: string;
  date: string;
  cloudCoverage: number;
  thumbnail?: string;
}

/**
 * Get OAuth2 access token from Copernicus
 */
export async function getCopernicusToken(): Promise<string> {
  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Copernicus credentials not configured. Please set COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET in .env.local');
  }

  const tokenUrl = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Copernicus authentication failed: ${response.statusText}`);
  }

  const data: AccessToken = await response.json();
  return data.access_token;
}

/**
 * Search for Sentinel-2 images for a specific location
 * @param lat Latitude
 * @param lon Longitude
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 */
export async function searchSentinelImages(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<SentinelProduct[]> {
  try {
    const token = await getCopernicusToken();

    // Create a bounding box around the point (approximately 10km x 10km)
    const delta = 0.05; // ~5km in degrees
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

    const searchUrl = new URL('https://catalogue.dataspace.copernicus.eu/odata/v1/Products');
    searchUrl.searchParams.append('$filter', 
      `Collection/Name eq 'SENTINEL-2' and OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((${lon - delta} ${lat - delta},${lon + delta} ${lat - delta},${lon + delta} ${lat + delta},${lon - delta} ${lat + delta},${lon - delta} ${lat - delta}))') and ContentDate/Start gt ${startDate}T00:00:00.000Z and ContentDate/Start lt ${endDate}T23:59:59.999Z`);
    searchUrl.searchParams.append('$top', '10');
    searchUrl.searchParams.append('$orderby', 'ContentDate/Start desc');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Copernicus search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return data.value?.map((product: any) => ({
      id: product.Id,
      name: product.Name,
      date: product.ContentDate?.Start,
      cloudCoverage: product.CloudCover || 0,
      thumbnail: product.Assets?.Thumbnail?.href,
    })) || [];
  } catch (error) {
    console.error('Error searching Sentinel images:', error);
    throw error;
  }
}

/**
 * Get risk analysis based on Sentinel data
 * This is a simplified version - full implementation would analyze NDVI, NDWI, etc.
 */
export async function getCopernicusRiskAnalysis(lat: number, lon: number) {
  try {
    // Search for recent images (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const images = await searchSentinelImages(lat, lon, startDate, endDate);

    if (images.length === 0) {
      return {
        status: 'No recent satellite data available',
        lastUpdate: null,
        riskFactors: [],
      };
    }

    // Get the most recent image with low cloud coverage
    const bestImage = images
      .filter(img => img.cloudCoverage < 30)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      status: 'Satellite data available',
      lastUpdate: bestImage?.date || images[0].date,
      imagesFound: images.length,
      bestImage: bestImage?.name || images[0].name,
      cloudCoverage: bestImage?.cloudCoverage || images[0].cloudCoverage,
      thumbnail: bestImage?.thumbnail || images[0].thumbnail,
      riskFactors: [
        'Análisis de vegetación (NDVI) disponible',
        'Análisis de humedad del suelo (NDWI) disponible',
        'Detección de cambios en el terreno',
      ],
      note: 'Esta es una versión simplificada. El análisis completo requeriría descargar y procesar las imágenes.',
    };
  } catch (error: any) {
    // FALLBACK: Mock data for demonstration if credentials are missing
    if (!process.env.COPERNICUS_CLIENT_ID || !process.env.COPERNICUS_CLIENT_SECRET) {
        return {
          status: 'Modo Demo (Satélite Simulado)',
          lastUpdate: new Date().toISOString(),
          imagesFound: 12,
          bestImage: `S2B_MSIL2A_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8)}_DEMO`,
          cloudCoverage: 4.2,
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop', // Realistic Earth image
          riskFactors: [
            'Índice NDVI: 0.65 (Vegetación densa detectada)',
            'Índice NDWI: 0.12 (Humedad de suelo estable)',
            'Estabilidad de terreno verificada por radar',
          ],
          note: 'Configura COPERNICUS_CLIENT_ID en .env.local para datos reales de Sentinel-2.',
        };
    }

    return {
      status: 'Error accessing Copernicus',
      error: error.message,
      help: 'Verifica que las credenciales de Copernicus estén configuradas correctamente en .env.local',
    };
  }
}
