import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig = {
            success: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', border: 'border-tertiary/20' },
            error: { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/20' },
            info: { bg: 'bg-primary-container', text: 'text-on-primary-container', border: 'border-primary/20' }
          };
          const config = typeConfig[toast.type] || typeConfig.info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl ${config.bg} ${config.text} ${config.border} min-w-[300px] transform transition-all animate-in slide-in-from-right-8`}
            >
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button 
                className="p-1 hover:bg-black/10 rounded transition-colors" 
                onClick={() => removeToast(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
