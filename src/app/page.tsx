import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.icon}>⚖️</span>
          <h1 className={styles.title}>NyayaSetu</h1>
        </div>
        <p className={styles.subtitle}>Bridge to Justice</p>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h2>Identify Legal Sections. Accelerate Justice.</h2>
          <p>Government-grade legal assistant for Citizens and Police.</p>
        </div>

        <div className={styles.roleSelection}>
          <Link href="/public" className={styles.roleCard}>
            <span className={styles.roleIcon}>👥</span>
            <h3>Public User</h3>
            <p>I need legal assistance for an incident.</p>
          </Link>

          <Link href="/police" className={styles.roleCard}>
            <span className={styles.roleIcon}>👮</span>
            <h3>Police Panel</h3>
            <p>Authorized officer login for Case/FIR drafting.</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>NyayaSetu Alpha • AI-Assisted Legal Framework • IPC/BNS/CrPC Supported</p>
      </footer>
    </div>
  );
}
