"use client";

import { IncidentAnalysis } from "@/lib/types";
import styles from "./AnalysisResult.module.css";

interface AnalysisResultProps {
    analysis: IncidentAnalysis;
    lang?: "en" | "hi";
    caseId?: string;
    onRegister?: () => void;
}

export default function AnalysisResult({ analysis, lang = "en", caseId, onRegister }: AnalysisResultProps) {
    const { classification, sections, guidance, summary, missing_facts } = analysis;

    const t = {
        summary: lang === "hi" ? "घटना सारांश (AI)" : "Incident Summary (AI Generated)",
        legal_map: lang === "hi" ? "कानूनी धाराएं (BNS / IPC)" : "Legal Sections Mapping",
        missing: lang === "hi" ? "⚠️ इन विवरणों की आवश्यकता है" : "⚠️ Missing Information",
        actions: lang === "hi" ? "सुझाव और कार्यवाही" : "Recommended Actions",
        visual: lang === "hi" ? "📸 दृश्य साक्ष्य विश्लेषण" : "📸 Visual Evidence Analysis",
        registered: lang === "hi" ? "✔️ घटना दर्ज की गई" : "✔️ Incident Registered"
    };

    // Procedure Steps
    const procedures = classification.cognizable
        ? [
            { title: "Report", desc: "Information to Police / FIR" },
            { title: "Investigation", desc: "Evidence Collection & Arrest" },
            { title: "Charge Sheet", desc: "Filing in Court" },
            { title: "Trial", desc: "Judicial Proceedings" },
            { title: "Judgment", desc: "Verdict & Sentence" }
        ]
        : [
            { title: "Complaint", desc: "Report to Magistrate/Police" },
            { title: "Inquiry", desc: "Preliminary Check" },
            { title: "Direction", desc: "Court orders investigation" },
            { title: "Trial", desc: "Summons & Evidence" },
            { title: "Judgment", desc: "Verdict" }
        ];

    return (
        <div className={styles.container}>
            {/* Registered Banner */}
            {caseId && (
                <div className={styles.registeredBanner}>
                    <h3>{t.registered}</h3>
                    <p>Case ID: <strong>{caseId}</strong></p>
                    <small>Save this ID to track status later.</small>
                </div>
            )}

            {/* Summary Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>📝 Incident Summary</h3>
                <p className={styles.text}>{summary}</p>
            </section>

            {/* Full Procedure Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>🚦 Standard Legal Procedure</h3>
                <div className={styles.procedureContainer}>
                    {procedures.map((step, idx) => (
                        <div key={idx} className={styles.step}>
                            <span className={styles.stepNumber}>{idx + 1}</span>
                            <div className={styles.stepTitle}>{step.title}</div>
                            <div className={styles.stepDesc}>{step.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Classification Cards */}
            <section className={styles.grid}>
                <div className={`${styles.card} ${classification.cognizable ? styles.cardDanger : styles.cardSafe} `}>
                    <h4>Cognizable</h4>
                    <p>{classification.cognizable ? "Yes (Police can investigate)" : "No"}</p>
                </div>
                <div className={`${styles.card} ${classification.fir_required ? styles.cardDanger : styles.cardNeutral} `}>
                    <h4>FIR Required</h4>
                    <p>{classification.fir_required ? "Yes" : "Optional / NCR"}</p>
                </div>
                <div className={styles.card}>
                    <h4>Type</h4>
                    <p>{classification.type}</p>
                </div>
            </section>

            {/* Legal Sections Table */}
            <section className={styles.section}>
                <h3 className={styles.heading}>⚖️ Applicable Legal Sections</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Section</th>
                                <th>Act</th>
                                <th>Offence</th>
                                <th>Punishment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.length > 0 ? (
                                sections.map((sec, i) => (
                                    <tr key={i}>
                                        <td className={styles.sectionCode}>Section {sec.section}</td>
                                        <td><span className={styles.badge}>{sec.law}</span></td>
                                        <td>{sec.title}</td>
                                        <td>{sec.punishment}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className={styles.empty}>No specific sections identified yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Visual Analysis Badge */}
            {
                analysis.visual_analysis && (
                    <div className={styles.visualAnalysis}>
                        <h3>{t.visual}</h3>
                        <p>{analysis.visual_analysis}</p>
                    </div>
                )
            }

            {/* Guidance */}
            <div className={styles.section}>
                <h3 className={styles.heading}>{t.actions}</h3>
                <ul className={styles.guidanceList}>
                    <li><strong>Immediate Reflection:</strong> {guidance.immediate_action}</li>
                    <li><strong>Evidence:</strong> {guidance.evidence_handling}</li>
                    <li><strong>Legal:</strong> {guidance.legal_steps}</li>
                </ul>
            </div>

            {/* Missing Facts Warning */}
            {
                missing_facts.length > 0 && (
                    <div className={styles.warningBox}>
                        <h4>{t.missing}</h4>
                        <ul>
                            {missing_facts.map((fact, index) => (
                                <li key={index}>{fact}</li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* Register Action */}
            {!caseId && onRegister && (
                <div className={styles.actionsSection}>
                    <button className={styles.registerBtn} onClick={onRegister}>
                        ✅ Proceed & Register Official Case
                    </button>
                </div>
            )}

            {/* Disclaimer */}
            <p className={styles.disclaimer}>
                * NyayaSetu provides legal assistance based on information supplied. Final authority rests with police officials and courts of law.
            </p>
        </div >
    );
}
