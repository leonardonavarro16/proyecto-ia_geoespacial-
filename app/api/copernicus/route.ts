import { NextResponse } from 'next/server';
import { getCopernicusRiskAnalysis } from '@/lib/copernicus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
  }

  try {
    const riskData = await getCopernicusRiskAnalysis(parseFloat(lat), parseFloat(lon));
    return NextResponse.json(riskData);
  } catch (error: any) {
    console.error('Copernicus API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Copernicus data',
      message: error.message,
    }, { status: 500 });
  }
}
