import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import './Preview.css';

// Configurazione di marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

const MERMAID_THEMES = [
  { id: 'default', name: 'Default' },
  { id: 'forest', name: 'Forest' },
  { id: 'dark', name: 'Dark' },
  { id: 'neutral', name: 'Neutral' },
  { id: 'base', name: 'Base' }
];

const Preview = ({ content, isDarkMode }) => {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const mermaidRef = useRef(null); // Ref to the SVG element

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isRendering, setIsRendering] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState(content);
  const [theme, setTheme] = useState(isDarkMode ? 'dark' : 'forest');

  // Sync theme with isDarkMode prop
  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'forest');
  }, [isDarkMode]);

  // Debounce content update
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
    });
    renderContent();
  }, [theme]);

  const renderContent = useCallback(async () => {
    if (!previewRef.current) return;

    setIsRendering(true);
    const container = previewRef.current;
    container.innerHTML = '';

    // Check if content is pure Mermaid or Markdown
    const mermaidKeywords = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
      'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph', 'mindmap', 'timeline',
    ];

    const trimmedContent = debouncedContent.trim();
    const cleanContent = trimmedContent.replace(/^%%.*\n/gm, '').trim();
    const isMermaid = mermaidKeywords.some((keyword) => cleanContent.startsWith(keyword));

    try {
      if (isMermaid) {
        // Render pure Mermaid
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, debouncedContent);
        container.innerHTML = svg;
        mermaidRef.current = container.querySelector('svg');
      } else {
        // Render Markdown
        container.innerHTML = marked(debouncedContent);

        // Find and render mermaid blocks in markdown
        const mermaidBlocks = container.querySelectorAll('.language-mermaid');
        for (let i = 0; i < mermaidBlocks.length; i++) {
          const block = mermaidBlocks[i];
          const code = block.innerText;
          const id = `mermaid-block-${i}-${Date.now()}`;
          try {
            const { svg } = await mermaid.render(id, code);
            const div = document.createElement('div');
            div.innerHTML = svg;
            div.className = 'mermaid-diagram';
            block.parentNode.replaceChild(div, block);
            if (i === 0) mermaidRef.current = div.querySelector('svg');
          } catch (err) {
            console.error('Mermaid block render error:', err);
            block.innerHTML = `<pre class="error">${err.message}</pre>`;
          }
        }
      }
    } catch (error) {
      console.error('Render error:', error);
      container.innerHTML = `<pre class="error">${error.message}</pre>`;
    } finally {
      setIsRendering(false);
    }
  }, [debouncedContent, theme]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  // Zoom & Pan Handlers
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.1, Math.min(5, prev + delta)));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
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

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.1));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export Logic
  const downloadFile = (href, filename) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format) => {
    // Try to find the first SVG
    const svgElement = previewRef.current.querySelector('svg');
    if (!svgElement) {
      alert('Nessun diagramma da esportare');
      return;
    }

    const filename = `diagram-${Date.now()}`;
    const svgData = new XMLSerializer().serializeToString(svgElement);

    if (format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `${filename}.svg`);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width * 2;
      const height = bbox.height * 2;

      canvas.width = width;
      canvas.height = height;

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = theme === 'dark' ? '#1e1e1e' : '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const pngUrl = canvas.toDataURL('image/png');
        downloadFile(pngUrl, `${filename}.png`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (format === 'pdf') {
      try {
        const bbox = svgElement.getBoundingClientRect();
        const orientation = bbox.width > bbox.height ? 'l' : 'p';

        const doc = new jsPDF({
          orientation: orientation,
          unit: 'pt',
          format: [bbox.width + 40, bbox.height + 40]
        });

        await svg2pdf(svgElement, doc, {
          x: 20,
          y: 20,
          width: bbox.width,
          height: bbox.height
        });

        doc.save(`${filename}.pdf`);
      } catch (error) {
        console.error('PDF Export error:', error);
        alert('Errore durante l\'esportazione PDF: ' + error.message);
      }
    }
  };

  return (
    <div className="preview-container">
      <div className="preview-toolbar">
        <div className="zoom-controls">
          <button onClick={handleZoomOut} title="Zoom Out">-</button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom In">+</button>
          <button onClick={handleResetZoom} title="Reset View">↺</button>
        </div>

        <div className="theme-selector">
          <select value={theme} onChange={(e) => setTheme(e.target.value)} title="Tema Mermaid">
            {MERMAID_THEMES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="export-controls">
          <button onClick={() => handleExport('png')} title="Esporta PNG">PNG</button>
          <button onClick={() => handleExport('svg')} title="Esporta SVG">SVG</button>
          <button onClick={() => handleExport('pdf')} title="Esporta PDF">PDF</button>
        </div>

        {isRendering && <span className="rendering-indicator" title="Rendering...">⚡</span>}
      </div>

      <div
        className={`preview-content-wrapper ${isDragging ? 'dragging' : ''}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="preview-content"
          ref={previewRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        />
      </div>
    </div>
  );
};

export default Preview;
