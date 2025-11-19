import React from 'react';
import { VscClose, VscSettingsGear } from 'react-icons/vsc';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
    if (!isOpen) return null;

    const handleChange = (key, value) => {
        onSave({ ...settings, [key]: value });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content settings-modal">
                <div className="modal-header">
                    <h2><VscSettingsGear /> Impostazioni</h2>
                    <button className="close-btn" onClick={onClose}><VscClose /></button>
                </div>
                <div className="modal-body">
                    <div className="setting-group">
                        <label>Dimensione Font Editor (px)</label>
                        <input
                            type="number"
                            value={settings.fontSize}
                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                            min="10"
                            max="30"
                        />
                    </div>

                    <div className="setting-group">
                        <label>Intervallo Auto-Save (ms)</label>
                        <input
                            type="number"
                            value={settings.autoSaveInterval}
                            onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value))}
                            step="500"
                            min="1000"
                        />
                    </div>

                    <div className="setting-group">
                        <label>AI Provider</label>
                        <select
                            value={settings.aiProvider}
                            onChange={(e) => handleChange('aiProvider', e.target.value)}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label>API Key ({settings.aiProvider})</label>
                        <input
                            type="password"
                            value={settings.apiKey}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            placeholder={`Inserisci la tua API Key per ${settings.aiProvider}`}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Chiudi</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
