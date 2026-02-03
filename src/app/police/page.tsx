"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import FIRDraftEditor from "@/components/forms/FIRDraftEditor";
import { IncidentAnalysis } from "@/lib/types";


export default function PolicePage() {
    const [view, setView] = useState<"dashboard" | "new-case" | "editor">("dashboard");
    const [description, setDescription] = useState("");
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [incidents, setIncidents] = useState<any[]>([]);



    // Fetch incidents on mount
    useEffect(() => {
        fetchIncidents();
    }, [view]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch("/api/incidents");
            if (res.ok) {
                const data = await res.json();
                setIncidents(data);
            }
        } catch (e) {
            console.error("Failed to fetch history");
        }
    };

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
            fetchIncidents(); // Refresh list
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
                        <div className={styles.headerRow}>
                            <h1>Dashboard</h1>
                            <p className={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <h3>Total Incidents</h3>
                                <p>{incidents.length}</p>
                                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑ Live Data</span>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Processed Today</h3>
                                <p>{incidents.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).length}</p>
                                <span className={`${styles.statTrend} ${styles.trendUp}`}>Today&apos;s Activity</span>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Pending Action</h3>
                                <p>{incidents.filter(i => i.status === 'PENDING').length}</p>
                                <span className={`${styles.statTrend} ${styles.trendDown}`}>Requires Attention</span>
                            </div>
                        </div>

                        <div className={styles.recentActivity}>
                            <div className={styles.sectionHeader}>
                                <h3>Recent Incident Reports</h3>
                                <button className={styles.viewBtn}>View All History</button>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Case ID</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Priority</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.length > 0 ? incidents.map((inc, i) => {
                                        let cat = "Unclassified";
                                        let priority = "Low";
                                        try {
                                            const analysis = JSON.parse(inc.analysis || '{}');
                                            cat = analysis.classification?.type || "General";
                                            // Mock priority if missing, or derive from logic
                                            priority = analysis.classification?.priority || (inc.status === 'PENDING' ? 'High' : 'Low');
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        } catch (e) { }

                                        return (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600 }}>{inc.id.split('-').slice(-2).join('-')}</td>
                                                <td>{cat}</td>
                                                <td title={inc.description}>
                                                    {inc.description.length > 40 ? inc.description.substring(0, 40) + '...' : inc.description}
                                                </td>
                                                <td><span className={styles[`priority${priority}`]}>{priority}</span></td>
                                                <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`${styles.tag} ${styles[`status${inc.status.charAt(0) + inc.status.slice(1).toLowerCase()}`]}`}>
                                                        {inc.status}
                                                    </span>
                                                </td>
                                                <td><button className={styles.viewBtn}>View</button></td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={7}>No incidents found.</td></tr>
                                    )}
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
