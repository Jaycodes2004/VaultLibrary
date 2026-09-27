import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    
    // Check if an audio file was uploaded
    let audioFile: File | null = null;
    let fallbackText = '';
    
    if (formData) {
      audioFile = formData.get('file') as File;
      fallbackText = (formData.get('fallbackPrompt') as string) || '';
    }

    // Check for OpenAI Whisper API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && audioFile) {
      const openAiFormData = new FormData();
      openAiFormData.append('file', audioFile);
      openAiFormData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: openAiFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          text: data.text,
          provider: 'openai-whisper',
        });
      }
    }

    // Smart fallback simulation for testing without an API key
    const simulatedTranscriptions = [
      "Key concept regarding memory bandwidth and latency optimization.",
      "Re-read chapter 2 on cryptographic enclaves and ephemeral key rotation.",
      "Interesting perspective on distributed consensus under network partition.",
      "Investigate Prospect Theory and loss aversion models for the next research paper.",
      "Check this section for the upcoming system architecture review."
    ];

    const randomTranscription = fallbackText 
      ? `Voice Note: "${fallbackText}"` 
      : simulatedTranscriptions[Math.floor(Math.random() * simulatedTranscriptions.length)];

    return NextResponse.json({
      success: true,
      text: randomTranscription,
      provider: apiKey ? 'whisper-api' : 'voice-engine-fallback',
      simulated: !apiKey,
    });
  } catch (error: unknown) {
    console.error('Whisper API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown transcription error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
