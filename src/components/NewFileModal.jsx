import React, { useState, useEffect, useRef } from 'react';
import './NewFileModal.css';

const NewFileModal = ({ isOpen, onClose, onCreate }) => {
    const [fileName, setFileName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setFileName('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fileName.trim()) {
            onCreate(fileName.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content new-file-modal">
                <div className="modal-header">
                    <h2>Nuovo File</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label htmlFor="filename">Nome del file:</label>
                        <input
                            type="text"
                            id="filename"
                            ref={inputRef}
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="es: diagramma.md"
                            required
                        />
                        <small>Estensioni supportate: .md, .mmd</small>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annulla
                        </button>
                        <button type="submit" className="btn-primary">
                            Crea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFileModal;
