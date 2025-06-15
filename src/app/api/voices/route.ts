import { NextResponse } from 'next/server';

const defaultVoices = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'premade'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'premade'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'premade'
  },
  {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    category: 'premade'
  }
];

export async function GET() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Voices API Error:', response.status, errorText);
      // Fallback to default voices if API fails
      return NextResponse.json({
        voices: defaultVoices
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      voices: data.voices?.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
      })) || defaultVoices
    });
  } catch (error) {
    console.error('Voices Error:', error);
    // Fallback to default voices if there's an error
    return NextResponse.json({
      voices: defaultVoices
    });
  }
}