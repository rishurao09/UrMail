import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { fetchDashboardStats, fetchEmails, runDemo, resetDemo } from '../data/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, emailsRes] = await Promise.all([
        fetchDashboardStats(),
        fetchEmails(),
      ]);
      setStats(statsRes);
      setEmails(emailsRes.emails || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  async function handleRunDemo() {
    setDemoRunning(true);
    try {
      const result = await runDemo();
      addToast(`${result.message}`, 'success');
      await loadData();
    } catch (err) {
      addToast('Demo failed: ' + err.message, 'error');
    } finally {
      setDemoRunning(false);
    }
  }

  async function handleReset() {
    try {
      await resetDemo();
      addToast('Demo reset complete', 'info');
      await loadData();
    } catch (err) {
      addToast('Reset failed: ' + err.message, 'error');
    }
  }

  const recentEmails = emails.slice(0, 5);

  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-[1024px]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold font-manrope tracking-tight text-on-surface">Executive Dashboard</h2>
            <p className="text-outline mt-1 font-body text-sm">Real-time automation performance and intelligence metrics.</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-variant transition-colors flex items-center gap-2"
              onClick={handleReset}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset
            </button>
            <button 
              className="bg-primary px-4 py-2 rounded-lg text-sm font-medium text-on-primary hover:opacity-90 transition-colors flex items-center gap-2"
              onClick={handleRunDemo}
              disabled={demoRunning}
            >
              <span className="material-symbols-outlined text-sm">{demoRunning ? 'hourglass_empty' : 'play_arrow'}</span>
              {demoRunning ? 'Processing...' : 'Run AI Demo'}
            </button>
          </div>
        </div>

        {/* Bento Grid - Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container p-6 rounded-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[0.6875rem] font-label uppercase tracking-widest text-outline">Total Emails</span>
              <span className="material-symbols-outlined text-primary/40">mail</span>
            </div>
            <div className="text-3xl font-extrabold font-manrope text-on-surface">{stats?.total_emails || 0}</div>
          </div>
          <div className="bg-surface-container p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1 h-full bg-tertiary"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[0.6875rem] font-label uppercase tracking-widest text-outline">Auto-handled</span>
              <span className="material-symbols-outlined text-tertiary/40">bolt</span>
            </div>
            <div className="text-3xl font-extrabold font-manrope text-tertiary">{stats?.auto_handled_percent || 0}%</div>
          </div>
          <div className="bg-surface-container p-6 rounded-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[0.6875rem] font-label uppercase tracking-widest text-outline">Pending Review</span>
              <span className="material-symbols-outlined text-outline/40">visibility</span>
            </div>
            <div className="text-3xl font-extrabold font-manrope text-on-surface">{stats?.pending_review || 0}</div>
          </div>
          <div className="bg-surface-container p-6 rounded-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[0.6875rem] font-label uppercase tracking-widest text-outline">Escalated</span>
              <span className="material-symbols-outlined text-error/40">warning</span>
            </div>
            <div className="text-3xl font-extrabold font-manrope text-error">{stats?.escalated || 0}</div>
          </div>
        </div>

        {/* Dashboard Center Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 bg-surface-container rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-manrope text-on-surface">Recent Autonomous Actions</h3>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline" onClick={() => navigate('/inbox')}>View Inbox</button>
            </div>
            <div className="space-y-2">
              {recentEmails.map((email) => {
                const actionColors = {
                  'auto_reply': 'tertiary',
                  'suggest_reply': 'primary',
                  'escalate': 'error'
                };
                const color = actionColors[email.action] || 'outline';
                
                return (
                  <div key={email.id} className={`flex items-center gap-4 p-3 rounded bg-surface-container-low border-l-2 border-${color} hover:bg-surface-container-highest cursor-pointer transition-colors`} onClick={() => navigate(`/email/${email.id}`)}>
                    <div className={`bg-${color}/10 text-${color} p-2 rounded`}>
                      <span className="material-symbols-outlined text-sm">
                        {email.action === 'auto_reply' ? 'auto_awesome' : email.action === 'escalate' ? 'warning' : 'schedule_send'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-on-surface truncate pr-4">{email.subject}</p>
                        <span className="text-[0.6rem] text-outline font-label uppercase">{(email.date || '').substring(11, 16)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[0.6875rem] text-outline font-medium text-${color}`}>
                          Score: {(email.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline/20"></span>
                        <span className="text-[0.6875rem] text-outline">
                          Sender: <span className="text-on-surface">{email.sender}</span>
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-[0.6rem] bg-surface-container-highest text-on-surface rounded font-label uppercase tracking-wider hover:bg-surface-variant transition-colors">
                      Review
                    </button>
                  </div>
                );
              })}
              {recentEmails.length === 0 && (
                <div className="text-center py-6 text-outline text-sm">
                  No automated actions yet. Run demo to process emails.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
