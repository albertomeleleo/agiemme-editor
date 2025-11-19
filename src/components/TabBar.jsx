import React from 'react';
import './TabBar.css';

const TabBar = ({ files, activeFile, onTabSelect, onTabClose }) => {
    return (
        <div className="tab-bar">
            {files.map((file) => (
                <div
                    key={file.path}
                    className={`tab-item ${file.path === activeFile ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`}
                    onClick={() => onTabSelect(file.path)}
                    title={file.path}
                >
                    <span className="tab-name">
                        {file.path.split('/').pop() || 'untitled.md'}
                    </span>
                    {file.isDirty && <span className="tab-dirty-indicator">●</span>}
                    <button
                        className="tab-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTabClose(file.path);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TabBar;
