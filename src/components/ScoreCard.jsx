import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import styles from './ScoreCard.module.css';

function AnimNum({ target, suffix = '' }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayed(end);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{displayed}{suffix}</>;
}

export default function ScoreCard({ score }) {
  if (!score) return null;
  const appsStr = score.apps.join(' · ');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={styles.card}
    >
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
    </motion.div>
  );
}
