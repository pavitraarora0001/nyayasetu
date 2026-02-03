"use client";

import { useState } from "react";
import styles from "./IncidentForm.module.css";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface IncidentFormProps {
    onAnalyze: (description: string, image?: string) => void;
    isLoading: boolean;
    lang?: "en" | "hi";
}

export default function IncidentForm({ onAnalyze, isLoading, lang = "en" }: IncidentFormProps) {
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);

    const translations = {
        placeholder: lang === "hi"
            ? "घटना का विस्तार से वर्णन करें... (उदाहरण: 'शाम 8 बजे मेट्रो स्टेशन के पास मेरा फोन छीन लिया गया')"
            : "Describe the incident in detail... (e.g., 'My phone was snatched at 8 PM near the metro station')",
        mic: lang === "hi" ? "बोलें" : "Speak",
        listening: lang === "hi" ? "सुन रहा हूँ..." : "Listening...",
        evidence: lang === "hi" ? "📷 सबूत जोड़ें" : "📷 Add Evidence",
        analyze: lang === "hi" ? "विश्लेषण करें" : "Analyze Incident",
        analyzing: lang === "hi" ? "विश्लेषण हो रहा है..." : "Analyzing..."
    };

    const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
        onResult: (text) => setDescription((prev) => prev + " " + text),
        lang: lang === "hi" ? "hi-IN" : "en-IN"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onAnalyze(description, image || undefined);
        }
    };

    const handleMicClick = () => {
        if (isListening) stopListening();
        else startListening();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.textareaWrapper}>
                <textarea
                    className={styles.textarea}
                    placeholder={translations.placeholder}
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                />
                {isSupported && (
                    <button
                        type="button"
                        className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
                        onClick={handleMicClick}
                        title="Click to Speak"
                    >
                        {isListening ? `🔴 ${translations.listening}` : `🎙️ ${translations.mic}`}
                    </button>
                )}
            </div>

            {image && (
                <div className={styles.imagePreview}>
                    <img src={image} alt="Evidence Preview" />
                    <button type="button" onClick={() => setImage(null)}>✕</button>
                </div>
            )}

            <div className={styles.actions}>
                <div className={styles.fileUpload}>
                    <label htmlFor="file-upload" className={styles.attachmentBtn}>
                        {translations.evidence}
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        hidden
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading || !description.trim()}
                >
                    {isLoading ? translations.analyzing : translations.analyze}
                </button>
            </div>
        </form>
    );
}
