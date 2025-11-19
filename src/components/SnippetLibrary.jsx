import React from 'react';
import './SnippetLibrary.css';

const SNIPPETS = [
    {
        category: 'Flowchart',
        items: [
            { label: 'Start/End', code: 'id1([Start/End])' },
            { label: 'Process', code: 'id1[Process]' },
            { label: 'Decision', code: 'id1{Decision}' },
            { label: 'Subroutine', code: 'id1[[Subroutine]]' },
            { label: 'Database', code: 'id1[(Database)]' },
            { label: 'Circle', code: 'id1((Circle))' },
            { label: 'Arrow', code: 'A --> B' },
            { label: 'Dotted Arrow', code: 'A -.-> B' },
            { label: 'Text Arrow', code: 'A -- Text --> B' },
        ]
    },
    {
        category: 'Sequence',
        items: [
            { label: 'Participant', code: 'participant Alice' },
            { label: 'Actor', code: 'actor Alice' },
            { label: 'Sync Message', code: 'Alice->>John: Hello John, how are you?' },
            { label: 'Async Message', code: 'Alice-)John: Hello John, how are you?' },
            { label: 'Dotted Line', code: 'Alice-->>John: Hello John, how are you?' },
            { label: 'Note', code: 'Note right of Alice: This is a note' },
            { label: 'Loop', code: 'loop Every minute\n    Alice->>John: Hello\nend' },
            { label: 'Alt', code: 'alt is sick\n    Alice->>John: Not feeling well\nelse is well\n    Alice->>John: Feeling good\nend' },
        ]
    },
    {
        category: 'Class',
        items: [
            { label: 'Class', code: 'classClassName {\n    +String attribute\n    +method()\n}' },
            { label: 'Inheritance', code: 'Class01 <|-- Class02' },
            { label: 'Composition', code: 'Class01 *-- Class02' },
            { label: 'Aggregation', code: 'Class01 o-- Class02' },
        ]
    },
    {
        category: 'State',
        items: [
            { label: 'Start', code: '[*]' },
            { label: 'State', code: 'State1' },
            { label: 'Transition', code: 'State1 --> State2' },
            { label: 'Composite', code: 'state CompositeState {\n    [*];\n}' },
        ]
    },
    {
        category: 'ER Diagram',
        items: [
            { label: 'Entity', code: 'ENTITY {\n    string attribute\n}' },
            { label: 'One to One', code: 'Entity1 ||--|| Entity2 : label' },
            { label: 'One to Many', code: 'Entity1 ||--|{ Entity2 : label' },
            { label: 'Many to Many', code: 'Entity1 }|--|{ Entity2 : label' },
        ]
    }
];

const SnippetLibrary = ({ onInsert }) => {
    return (
        <div className="snippet-library">
            <div className="snippet-header">
                <h3>Snippets</h3>
            </div>
            <div className="snippet-content">
                {SNIPPETS.map((category) => (
                    <div key={category.category} className="snippet-category">
                        <h4>{category.category}</h4>
                        <div className="snippet-grid">
                            {category.items.map((item, index) => (
                                <button
                                    key={index}
                                    className="snippet-item"
                                    onClick={() => onInsert(item.code)}
                                    title={item.code}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SnippetLibrary;
