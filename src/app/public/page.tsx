"use client";

import { useState } from "react";
import IncidentForm from "@/components/forms/IncidentForm";
import AnalysisResult from "@/components/display/AnalysisResult";
import { IncidentAnalysis } from "@/lib/types";
import styles from "./page.module.css";
import Link from "next/link";

export default function PublicPage() {
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lang, setLang] = useState<"en" | "hi">("en");

    const handleAnalyze = async (description: string) => {
        setIsLoading(true);
        setAnalysis(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, userType: "public" }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <Link href="/" className={styles.backLink}>←</Link>
                    <h1>NyayaSetu</h1>
                </div>
                <button
                    className={styles.langToggle}
                    onClick={() => setLang(l => l === "en" ? "hi" : "en")}
                >
                    {lang === "en" ? "🇮🇳 English" : "🇮🇳 हिंदी"}
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.intro}>
                    <h2>{lang === "en" ? "Incident Reporting Assistant" : "घटना रिपोर्टिंग सहायक"}</h2>
                    <p>
                        {lang === "en"
                            ? "Tell us what happened. Our AI will guide you on the legal sections and next steps."
                            : "कृपया हमें बताएं कि क्या हुआ। हमारी एआई आपको कानूनी धाराओं और अगले कदमों के बारे में मार्गदर्शन करेगी।"}
                    </p>
                </div>

                {!analysis ? (
                    <IncidentForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                ) : (
                    <div className={styles.resultContainer}>
                        <AnalysisResult analysis={analysis} />
                        <div className={styles.resetContainer}>
                            <button onClick={() => setAnalysis(null)} className={styles.resetBtn}>
                                Report Another Incident
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
