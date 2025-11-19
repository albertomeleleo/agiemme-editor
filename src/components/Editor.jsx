import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { mermaid } from 'codemirror-lang-mermaid';
import { languages } from '@codemirror/language-data';
import { EditorState } from '@codemirror/state';
import './Editor.css';

const Editor = ({ content, onChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Crea lo stato dell'editor
    const startState = EditorState.create({
      doc: content || '',
      extensions: [
        basicSetup,
        markdown({ codeLanguages: languages }), // Supporto per altri linguaggi nei blocchi code
        mermaid(), // Syntax highlighting per Mermaid
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            onChange(newContent);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: '"Fira Code", "Monaco", monospace',
          },
          '.cm-content': {
            padding: '10px',
          },
          '&.cm-focused': {
            outline: 'none',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            borderRight: '1px solid var(--border-color)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'var(--hover-color)',
          },
        }),
      ],
    });

    // Crea la vista dell'editor
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Solo al mount

  // Aggiorna il contenuto quando cambia il file
  useEffect(() => {
    if (viewRef.current && content !== undefined) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content || '',
          },
        });
      }
    }
  }, [content]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3>Editor</h3>
      </div>
      <div ref={editorRef} className="editor-content" />
    </div>
  );
};

export default Editor;
