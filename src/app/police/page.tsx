"use client";

import { useState } from "react";
import styles from "./page.module.css";
import FIRDraftEditor from "@/components/forms/FIRDraftEditor";
import { IncidentAnalysis } from "@/lib/types";
import Link from "next/link";

export default function PolicePage() {
    const [view, setView] = useState<"dashboard" | "new-case" | "editor">("dashboard");
    const [description, setDescription] = useState("");
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!description) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, userType: "police" }),
            });
            const data = await res.json();
            setAnalysis(data);
            setView("editor");
        } catch (err) {
            alert("Analysis failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2>NyayaSetu</h2>
                    <span>Police Panel</span>
                </div>
                <nav className={styles.nav}>
                    <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>📊 Dashboard</button>
                    <button onClick={() => setView("new-case")} className={view === "new-case" ? styles.active : ""}>➕ New Case Report</button>
                    <button>📂 Case History</button>
                    <button>⚙️ Settings</button>
                </nav>
                <div className={styles.user}>
                    <div className={styles.avatar}>👮</div>
                    <div>
                        <p>Officer Sharma</p>
                        <small>PS: Connaught Place</small>
                    </div>
                </div>
            </aside>

            <main className={styles.main}>
                {view === "dashboard" && (
                    <div className={styles.dashboard}>
                        <h1>Dashboard</h1>
                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <h3>Pending FIRs</h3>
                                <p>12</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Processed Today</h3>
                                <p>5</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Court Dates</h3>
                                <p>3</p>
                            </div>
                        </div>

                        <div className={styles.recentActivity}>
                            <h3>Recent Incident Reports</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#INC-2024-001</td>
                                        <td>Oct 24, 2024</td>
                                        <td>Theft</td>
                                        <td><span className={styles.tag}>Drafting</span></td>
                                    </tr>
                                    <tr>
                                        <td>#INC-2024-002</td>
                                        <td>Oct 23, 2024</td>
                                        <td>Assault</td>
                                        <td><span className={styles.tagSuccess}>Filed</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === "new-case" && (
                    <div className={styles.newCase}>
                        <h1>New Incident Processing</h1>
                        <div className={styles.inputArea}>
                            <label>Incident Narration</label>
                            <textarea
                                rows={10}
                                placeholder="Enter detailed facts of the incident..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className={styles.uploadBox}>
                                📁 Upload Evidence (Audio/Video/Images) - [Mock]
                            </div>
                            <button
                                className={styles.analyzeBtn}
                                onClick={handleAnalyze}
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : "Analyze & Generate FIR Draft"}
                            </button>
                        </div>
                    </div>
                )}

                {view === "editor" && analysis && (
                    <div className={styles.editorView}>
                        <div className={styles.breadcrumb}>
                            <button onClick={() => setView("new-case")}>← Back</button>
                            <span>Drafting Mode</span>
                        </div>
                        <FIRDraftEditor initialAnalysis={analysis} />
                    </div>
                )}
            </main>
        </div>
    );
}
