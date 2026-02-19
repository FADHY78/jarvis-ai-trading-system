
import { GoogleGenAI, Modality } from "@google/genai";

// Module-level references so audio can be interrupted at any time
let activeAudioContext: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;

/**
 * Immediately stop any audio currently playing from JARVIS.
 */
export function stopJarvis() {
  // Stop Web Audio API source
  if (activeBufferSource) {
    try { activeBufferSource.onended = null; activeBufferSource.stop(); } catch (_) {}
    activeBufferSource = null;
  }
  if (activeAudioContext) {
    try { activeAudioContext.close(); } catch (_) {}
    activeAudioContext = null;
  }
  // Stop browser speech synthesis fallback
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Decodes a base64 string into a Uint8Array.
 * Optimized for processing raw PCM chunks from Gemini TTS.
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer for the Web Audio API.
 * Converts 16-bit signed integers to 32-bit floats.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Primary function to trigger JARVIS's vocal response system.
 * Uses Gemini 2.5 Flash Preview TTS for high-fidelity, expressive audio.
 * Falls back to browser TTS when offline.
 */
export async function speakJarvis(text: string, style: 'sophisticated' | 'alert' | 'encouraging' = 'sophisticated') {
  // Offline fallback: use browser's built-in speech synthesis
  if (!navigator.onLine) {
    return speakJarvisFallback(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // JARVIS Persona instruction to ensure character consistency and emotional nuance
    const emotionalPrompt = `
      System Protocol: Act as JARVIS. 
      Vocal Identity: Sophisticated, highly intelligent, slightly warm female AI.
      Style: ${style}.
      Instruction: Deliver the following update with appropriate emotional inflection. 
      Text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: emotionalPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Stop any previous audio before playing new one
      stopJarvis();

      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      activeAudioContext = outputAudioContext;

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1
      );

      const source = outputAudioContext.createBufferSource();
      activeBufferSource = source;
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);

      // Resolves when playback finishes OR is stopped externally
      return new Promise<boolean>((resolve) => {
        source.onended = () => {
          activeBufferSource = null;
          activeAudioContext = null;
          resolve(true);
        };
        source.start();
      });
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isOffline = !navigator.onLine || errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('internet');
    const isRateLimited = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate');
    if (isOffline) {
      console.warn('JARVIS: Offline — falling back to browser TTS');
      return speakJarvisFallback(text);
    }
    if (isRateLimited) {
      console.warn('JARVIS: Gemini TTS quota exceeded — falling back to browser TTS');
      return speakJarvisFallback(text);
    }
    console.error("Vocal synthesis subsystem failure:", error);
    // Fall back to browser TTS for any unhandled Gemini error
    return speakJarvisFallback(text);
  }
  return false;
}

/**
 * Browser built-in speech synthesis fallback (works offline).
 */
function speakJarvisFallback(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    // Prefer a female English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}
