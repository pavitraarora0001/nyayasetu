import { useState, useEffect, useCallback } from 'react';

export interface UseSpeechRecognitionProps {
    onResult: (transcript: string) => void;
    lang?: string;
}

export default function useSpeechRecognition({ onResult, lang = 'en-IN' }: UseSpeechRecognitionProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsSupported(true);
                const recog = new SpeechRecognition();
                recog.continuous = true;
                recog.interimResults = true;
                recog.lang = lang;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recog.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        onResult(finalTranscript);
                    }
                };

                recog.onend = () => {
                    setIsListening(false);
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recog.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                setRecognition(recog);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    return { isListening, isSupported, startListening, stopListening };
}
