import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Templates.module.css';
import Toast from '../components/Toast';

const templates = [
  {
    icon: '🐛', name: 'Bug Escalation', tag: 'Ops', color: '#ff4f6d',
    desc: 'Triage a critical bug, create a P1 Jira ticket, alert the on-call team on Slack, and write a Notion incident report.',
    steps: ['Fetch Jira board', 'Analyse severity', 'Create P1 ticket', 'Alert #dev-alerts', 'Write incident log'],
    key: 'bug',
  },
  {
    icon: '📅', name: 'Sprint Review Digest', tag: 'Engineering', color: '#4da6ff',
    desc: 'Compile sprint stats, create the review ticket, post the digest to Slack, and update the Notion sprint board.',
    steps: ['Pull sprint data', 'Create review ticket', 'Post to #general', 'Update Notion board'],
    key: 'sprint',
  },
  {
    icon: '👤', name: 'New Employee Onboarding', tag: 'HR', color: '#00d4aa',
    desc: 'Create an onboarding Jira ticket, send a warm Slack welcome, and set up a personalised Notion onboarding page.',
    steps: ['Fetch template', 'Create onboarding ticket', 'Send Slack welcome', 'Create Notion page'],
    key: 'onboard',
  },
  {
    icon: '🚨', name: 'Incident Response', tag: 'Ops', color: '#ff4f6d',
    desc: 'Immediately escalate a production outage: P1 ticket, on-call page, Notion post-mortem template — all in seconds.',
    steps: ['Check active incidents', 'Create P1 ticket', 'Page #incidents', 'Create post-mortem'],
    key: 'incident',
  },
  {
    icon: '💬', name: 'Customer Feedback Loop', tag: 'Product', color: '#f0b429',
    desc: 'Log negative feedback, create a priority ticket, share the analysis on Slack, and update the Notion tracker.',
    steps: ['Check existing tickets', 'Create P2 ticket', 'Share to #product', 'Update feedback log'],
    key: 'feedback',
  },
  {
    icon: '🎯', name: 'Sprint Planning Kickoff', tag: 'Engineering', color: '#4da6ff',
    desc: 'Kick off a new sprint with auto-created planning ticket, team notification on Slack, and a Notion planning page.',
    steps: ['Read backlog', 'Create planning ticket', 'Post kickoff message', 'Create sprint page'],
    key: 'sprint',
  },
];

const templatePrompts = {
  bug: 'Get all Jira tickets, find P1 and P2 bugs, create escalation tickets for unassigned ones, post summary to Slack #engineering',
  sprint: 'Get all Jira tickets, summarize completed sprint work, post sprint review to Slack #general',
  onboard: 'Create Jira onboarding ticket for new employee, post welcome message to Slack #general, create Notion onboarding page with first week plan',
  incident: 'Get all P1 Jira tickets, post incident alert to Slack #general with ticket details, create incident report in Notion',
  weekly: 'Get all Jira tickets from this week, summarize completed and in-progress work, post weekly digest to Slack #general',
  feedback: 'Create Jira ticket for customer feedback, post feedback summary to Slack #general, create Notion page with feedback analysis',
};

export default function Templates() {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [active, setActive] = useState(null);

  const handleTemplateClick = (templatePrompt) => {
    navigate('/dashboard', { state: { prompt: templatePrompt } });
  };

  const handleUse = (t) => {
    const prompt = templatePrompts[t.key];
    handleTemplateClick(prompt);
  };

  return (
    <div className={styles.page}>
      <Toast message={toast} onClose={() => setToast('')} />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className="section-label">Workflow Templates</div>
          <h1 className={styles.title}>One click.<br /><span className="grad-text">Complete automation.</span></h1>
          <p className={styles.sub}>Pick a template — FlowMind loads the workflow and runs it instantly. No typing needed.</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <div className={styles.statNum}>6</div>
            <div className={styles.statLabel}>Templates</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum}>5</div>
            <div className={styles.statLabel}>AI Tools</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNum}>₹0</div>
            <div className={styles.statLabel}>Cost</div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {templates.map((t, i) => (
          <div
            key={i}
            className={`${styles.card} ${active === i ? styles.selected : ''}`}
            onClick={() => setActive(active === i ? null : i)}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className={styles.cardTop}>
              <div className={styles.icon} style={{ background: t.color + '20' }}>{t.icon}</div>
              <span className="badge" style={{ background: t.color + '20', color: t.color, border: `1px solid ${t.color}40` }}>{t.tag}</span>
            </div>
            <div className={styles.cardName}>{t.name}</div>
            <div className={styles.cardDesc}>{t.desc}</div>

            {/* Steps preview */}
            <div className={styles.stepsPreview}>
              {t.steps.map((s, j) => (
                <div key={j} className={styles.stepBubble}>
                  <span className={styles.stepNum} style={{ background: t.color + '25', color: t.color }}>{j + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            <button
              className={`${styles.useBtn} btn`}
              style={{ background: t.color, color: '#000', width: '100%', marginTop: '1rem' }}
              onClick={e => { e.stopPropagation(); handleUse(t); }}
            >
              ⚡ Run This Template
            </button>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className="section-label" style={{ textAlign: 'center', marginBottom: '2rem' }}>How Templates Work</div>
        <div className={styles.howGrid}>
          {['Pick a template', 'FlowMind loads the prompt', 'AI reasons through steps', 'Apps update live'].map((step, i) => (
            <div key={i} className={styles.howStep}>
              <div className={styles.howNum}>{i + 1}</div>
              <div className={styles.howLabel}>{step}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
