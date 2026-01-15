
async function testAPIs() {
    console.log("Testing API Access...");

    
    try {
        const aqRes = await fetch('https://api.openaq.org/v2/locations?limit=1&country=ES');
        console.log("OpenAQ Status:", aqRes.status);
        if (aqRes.ok) console.log("✅ OpenAQ accessible");
    } catch (e) {
        console.log("❌ OpenAQ failed:", e.message);
    }

    
    try {

        const ignRes = await fetch('https://api-features.ign.es/inspire-nucleo/collections', {
            headers: { 'Accept': 'application/json' }
        });
        console.log("IGN Features Status:", ignRes.status);
        if (ignRes.ok) console.log("✅ IGN API Features accessible");
    } catch (e) {
        console.log("❌ IGN API Features failed:", e.message);
    }


}

testAPIs();
