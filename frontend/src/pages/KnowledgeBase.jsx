import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/Toast';
import { fetchKBs, createKB, deleteKB, uploadDocument, checkKBLimit, fetchUser } from '../data/api';

export default function KnowledgeBase() {
  const [kbs, setKBs] = useState([]);
  const [limit, setLimit] = useState(null);
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKBName, setNewKBName] = useState('');
  const [uploading, setUploading] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [kbsRes, limitRes, userRes] = await Promise.all([
        fetchKBs(),
        checkKBLimit(),
        fetchUser(),
      ]);
      setKBs(kbsRes.knowledge_bases || []);
      setLimit(limitRes);
      setUser(userRes);
    } catch (err) {
      console.error('Load KB data:', err);
    }
  }

  async function handleCreate() {
    if (!newKBName.trim()) {
      addToast('Please enter a name', 'error');
      return;
    }
    try {
      await createKB(newKBName.trim());
      addToast('Knowledge base created', 'success');
      setNewKBName('');
      setShowCreate(false);
      await loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Knowledge Bases</h2>
          <p className="text-on-surface-variant max-w-xl">Manage the high-fidelity data sources powering your autonomous agents. These stores provide the semantic context for all AI-driven communications.</p>
        </div>
        
        {user && limit && (
          <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary flex items-center gap-6 shadow-xl">
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-label text-outline uppercase tracking-widest mb-1">{user.tier} Plan</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-headline font-bold text-primary">{limit.current_count} <span className="text-sm font-normal text-outline">of</span> {limit.max_allowed}</span>
                <span className="text-xs text-on-surface-variant">KBs Active</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-outline-variant/20"></div>
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-label text-outline uppercase tracking-widest mb-1">Status</span>
              <span className="text-sm font-medium text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Knowledge Base List */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-headline font-bold text-on-surface">Active Repositories</h3>
          </div>

          {kbs.map((kb, idx) => (
            <KBCard 
               key={kb.id} 
               kb={kb} 
               idx={idx}
               onDelete={async (id) => {
                 if (!confirm('Delete this knowledge base?')) return;
                 try {
                   await deleteKB(id);
                   addToast('Knowledge base deleted', 'info');
                   await loadData();
                 } catch (err) {
                   addToast(err.message, 'error');
                 }
               }} 
            />
          ))}

          {kbs.length === 0 && (
             <div className="bg-surface-container rounded-lg p-10 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-outline text-5xl mb-4">database</span>
                <h3 className="font-headline font-bold text-on-surface mb-2">No Repositories</h3>
                <p className="text-outline text-sm">Create your first knowledge base to improve agent answers.</p>
             </div>
          )}
        </div>

        {/* Right Column: Upload & Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <button 
             onClick={() => setShowCreate(true)}
             disabled={limit && !limit.allowed}
             className="w-full h-20 group relative rounded-lg border-2 border-dashed border-outline-variant/30 hover:border-primary/50 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span className="font-headline font-bold text-on-surface-variant group-hover:text-primary transition-colors">
              {limit && !limit.allowed ? 'Limit Reached' : 'Create New Knowledge Base'}
            </span>
          </button>

          {/* Upload Zone (assuming first KB for demo) */}
          {kbs.length > 0 && (
            <UploadZone 
               kb={kbs[0]} 
               onUpload={async (kbId, files) => {
                 setUploading(prev => ({ ...prev, [kbId]: true }));
                 try {
                   for (const file of files) {
                     await uploadDocument(kbId, file);
                     addToast(`"${file.name}" uploaded`, 'success');
                   }
                   await loadData();
                 } catch (err) {
                   addToast('Upload failed: ' + err.message, 'error');
                 } finally {
                   setUploading(prev => ({ ...prev, [kbId]: false }));
                 }
               }}
               isUploading={uploading[kbs[0].id]}
            />
          )}

          <div className="bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-lg p-6 border border-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[0.6875rem] font-label text-primary uppercase tracking-widest">UrMail Intelligence</span>
              </div>
              <h4 className="font-headline font-bold text-on-surface mb-2">Optimize Your Context</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Large documents (50+ pages) are better processed as separate files to improve retrieval accuracy in complex SOP queries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-outline-variant/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6">Create Knowledge Base</h2>
            <div className="mb-6">
              <label className="text-xs font-label text-outline uppercase tracking-wider mb-2 block">Repository Name</label>
              <input 
                 className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface outline-none"
                 placeholder="e.g. Acme Employee Handbook"
                 autoFocus
                 value={newKBName}
                 onChange={e => setNewKBName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                 onClick={() => setShowCreate(false)}
                 className="px-4 py-2 rounded-lg text-sm font-medium text-outline hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button 
                 onClick={handleCreate}
                 className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span> Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function KBCard({ kb, idx, onDelete }) {
  const isExpired = !kb.is_active;
  const theme = idx % 2 === 0 ? 'tertiary' : 'primary';

  return (
    <div className="group bg-surface-container rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-high transition-all duration-300 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${theme}/40`}></div>
      <div className="flex items-start gap-5">
        <div className={`w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center text-${theme}`}>
          <span className="material-symbols-outlined text-3xl">{idx % 2 === 0 ? 'support_agent' : 'point_of_sale'}</span>
        </div>
        <div>
          <h4 className="text-lg font-headline font-bold text-on-surface mb-1">{kb.name}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span className="flex items-center gap-1 text-xs text-outline">
              <span className="material-symbols-outlined text-[14px]">description</span> {kb.document_count || 0} Documents
            </span>
            <span className="flex items-center gap-1 text-xs text-outline">
              <span className="material-symbols-outlined text-[14px]">grid_view</span> {kb.chunk_count || 0} Chunks
            </span>
            <span className="flex items-center gap-1 text-xs text-outline">
              <span className="material-symbols-outlined text-[14px]">update</span> {new Date(kb.expiry_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <span className={`bg-${theme}/10 text-${theme} text-[10px] font-label px-2 py-1 rounded uppercase tracking-tighter`}>{isExpired ? 'Expired' : 'Active'}</span>
        </div>
        <button 
           className="w-10 h-10 rounded-full flex items-center justify-center text-error opacity-0 group-hover:opacity-100 hover:bg-error/10 transition-all"
           onClick={() => onDelete(kb.id)}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}

function UploadZone({ kb, onUpload, isUploading }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onUpload(kb.id, files);
  }

  return (
    <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-on-surface">Ingest Data ({kb.name})</h3>
        <span className="material-symbols-outlined text-outline">cloud_upload</span>
      </div>

      <div 
        className={`border-2 border-dashed ${dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/20 bg-surface-container-low'} rounded-lg p-10 flex flex-col items-center text-center hover:bg-surface-container-highest/20 transition-colors cursor-pointer relative overflow-hidden`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input 
          ref={fileRef} 
          type="file" 
          accept=".txt,.pdf,.docx" 
          multiple hidden 
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) onUpload(kb.id, files);
            e.target.value = '';
          }} 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
             <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
             <p className="text-sm font-medium text-primary">Processing document...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-primary/40 group-hover:text-primary">
              <span className="material-symbols-outlined text-5xl">upload_file</span>
            </div>
            <p className="text-sm text-on-surface mb-1">Drag &amp; drop files to upload</p>
            <p className="text-xs text-outline mb-6">Supported: .txt, .pdf, .docx</p>
            <button className="bg-surface-container-highest px-4 py-2 rounded text-sm font-medium text-on-surface pointer-events-none">
              Select Files
            </button>
          </>
        )}
      </div>
    </div>
  );
}
