import React, { useState } from 'react';
import { VscClose, VscSparkle, VscLoading } from 'react-icons/vsc';
import './SettingsModal.css'; // Reuse modal styles

const AIGenerator = ({ isOpen, onClose, onGenerate, apiKey, provider }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if (!apiKey) {
            setError('API Key mancante. Configurala nelle impostazioni.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let generatedCode = '';

            if (provider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "Sei un esperto di Mermaid.js. Genera SOLO il codice Mermaid valido per il diagramma richiesto. Non aggiungere spiegazioni o markdown (```mermaid)."
                            },
                            {
                                role: "user",
                                content: `Crea un diagramma Mermaid per: ${prompt}`
                            }
                        ],
                        temperature: 0.7
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                generatedCode = data.choices[0].message.content.trim();
            } else if (provider === 'anthropic') {
                // Simple implementation for Anthropic (requires proxy usually due to CORS, but let's try direct)
                // Note: Anthropic API usually blocks direct browser calls due to CORS. 
                // This might fail in browser environment without a backend proxy.
                // For Electron, we might need to disable web security or use main process.
                // For now, let's assume OpenAI is the primary working one or Electron allows it.

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "claude-3-haiku-20240307",
                        max_tokens: 1024,
                        messages: [
                            { role: "user", content: `Genera SOLO il codice Mermaid valido per: ${prompt}. Non aggiungere spiegazioni o markdown.` }
                        ]
                    })
                });

                // Note: Anthropic API calls from browser might fail due to CORS if not proxied.
                // In a real Electron app, we should use ipcRenderer to call via main process.
                // For this demo, we assume it might work or fail.
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                generatedCode = data.content[0].text.trim();
            }

            // Clean up code blocks if the LLM included them anyway
            generatedCode = generatedCode.replace(/^```mermaid\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

            onGenerate(generatedCode);
            onClose();
            setPrompt('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content settings-modal">
                <div className="modal-header">
                    <h2><VscSparkle /> Genera Diagramma AI</h2>
                    <button className="close-btn" onClick={onClose}><VscClose /></button>
                </div>

                <div className="modal-body">
                    <p>Descrivi il diagramma che vuoi creare:</p>
                    <textarea
                        rows="5"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Es. Un diagramma di flusso per un processo di login..."
                        disabled={isLoading}
                        style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                    />

                    {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isLoading}>Annulla</button>
                    <button className="btn-primary" onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                        {isLoading ? <><VscLoading className="spin" /> Generazione...</> : 'Genera'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIGenerator;
