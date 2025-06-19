import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Prepare messages for OpenAI Chat API
    const messages = [
      {
        role: 'system',
        content: 'あなたは親しみやすい日本語AIアシスタントです。ユーザーとの会話を楽しく、自然に行ってください。短めで分かりやすい回答を心がけてください。'
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to get response from AI', 
        details: errorData.error?.message || 'Unknown error'
      }, { status: response.status });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'すみません、うまく回答できませんでした。';

    return NextResponse.json({ 
      response: aiResponse,
      updatedHistory: [...history, 
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process chat request', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}