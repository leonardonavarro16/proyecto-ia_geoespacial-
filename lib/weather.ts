export async function getWeatherData(lat: number | string, lon: number | string) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`
  );

  if (!res.ok) {
    throw new Error(`Weather API Error: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;
  
  if (!current) {
      throw new Error("No current weather data received");
  }

  return {
    temp: `${current.temperature_2m}${data.current_units.temperature_2m}`,
    raw_temp: current.temperature_2m,
    wind: `${current.wind_speed_10m}${data.current_units.wind_speed_10m}`,
    precip: `${current.precipitation}${data.current_units.precipitation}`,
    source: 'Open-Meteo',
    rawData: data
  };
}

export async function getAirQuality(lat: number | string, lon: number | string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return { error: 'OWM API Key missing' };

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await res.json();
    const list = data.list?.[0];
    if (!list) return null;

    const components = list.components;
    const aqi = list.main.aqi; // 1-5 (Good to Very Poor)
    const labels = ['Muy Bueno', 'Bueno', 'Moderado', 'Pobre', 'Muy Pobre'];

    return {
      aqi,
      label: labels[aqi - 1] || 'Desconocido',
      components: {
        co: `${components.co} μg/m3`,
        no2: `${components.no2} μg/m3`,
        o3: `${components.o3} μg/m3`,
        pm2_5: `${components.pm2_5} μg/m3`,
        pm10: `${components.pm10} μg/m3`
      },
      source: 'OpenWeatherMap Air Pollution'
    };
  } catch (e) {
    return { error: 'Failed to fetch air quality' };
  }
}
