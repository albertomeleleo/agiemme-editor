import React from 'react';
import './HistoryPanel.css';

const HistoryPanel = ({ history, onRestore, onClose }) => {
    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="history-panel">
            <div className="history-header">
                <h3>Cronologia Locale</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="history-list">
                {history.length === 0 ? (
                    <div className="history-empty">Nessuna cronologia disponibile</div>
                ) : (
                    history.map((snapshot) => (
                        <div key={snapshot.id} className="history-item">
                            <div className="history-info">
                                <span className="history-time">{formatDate(snapshot.timestamp)}</span>
                                <span className="history-size">{snapshot.content.length} bytes</span>
                            </div>
                            <button
                                className="restore-btn"
                                onClick={() => onRestore(snapshot)}
                                title="Ripristina questa versione"
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
