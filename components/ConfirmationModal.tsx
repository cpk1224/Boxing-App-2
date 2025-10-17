import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-xs sm:max-w-sm shadow-2xl border border-slate-700 transform transition duration-300 scale-100 animate-fade-in">
                <h2 className="text-xl font-bold mb-2 text-white">Stop Training?</h2>
                <p className="text-slate-400 mb-6 text-sm">Are you sure you want to stop? Your current progress will be lost.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-3 py-2 text-sm font-medium rounded-lg text-amber-400 hover:bg-slate-700 transition uppercase">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition uppercase shadow-md">Stop & Reset</button>
                </div>
            </div>
        </div>
    );
};
