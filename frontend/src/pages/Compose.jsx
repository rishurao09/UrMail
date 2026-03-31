import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function Compose() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      addToast('Please fill out all fields', 'error');
      return;
    }
    setIsSending(true);
    
    // Simulate email dispatch
    setTimeout(() => {
      setIsSending(false);
      addToast('Email dispatched to UrMail Outbox', 'success');
      navigate('/inbox');
    }, 1500);
  };

  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-[1024px]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold font-manrope tracking-tight text-on-surface">Compose Agent</h2>
          <p className="text-outline mt-1 font-body text-sm">Draft a new outbound email or task for the AEOS to process.</p>
        </div>

        <form onSubmit={handleSend} className="bg-surface-container rounded-2xl p-6 ring-1 ring-outline-variant/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary"></div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-outline mb-2">To</label>
              <input 
                type="email" 
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-outline mb-2">Subject</label>
              <input 
                type="text" 
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-outline mb-2">Message Body</label>
              <textarea 
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body min-h-[300px] resize-y"
                placeholder="Draft your message. UrMail AEOS will automatically refine and track this outgoing thread..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <div className="flex gap-2">
                <button type="button" className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button type="button" className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">format_bold</span>
                </button>
                <button type="button" className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">smart_toy</span>
                </button>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-surface bg-surface-variant hover:bg-outline-variant/20 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-primary bg-primary hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSending ? (
                    <span className="material-symbols-outlined animate-spin text-sm">cycle</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                  )}
                  {isSending ? 'Sending...' : 'Send securely'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
