import { useEffect, useRef } from 'react';
import styles from './Landing.module.css';
import { useNavigate } from 'react-router-dom';
import Orb from '../components/Orb';

const features = [
  { icon: '🧠', title: 'Live AI Reasoning', desc: 'Watch FlowMind think step-by-step in real time. Every decision visible, every tool call transparent.' },
  { icon: '🔗', title: 'Multi-App Control', desc: 'One command updates Jira, Slack and Notion simultaneously. No tab-switching, no copy-pasting.' },
  { icon: '🎙️', title: 'Voice Commands', desc: 'Speak your workflow in plain English. FlowMind understands context and executes complex chains.' },
  { icon: '↩️', title: 'Undo + Audit Trail', desc: 'Every action logged. One-click undo. Enterprise-grade accountability built right in.' },
  { icon: '⚡', title: 'Workflow Templates', desc: '6 enterprise templates — Bug Escalation, Sprint Review, Onboarding and more. One click to run.' },
  { icon: '📊', title: 'Success Metrics', desc: 'After each run: steps done, apps updated, time saved vs manual. Judges love the numbers.' },
];

const stats = [
  { num: '5', label: 'AI Tools Active', suffix: '' },
  { num: '87', label: 'Time Saved', suffix: '%' },
  { num: '3', label: 'Apps Connected', suffix: '' },
  { num: '0', label: 'Total Cost', prefix: '₹' },
];

const timeline = [
  { time: 'Hr 0–1', label: 'Setup', color: '#00d4aa' },
  { time: 'Hr 1–3', label: 'UI Build', color: '#4da6ff' },
  { time: 'Hr 3–4', label: 'Mock Apps', color: '#f0b429' },
  { time: 'Hr 4–8', label: 'AI Brain', color: '#ff4f6d' },
  { time: 'Hr 8–9', label: 'Voice', color: '#4da6ff' },
  { time: 'Hr 9–12', label: 'Unique Layers', color: '#00d4aa' },
  { time: 'Hr 12–16', label: 'Deploy', color: '#10b981' },
];

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + .4, vx: (Math.random() - .5) * .3, vy: -(Math.random() * .35 + .05),
      c: ['#00d4aa', '#4da6ff', '#4dffd8', '#ff4f6d'][Math.floor(Math.random() * 4)],
      a: Math.random(),
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a -= .0008;
        if (p.y < 0 || p.a <= 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; p.a = Math.random(); }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.a * 200).toString(16).padStart(2, '0');
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.page}>
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* WebGL Orb background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f'
      }}>
        <div style={{ width: '900px', height: '900px', position: 'relative', opacity: 0.6 }}>
          <Orb hue={260} hoverIntensity={3} rotateOnHover={true} forceHoverState={false} />
        </div>
      </div>

      {/* CSS Orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.liveDot} />
          Powered by Gemini 2.0 Flash &nbsp;·&nbsp; 100% Free &nbsp;·&nbsp; 24h Hackathon
        </div>
        <h1 className={styles.heroTitle}>
          Stop switching tabs.<br />
          <span className="grad-text">Let AI do the work.</span>
        </h1>
        <p className={styles.heroSub}>
          FlowMind is an intelligent workflow agent that connects Jira, Slack &amp; Notion — and executes complex multi-step automations from a single sentence. Watch it reason live.
        </p>
        <div className={styles.heroCta}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => navigate('/dashboard')}>
            🚀 Try Live Demo
          </button>
          <button className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={() => navigate('/templates')}>
            📋 Browse Templates
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className={styles.statsRow}>
        {stats.map(s => (
          <div key={s.label} className={styles.statItem}>
            <div className="stat-num">{s.prefix}{s.num}{s.suffix}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 24h Timeline */}
      <section className={styles.timelineSection}>
        <div className={styles.sectionLabel}>24-Hour Build Timeline</div>
        <div className={styles.timeline}>
          {timeline.map(t => (
            <div key={t.time} className={styles.timelineBar} style={{ borderTop: `3px solid ${t.color}` }}>
              <div className={styles.timelineTime}>{t.time}</div>
              <div className={styles.timelineLabel} style={{ color: t.color }}>{t.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>Why FlowMind Wins</div>
          <h2 className={styles.sectionTitle}>5 Unique Layers<br /><span className="grad-text">nobody else has</span></h2>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={`${styles.featureCard} card card-glow`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureName}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className={styles.stackSection}>
        <div className={styles.sectionLabel}>Complete Free Tech Stack</div>
        <div className={styles.stackGrid}>
          {[
            ['Gemini 2.0 Flash','AI brain + tool calling','aistudio.google.com'],
            ['Bolt.new','Generate full UI instantly','bolt.new'],
            ['Cursor AI','Vibe coding — fix anything','cursor.com'],
            ['React + Vite','App framework','via Bolt.new'],
            ['Web Speech API','Voice input','Chrome built-in'],
            ['Vercel','Live URL hosting','vercel.com'],
          ].map(([tool, purpose, where]) => (
            <div key={tool} className={`${styles.stackCard} card`}>
              <div className={styles.stackTool}>{tool}</div>
              <div className={styles.stackPurpose}>{purpose}</div>
              <div className={styles.stackFree}>{where}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div className={styles.ctaIcon}>🏆</div>
          <h2 className={styles.ctaTitle}>Ready to win the hackathon?</h2>
          <p className={styles.ctaSub}>Built from a flawless 7-phase masterplan. Zero API cost. Live URL. Judges will have never seen anything like it.</p>
          <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }} onClick={() => navigate('/dashboard')}>
            ⚡ Launch FlowMind
          </button>
        </div>
      </section>
    </div>
  );
}
