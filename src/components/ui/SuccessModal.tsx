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

                <p className={styles.instructions}>{translations.instructions}</p>

                <button onClick={onClose} className={styles.closeBtn}>
                    {translations.close}
                </button>
            </div>
        </div>
    );
}
