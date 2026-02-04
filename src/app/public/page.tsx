"use client";

import { useState } from "react";
import IncidentForm from "@/components/forms/IncidentForm";
import AnalysisResult from "@/components/display/AnalysisResult";
import SuccessModal from "@/components/ui/SuccessModal";
import { IncidentAnalysis } from "@/lib/types";
import styles from "./page.module.css";
import Link from "next/link";

export default function PublicPage() {
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lang, setLang] = useState<"en" | "hi">("en");
    const [trackId, setTrackId] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [statusResult, setStatusResult] = useState<any>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedCaseId, setSubmittedCaseId] = useState("");
    const [currentIncident, setCurrentIncident] = useState<{ description: string, image?: string } | null>(null);

    const handleAnalyze = async (description: string, image?: string) => {
        setIsLoading(true);
        setAnalysis(null);
        setCurrentIncident({ description, image }); // Save for registration

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, userType: "public", image }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setAnalysis(data);

            // Show success modal with case ID (Analysis Only - No ID yet)
            setSubmittedCaseId("");
        } catch (error) {
            console.error("Analysis failed", error);
            alert(lang === "hi" ? "कुछ गलत हो गया। कृपया पुन: प्रयास करें।" : "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!analysis) return;

        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: currentIncident?.description || analysis.summary || "Reported Incident",
                    type: analysis.classification?.type,
                    imageUrl: currentIncident?.image || null,
                    // Pass full analysis for backend processing
                    analysis: analysis
                })
            });

            if (!res.ok) {
                throw new Error("Registration failed");
            }

            const data = await res.json();
            setSubmittedCaseId(data.caseId || data.id);
            setShowSuccessModal(true);

        } catch (e) {
            console.error(e);
            alert("Registration failed");
        }
    };

    const handleTrack = async () => {
        if (!trackId) return;
        setIsTracking(true);
        setStatusResult(null);
        try {
            // Use the individual incident API endpoint
            const res = await fetch(`/api/incidents/${trackId.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setStatusResult(data);
            } else if (res.status === 404) {
                setStatusResult("NOT_FOUND");
            } else {
                throw new Error("Tracking failed");
            }
        } catch (e) {
            console.error(e);
            alert(lang === "hi" ? "ट्रैकिंग विफल रही" : "Tracking failed");
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
                        <AnalysisResult
                            analysis={analysis}
                            lang={lang}
                            caseId={showSuccessModal ? submittedCaseId : undefined} // Only show ID after success modal (or we logic it differently)
                            // Actually, let's keep caseId hidden until they register? 
                            // OR just pass onRegister to show the button.
                            onRegister={handleRegister}
                        />
                        <div className={styles.resetContainer}>
                            <button onClick={() => setAnalysis(null)} className={styles.resetBtn}>
                                {lang === "hi" ? "एक और घटना रिपोर्ट करें" : "Report Another Incident"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal
                    caseId={submittedCaseId}
                    onClose={() => setShowSuccessModal(false)}
                    lang={lang}
                />
            )}
        </div>
    );
}
