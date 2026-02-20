
// Module-level references so audio can be interrupted at any time
let activeAudioContext: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;

/**
 * Immediately stop any audio currently playing from JARVIS.
 */
export function stopJarvis() {
  if (activeBufferSource) {
    try { activeBufferSource.onended = null; activeBufferSource.stop(); } catch (_) {}
    activeBufferSource = null;
  }
  if (activeAudioContext) {
    try { activeAudioContext.close(); } catch (_) {}
    activeAudioContext = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Decodes a base64 string into a Uint8Array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw 16-bit PCM data into an AudioBuffer.
 */
async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + ch] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Plays raw base64 PCM audio returned by the /api/tts proxy.
 */
async function playBase64Audio(base64: string): Promise<boolean> {
  stopJarvis();
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  activeAudioContext = ctx;
  const audioBuffer = await decodePCM(decode(base64), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  activeBufferSource = source;
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  return new Promise<boolean>((resolve) => {
    source.onended = () => {
      activeBufferSource = null;
      activeAudioContext = null;
      resolve(true);
    };
    source.start();
  });
}

/**
 * Primary JARVIS vocal function.
 * Calls the /api/tts server proxy so the Gemini API key is NEVER exposed to the browser.
 * Voice: Aoede — calm, confident, convincing female.
 * Only falls back to browser TTS when the device is fully offline.
 */
export async function speakJarvis(
  text: string,
  style: 'sophisticated' | 'alert' | 'encouraging' = 'sophisticated',
): Promise<boolean> {
  // Hard offline: browser TTS only
  if (!navigator.onLine) {
    return speakJarvisFallback(text);
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string };
      console.error(`JARVIS TTS proxy error ${res.status}:`, err.error || '');
      // Do NOT fall back — surface the error so the API key issue is visible
      return false;
    }

    const { audio } = await res.json() as { audio: string };
    if (audio) {
      return playBase64Audio(audio);
    }
    return false;
  } catch (err) {
    console.error('JARVIS TTS fetch failed:', err);
    return false;
  }
}

/**
 * Browser built-in speech synthesis — offline fallback only.
 */
function speakJarvisFallback(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.90;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend  = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}
