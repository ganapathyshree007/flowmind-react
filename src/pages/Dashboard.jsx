import { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import StepItem from '../components/StepItem';
import { JiraPanel, SlackPanel, NotionPanel } from '../components/MockPanels';
import ScoreCard from '../components/ScoreCard';
import VoiceButton from '../components/VoiceButton';
import Toast from '../components/Toast';
import Orb from '../components/Orb';
import styles from './Dashboard.module.css';

const DEMOS = [
  { value: '',         label: 'Quick demo scenarios' },
  { value: 'bug',     label: '🐛  Escalate critical bug' },
  { value: 'sprint',  label: '📅  Sprint review digest' },
  { value: 'onboard', label: '👤  Onboard new employee' },
  { value: 'incident',label: '🚨  Incident response' },
  { value: 'feedback',label: '💬  Customer feedback loop' },
];

const PROMPTS = {
  bug:      'We have a critical login crash affecting 400+ users on mobile Safari. Create a P1 Jira ticket assigned to Arjun K, post an urgent alert on Slack #dev-alerts, and create a Notion incident report.',
  sprint:   "It's Friday — create a sprint review Jira ticket, post the weekly engineering digest on Slack #general, and update the Notion sprint board.",
  onboard:  'New engineer Priya Nair joins Monday as Frontend Developer. Create an onboarding Jira ticket, send a Slack welcome message, and set up a Notion onboarding page.',
  incident: 'Production is down! Payment service 500 errors for 10 minutes. Immediately: P1 Jira ticket, page the on-call team on Slack #incidents, create a Notion post-mortem.',
  feedback: '50 negative reviews about slow dashboard load time this week. Create a P2 Jira ticket, share summary on Slack #product, update the Notion feedback log.',
};

export default function Dashboard() {
  const [input,      setInput]      = useState('');
  const [toast,      setToast]      = useState('');
  const [flashJira,  setFlashJira]  = useState(false);
  const [flashSlack, setFlashSlack] = useState(false);
  const [flashNotion,setFlashNotion]= useState(false);
  const [histOpen,   setHistOpen]   = useState(false);
  const stepsEndRef = useRef(null);
  const prevSteps   = useRef([]);

  const { appState, steps, isRunning, score, history, run, reset, undo } = useWorkflow();

  // Flash panels when tool actions complete
  useEffect(() => {
    const newDone = steps.filter(s =>
      s.status === 'done' &&
      !prevSteps.current.find(p => p.id === s.id && p.status === 'done')
    );
    newDone.forEach(s => {
      if (s.tool?.includes('jira'))   { setFlashJira(true);   setTimeout(() => setFlashJira(false),   700); }
      if (s.tool?.includes('slack'))  { setFlashSlack(true);  setTimeout(() => setFlashSlack(false),  700); }
      if (s.tool?.includes('notion')) { setFlashNotion(true); setTimeout(() => setFlashNotion(false), 700); }
    });
    prevSteps.current = steps;
  }, [steps]);

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  useEffect(() => {
    if (score) setToast(`✓ Workflow complete — ${score.saved}min saved in ${score.elapsed}s`);
  }, [score]);

  const handleRun = useCallback(async () => {
    if (!input.trim() || isRunning) return;
    await run(input);
  }, [input, isRunning, run]);

  const handleKey = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'l')     { e.preventDefault(); reset(); setInput(''); }
  };

  const handleDemo = e => {
    const v = e.target.value;
    if (v && PROMPTS[v]) { setInput(PROMPTS[v]); e.target.value = ''; }
  };

  const statusLabel = isRunning ? 'Reasoning...' : score ? 'Complete' : 'Ready';
  const statusStyle = isRunning ? 'running' : score ? 'done' : 'idle';

  return (
    <div className={styles.page}>
      {/* Orb background — 1080×1080 centred */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1080px', height: '1080px',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
          <Orb
            hue={40}
            hoverIntensity={2}
            rotateOnHover
            forceHoverState={false}
          />
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>Workspace</h1>
          <div className={`${styles.statusChip} ${styles[statusStyle]}`}>
            <span className={styles.statusDot} />
            {statusLabel}
          </div>
        </div>
        <div className={styles.topActions}>
          <button className="btn btn-ghost" style={{ fontSize: '.78rem', padding: '6px 12px' }} onClick={() => { reset(); setInput(''); }}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className={styles.grid}>

        {/* ── LEFT: Input ── */}
        <div className={`${styles.panel} card`}>
          <div className={styles.panelHead}>
            <span className={styles.panelHeadLabel}>Command</span>
          </div>
          <div className={styles.panelBody}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={7}
              placeholder={"Describe your workflow in plain English...\n\nExample: Escalate the Safari login crash — create a P1 ticket, alert the team on Slack, and write a Notion incident report."}
            />
            <div className={styles.charHint}>{input.length} / 500</div>

            <div className={styles.inputRow}>
              <VoiceButton onResult={setInput} onToast={setToast} currentValue={input} />
              <button
                className={`${styles.runBtn} btn btn-primary`}
                onClick={handleRun}
                disabled={isRunning || !input.trim()}
              >
                {isRunning
                  ? <><span className="spinner" /> Running…</>
                  : <>Run Workflow</>
                }
              </button>
            </div>

            <div className={styles.divRow} />

            <div className={styles.fieldLabel}>Quick demo</div>
            <select onChange={handleDemo}>
              {DEMOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            <div className={styles.hints}>
              <span>⌘↵ to run</span>
              <span>⌘L to reset</span>
              <span>Chrome for voice</span>
            </div>
          </div>
        </div>

        {/* ── MIDDLE: AI Reasoning ── */}
        <div className={`${styles.panel} card`}>
          <div className={styles.panelHead}>
            <span className={styles.panelHeadLabel}>AI Reasoning</span>
            {steps.length > 0 && (
              <span className={styles.stepCount}>{steps.filter(s => s.status === 'done').length}/{steps.length} steps</span>
            )}
          </div>
          <div className={`${styles.panelBody} ${styles.scrollable}`}>
            {steps.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                  </svg>
                </div>
                <p className={styles.emptyTitle}>Waiting for a command</p>
                <p className={styles.emptySub}>Type a workflow or pick a demo above. Each AI reasoning step will appear here as it executes.</p>
              </div>
            ) : (
              steps.map((s, i) => (
                <StepItem key={s.id} step={s} isLast={i === steps.length - 1} />
              ))
            )}
            {score && (
              <div className={styles.miniBadges}>
                <span className="badge badge-green">✓ {score.steps} steps</span>
                <span className="badge badge-default">⏱ {score.elapsed}s</span>
                <span className="badge badge-accent">↑ {score.saved}min saved</span>
              </div>
            )}
            <div ref={stepsEndRef} />
          </div>
        </div>

        {/* ── RIGHT: Mock Apps ── */}
        <div className={`${styles.panel} card`}>
          <div className={styles.panelHead}>
            <span className={styles.panelHeadLabel}>Connected Apps</span>
            <span className={styles.appCount}>3 live</span>
          </div>
          <div className={`${styles.panelBody} ${styles.appCol}`}>
            <JiraPanel   tickets={appState.jira}    isFlashing={flashJira}   />
            <SlackPanel  messages={appState.slack}   isFlashing={flashSlack}  />
            <NotionPanel page={appState.notion}      isFlashing={flashNotion} />
          </div>
        </div>
      </div>

      {/* Score card */}
      {score && (
        <div className={styles.scoreWrap}>
          <ScoreCard score={score} />
        </div>
      )}

      {/* Action History */}
      {history.length > 0 && (
        <div className={styles.histSection}>
          <button
            className={`${styles.histToggle} ${histOpen ? styles.histOpen : ''}`}
            onClick={() => setHistOpen(o => !o)}
          >
            <span className={styles.histTitle}>Audit Trail</span>
            <span className="badge badge-default">{history.length} actions</span>
            <span className={styles.histArrow}>›</span>
          </button>

          {histOpen && (
            <div className={styles.histBody}>
              {history.map((h, i) => (
                <div key={i} className={styles.histRow}>
                  <span className={styles.histTime}>{h.time}</span>
                  <span className={styles.histTool}>{h.tool}()</span>
                  <span className={styles.histDesc}>{h.desc}</span>
                  <button className={styles.undoBtn} onClick={() => undo(i)}>↩ Undo</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
