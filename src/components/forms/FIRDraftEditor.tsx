"use client";

import { useState, useRef } from "react";
import { IncidentAnalysis, LegalSection } from "@/lib/types";
import styles from "./FIRDraftEditor.module.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface FIRDraftEditorProps {
    initialAnalysis: IncidentAnalysis;
    initialFirDraft?: string;
}

export default function FIRDraftEditor({ initialAnalysis, initialFirDraft = "" }: FIRDraftEditorProps) {
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [firText, setFirText] = useState(initialFirDraft);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newSection, setNewSection] = useState<Partial<LegalSection>>({});
    const printRef = useRef<HTMLDivElement>(null);

    const handleRemoveSection = (index: number) => {
        const updated = { ...analysis };
        updated.sections.splice(index, 1);
        setAnalysis(updated);
    };

    const handleAddSection = () => {
        if (newSection.section && newSection.law && newSection.title) {
            setAnalysis({
                ...analysis,
                sections: [
                    ...analysis.sections,
                    {
                        section: newSection.section,
                        law: newSection.law as "IPC" | "BNS",
                        title: newSection.title,
                        punishment: newSection.punishment || "N/A"
                    }
                ]
            });
            setNewSection({});
        } else {
            alert("Please fill Section, Law, and Title");
        }
    };

    const handleExportPDF = async () => {
        if (!printRef.current) return;

        try {
            const canvas = await html2canvas(printRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("FIR_Draft_NyayaSetu.pdf");
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Could not generate PDF");
        }
    };

    const handleGenerateFIR = async () => {
        if (!analysis.id) return alert("Save the case first!");
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/incidents/${analysis.id}/draft-fir`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setFirText(data.firDraft);
            } else {
                const err = await res.json();
                alert(`Failed to generate FIR: ${err.error || res.statusText}`);
            }
        } catch (e) {
            console.error(e);
            alert("Error generating FIR");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!analysis.id) {
            alert("Error: No Incident ID found. Cannot save.");
            return;
        }

        try {
            const res = await fetch("/api/incidents", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: analysis.id,
                    analysis: analysis,
                    firDraft: firText,
                    status: "DRAFT_SAVED"
                })
            });

            if (res.ok) alert("Draft updated successfully in Database!");
            else alert("Failed to save draft.");
        } catch {
            alert("Error saving draft.");
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h3>📋 FIR Draft Assistant</h3>
                <span className={`${styles.badge} ${styles[analysis.confidence_score.toLowerCase()]}`}>
                    Confidence: {analysis.confidence_score}
                </span>
            </div>

            {/* Printable Area */}
            <div ref={printRef} className={styles.printArea}>
                {/* Summary Review */}
                <div className={styles.panel}>
                    <h4>Incident Summary (Editable)</h4>
                    <textarea
                        className={styles.summaryEdit}
                        value={analysis.summary}
                        onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })}
                    />
                </div>

                {/* Sections Editor */}
                <div className={styles.panel}>
                    <h4>Legal Sections Mapping</h4>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Section</th>
                                <th>Law</th>
                                <th>Title</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.sections.map((sec, idx) => (
                                <tr key={idx}>
                                    <td>{sec.section}</td>
                                    <td>{sec.law}</td>
                                    <td>{sec.title}</td>
                                    <td>
                                        <button onClick={() => handleRemoveSection(idx)} className={styles.deleteBtn}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Add New Row */}
                            <tr className={styles.editRow} data-html2canvas-ignore>
                                <td><input placeholder="Sec No." value={newSection.section || ''} onChange={e => setNewSection({ ...newSection, section: e.target.value })} /></td>
                                <td>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <select value={newSection.law || ''} onChange={e => setNewSection({ ...newSection, law: e.target.value as any })}>
                                        <option value="">Select Law</option>
                                        <option value="BNS">BNS</option>
                                        <option value="IPC">IPC</option>
                                    </select>
                                </td>
                                <td><input placeholder="Offence Title" value={newSection.title || ''} onChange={e => setNewSection({ ...newSection, title: e.target.value })} /></td>
                                <td>
                                    <button onClick={handleAddSection} className={styles.addBtn}>Add</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FIR Text Editor */}
                <div className={styles.panel}>
                    <div className={styles.sectionHeader}>
                        <h4>📝 Official FIR Text</h4>
                        <button
                            onClick={handleGenerateFIR}
                            disabled={isGenerating}
                            className={styles.generateBtn}
                        >
                            {isGenerating ? "Generating..." : "✨ Auto-Draft with AI"}
                        </button>
                    </div>
                    <textarea
                        className={styles.firTextarea}
                        value={firText}
                        onChange={(e) => setFirText(e.target.value)}
                        placeholder="Generated FIR text will appear here..."
                        rows={15}
                    />
                </div>
            </div>

            {/* Missing Elements Checklist */}
            {analysis.missing_facts.length > 0 && (
                <div className={styles.panel}>
                    <h4>⚠️ Missing Elements Checklist</h4>
                    <ul>
                        {analysis.missing_facts.map((fact, i) => (
                            <li key={i} className={styles.missingItem}>
                                <input type="checkbox" id={`missing-${i}`} />
                                <label htmlFor={`missing-${i}`}>{fact}</label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                    💾 Save Draft
                </button>
                <button className={styles.printBtn} onClick={handleExportPDF}>
                    🖨️ Export PDF
                </button>
            </div>
        </div>
    );
}
