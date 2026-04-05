import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, temperature = 0.2, response_format } = await req.json();
    
    // Use the secret key from environment if available, fallback to public for now (though not recommended)
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const groqPayload: any = {
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: temperature
    };

    if (response_format) {
      groqPayload.response_format = response_format;
    }

    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(groqPayload)
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
