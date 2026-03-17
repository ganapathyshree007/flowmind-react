import { useState, useCallback, useRef, useEffect } from 'react';
import { initialJira, initialSlack, initialNotion } from '../data/mockData';
import { runAgent } from '../geminiAgent';

const INITIAL_STATE = { jira: initialJira, slack: initialSlack, notion: initialNotion };

export function useWorkflow() {
  const [appState, setAppState] = useState(INITIAL_STATE);
  const [steps,     setSteps]     = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score,     setScore]     = useState(null);
  const [history,   setHistory]   = useState([]);

  const startRef     = useRef(null);
  // ✅ FIX: track current appState in a ref so runAgent always sees the latest value
  const appStateRef  = useRef(appState);

  // Keep the ref in sync every render
  const setAppStateSynced = useCallback((updater) => {
    setAppState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      appStateRef.current = next;
      return next;
    });
  }, []);

  // Load real Jira tickets on mount (shows KAN tickets immediately)
  useEffect(() => {
    async function loadRealTickets() {
      try {
        const res = await fetch('/api/jira-get-tickets')
        const data = await res.json()
        if (data.tickets && data.tickets.length > 0) {
          setAppStateSynced((prev) => ({ ...prev, jira: data.tickets }))
        }
      } catch (err) {
        console.log('Could not load real tickets:', err.message)
      }
    }
    loadRealTickets()
  }, [setAppStateSynced])

  // ── Callbacks for geminiAgent ─────────────────────────────────────────────

  const handleStepUpdate = useCallback((step) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === step.id);
      if (idx === -1) return [...prev, step];
      return prev.map((s, i) => (i === idx ? { ...s, ...step } : s));
    });
  }, []);

  const handleStateChange = useCallback((partial) => {
    setAppStateSynced((prev) => ({ ...prev, ...partial }));

    const toolKey = partial.jira
      ? 'create_jira_ticket'
      : partial.slack
      ? 'post_slack_message'
      : partial.notion
      ? 'create_notion_page'
      : 'tool_action';

    setHistory((prev) => [
      { time: new Date().toLocaleTimeString(), tool: toolKey, desc: toolKey.replace(/_/g, ' ') },
      ...prev,
    ]);
  }, [setAppStateSynced]);

  // ── run ──────────────────────────────────────────────────────────────────

  const run = useCallback(async (input) => {
    if (!input.trim() || isRunning) return;

    setIsRunning(true);
    setSteps([]);
    setScore(null);
    startRef.current = Date.now();

    // Use ref snapshot — always current, no async race
    const snapshot = appStateRef.current;

    try {
      await runAgent(input, snapshot, handleStepUpdate, handleStateChange);
    } catch (err) {
      console.error('[FlowMind] Gemini agent error:', err);
      handleStepUpdate({
        id: 9999,
        tool: 'error',
        title: '⚠️ Agent Error',
        desc: err.message ?? String(err),
        status: 'done',
      });
    }

    const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);

    setSteps((finalSteps) => {
      const done = finalSteps.filter((s) => s.status === 'done' && s.tool !== 'error');
      const apps = [
        ...new Set(
          done.map((s) => {
            if (s.tool?.includes('jira'))   return 'Jira';
            if (s.tool?.includes('slack'))  return 'Slack';
            if (s.tool?.includes('notion')) return 'Notion';
            if (s.tool?.includes('email'))  return 'Email';
            return null;
          }).filter(Boolean)
        ),
      ];
      setScore({ steps: done.length, apps, saved: done.length * 3, elapsed });
      return finalSteps;
    });

    setIsRunning(false);
  }, [isRunning, handleStepUpdate, handleStateChange]);

  // ── reset / undo ─────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setSteps([]);
    setScore(null);
    setAppStateSynced(INITIAL_STATE);
  }, [setAppStateSynced]);

  const undo = useCallback((index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { appState, steps, isRunning, score, history, run, reset, undo };
}
