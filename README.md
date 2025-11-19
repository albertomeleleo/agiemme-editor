# AGiEmme Editor

Un'applicazione desktop moderna per visualizzare e modificare file Mermaid e Markdown, costruita con Electron, React e Node.js.

## Caratteristiche

- **Modalità View/Edit**: Visualizza file in modalità lettura o attiva l'editor quando necessario
- **Zoom e Pan**: Ingrandisci e naviga diagrammi complessi con controlli intuitivi
- **Editor CodeMirror**: Editor di testo avanzato con syntax highlighting per Markdown
- **Anteprima in tempo reale**: Visualizzazione istantanea di Markdown e diagrammi Mermaid
- **File Explorer**: Navigazione intuitiva delle directory con supporto per file `.md` e `.mmd`
- **Salvataggio file**: Salva modifiche o crea nuovi file con scorciatoie da tastiera
- **Supporto completo Mermaid**: Rendering di tutti i tipi di diagrammi Mermaid
- **Interfaccia moderna**: Design pulito e professionale

## Installazione

### Per sviluppatori

1. Clona il repository e installa le dipendenze:
```bash
git clone <repository-url>
cd mermaid-editor
npm install
```

### Per utenti finali

Scarica l'installer per il tuo sistema operativo dalla sezione [Releases](https://github.com/your-repo/releases).

## Utilizzo

### Modalità sviluppo

Per avviare l'applicazione in modalità sviluppo:

```bash
npm run electron:dev
```

Questo comando avvierà sia il server di sviluppo Vite che l'applicazione Electron.

### Build per distribuzione

#### Build per la piattaforma corrente
```bash
npm run electron:build
```

#### Build per piattaforme specifiche

**macOS:**
```bash
npm run electron:build:mac
```
Genera file `.dmg` e `.zip` nella cartella `release/`

**Windows:**
```bash
npm run electron:build:win
```
Genera installer `.exe` (NSIS) e versione portable nella cartella `release/`

**Linux:**
```bash
npm run electron:build:linux
```
Genera `.AppImage`, `.deb` e `.rpm` nella cartella `release/`

#### Build per tutte le piattaforme
```bash
npm run electron:build:all
```

**Nota:** Per buildare per macOS è necessario essere su macOS. Per Windows, è consigliato essere su Windows (o usare Wine su Linux/Mac).

## Scorciatoie da tastiera

- **Ctrl/Cmd + E**: Toggle tra modalità View e Edit
- **Ctrl/Cmd + S**: Salva il file corrente (solo in modalità Edit)
- **Ctrl/Cmd + Shift + S**: Salva come nuovo file (solo in modalità Edit)
- **Ctrl/Cmd + Scroll**: Zoom in/out nella preview

## Funzionalità principali

### File Explorer
- Seleziona una directory da esplorare
- Naviga tra le sottodirectory
- Visualizza solo file `.md` e `.mmd`
- Crea nuovi file direttamente dall'interfaccia

### Modalità View/Edit
- **Modalità View** (default): Solo visualizzazione dell'anteprima
- **Modalità Edit**: Editor + Anteprima affiancati
- Toggle con pulsante o Ctrl/Cmd + E

### Editor (modalità Edit)
- Syntax highlighting per Markdown
- Line numbers
- Auto-indentazione
- Editor basato su CodeMirror 6

### Preview
- Rendering Markdown in tempo reale
- Supporto per diagrammi Mermaid inline (code blocks con ` ```mermaid `)
- Supporto per file Mermaid puri (`.mmd`)
- **Zoom**: Ingrandisci/riduci con pulsanti +/- o Ctrl + scroll
- **Pan**: Trascina con il mouse per navigare
- **Reset**: Ripristina vista con pulsante Reset
- Gestione errori di rendering con messaggi dettagliati

## Tipi di diagrammi Mermaid supportati

- Flowchart / Graph
- Sequence Diagram
- Class Diagram
- State Diagram
- ER Diagram
- Gantt Chart
- Pie Chart
- User Journey
- Git Graph
- Mindmap
- Timeline

## Struttura del progetto

```
agiemme-editor/
├── src/
│   ├── components/
│   │   ├── FileExplorer.jsx    # Componente per la navigazione file
│   │   ├── FileExplorer.css
│   │   ├── Editor.jsx           # Componente editor CodeMirror
│   │   ├── Editor.css
│   │   ├── Preview.jsx          # Componente anteprima con zoom/pan
│   │   └── Preview.css
│   ├── App.jsx                  # Componente principale
│   ├── App.css
│   ├── main.jsx                 # Entry point React
│   └── index.css
├── main.js                      # Processo principale Electron
├── preload.js                   # Script preload per sicurezza
├── index.html                   # Template HTML
├── vite.config.js              # Configurazione Vite
└── package.json

## Tecnologie utilizzate

- **Electron**: Framework per applicazioni desktop cross-platform
- **React**: Libreria UI per l'interfaccia utente
- **Vite**: Build tool e dev server veloce
- **CodeMirror 6**: Editor di testo avanzato
- **Mermaid**: Libreria per il rendering di diagrammi
- **Marked**: Parser Markdown

## Licenza

ISC
