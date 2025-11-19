import React from 'react';
import { VscClose, VscHistory } from 'react-icons/vsc';
import './HistoryPanel.css';

const HistoryPanel = ({ history, onRestore, onClose }) => {
    return (
        <div className="history-panel">
            <div className="history-header">
                <h3><VscHistory /> Cronologia</h3>
                <button onClick={onClose} className="close-btn" title="Chiudi"><VscClose /></button>
            </div>
            <div className="history-list">
                {history.length === 0 ? (
                    <div className="no-history">Nessuna versione salvata</div>
                ) : (
                    history.map((snapshot, index) => (
                        <div key={index} className="history-item">
                            <div className="history-info">
                                <span className="history-time">
                                    {new Date(snapshot.timestamp).toLocaleString()}
                                </span>
                                <span className="history-size">
                                    {snapshot.content.length} chars
                                </span>
                            </div>
                            <button
                                onClick={() => onRestore(snapshot)}
                                className="restore-btn"
                            >
                                Ripristina
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;
