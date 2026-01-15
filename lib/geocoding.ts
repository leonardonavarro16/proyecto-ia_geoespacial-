export async function getCoordinates(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`,
    {
      headers: {
        'User-Agent': 'GeospatialAI-StudentProject/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Geocoding API Error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    return null;
  }

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    display_name: data[0].display_name,
  };
}

export async function searchSuggestions(query: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5`,
    {
      headers: {
        'User-Agent': 'GeospatialAI-StudentProject/1.0',
      },
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  return data.map((item: any) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display_name: item.display_name,
  }));
}
