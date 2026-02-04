import styles from './SuccessModal.module.css';

interface SuccessModalProps {
    caseId: string;
    onClose: () => void;
    lang?: 'en' | 'hi';
}

export default function SuccessModal({ caseId, onClose, lang = 'en' }: SuccessModalProps) {
    const translations = {
        title: lang === 'hi' ? '✅ सफलतापूर्वक दर्ज किया गया' : '✅ Successfully Submitted',
        message: lang === 'hi'
            ? 'आपकी घटना रिपोर्ट सफलतापूर्वक दर्ज की गई है।'
            : 'Your incident report has been successfully submitted.',
        caseIdLabel: lang === 'hi' ? 'केस आईडी:' : 'Case ID:',
        instructions: lang === 'hi'
            ? 'कृपया इस केस आईडी को सुरक्षित रखें। आप इसका उपयोग अपने आवेदन की स्थिति को ट्रैक करने के लिए कर सकते हैं।'
            : 'Please save this Case ID. You can use it to track the status of your application.',
        close: lang === 'hi' ? 'बंद करें' : 'Close'
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(caseId);
        alert(lang === 'hi' ? 'केस आईडी कॉपी की गई!' : 'Case ID copied!');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2>{translations.title}</h2>
                <p>{translations.message}</p>

                <div className={styles.caseIdBox}>
                    <label>{translations.caseIdLabel}</label>
                    <div className={styles.caseIdValue}>
                        <code>{caseId}</code>
                        <button onClick={copyToClipboard} className={styles.copyBtn}>
                            📋 Copy
                        </button>
                    </div>
                </div>

                {/* Judicial Roadmap Section */}
                <div className={styles.roadmapSection}>
                    <div className={styles.roadmapHeader}>
                        📜 Procedure Established by Law
                        <span className={styles.constRef}>Const. Art 21</span>
                    </div>

                    <div className={styles.timeline}>
                        <div className={styles.timelineStep}>
                            <div className={styles.timelineIcon}>1</div>
                            <div className={styles.timelineContent}>
                                <h4>Information Received (FIR)</h4>
                                <p>Recorded u/s 173 BNSS (ex-154 CrPC). Police initiates action or magistrate directs enquiry.</p>
                            </div>
                        </div>
                        <div className={styles.timelineStep}>
                            <div className={styles.timelineIcon}>2</div>
                            <div className={styles.timelineContent}>
                                <h4>Investigation</h4>
                                <p>Evidence collection, statement recording, and potential arrest as per BNS provisions.</p>
                            </div>
                        </div>
                        <div className={styles.timelineStep}>
                            <div className={styles.timelineIcon}>3</div>
                            <div className={styles.timelineContent}>
                                <h4>Magistrate Cognizance</h4>
                                <p>Report submitted to Judicial Magistrate u/s 190 BNSS upon investigation completion.</p>
                            </div>
                        </div>
                        <div className={styles.timelineStep}>
                            <div className={styles.timelineIcon}>4</div>
                            <div className={styles.timelineContent}>
                                <h4>Trial & Judgment</h4>
                                <p>Fair trial guarantees under Constitution followed by final verdict (Acquittal/Conviction).</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.legalRights}>
                        <strong>⚖️ Your Constitutional Rights:</strong>
                        You have the right to a free copy of the FIR and free legal aid (Article 39A) if eligible.
                    </div>
                </div>

                <button onClick={onClose} className={styles.closeBtn}>
                    {translations.close}
                </button>
            </div>
        </div>
    );
}
