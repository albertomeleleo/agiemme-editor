# File Management

## Descrizione
Il modulo di gestione file permette agli utenti di creare, aprire, leggere e salvare file Markdown (`.md`) e Mermaid (`.mmd`) all'interno dell'applicazione. Le operazioni sono gestite in modo sicuro tramite IPC.

## Scopo e Valore
Fornisce le funzionalità essenziali di un editor di testo, garantendo la persistenza dei dati e la gestione sicura degli accessi al disco. Include meccanismi di protezione contro la perdita accidentale di modifiche non salvate.

## Dettaglio del Comportamento

### Operazioni Supportate
- **Lettura**: Caricamento asincrono del contenuto dei file.
- **Scrittura**: Salvataggio del contenuto corrente su disco.
- **Salva con nome**: Creazione di nuovi file da contenuto esistente tramite dialog di sistema.
- **Creazione**: Generazione di nuovi file vuoti nella directory corrente.
- **Protezione**: Prompt di conferma se si tenta di chiudere/cambiare file con modifiche non salvate.

### Input / Output
- **Input**: Interazioni utente (click, shortcut tastiera), percorsi file, contenuto testuale.
- **Output**: Operazioni su file system, aggiornamenti di stato UI (titolo finestra, indicatori).

## Esempi d'uso
- Premere `Ctrl+S` per salvare rapidamente il lavoro.
- Cliccare su un file nel File Explorer per aprirlo.
- Usare il pulsante "+ Nuovo File" per creare un nuovo documento.

## Limitazioni
- Supporta solo codifica UTF-8.
- Non gestisce il locking dei file (concorrenza con altre app).

## Diagrammi

### Flowchart
```mermaid
flowchart TD
    Start([User Action]) --> ActionType{Action Type}
    
    ActionType -- Open File --> SelectFile[Select File in Explorer]
    SelectFile --> CheckUnsaved{Unsaved Changes?}
    CheckUnsaved -- Yes --> Confirm[Show Confirmation Dialog]
    Confirm -- Cancel --> End([Cancel])
    Confirm -- Proceed --> ReadFile[IPC: read-file]
    CheckUnsaved -- No --> ReadFile
    ReadFile --> UpdateState[Update Content & CurrentFile]
    
    ActionType -- Save --> HasPath{Has File Path?}
    HasPath -- Yes --> WriteFile[IPC: save-file]
    HasPath -- No --> SaveAs
    
    ActionType -- Save As --> SaveAs[IPC: save-file-as]
    SaveAs --> ShowDialog[Show Save Dialog]
    ShowDialog --> WriteFile
    
    WriteFile --> UpdateSaved[Set UnsavedChanges = false]
    UpdateSaved --> Notify[Show Success Alert]
    
    ActionType -- Create New --> PromptName[Prompt File Name]
    PromptName --> ValidateName{Valid Name?}
    ValidateName -- No --> End
    ValidateName -- Yes --> IPC_Create[IPC: create-file]
    IPC_Create --> LoadDir[Reload Directory]
    LoadDir --> SelectNew[Select New File]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant App as App Component
    participant IPC as Electron API
    participant Main as Main Process
    participant FS as File System

    %% Open File Flow
    User->>App: Click File in Explorer
    App->>App: Check hasUnsavedChanges
    alt Unsaved Changes
        App->>User: Confirm Discard?
        User-->>App: Yes
    end
    App->>IPC: readFile(path)
    IPC->>Main: invoke('read-file', path)
    Main->>FS: fs.readFile(path)
    FS-->>Main: content
    Main-->>IPC: content
    IPC-->>App: content
    App->>App: setContent(content), setCurrentFile(path)

    %% Save Flow
    User->>App: Click Save (Ctrl+S)
    alt New File (No Path)
        App->>IPC: saveFileAs(content)
        IPC->>Main: invoke('save-file-as')
        Main->>User: Show Save Dialog
        User-->>Main: Select Path
        Main->>FS: fs.writeFile(path, content)
        Main-->>IPC: newPath
        IPC-->>App: newPath
        App->>App: setCurrentFile(newPath)
    else Existing File
        App->>IPC: saveFile(path, content)
        IPC->>Main: invoke('save-file', path, content)
        Main->>FS: fs.writeFile(path, content)
        Main-->>IPC: success
    end
    App->>App: setHasUnsavedChanges(false)
    App->>User: Show Success Message
```

### User Journey
```mermaid
journey
    title Gestione File Workflow
    section Apertura File
      Navigazione cartelle: 5: Utente
      Selezione file: 5: Utente
      Caricamento contenuto: 5: Sistema
    section Modifica
      Digitazione testo: 5: Utente
      Indicatore modifiche (*): 5: Sistema
    section Salvataggio
      Pressione Ctrl+S: 5: Utente
      Scrittura su disco: 4: Sistema
      Conferma salvataggio: 5: Sistema
    section Creazione
      Click Nuovo File: 5: Utente
      Inserimento nome: 4: Utente
      File creato e aperto: 5: Sistema
```
