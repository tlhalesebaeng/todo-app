import styles from './LabeledInput.module.css';

export default function LabeledInput({ labelText, type, onChange }) {
    return (
        <section className={styles.inputContainer}>
            <label htmlFor={labelText}>{labelText}</label>
            <input className={styles.input} name={labelText} type={type} onChange={onChange} />
        </section>
    );
}
