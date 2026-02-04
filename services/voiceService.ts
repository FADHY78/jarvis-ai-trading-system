
import { GoogleGenAI, Modality } from "@google/genai";

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
 */
export async function speakJarvis(text: string, style: 'sophisticated' | 'alert' | 'encouraging' = 'sophisticated') {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1
      );

      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
      
      return true;
    }
  } catch (error) {
    console.error("Vocal synthesis subsystem failure:", error);
    return false;
  }
  return false;
}
