import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content settings-modal">
                <div className="modal-header">
                    <h2>Impostazioni</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="setting-group">
                        <label>Dimensione Font Editor (px)</label>
                        <input
                            type="number"
                            value={localSettings.fontSize}
                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                            min="10"
                            max="32"
                        />
                    </div>

                    <div className="setting-group">
                        <label>Intervallo Auto-Save (ms)</label>
                        <input
                            type="number"
                            value={localSettings.autoSaveInterval}
                            onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value))}
                            min="1000"
                            step="1000"
                        />
                        <small>Default: 2000ms (2 secondi)</small>
                    </div>

                    <div className="setting-group">
                        <h3>Configurazione AI</h3>
                        <label>Provider</label>
                        <select
                            value={localSettings.aiProvider}
                            onChange={(e) => handleChange('aiProvider', e.target.value)}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label>API Key</label>
                        <input
                            type="password"
                            value={localSettings.apiKey}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            placeholder={`Inserisci la tua chiave ${localSettings.aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}`}
                        />
                        <small>La chiave viene salvata solo nel tuo browser (localStorage).</small>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Annulla</button>
                    <button className="btn-primary" onClick={handleSave}>Salva</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
