const CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
    try {
        const body = await request.json();
        const { systemPrompt, userPrompt } = body;

        if (!systemPrompt || !userPrompt) {
            return new Response(JSON.stringify({ error: "Missing prompts" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Caching logic
        const cacheKey = Buffer.from(systemPrompt + userPrompt).toString('base64');
        const cached = CACHE.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log("Serving from cache...");
            return new Response(JSON.stringify(cached.data), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        // Correcting model to gemini-1.5-pro (v1 stable) for Pro plan users.
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: "SYSTEM INSTRUCTION:\n" + systemPrompt + "\n\nUSER INPUT:\n" + userPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096, // Optimized for response length
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            // Check for rate limit specifically
            if (data.error.code === 429) {
                return new Response(JSON.stringify({ error: "Kuota harian penuh atau limit tercapai. Silakan coba lagi nanti." }), {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return new Response(JSON.stringify({ error: data.error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Store in cache
        CACHE.set(cacheKey, {
            timestamp: Date.now(),
            data: data
        });

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
