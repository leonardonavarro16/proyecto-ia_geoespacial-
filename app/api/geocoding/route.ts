import { NextResponse } from 'next/server';
import { getCoordinates } from '@/lib/geocoding';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const coords = await getCoordinates(address);

    if (!coords) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({
        lat: parseFloat(coords.lat),
        lon: parseFloat(coords.lon),
        display_name: coords.display_name,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coordinates' },
      { status: 500 }
    );
  }
}
