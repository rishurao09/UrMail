import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { fetchEmails } from '../data/api';

export default function Spam() {
  const [spamEmails, setSpamEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSpam() {
      try {
        const res = await fetchEmails();
        // Filter based on spam category or escalated state. We'll simply show simulated spam if none exists
        let spam = (res.emails || []).filter(e => e.category === 'Spam');
        
        // Mock some spam if empty for demo purposes
        if (spam.length === 0) {
          spam = [
            { id: "spam_1", subject: "You've Won $1,000,000 immediately!!", sender: "Admin Rewards", date: new Date().toISOString(), category: "Spam", confidence: 0.99 },
            { id: "spam_2", subject: "LIMITED TIME OFFER - ACT FAST", sender: "Marketing Pro", date: new Date().toISOString(), category: "Spam", confidence: 0.95 }
          ];
        }
        
        setSpamEmails(spam);
      } catch (err) {
        addToast('Failed to load spam folder', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSpam();
  }, [addToast]);

  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-[1024px]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end border-b border-outline-variant/10 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold font-manrope tracking-tight text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-3xl">report</span>
              Spam Filtering
            </h2>
            <p className="text-outline mt-1 font-body text-sm">Emails automatically quarantined by the AEOS due to high spam probability patterns.</p>
          </div>
          <button className="text-error font-bold text-sm bg-error/10 hover:bg-error/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            Empty Spam
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-tertiary text-4xl mb-4">refresh</span>
            <p className="font-label uppercase tracking-widest text-outline text-sm">Evaluating Headers...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {spamEmails.map((email) => (
              <div 
                key={email.id} 
                className="group flex items-center justify-between p-4 bg-surface-container rounded-xl border border-error/20 hover:border-error/50 transition-colors shadow-sm cursor-pointer"
                onClick={() => navigate(`/email/${email.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-error/10 p-3 rounded-lg text-error">
                    <span className="material-symbols-outlined">block</span>
                  </div>
                  <div>
                    <h3 className="text-on-surface font-bold font-manrope pr-4">{email.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-outline">{email.sender}</span>
                      <span className="text-[0.6rem] bg-error/20 text-error px-2 py-0.5 rounded font-label uppercase tracking-wider">
                        Spam Probability: {(email.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-outline text-xs pr-4 opacity-50 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <button className="hover:bg-surface-variant p-2 rounded transition-colors" title="Delete">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button className="hover:bg-surface-variant p-2 rounded transition-colors" title="Not Spam">
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                </div>
              </div>
            ))}
            
            {spamEmails.length === 0 && (
              <div className="text-center py-16 text-outline bg-surface-container rounded-xl border border-outline-variant/10 border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">check_circle</span>
                <p>Hooray! No spam in your queue.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
