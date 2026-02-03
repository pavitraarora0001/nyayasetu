"use client";

import { IncidentAnalysis } from "@/lib/types";
import styles from "./AnalysisResult.module.css";

interface AnalysisResultProps {
    analysis: IncidentAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
    const { classification, sections, guidance, summary, missing_facts } = analysis;

    return (
        <div className={styles.container}>
            {/* Summary Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>📝 Incident Summary</h3>
                <p className={styles.text}>{summary}</p>
            </section>

            {/* Classification Cards */}
            <section className={styles.grid}>
                <div className={`${styles.card} ${classification.cognizable ? styles.cardDanger : styles.cardSafe}`}>
                    <h4>Cognizable</h4>
                    <p>{classification.cognizable ? "Yes (Police can investigate)" : "No"}</p>
                </div>
                <div className={`${styles.card} ${classification.fir_required ? styles.cardDanger : styles.cardNeutral}`}>
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
                                <th>Law</th>
                                <th>Title</th>
                                <th>Punishment (Max)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.length > 0 ? (
                                sections.map((sec, idx) => (
                                    <tr key={idx}>
                                        <td className={styles.sectionCode}>{sec.section}</td>
                                        <td>{sec.law}</td>
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

            {/* Guidance */}
            <section className={styles.section}>
                <h3 className={styles.heading}>🧭 How to Proceed</h3>
                <ul className={styles.guidanceList}>
                    <li><strong>Immediate Action:</strong> {guidance.immediate_action}</li>
                    <li><strong>Evidence:</strong> {guidance.evidence_handling}</li>
                    <li><strong>Legal Steps:</strong> {guidance.legal_steps}</li>
                </ul>
            </section>

            {/* Missing Facts Warning */}
            {missing_facts.length > 0 && (
                <div className={styles.warningBox}>
                    <h4>⚠️ Missing Information</h4>
                    <p>To improve accuracy, please provide: {missing_facts.join(", ")}</p>
                </div>
            )}

            {/* Disclaimer */}
            <p className={styles.disclaimer}>
                * NyayaSetu provides legal assistance based on information supplied. Final authority rests with police officials and courts of law.
            </p>
        </div>
    );
}
