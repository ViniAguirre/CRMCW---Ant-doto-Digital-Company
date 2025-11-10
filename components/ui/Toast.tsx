
import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle } from '../icons';

export interface ToastData {
    message: string;
    type: 'success' | 'error';
}

interface ToastProps extends ToastData {
    onClose: () => void;
}

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
};

const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            role="alert"
            className={`fixed top-5 right-5 z-50 flex items-center p-4 text-sm rounded-lg shadow-lg border animate-fade-in-down ${colors[type]}`}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="ml-3 font-medium text-brand-black">
                {message}
            </div>
            <button 
                type="button" 
                className="ml-4 -mr-1.5 -my-1.5 p-1.5 rounded-full inline-flex items-center justify-center hover:bg-gray-200/50"
                onClick={onClose}
                aria-label="Fechar"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};
