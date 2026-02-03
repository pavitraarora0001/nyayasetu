"use client";

import { useState } from "react";
import styles from "./IncidentForm.module.css";

interface IncidentFormProps {
    onAnalyze: (description: string) => void;
    isLoading: boolean;
}

export default function IncidentForm({ onAnalyze, isLoading }: IncidentFormProps) {
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onAnalyze(description);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label htmlFor="incident" className={styles.label}>
                    Describe the Incident
                </label>
                <textarea
                    id="incident"
                    className={styles.textarea}
                    placeholder="e.g. Someone stole my purse at the station..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    disabled={isLoading}
                />
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={isLoading}
                    onClick={() => alert("Image upload is a pro feature (Coming Soon)")}
                >
                    📷 Upload Media
                </button>

                <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={isLoading || !description.trim()}
                >
                    {isLoading ? "Analyzing..." : "Analyze Incident"}
                </button>
            </div>
        </form>
    );
}
