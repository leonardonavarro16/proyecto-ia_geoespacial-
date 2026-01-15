import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 });
  }

  try {
    const infraData = await import('@/lib/osm').then(m => m.getUrbanInfrastructure(lat, lon));
    
    // Transform the string details back to object if needed or just pass them
    // My lib returns strings like "- type: name". Let's parse or just use as is in a wrapper.
    // For now, let's adapt the array to the string format or vice versa.
    // The previous mock had objects. Let's create objects from the strings in lib or just return the strings.
    // Given I control the lib, I could have returned objects, but strings are fine for Chat.
    // For this API which might be used by UI, objects are better.
    // But since I don't want to change the lib signature that Chat uses (which expects text-friendly), 
    // I will parse the strings or just put them in a "details" field.
    
    // Simplest: just pass the real data in `infrastructure` property, adapting to {type, name}.
    // Lib strings: "- type: name"
    
    const realInfrastructure = infraData.details ? infraData.details.map((s: string) => {
        const parts = s.replace('- ', '').split(': ');
        return { type: parts[0], name: parts[1] || 'Ubicación' };
    }) : [];

    const responseData = {
      classification: 'Suelo Urbano (Estimado)', 
      usage: 'Mixto (Residencial/Servicios)',
      infrastructure: realInfrastructure.length > 0 ? realInfrastructure : [{ type: 'Info', name: 'Sin datos relevantes cercanos' }],
      regulations: 'Consultar planeamiento municipal',
      source: 'OpenStreetMap'
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Urban Data Error:', error);
     return NextResponse.json({ error: 'Failed to fetch urban data' }, { status: 500 });
  }
}
