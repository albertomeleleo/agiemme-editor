import React from 'react';
import { marked } from 'marked';
import { VscClose, VscQuestion } from 'react-icons/vsc';
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
                    <h2><VscQuestion /> Guida Utente</h2>
                    <button className="close-btn" onClick={onClose} title="Chiudi"><VscClose /></button>
                </div>
                <div className="modal-body">
                    <div className="markdown-content" dangerouslySetInnerHTML={getMarkdownText()} />
                </div>
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Chiudi</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
