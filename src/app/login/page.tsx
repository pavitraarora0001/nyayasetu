"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === "officer" && password === "jaihind") {
            // Mock Auth Success
            localStorage.setItem("nyayasetu_auth", "true");
            // document.cookie = "auth=true; path=/"; // Optional: for middleware
            router.push("/police");
        } else {
            setError("Invalid Credentials. Try officer / jaihind");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>🏛️</h1>
                    <h2>NyayaSetu</h2>
                    <p>Police Official Access</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.group}>
                        <label>Officer ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter ID"
                            required
                        />
                    </div>

                    <div className={styles.group}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.loginBtn}>Login to Panel</button>
                </form>

                <div className={styles.footer}>
                    <Link href="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
