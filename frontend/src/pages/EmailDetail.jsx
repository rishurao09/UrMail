import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  fetchEmail,
  processEmail,
  sendReply,
  escalateEmail,
  correctReply,
} from '../data/api';

export default function EmailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadEmail();
  }, [id]);

  async function loadEmail() {
    setLoading(true);
    try {
      const data = await fetchEmail(id);
      setEmail(data);
      setReply(data.suggested_reply || '');
    } catch (err) {
      addToast('Email not found', 'error');
      navigate('/inbox');
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess() {
    setProcessing(true);
    try {
      await processEmail(id);
      addToast('Email processed by AI', 'success');
      await loadEmail();
    } catch (err) {
      addToast('Processing failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      if (reply !== email.suggested_reply && email.suggested_reply) {
        await correctReply(id, reply);
        addToast('Correction stored for learning', 'info');
      }
      await sendReply(id);
      addToast('Reply sent successfully', 'success');
      await loadEmail();
    } catch (err) {
      addToast('Send failed: ' + err.message, 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleEscalate() {
    try {
      await escalateEmail(id);
      addToast('Email escalated to human agent', 'info');
      await loadEmail();
    } catch (err) {
      addToast('Escalation failed: ' + err.message, 'error');
    }
  }

  if (loading) {
    return (
      <main className="ml-64 pt-24 p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
          <p className="text-on-surface-variant font-medium">Loading intelligence data...</p>
        </div>
      </main>
    );
  }

  if (!email) return null;

  const confidence = email.confidence ? (email.confidence * 100).toFixed(0) : null;
  const confLevel = confidence >= 80 ? 'high' : confidence >= 50 ? 'medium' : 'low';
  
  const actionColors = {
    'auto_reply': 'tertiary',
    'suggest_reply': 'primary',
    'escalate': 'error'
  };
  const themeColor = actionColors[email.action] || 'outline';

  return (
    <main className="ml-64 pt-24 p-8 pb-20">
      {processing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface-container p-8 rounded-xl flex flex-col items-center shadow-2xl">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">sync</span>
            <div className="text-lg font-headline font-bold mb-2">Analyzing Context...</div>
            <p className="text-sm text-outline">Extracting key entities and generating response.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs & Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-outline text-[0.6875rem] font-label uppercase tracking-widest mb-2 cursor-pointer" onClick={() => navigate('/inbox')}>
              <span className="hover:text-primary transition-colors">Inbox</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">Intelligence Detail</span>
            </nav>
            <h2 className="text-4xl font-headline font-bold tracking-tight text-on-surface">{email.subject}</h2>
          </div>
          <div className="flex gap-3">
             {email.status === 'pending' && (
                <button 
                  className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-xs font-label uppercase tracking-widest border border-primary/10 hover:bg-primary/30 transition-colors flex items-center gap-2"
                  onClick={handleProcess}
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Process with AI
                </button>
             )}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Email Thread & Summary */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            
            {/* Original Email Card */}
            <div className="bg-surface-container rounded-lg p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 font-bold text-outline">
                    {email.sender.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface">{email.sender}</p>
                    <p className="text-xs text-outline">{email.sender_email} • {new Date(email.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                {email.category && (
                  <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-label uppercase rounded">
                    {email.category}
                  </span>
                )}
              </div>
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p className="text-sm whitespace-pre-wrap">{email.body}</p>
              </div>
            </div>

            {/* AI Summary & Action Items */}
            {email.summary ? (
              <div className={`bg-surface-container rounded-lg p-6 border-l-2 border-${themeColor}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`material-symbols-outlined text-${themeColor} text-lg`} style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-headline font-bold text-sm tracking-wide uppercase">AI Intelligence Summary</h3>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 bg-surface-container-low p-4 rounded-lg">
                  {email.summary}
                </p>

                {email.action_items && email.action_items.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[0.625rem] font-label uppercase tracking-widest text-outline">Recommended Action Items</h4>
                    <div className="space-y-2">
                       {email.action_items.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-3 text-sm p-3 bg-surface-container-low rounded-lg border border-outline-variant/5">
                            <span className={`w-5 h-5 rounded-full bg-${themeColor}/10 text-${themeColor} flex items-center justify-center text-[10px] font-bold`}>{idx + 1}</span>
                            <span>{item}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Right Column: Decision Engine & RAG */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            
            {/* Decision Engine Panel */}
            {(email.action || email.status !== 'pending') && (
              <div className={`bg-surface-container-high rounded-lg p-6 shadow-2xl shadow-black/40 border border-${themeColor}/20`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-headline font-bold text-${themeColor}`}>Decision Engine</h3>
                  {confidence && (
                    <div className="text-right">
                      <p className="text-[0.625rem] font-label text-outline uppercase">Confidence Score</p>
                      <p className={`text-xl font-headline font-extrabold text-${themeColor}`}>{(confidence/100).toFixed(2)} <span className="text-xs font-normal text-outline ml-1">({confLevel})</span></p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="text-[0.625rem] font-label text-outline uppercase block mb-2">Automated Decision</label>
                  <div className={`px-4 py-2 bg-${themeColor}/10 text-${themeColor} border border-${themeColor}/20 rounded-lg font-bold text-center tracking-widest text-xs`}>
                    {email.action ? email.action.toUpperCase() : email.status.toUpperCase()}
                  </div>
                  {email.priority_explanation && (
                    <p className="text-xs text-outline mt-2 italic text-center px-4">{email.priority_explanation}</p>
                  )}
                </div>

                {reply && (
                  <div className="mb-6">
                    <label className="text-[0.625rem] font-label text-outline uppercase block mb-2">Drafted Reply</label>
                    <textarea 
                      className={`w-full bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed focus:ring-1 focus:ring-${themeColor}/50 outline-none`}
                      rows={6}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      disabled={email.status === 'auto_sent' || email.status === 'corrected_sent'}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 mt-4">
                  {email.status !== 'auto_sent' && email.status !== 'corrected_sent' ? (
                     <>
                        <button 
                          className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold text-sm rounded shadow-lg shadow-primary/20 hover:scale-[0.99] transition-all disabled:opacity-50"
                          onClick={handleSend}
                          disabled={sending}
                        >
                          {sending ? 'Sending...' : (reply !== email.suggested_reply ? 'Approve Correction & Send' : 'Approve & Send')}
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                             className="py-2.5 bg-surface-container-highest text-on-surface text-xs font-bold rounded border border-outline-variant/20 hover:bg-surface-variant transition-colors"
                             onClick={() => setReply(email.suggested_reply || '')}
                          >
                            Reset Draft
                          </button>
                          <button 
                             className="py-2.5 bg-surface-container-highest text-error text-xs font-bold rounded border border-error/10 hover:bg-error-container/10 transition-colors"
                             onClick={handleEscalate}
                          >
                            Escalate
                          </button>
                        </div>
                     </>
                  ) : (
                    <div className="w-full py-3 bg-surface-container-highest text-success font-headline font-bold text-sm rounded flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      {email.status === 'corrected_sent' ? 'Corrected & Sent' : 'Sent'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Log Component could go here */}

          </div>
        </div>
      </div>
    </main>
  );
}
