import { useEffect, useState } from 'react';
import styles from './ScoreCard.module.css';

function AnimNum({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const t = setInterval(() => {
      cur++;
      setVal(cur);
      if (cur >= target) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}{suffix}</>;
}

export default function ScoreCard({ score }) {
  if (!score) return null;
  const appsStr = score.apps.join(' · ');
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>✅</span>
        <div>
          <div className={styles.title}>Workflow Complete</div>
          <div className={styles.sub}>Apps updated: {appsStr}</div>
        </div>
      </div>
      <div className={styles.grid}>
        <div className={styles.item}>
          <div className={styles.num}><AnimNum target={score.steps} /></div>
          <div className={styles.label}>Steps Done</div>
        </div>
        <div className={styles.item}>
          <div className={styles.num}><AnimNum target={score.apps.length} /></div>
          <div className={styles.label}>Apps Updated</div>
        </div>
        <div className={styles.item}>
          <div className={styles.num}><AnimNum target={score.saved} suffix="m" /></div>
          <div className={styles.label}>Time Saved</div>
        </div>
        <div className={styles.item}>
          <div className={styles.num}>{score.elapsed}s</div>
          <div className={styles.label}>AI Time</div>
        </div>
      </div>
    </div>
  );
}
