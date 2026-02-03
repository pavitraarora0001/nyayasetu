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
    const [trackId, setTrackId] = useState("");
    const [statusResult, setStatusResult] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);

    const handleAnalyze = async (description: string, image?: string) => {
        setIsLoading(true);
        setAnalysis(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, userType: "public", image }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrack = async () => {
        if (!trackId) return;
        setIsTracking(true);
        setStatusResult(null);
        try {
            const res = await fetch("/api/incidents");
            if (res.ok) {
                const data = await res.json();
                // Client-side filtering for demo since API returns all
                // In real app, we'd have /api/incidents/[id]
                const found = data.find((i: any) => i.id === trackId.trim());
                setStatusResult(found || "NOT_FOUND");
            }
        } catch (e) {
            alert("Tracking failed");
        } finally {
            setIsTracking(false);
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

                {/* Track Status Section */}
                <div className={styles.trackSection}>
                    <h3>{lang === "en" ? "📍 Track Your Application" : "📍 अपना आवेदन ट्रैक करें"}</h3>
                    <input
                        type="text"
                        placeholder={lang === "en" ? "Enter Case ID (e.g., demo-id-123456)" : "केस आईडी दर्ज करें"}
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        className={styles.trackInput}
                    />
                    <button onClick={handleTrack} disabled={isTracking} className={styles.trackBtn}>
                        {isTracking ? "Checking..." : (lang === "en" ? "Track Status" : "स्थिति ट्रैक करें")}
                    </button>

                    {statusResult && (
                        <div className={styles.statusResult}>
                            {statusResult === "NOT_FOUND" ? (
                                <p style={{ color: 'red' }}>❌ {lang === "en" ? "Case not found" : "केस नहीं मिला"}</p>
                            ) : (
                                <div>
                                    <p><strong>Status:</strong> <span className={styles.statusBadge}>{statusResult.status}</span></p>
                                    <p><strong>Description:</strong> {statusResult.description.substring(0, 60)}...</p>
                                    <p><small>Last Updated: {new Date(statusResult.updatedAt).toLocaleDateString()}</small></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!analysis ? (

                    <IncidentForm onAnalyze={handleAnalyze} isLoading={isLoading} lang={lang} />
                ) : (
                    <div className={styles.resultContainer}>
                        <AnalysisResult analysis={analysis} lang={lang} />
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
