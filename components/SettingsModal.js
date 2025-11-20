import React, { useState } from 'react';
import { TRANSLATIONS } from '../translations.js';

const SettingsModal = ({ isOpen, onClose, timeUnit, setTimeUnit, language, setLanguage, onReset }) => {
    const [pendingUnit, setPendingUnit] = useState(null);
    
    if (!isOpen) return null;

    const t = TRANSLATIONS[language];

    const handleUnitChange = (unit) => {
        if (unit === timeUnit) {
            return;
        }
        setPendingUnit(unit);
    };

    const confirmChange = () => {
        if (pendingUnit) {
            setTimeUnit(pendingUnit);
            onReset();
            setPendingUnit(null);
        }
    };

    const cancelChange = () => {
        setPendingUnit(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-[#001489] p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        {t.settingsModal.title}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Language Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.settingsModal.languageLabel}
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                           {t.settingsModal.languageDesc}
                        </p>
                        <div className="flex flex-col space-y-2">
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="language"
                                    value="nl"
                                    checked={language === 'nl'}
                                    onChange={() => setLanguage('nl')}
                                    className="h-4 w-4 text-[#001489] border-gray-300 focus:ring-[#001489]"
                                />
                                <span className="ml-3 block text-sm font-medium text-gray-900">
                                    Nederlands
                                </span>
                            </label>
                            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="language"
                                    value="en"
                                    checked={language === 'en'}
                                    onChange={() => setLanguage('en')}
                                    className="h-4 w-4 text-[#001489] border-gray-300 focus:ring-[#001489]"
                                />
                                <span className="ml-3 block text-sm font-medium text-gray-900">
                                    English
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.settingsModal.timeUnitLabel}
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            {t.settingsModal.timeUnitDesc}
                        </p>
                        <div className="flex flex-col space-y-2">
                            {['Seconds', 'Minutes', 'Hours'].map((unit) => (
                                <label key={unit} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="timeUnit"
                                        value={unit}
                                        checked={timeUnit === unit}
                                        onChange={() => handleUnitChange(unit)}
                                        className="h-4 w-4 text-[#001489] border-gray-300 focus:ring-[#001489]"
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-900">
                                        {unit}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#001489] text-base font-medium text-white hover:bg-[#001075] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001489] sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        {t.settingsModal.done}
                    </button>
                </div>

                {/* Confirmation Overlay */}
                {pendingUnit && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center p-6 animate-fade-in">
                        <div className="bg-white border-2 border-[#C8102E] rounded-xl shadow-2xl p-6 max-w-sm text-center">
                             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#C8102E" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                             </div>
                            <h3 className="text-lg font-bold text-[#C8102E] mb-2">{t.settingsModal.warningTitle}</h3>
                            <p className="text-gray-700 text-sm mb-6">
                                {t.settingsModal.resetWarning}
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={confirmChange}
                                    className="w-full px-4 py-2 bg-[#C8102E] text-white font-bold rounded-lg hover:bg-[#A60D25] transition-colors"
                                >
                                    {t.settingsModal.confirmReset}
                                </button>
                                <button
                                    onClick={cancelChange}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    {t.settingsModal.cancel}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;