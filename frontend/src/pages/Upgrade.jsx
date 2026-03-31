import React, { useState } from 'react';
import { useToast } from '../components/Toast';

export default function Upgrade() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { addToast } = useToast();

  const handleUpgrade = (plan) => {
    addToast(`${plan} Tier activated seamlessly`, 'success');
  };

  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary uppercase font-bold text-xs tracking-widest font-label ring-1 ring-primary/20 shadow-[0_0_15px_rgba(173,198,255,0.2)]">
            <span className="material-symbols-outlined text-sm">diamond</span>
            UrMail Subscription
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold font-manrope text-on-surface tracking-tight leading-tight">
            Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Autonomous Operations</span>
          </h2>
          <p className="text-outline font-body max-w-2xl mx-auto text-lg pt-2">
            Supercharge your AEOS with enterprise-grade Knowledge Base ingestion, unlimited execution limits, and multi-agent coordination.
          </p>
        </div>

        {/* Toggle Billing */}
        <div className="flex justify-center mb-12">
          <div className="bg-surface-container p-1.5 rounded-2xl flex items-center border border-outline-variant/10 shadow-sm relative">
            <div 
              className={`absolute h-[85%] bg-surface-variant rounded-xl transition-all duration-300 ease-in-out shadow-md`}
              style={{
                width: 'calc(50% - 6px)',
                left: billingCycle === 'monthly' ? '6px' : 'calc(50%)',
              }}
            ></div>
            
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-8 py-2.5 rounded-xl font-bold font-label uppercase tracking-widest text-xs transition-colors w-40 ${billingCycle === 'monthly' ? 'text-on-surface' : 'text-outline hover:text-on-surface'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annually')}
              className={`relative z-10 px-8 py-2.5 rounded-xl font-bold font-label uppercase tracking-widest text-xs transition-colors w-40 flex items-center justify-center gap-2 ${billingCycle === 'annually' ? 'text-on-surface' : 'text-outline hover:text-on-surface'}`}
            >
              Annually <span className="text-[9px] bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          
          {/* Free Tier */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 flex flex-col justify-between hover:border-primary/30 transition-all hover:bg-surface-variant/20 hover:shadow-2xl">
            <div>
              <h3 className="text-xl font-bold font-manrope text-on-surface mb-2">AEOS Free</h3>
              <p className="text-sm font-body text-outline mb-6">Perfect for individual professionals automating personal triage.</p>
              <div className="text-5xl font-extrabold font-manrope text-on-surface mb-8 tracking-tighter">
                $0
                <span className="text-lg text-outline font-normal tracking-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">1 Knowledge Base</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">500 Emails / month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">Basic RAG classification</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="material-symbols-outlined text-outline text-sm mt-0.5">cancel</span>
                  <span className="text-sm font-medium text-outline خط-through">Custom Auto-Replies</span>
                </li>
              </ul>
            </div>
            <button onClick={() => handleUpgrade('Free')} className="w-full py-3.5 bg-surface-variant hover:bg-outline-variant/20 text-on-surface font-bold rounded-xl transition-colors tracking-wide font-headline text-sm">
              Current Plan
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="bg-gradient-to-br w-full from-surface-container to-surface-container-highest rounded-3xl p-[1px] relative shadow-[0_10px_40px_-15px_rgba(173,198,255,0.3)] transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[0.6875rem] shadow-lg border border-primary/20 z-10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Most Popular
            </div>
            <div className="bg-surface-container rounded-3xl p-8 h-full flex flex-col justify-between border-[0.5px] border-primary/30 relative overflow-hidden group">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-primary/5 via-transparent to-transparent rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold font-manrope text-primary mb-2">AEOS Pro</h3>
                <p className="text-sm font-body text-outline mb-6">For power users and small teams demanding high automation.</p>
                <div className="text-5xl font-extrabold font-manrope text-on-surface mb-8 tracking-tighter">
                  ${billingCycle === 'monthly' ? '29' : '23'}
                  <span className="text-lg text-outline font-normal tracking-normal">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span className="text-sm font-medium text-on-surface">5 Premium Knowledge Bases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span className="text-sm font-medium text-on-surface">15,000 Emails / month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span className="text-sm font-medium text-on-surface">Advanced RAG & Decision Engine</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span className="text-sm font-medium text-on-surface">Auto-Reply Execution</span>
                  </li>
                </ul>
              </div>
              <button onClick={() => handleUpgrade('Pro')} className="relative z-10 w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] tracking-wide font-headline text-sm border border-primary/20">
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Elite Tier */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 flex flex-col justify-between hover:border-tertiary/30 transition-all hover:bg-surface-variant/20 hover:shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-tertiary/20 transition-colors"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-manrope text-on-surface mb-2">AEOS Elite</h3>
              <p className="text-sm font-body text-outline mb-6">Unrestricted enterprise deployment with API CRM integration.</p>
              <div className="text-5xl font-extrabold font-manrope text-on-surface mb-8 tracking-tighter">
                ${billingCycle === 'monthly' ? '99' : '79'}
                <span className="text-lg text-outline font-normal tracking-normal">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">Unlimited Knowledge Bases</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">Unlimited Email Bandwidth</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">Multi-Agent Workflow Pipelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check_circle</span>
                  <span className="text-sm font-medium text-on-surface">Dedicated Support Server</span>
                </li>
              </ul>
            </div>
            <button onClick={() => handleUpgrade('Elite')} className="relative z-10 w-full py-3.5 bg-surface-variant hover:bg-outline-variant/20 text-tertiary hover:text-on-surface border border-tertiary/20 hover:border-tertiary font-bold rounded-xl transition-all tracking-wide font-headline text-sm active:scale-[0.98]">
              Contact Sales
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
