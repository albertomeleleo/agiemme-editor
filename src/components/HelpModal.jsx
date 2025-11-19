import React from 'react';
import { marked } from 'marked';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    const getMarkdownText = () => {
        const rawMarkup = marked(content);
        return { __html: rawMarkup };
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content help-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Guida Utente</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body help-content" dangerouslySetInnerHTML={getMarkdownText()} />
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Chiudi</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
