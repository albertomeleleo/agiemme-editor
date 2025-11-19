import React, { useState } from 'react';
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
                                content: "You are an expert in Mermaid.js. Generate ONLY the Mermaid code for the requested diagram. Do not include markdown code blocks (```mermaid), just the raw code. If the user asks for something impossible, return a comment explaining why."
                            },
                            {
                                role: "user",
                                content: prompt
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
                        'content-type': 'application/json',
                        'dangerously-allow-browser': 'true' // Only for dev/testing
                    },
                    body: JSON.stringify({
                        model: "claude-3-haiku-20240307",
                        max_tokens: 1024,
                        system: "You are an expert in Mermaid.js. Generate ONLY the Mermaid code for the requested diagram. Do not include markdown code blocks (```mermaid), just the raw code.",
                        messages: [
                            { role: "user", content: prompt }
                        ]
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                generatedCode = data.content[0].text.trim();
            }

            // Clean up code blocks if the LLM included them anyway
            generatedCode = generatedCode.replace(/^```mermaid\n/, '').replace(/^```\n/, '').replace(/```$/, '');

            onGenerate(generatedCode);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content ai-modal">
                <div className="modal-header">
                    <h2>Generatore Diagrammi AI ✨</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="setting-group">
                        <label>Descrivi il diagramma che vuoi creare:</label>
                        <textarea
                            rows="5"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Es. Un diagramma di flusso per il processo di registrazione utente, con verifica email e gestione errori."
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isLoading}>Annulla</button>
                    <button className="btn-primary" onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                        {isLoading ? 'Generazione...' : 'Genera Diagramma'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIGenerator;
