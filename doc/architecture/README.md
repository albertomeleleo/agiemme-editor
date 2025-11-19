# Architecture Overview

## Descrizione
L'architettura di AGiEmme Editor è basata su **Electron**, che combina Chromium per il rendering dell'interfaccia utente e Node.js per le operazioni di sistema. Il progetto adotta il pattern di sicurezza raccomandato con **Context Isolation** e **Preload Scripts**.

## Scopo e Valore
Questa architettura garantisce:
- **Sicurezza**: Separazione tra codice UI e accesso al sistema operativo.
- **Performance**: UI reattiva grazie a React e gestione asincrona dei file.
- **Cross-Platform**: Unica codebase per macOS, Windows e Linux.

## Dettaglio del Comportamento
1. **Main Process**: Gestisce la creazione delle finestre e l'accesso al file system tramite `ipcMain`.
2. **Preload Script**: Espone un set limitato e sicuro di API (`window.electronAPI`) al Renderer.
3. **Renderer Process**: Esegue l'applicazione React, gestisce lo stato e l'interfaccia utente.

## Diagrammi

### Flowchart: Ciclo di Vita Applicazione
```mermaid
flowchart TD
    Start[Application Start] --> InitMain[Initialize Main Process]
    InitMain --> CreateWin[Create Browser Window]
    CreateWin --> LoadContent{Dev Mode?}
    LoadContent -- Yes --> LoadVite[Load localhost:5173]
    LoadContent -- No --> LoadDist[Load dist/index.html]
    LoadVite --> InitPreload[Execute Preload Script]
    LoadDist --> InitPreload
    InitPreload --> ExposeAPI[Expose electronAPI to Window]
    ExposeAPI --> MountReact[Mount React App]
    MountReact --> InitState[Initialize Global State]
    InitState --> Ready[Application Ready]
```

### Sequence Diagram: Inizializzazione e IPC
```mermaid
sequenceDiagram
    participant Main as Main Process (Node.js)
    participant Win as BrowserWindow
    participant Preload as Preload Script
    participant Renderer as Renderer (React)

    Main->>Main: App Ready
    Main->>Win: Create Window
    Main->>Preload: Load Preload
    Preload->>Preload: Setup ContextBridge
    Preload-->>Renderer: Expose window.electronAPI
    Main->>Renderer: Load Content (HTML/JS)
    Renderer->>Renderer: Mount App Component
    Renderer->>Renderer: Initialize State (useState)
    Renderer->>Preload: Invoke IPC (e.g. read-directory)
    Preload->>Main: ipcRenderer.invoke()
    Main->>Main: Handle Operation
    Main-->>Preload: Return Result
    Preload-->>Renderer: Resolve Promise
```

### Capability Map
```mermaid
mindmap
  root((AGiEmme Editor))
    Core Architecture
      Electron Integration
        Main Process
        Renderer Process
        IPC Communication
      Security
        Context Isolation
        Node Integration Disabled
      State Management
        React Hooks
        Local Storage Persistence
    File System
      Read/Write Operations
      Directory Traversal
      Path Management
    UI/UX
      Theme Engine (Dark/Light)
      Responsive Layout
      Split View (Edit/Preview)
```
