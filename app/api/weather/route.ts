import { NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/weather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
  }

  try {
    const weather = await getWeatherData(lat, lon);
    return NextResponse.json(weather);
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
