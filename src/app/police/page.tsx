"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import FIRDraftEditor from "@/components/forms/FIRDraftEditor";
import { IncidentAnalysis } from "@/lib/types";


export default function PolicePage() {
    const [view, setView] = useState<"dashboard" | "new-case" | "editor" | "case-detail" | "case-history" | "settings">("dashboard");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [incidents, setIncidents] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [legalRefUri, setLegalRefUri] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleView = (incident: any) => {
        setSelectedIncident(incident);
        setView("case-detail");
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await fetch(`/api/incidents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    // Assign current officer details on acceptance
                    ...(newStatus === 'ACCEPTED' && {
                        officerId: 'OFF-8821', // Mock ID
                        officerName: 'Officer Sharma',
                        policeStation: 'Connaught Place'
                    })
                })
            });
            fetchIncidents(); // Refresh
            if (view === 'case-detail') setView('dashboard');
        } catch {
            console.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) return;

        try {
            await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
            fetchIncidents();
        } catch {
            alert("Failed to delete case");
        }
    };



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
        } catch {
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
                body: JSON.stringify({
                    description,
                    userType: "police",
                    image,
                    knowledgeBaseUri: legalRefUri // Pass the reference if active
                }),
            });
            const data = await res.json();
            setAnalysis(data);
            setView("editor");
            fetchIncidents(); // Refresh list
        } catch {
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
                    <button onClick={() => setView("case-history")} className={view === "case-history" ? styles.active : ""}>📂 Case History</button>
                    <button onClick={() => setView("settings")} className={view === "settings" ? styles.active : ""}>⚙️ Settings</button>
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
                                        } catch { }

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
                                                <td>
                                                    <button className={styles.viewBtn} onClick={() => handleView(inc)}>View</button>
                                                    <button className={styles.btnDelete} onClick={() => handleDelete(inc.id)}>Delete</button>
                                                </td>
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
                                <label htmlFor="police-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                                    {image ? "✅ Evidence Uploaded" : "📁 Upload Evidence (Image)"}
                                </label>
                                <input
                                    id="police-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setImage(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    hidden
                                />
                                {image && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px' }} />
                                        <button onClick={(e) => { e.preventDefault(); setImage(null); }} style={{ marginLeft: '1rem', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                )}
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
                        <FIRDraftEditor initialAnalysis={analysis} incidentDescription={description} />
                    </div>
                )}

                {view === "case-detail" && selectedIncident && (
                    <div className={styles.detailView}>
                        <div className={styles.breadcrumb}>
                            <button onClick={() => setView("dashboard")}>← Back to Dashboard</button>
                            <span>Case Details / {selectedIncident.caseId || selectedIncident.id}</span>
                        </div>

                        <div className={styles.detailHeader}>
                            <div>
                                <h2>Case Report</h2>
                                <span className={`${styles.tag} ${styles[`status${selectedIncident.status.charAt(0) + selectedIncident.status.slice(1).toLowerCase()}`]}`}>
                                    {selectedIncident.status}
                                </span>
                            </div>
                            <div className={styles.detailActions}>
                                {selectedIncident.status === 'PENDING' && (
                                    <>
                                        <button className={styles.btnAccept} onClick={() => updateStatus(selectedIncident.id, 'ACCEPTED')}>✓ Accept & Investigate</button>
                                        <button className={styles.btnReject} onClick={() => updateStatus(selectedIncident.id, 'REJECTED')}>✕ Reject</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.detailSection}>
                            <h3>Incident Description</h3>
                            <div className={styles.detailContent}>
                                {selectedIncident.description}
                            </div>
                        </div>

                        <div className={styles.detailSection}>
                            <h3>AI Analysis Data</h3>
                            {(() => {
                                try {
                                    const analysisData = JSON.parse(selectedIncident.analysis || '{}');
                                    return (
                                        <div className={styles.detailContent}>
                                            <p><strong>Classification:</strong> {analysisData.classification?.type}</p>
                                            <p><strong>Priority:</strong> <span className={styles[`priority${analysisData.classification?.priority}`]}>{analysisData.classification?.priority}</span></p>
                                            <p><strong>Summary:</strong> {analysisData.summary}</p>
                                        </div>
                                    );
                                } catch { return <p>No analysis data.</p>; }
                            })()}
                        </div>

                        <div className={styles.detailSection}>
                            <h3>Evidence</h3>
                            <div className={styles.detailContent}>
                                {selectedIncident.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={selectedIncident.imageUrl} alt="Evidence" style={{ maxWidth: '100%', borderRadius: '0.5rem' }} />
                                ) : (
                                    <p>No media attached.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {view === "case-history" && (
                    <div className={styles.historyView}>
                        <div className={styles.historyHeader}>
                            <h1>Case History</h1>
                            <input type="text" placeholder="Search cases..." className={styles.searchBox} />
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
                                {incidents.map((inc, i) => {
                                    let cat = "Unclassified";
                                    let priority = "Low";
                                    try {
                                        const analysis = JSON.parse(inc.analysis || '{}');
                                        cat = analysis.classification?.type || "General";
                                        priority = analysis.classification?.priority || (inc.status === 'PENDING' ? 'High' : 'Low');
                                    } catch { }

                                    return (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{inc.id.split('-').slice(-2).join('-')}</td>
                                            <td>{cat}</td>
                                            <td title={inc.description}>
                                                {inc.description.length > 50 ? inc.description.substring(0, 50) + '...' : inc.description}
                                            </td>
                                            <td><span className={styles[`priority${priority}`]}>{priority}</span></td>
                                            <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`${styles.tag} ${styles[`status${inc.status.charAt(0) + inc.status.slice(1).toLowerCase()}`]}`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className={styles.viewBtn} onClick={() => handleView(inc)}>View</button>
                                                <button className={styles.btnDelete} onClick={() => handleDelete(inc.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === "settings" && (
                    <div className={styles.settingsView}>
                        <h1>Settings</h1>
                        <div className={styles.settingsCard}>
                            <h3>Profile Settings</h3>
                            <div className={styles.formGroup}>
                                <label>Officer Name</label>
                                <input type="text" defaultValue="Officer Sharma" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Badge Number</label>
                                <input type="text" defaultValue="DL-8821" readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Police Station</label>
                                <select defaultValue="cp">
                                    <option value="cp">Connaught Place</option>
                                    <option value="hk">Hauz Khas</option>
                                    <option value="k">Karol Bagh</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.settingsCard}>
                            <h3>Preferences</h3>
                            <div className={styles.toggle}>
                                <span>Email Notifications for New Cases</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div className={styles.toggle}>
                                <span>Dark Mode</span>
                                <input type="checkbox" />
                            </div>
                            <div className={styles.toggle}>
                                <span>AI Analysis Sensitivity</span>
                                <select style={{ padding: '0.25rem', width: 'auto' }}>
                                    <option>Standard</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.settingsCard}>
                            <h3>📚 Legal Knowledge Base</h3>
                            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1rem' }}>
                                Upload a custom legal document (PDF) to ground the AI analysis in specific laws (e.g., Constitution, Standing Orders).
                            </p>
                            <label className={styles.uploadBtnLabel} style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#3B82F6', color: 'white', borderRadius: '0.375rem', cursor: 'pointer' }}>
                                {legalRefUri ? "✅ Reference Active (Constitution.pdf)" : "📤 Upload Legal PDF (Constitution/BNS)"}
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    hidden
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append('file', file);

                                        try {
                                            alert("Uploading Legal Reference... Please wait.");
                                            const res = await fetch('/api/upload-reference', { method: 'POST', body: formData });
                                            const data = await res.json();
                                            if (data.success) {
                                                setLegalRefUri(data.fileUri);
                                                alert("Legal Reference Active! AI will now cite this document.");
                                            } else {
                                                alert("Upload failed.");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Upload failed.");
                                        }
                                    }}
                                />
                            </label>
                            {legalRefUri && (
                                <button
                                    onClick={() => setLegalRefUri(null)}
                                    style={{ marginLeft: '1rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Remove Reference
                                </button>
                            )}
                        </div>

                        <button className={styles.saveBtn} onClick={() => alert('Settings Saved!')}>Save Changes</button>
                    </div>
                )}
            </main>
        </div>
    );
}
