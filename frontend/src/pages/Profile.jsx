import React, { useState } from 'react';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  
  return (
    <main className="ml-64 pt-24 px-8 pb-12 bg-surface-container-low min-h-[1024px]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-outline-variant/10 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold font-manrope text-on-surface">Identity Profile</h2>
            <p className="text-outline font-body text-sm mt-1">Manage your AEOS persona and account security.</p>
          </div>
          <button 
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 bg-surface-variant hover:bg-outline-variant/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            {editing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-lg p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-20"></div>
          
          <div className="flex gap-8 items-start relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-surface-container-highest border-2 border-primary overflow-hidden flex-shrink-0 relative group shadow-xl">
              <img src="https://i.pravatar.cc/300?img=68" alt="Profile" className="w-full h-full object-cover" />
              {editing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-on-primary">photo_camera</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2">Display Name</label>
                  {editing ? (
                    <input type="text" className="w-full bg-surface-container-highest border border-primary/50 focus:border-primary rounded-lg px-4 py-2.5 outline-none text-on-surface transition-all font-manrope font-bold text-lg" defaultValue="Sarah Jenkins" />
                  ) : (
                    <p className="text-xl font-bold font-manrope text-on-surface">Sarah Jenkins</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2">Email Address</label>
                  {editing ? (
                    <input type="email" className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary rounded-lg px-4 py-2.5 outline-none text-on-surface transition-all font-body text-base" defaultValue="sarah.j@example.com" />
                  ) : (
                    <p className="text-base text-outline font-body">sarah.j@example.com</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2">Organization</label>
                  {editing ? (
                    <input type="text" className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary rounded-lg px-4 py-2.5 outline-none text-on-surface transition-all font-body" defaultValue="Acme Corp" />
                  ) : (
                    <p className="text-base text-on-surface font-body">Acme Corp</p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2">Role Title</label>
                  {editing ? (
                    <input type="text" className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary rounded-lg px-4 py-2.5 outline-none text-on-surface transition-all font-body" defaultValue="Customer Experience Lead" />
                  ) : (
                    <p className="text-base text-on-surface font-body">Customer Experience Lead</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-primary mb-2">AEOS Signature Block</label>
                {editing ? (
                  <textarea className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary rounded-lg px-4 py-3 outline-none text-on-surface font-body min-h-24 resize-y transition-all" defaultValue={`Best regards,\nSarah (via UrMail Agent)\nCustomer Experience Lead`}></textarea>
                ) : (
                  <div className="bg-surface-container-highest/50 p-4 rounded-lg border border-outline-variant/10 text-sm font-body text-outline font-mono">
                    Best regards,<br/>
                    Sarah (via UrMail Agent)<br/>
                    Customer Experience Lead
                  </div>
                )}
              </div>

              {editing && (
                <div className="pt-4 flex justify-end">
                  <button className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 shadow-md transition-all">
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Box */}
        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-tertiary/10 p-4 rounded-full text-tertiary">
              <span className="material-symbols-outlined text-2xl">shield_locked</span>
            </div>
            <div>
              <h4 className="text-lg font-bold font-manrope text-on-surface">Data Privacy & Security</h4>
              <p className="text-sm text-outline font-body">Your account is fortified with AEOS Grade 5 encryption. Knowledge Base documents are strictly segregated.</p>
            </div>
          </div>
          <button className="border border-tertiary text-tertiary font-bold hover:bg-tertiary/10 px-6 py-2.5 rounded-lg transition-colors font-label tracking-wide uppercase text-xs">
            Review Policy
          </button>
        </div>
      </div>
    </main>
  );
}
