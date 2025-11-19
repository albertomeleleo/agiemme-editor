import React from 'react';
import { VscClose, VscCircleFilled } from 'react-icons/vsc';
import './TabBar.css';

const TabBar = ({ files, activeFile, onTabSelect, onTabClose }) => {
    return (
        <div className="tab-bar">
            {files.map(file => (
                <div
                    key={file.path}
                    className={`tab-item ${file.path === activeFile ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`}
                    onClick={() => onTabSelect(file.path)}
                    title={file.path}
                >
                    <span className="tab-name">{file.path.split('/').pop()}</span>
                    {file.isDirty && <span className="tab-dirty-indicator"><VscCircleFilled /></span>}
                    <button
                        className="tab-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTabClose(file.path);
                        }}
                        title="Chiudi"
                    >
                        <VscClose />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TabBar;
