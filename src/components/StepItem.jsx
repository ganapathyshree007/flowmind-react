import styles from './StepItem.module.css';

export default function StepItem({ step, isLast }) {
  const { tool, title, desc, status } = step;

  const icon = status === 'done' ? '✓' : status === 'error' ? '✕' : '◌';

  return (
    <div className={`${styles.item} ${status === 'thinking' ? styles.active : ''}`}>
      <div className={styles.timeline}>
        <div className={`${styles.icon} ${styles[status]}`}>{icon}</div>
        {!isLast && <div className={styles.line} />}
      </div>
      <div className={styles.body}>
        <div className={styles.tool}>{tool}()</div>
        <div className={styles.title}>
          {title}
          {status === 'thinking' && <span className={styles.cursor} />}
        </div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
}
