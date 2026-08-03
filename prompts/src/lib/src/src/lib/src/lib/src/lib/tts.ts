import { supabaseAdmin } from './supabase';

export async function generateAndStoreAudio(script: string, eventId: string): Promise<string> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const ttsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.4, similarity_boost: 0.8 }
      })
    }
  );

  if (!ttsRes.ok) {
    const errText = await ttsRes.text();
    throw new Error(`ElevenLabs request failed: ${ttsRes.status} ${errText}`);
  }

  const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
  const fileName = `reveals/${eventId}.mp3`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('audio')
    .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from('audio').getPublicUrl(fileName);
  return data.publicUrl;
}
