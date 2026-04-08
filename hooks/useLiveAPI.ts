import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type TranscriptMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
};

export function useLiveAPI(language: string, proficiency: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback state
  const nextPlayTimeRef = useRef<number>(0);
  const playbackContextRef = useRef<AudioContext | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setTranscripts([]);

    try {
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const playbackContext = new AudioContext({ sampleRate: 24000 });
      playbackContextRef.current = playbackContext;
      nextPlayTimeRef.current = playbackContext.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const systemInstruction = `You are a friendly and encouraging language learning partner. 
The user is practicing ${language} at a ${proficiency} level. 
Only speak in ${language}. 
Keep your responses concise, conversational, and natural. 
If the user makes a major mistake, gently correct them, but prioritize keeping the conversation flowing.`;

      let currentSession: any = null;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            source.connect(processor);
            processor.connect(audioContext.destination);
            
            processor.onaudioprocess = (e) => {
              if (!currentSession) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              currentSession.sendRealtimeInput({
                audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 0x7FFF;
              }
              
              if (playbackContextRef.current) {
                const audioBuffer = playbackContextRef.current.createBuffer(1, float32.length, 24000);
                audioBuffer.getChannelData(0).set(float32);
                const source = playbackContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(playbackContextRef.current.destination);
                
                const currentTime = playbackContextRef.current.currentTime;
                if (nextPlayTimeRef.current < currentTime) {
                  nextPlayTimeRef.current = currentTime;
                }
                source.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += audioBuffer.duration;
                
                source.onended = () => {
                  if (playbackContextRef.current && playbackContextRef.current.currentTime >= nextPlayTimeRef.current) {
                    setIsSpeaking(false);
                  }
                };
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              if (playbackContextRef.current) {
                playbackContextRef.current.close();
                const newPlaybackContext = new AudioContext({ sampleRate: 24000 });
                playbackContextRef.current = newPlaybackContext;
                nextPlayTimeRef.current = newPlaybackContext.currentTime;
                setIsSpeaking(false);
              }
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError(err.message || "An error occurred");
            disconnect();
          },
          onclose: () => {
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction,
        }
      });

      currentSession = await sessionPromise;
      sessionRef.current = currentSession;

    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
      disconnect();
    }
  }, [language, proficiency]);

  const disconnect = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
    if (sessionRef.current) {
      try {
        // @ts-ignore
        sessionRef.current.close?.();
      } catch (e) {}
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  }, []);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    transcripts,
    error,
    connect,
    disconnect
  };
}
