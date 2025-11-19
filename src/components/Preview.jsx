import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { marked } from 'marked';
import './Preview.css';

// Temi disponibili per Mermaid
const MERMAID_THEMES = {
  default: 'Default',
  forest: 'Forest',
  dark: 'Dark',
  neutral: 'Neutral',
  base: 'Base'
};

const Preview = ({ content }) => {
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [debouncedContent, setDebouncedContent] = useState(content);
  const [theme, setTheme] = useState('default');
  const [isRendering, setIsRendering] = useState(false);

  // Debounce content updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [content]);

  // Re-initialize mermaid when theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
    });
    // Force re-render by toggling content slightly or just calling render
    // Actually, we can just trigger the render effect by depending on theme
  }, [theme]);

  useEffect(() => {
    if (!debouncedContent || !previewRef.current) {
      if (previewRef.current) {
        previewRef.current.innerHTML = '<div class="empty-preview">Nessun contenuto da visualizzare</div>';
      }
      return;
    }

    const renderContent = async () => {
      setIsRendering(true);
      try {
        // Controlla se il contenuto è Mermaid
        const mermaidKeywords = [
          'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
          'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph', 'mindmap', 'timeline',
        ];

        const trimmedContent = debouncedContent.trim();
        // Rimuovi commenti iniziali per il check
        const cleanContent = trimmedContent.replace(/^%%.*\n/gm, '').trim();

        const isMermaid = mermaidKeywords.some((keyword) =>
          cleanContent.startsWith(keyword)
        );

        if (isMermaid) {
          // Rendering Mermaid
          const id = `mermaid-${Date.now()}`;
          previewRef.current.innerHTML = `<div class="mermaid-diagram" id="${id}">${debouncedContent}</div>`;

          try {
            await mermaid.run({
              nodes: [document.getElementById(id)],
            });
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            previewRef.current.innerHTML = `
              <div class="error-message">
                <h3>Errore nel rendering Mermaid</h3>
                <pre>${error.message}</pre>
              </div>
            `;
          }
        } else {
          // Rendering Markdown
          const renderer = new marked.Renderer();

          renderer.code = function (code, language) {
            if (language === 'mermaid') {
              return `<div class="mermaid-diagram">${code}</div>`;
            }
            return `<pre><code class="language-${language || 'plaintext'}">${code}</code></pre>`;
          };

          marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true,
          });

          const html = marked(debouncedContent);
          previewRef.current.innerHTML = html;

          // Renderizza eventuali diagrammi Mermaid nei code blocks
          const mermaidElements = previewRef.current.querySelectorAll('.mermaid-diagram');
          if (mermaidElements.length > 0) {
            try {
              await mermaid.run({
                nodes: Array.from(mermaidElements),
              });
            } catch (error) {
              console.error('Mermaid in markdown rendering error:', error);
            }
          }
        }
      } catch (error) {
        console.error('Preview rendering error:', error);
        previewRef.current.innerHTML = `
          <div class="error-message">
            <h3>Errore nel rendering</h3>
            <pre>${error.message}</pre>
          </div>
        `;
      } finally {
        setIsRendering(false);
      }
    };

    renderContent();
  }, [debouncedContent, theme]);

  // Gestione zoom con rotella del mouse
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prevZoom) => Math.max(0.1, Math.min(5, prevZoom + delta)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Gestione drag per pan
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Click sinistro
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Reset zoom e pan
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom in/out con pulsanti
  const zoomIn = () => {
    setZoom((prevZoom) => Math.min(5, prevZoom + 0.2));
  };

  const zoomOut = () => {
    setZoom((prevZoom) => Math.max(0.1, prevZoom - 0.2));
  };

  // Export functions
  const handleExport = async (format) => {
    const svgElement = previewRef.current.querySelector('svg');
    if (!svgElement) {
      alert('Nessun diagramma da esportare');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Get dimensions from SVG
    const svgRect = svgElement.getBoundingClientRect();
    const width = svgRect.width * 2; // 2x scale for better quality
    const height = svgRect.height * 2;

    canvas.width = width;
    canvas.height = height;

    if (format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `diagram.${format}`);
    } else if (format === 'png') {
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = theme === 'dark' ? '#1e1e1e' : '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const pngUrl = canvas.toDataURL('image/png');
        downloadFile(pngUrl, `diagram.png`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <div className="preview-title">
          <h3>Anteprima</h3>
          {isRendering && <span className="loading-indicator">⚡</span>}
        </div>

        <div className="preview-controls">
          <div className="theme-selector">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              title="Tema Diagramma"
            >
              {Object.entries(MERMAID_THEMES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="export-controls">
            <button onClick={() => handleExport('png')} className="action-btn" title="Esporta PNG">
              PNG
            </button>
            <button onClick={() => handleExport('svg')} className="action-btn" title="Esporta SVG">
              SVG
            </button>
          </div>

          <div className="zoom-controls">
            <button onClick={zoomOut} className="zoom-btn" title="Zoom Out">-</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} className="zoom-btn" title="Zoom In">+</button>
            <button onClick={resetView} className="zoom-btn reset" title="Reset View">Reset</button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`preview-content-wrapper ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={previewRef}
          className="preview-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};

export default Preview;
