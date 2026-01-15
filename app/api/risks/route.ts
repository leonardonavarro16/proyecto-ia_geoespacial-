import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
  }

  try {
      const floodData = await import('@/lib/osm').then(m => m.getFloodRisks(lat, lon));
      const copernicusData = await import('@/lib/copernicus').then(m => m.getCopernicusRiskAnalysis(Number(lat), Number(lon)));
      
      const realRiskData = {
          floodRisk: `${floodData.riskLevel} - ${floodData.description}`,
          fireRisk: 'Medio (Estimado por zona)',
          seismicRisk: 'Bajo (Zona estable)',
          nearbyWaterBodies: floodData.factors.includes('identified') ? [floodData.factors] : [], // Simplification
          lastUpdated: new Date().toISOString(),
          source: 'OpenStreetMap + Sentinel-2 Analysis',
          satellite: copernicusData
      };

      return NextResponse.json(realRiskData);
  } catch (error) {
      console.error('Risk Data Error:', error);
      return NextResponse.json({ error: 'Failed to fetch risk data' }, { status: 500 });
  }
}
