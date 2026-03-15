import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
        return id;
    }, [removeToast]);

    const toast = useCallback({
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    }, [addToast]);

    // Fix: useCallback doesn't work on objects, use useRef
    const toastRef = useRef(null);
    if (!toastRef.current) {
        toastRef.current = {
            success: (msg, duration) => addToast(msg, 'success', duration),
            error: (msg, duration) => addToast(msg, 'error', duration),
            warning: (msg, duration) => addToast(msg, 'warning', duration),
            info: (msg, duration) => addToast(msg, 'info', duration),
        };
    }
    // Update the ref methods when addToast changes
    toastRef.current.success = (msg, duration) => addToast(msg, 'success', duration);
    toastRef.current.error = (msg, duration) => addToast(msg, 'error', duration);
    toastRef.current.warning = (msg, duration) => addToast(msg, 'warning', duration);
    toastRef.current.info = (msg, duration) => addToast(msg, 'info', duration);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    };

    return (
        <ToastContext.Provider value={toastRef.current}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`custom-toast toast-${t.type} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}>
                        <span className="toast-icon">{icons[t.type]}</span>
                        <span className="toast-message">{t.message}</span>
                        <button className="toast-close" onClick={() => removeToast(t.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
