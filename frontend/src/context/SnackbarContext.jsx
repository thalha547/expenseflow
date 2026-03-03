import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success', // 'success' | 'error' | 'info'
    });

    const showSnackbar = useCallback((message, type = 'success') => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev, open: false }));
        }, 5000);
    }, []);

    const closeSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            {snackbar.open && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`
                        flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border
                        ${snackbar.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400/50' :
                            snackbar.type === 'error' ? 'bg-rose-500/90 text-white border-rose-400/50' :
                                'bg-indigo-600/90 text-white border-indigo-400/50'}
                    `}>
                        <div className="flex-shrink-0">
                            {snackbar.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {snackbar.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {snackbar.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <p className="flex-grow text-sm font-bold tracking-tight">
                            {snackbar.message}
                        </p>
                        <button
                            onClick={closeSnackbar}
                            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};
