import React, { useState } from 'react';
import { useToast } from '../components/Toast';

export default function Settings() {
  const { addToast } = useToast();
  const [theme, setTheme] = useState('Lumina Nocturne Dark');
  const [notifications, setNotifications] = useState(true);
  const [autoReply, setAutoReply] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.9);

  const handleSave = () => {
    addToast('Settings updated successfully', 'success');
  };

  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b border-outline-variant/10 pb-6">
          <h2 className="text-3xl font-extrabold font-manrope text-on-surface">Configuration</h2>
          <p className="text-outline font-body text-sm mt-1">Tune UrMail Agentic logic and visual preferences.</p>
        </div>

        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm space-y-8">
          
          {/* Agent Preferences */}
          <div>
            <h3 className="text-lg font-bold font-manrope text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">robot</span>
              Agent Governance
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Auto-Reply Enabled</h4>
                  <p className="text-xs text-outline w-3/4">When enabled, the Decision Engine will autonomously send emails if the confidence threshold is met.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoReply} onChange={() => setAutoReply(!autoReply)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <h4 className="text-sm font-bold text-on-surface">Execution Threshold</h4>
                  <p className="text-xs text-outline mt-1">Confidence rating required for autonomous action without human review.</p>
                </div>
                <div className="w-1/2 flex items-center gap-4">
                  <input 
                    type="range" min="0.5" max="1.0" step="0.05" 
                    value={confidenceThreshold} 
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-bold font-manrope text-primary bg-primary/10 px-3 py-1 rounded-lg min-w-16 text-center">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/10" />

          {/* Interface */}
          <div>
            <h3 className="text-lg font-bold font-manrope text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">palette</span>
              Interface & Notifications
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Active Theme</h4>
                  <p className="text-xs text-outline w-3/4">Stitch Design System theme rendering.</p>
                </div>
                <select 
                  className="bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option>Lumina Nocturne Dark</option>
                  <option>Stitch Daylight</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Push Notifications</h4>
                  <p className="text-xs text-outline w-3/4">Receive alerts for escalated emails requiring manual overriding.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-surface bg-surface-variant hover:bg-outline-variant/20 transition-colors">Discard</button>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-primary bg-primary hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Preferences
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
