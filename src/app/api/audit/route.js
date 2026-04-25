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

        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: "SYSTEM INSTRUCTION:\n" + systemPrompt + "\n\nUSER INPUT:\n" + userPrompt }]
            }],
            generationConfig: { 
                response_mime_type: "application/json",
                temperature: 0.7,
                maxOutputTokens: 4000
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ error: data.error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
