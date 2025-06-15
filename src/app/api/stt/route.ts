import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Create FormData for ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('file', audioFile);
    elevenLabsFormData.append('model_id', 'scribe_v1');
    elevenLabsFormData.append('language_code', 'ja');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT API Error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to convert speech to text', 
        details: `ElevenLabs API error: ${response.status} - ${errorText}`
      }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text || '',
      alignment: result.alignment || null
    });
  } catch (error) {
    console.error('STT Error:', error);
    return NextResponse.json({ 
      error: 'Failed to convert speech to text', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}