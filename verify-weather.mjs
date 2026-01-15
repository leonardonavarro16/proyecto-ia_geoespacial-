
async function testWeather() {
    const lat = 40.4168; // Madrid
    const lon = -3.7038;
    console.log(`Testing Weather for Lat: ${lat}, Lon: ${lon}...`);

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`Status ${res.status}`);
        
        const data = await res.json();
        const current = data.current;
        const units = data.current_units;

        console.log("✅ Weather Data Received:");
        console.log(`Temp: ${current.temperature_2m}${units.temperature_2m}`);
        console.log(`Wind: ${current.wind_speed_10m}${units.wind_speed_10m}`);
        console.log(`Precip: ${current.precipitation}${units.precipitation}`);
    } catch (e) {
        console.error("❌ Weather check failed:", e.message);
    }
}

testWeather();
