import React, { useState, useEffect, useRef } from 'react';
import { VscClose, VscNewFile } from 'react-icons/vsc';
import './NewFileModal.css';

const NewFileModal = ({ isOpen, onClose, onCreate }) => {
    const [fileName, setFileName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFileName('');
            // Focus input when modal opens
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fileName.trim()) {
            onCreate(fileName.trim());
            setFileName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content new-file-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><VscNewFile /> Nuovo File</h2>
                    <button className="close-btn" onClick={onClose} title="Chiudi"><VscClose /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label htmlFor="filename-input">Nome del file:</label>
                        <input
                            id="filename-input"
                            ref={inputRef}
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="Es. diagramma.md"
                            autoComplete="off"
                        />
                        <p className="hint-text">Estensioni supportate: .md, .mmd, .mermaid</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Annulla</button>
                        <button type="submit" className="btn-primary" disabled={!fileName.trim()}>Crea</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFileModal;
