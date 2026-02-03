"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import FIRDraftEditor from "@/components/forms/FIRDraftEditor";
import { IncidentAnalysis } from "@/lib/types";
import Link from "next/link";

export default function PolicePage() {
    const [view, setView] = useState<"dashboard" | "new-case" | "editor">("dashboard");
    const [description, setDescription] = useState("");
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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
                                <p>1,248</p>
                                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑ 12% this week</span>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Processed Today</h3>
                                <p>14</p>
                                <span className={`${styles.statTrend} ${styles.trendUp}`}>↑ 4 from yesterday</span>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Pending Action</h3>
                                <p>8</p>
                                <span className={`${styles.statTrend} ${styles.trendDown}`}>↓ 2 resolved</span>
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
                                    {[
                                        { id: "CASE-2024-001", cat: "Theft", desc: "Phone snatching at CP Outer Circle", date: "2024-02-03", status: "PENDING", priority: "High" },
                                        { id: "CASE-2024-002", cat: "Cyber", desc: "Online payment fraud reporting", date: "2024-02-02", status: "DRAFTING", priority: "Medium" },
                                        { id: "CASE-2024-003", cat: "Assault", desc: "Physical altercation near Metro Station", date: "2024-02-02", status: "FILED", priority: "High" },
                                        { id: "CASE-2024-004", cat: "Lost", desc: "Lost wallet containing documents", date: "2024-02-01", status: "PROCESSING", priority: "Low" },
                                        { id: "CASE-2024-005", cat: "Theft", desc: "Bicycle theft from residential area", date: "2024-01-31", status: "FILED", priority: "Medium" },
                                    ].map((inc, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{inc.id}</td>
                                            <td>{inc.cat}</td>
                                            <td title={inc.desc}>{inc.desc}</td>
                                            <td><span className={styles[`priority${inc.priority}`]}>{inc.priority}</span></td>
                                            <td>{inc.date}</td>
                                            <td>
                                                <span className={`${styles.tag} ${styles[`status${inc.status.charAt(0) + inc.status.slice(1).toLowerCase()}`]}`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td><button className={styles.viewBtn}>View</button></td>
                                        </tr>
                                    ))}
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
