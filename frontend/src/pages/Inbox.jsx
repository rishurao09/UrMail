import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { fetchEmails, processAllEmails, processEmail } from '../data/api';

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    try {
      const res = await fetchEmails();
      setEmails(res.emails || []);
    } catch (err) {
      addToast('Failed to load emails', 'error');
    }
  }

  async function handleProcessAll() {
    setProcessing(true);
    try {
      const res = await processAllEmails();
      addToast(`Processed ${res.processed} emails`, 'success');
      await loadEmails();
    } catch (err) {
      addToast('Processing failed: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleProcessSingle(emailId, e) {
    if (e) e.stopPropagation();
    try {
      await processEmail(emailId);
      addToast('Email processed', 'success');
      await loadEmails();
    } catch (err) {
      addToast('Failed: ' + err.message, 'error');
    }
  }

  const filtered = emails.filter((e) => {
    if (filter !== 'all' && e.category?.toLowerCase() !== filter.toLowerCase() && e.action?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.sender?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.sender_email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="ml-64 pt-16 h-screen flex flex-col bg-surface-container-low">
      {/* Filter Bar */}
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-label uppercase tracking-[0.15em] text-outline mb-1">Context View</span>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight">Smart Inbox</h2>
          </div>
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 rounded text-xs transition-all ${filter === 'all' ? 'bg-surface-container-highest text-primary font-bold font-headline' : 'hover:bg-surface-container-highest/50 text-outline font-medium'}`}
              onClick={() => setFilter('all')}
            >All Activity</button>
            <button 
              className={`px-4 py-1.5 rounded text-xs transition-all ${filter === 'escalate' ? 'bg-surface-container-highest text-primary font-bold font-headline' : 'hover:bg-surface-container-highest/50 text-outline font-medium'}`}
              onClick={() => setFilter('escalate')}
            >Flagged</button>
            <button 
              className={`px-4 py-1.5 rounded text-xs transition-all ${filter === 'draft' ? 'bg-surface-container-highest text-primary font-bold font-headline' : 'hover:bg-surface-container-highest/50 text-outline font-medium'}`}
              onClick={() => setFilter('draft')}
            >Drafts</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {processing && <span className="text-primary text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined animate-spin text-sm">autorenew</span>Processing...</span>}
          <div 
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/10 bg-surface-container-highest/20 cursor-pointer hover:bg-surface-container-highest/40 transition-all"
             onClick={handleProcessAll}
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="text-xs font-medium">Process Pending</span>
          </div>
        </div>
      </div>

      {/* Inbox Layout */}
      <div className="flex-1 px-8 pb-8 overflow-hidden flex gap-6">
        {/* Email List Panel */}
        <section className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filtered.map((email) => {
             // Theme determination based on action / category
             let highlightColor = 'transparent';
             let priorityColorClass = 'bg-surface-variant/50 text-outline';
             let categoryColorClass = 'bg-surface-variant text-on-surface-variant';
             let actionIcon = 'bolt';
             let actionColorClass = 'bg-outline/10 text-outline';
             
             if (email.priority === 'High') priorityColorClass = 'bg-error-container/20 text-error';
             else if (email.priority === 'Medium') priorityColorClass = 'bg-on-surface/10 text-on-surface';

             if (email.category === 'Support') categoryColorClass = 'bg-primary/10 text-primary border border-primary/20';
             else if (email.category === 'Sales') categoryColorClass = 'bg-secondary-container/20 text-secondary';
             else if (email.category === 'Spam') categoryColorClass = 'bg-outline/10 text-outline';

             if (email.action === 'auto_reply' || email.status === 'auto_sent') {
                highlightColor = 'bg-tertiary';
                actionColorClass = 'bg-tertiary-container/15 text-tertiary';
                actionIcon = 'bolt';
             } else if (email.action === 'suggest_reply' || email.status === 'draft') {
                actionColorClass = 'bg-primary/10 text-primary';
                actionIcon = 'lightbulb';
             } else if (email.action === 'escalate' || email.status === 'escalated') {
                highlightColor = 'bg-error';
                actionColorClass = 'bg-error-container/20 text-error';
                actionIcon = 'warning';
             }

             return (
              <div 
                 key={email.id} 
                 className={`group bg-surface-container rounded-lg p-5 flex items-start gap-5 cursor-pointer transition-all relative overflow-hidden ${email.action === 'escalate' ? 'hover:ring-1 hover:ring-error/30' : 'hover:ring-1 hover:ring-primary/30'}`}
                 onClick={() => navigate(`/email/${email.id}`)}
              >
                {highlightColor !== 'transparent' && <div className={`absolute left-0 top-0 bottom-0 w-1 ${highlightColor}`}></div>}
                
                <div className="flex-shrink-0 pt-1">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-bold text-outline border border-outline-variant/10">
                    {email.sender.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-headline font-bold truncate">{email.sender}</h3>
                    <span className="text-xs text-outline font-label">{email.date?.substring(11, 16)}</span>
                  </div>
                  <h4 className={`text-sm font-semibold mb-2 ${email.is_read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{email.subject}</h4>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mb-4">{email.body?.substring(0, 80)}...</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {email.category && <span className={`px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase ${categoryColorClass}`}>{email.category}</span>}
                    {email.priority && <span className={`px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase ${priorityColorClass}`}>{email.priority}</span>}
                    {(email.action || email.status !== 'pending') && (
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase ${actionColorClass}`}>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{actionIcon}</span>
                        {email.action ? email.action.replace('_', ' ') : email.status}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex flex-col items-end gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {email.status === 'pending' && (
                    <button 
                       className="p-2 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary transition-colors"
                       onClick={(e) => handleProcessSingle(email.id, e)}
                    >
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    </button>
                  )}
                  <button className="p-2 rounded-lg bg-surface-container-high hover:bg-error/20 hover:text-error transition-colors text-outline">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
             );
          })}
          
          {filtered.length === 0 && (
            <div className="text-center py-12 text-outline">No records found.</div>
          )}
        </section>

        {/* Intelligence Sidebar */}
        <aside className="w-80 flex flex-col gap-6">
          <div className="bg-surface-container p-6 rounded-xl">
            <h3 className="text-xs font-label uppercase tracking-widest text-outline mb-4">Search & Filters</h3>
            <div className="relative mb-6">
               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
               <input 
                 className="w-full bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-outline/50 outline-none text-on-surface" 
                 placeholder="Search emails..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <div className="space-y-2">
               {['Support', 'Sales', 'Personal', 'Spam'].map(cat => (
                 <label key={cat} onClick={() => setFilter(filter === cat ? 'all' : cat)} className="flex items-center justify-between cursor-pointer group">
                   <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${cat==='Support'?'bg-primary':cat==='Sales'?'bg-secondary':cat==='Spam'?'bg-outline-variant':'bg-on-surface/30'}`}></div>
                     <span className={`text-sm font-medium transition-colors ${filter === cat ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{cat}</span>
                   </div>
                   <span className="text-[10px] font-label text-outline bg-surface-container-high px-2 py-0.5 rounded">
                     {emails.filter(e => e.category === cat).length}
                   </span>
                 </label>
               ))}
            </div>
          </div>
          
          <div className="bg-surface-container p-6 rounded-xl">
            <h3 className="text-xs font-label uppercase tracking-widest text-outline mb-4">AI Status</h3>
            <div className="space-y-3">
              <div 
                 onClick={() => setFilter(filter === 'auto_reply' ? 'all' : 'auto_reply')}
                 className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${filter === 'auto_reply' ? 'bg-tertiary/20 border-tertiary/50' : 'bg-tertiary-container/10 border-tertiary/20'}`}
              >
                <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="text-xs font-bold text-tertiary uppercase tracking-tighter">Auto Replied</span>
              </div>
              <div 
                 onClick={() => setFilter(filter === 'suggest_reply' ? 'all' : 'suggest_reply')}
                 className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${filter === 'suggest_reply' ? 'bg-primary/20 border-primary/50' : 'bg-primary/10 border-primary/20'}`}
              >
                <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">Suggested</span>
              </div>
              <div 
                 onClick={() => setFilter(filter === 'escalate' ? 'all' : 'escalate')}
                 className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${filter === 'escalate' ? 'bg-error-container/20 border-error/50' : 'bg-error-container/10 border-error/20'}`}
              >
                <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="text-xs font-bold text-error uppercase tracking-tighter">Escalated</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
