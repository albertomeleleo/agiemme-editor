# Editor Component

## Descrizione
Il componente Editor integra **CodeMirror 6** per fornire un'esperienza di editing del codice moderna e performante. È configurato specificamente per il linguaggio Markdown, offrendo funzionalità come syntax highlighting e gestione delle modifiche in tempo reale.

## Scopo e Valore
Fornisce l'interfaccia principale per la creazione e la modifica dei contenuti. A differenza di una semplice textarea, offre strumenti visivi che aiutano l'utente a scrivere codice corretto e leggibile.

## Dettaglio del Comportamento

### Configurazione CodeMirror
- **Extensions**: `basicSetup`, `markdown()`, `EditorView.updateListener`.
- **Tema**: Personalizzato per adattarsi al design dell'applicazione (font monospaziato, padding, altezza).

### Sincronizzazione Bidirezionale
1. **User -> App**: Quando l'utente digita, un `UpdateListener` cattura le modifiche e invoca la callback `onChange` passata dal componente padre.
2. **App -> Editor**: Quando il contenuto cambia esternamente (es. caricamento file), un `useEffect` confronta il contenuto attuale dell'editor con la nuova prop e, se necessario, dispaccia una transazione di aggiornamento.

### Input / Output
- **Input**: Testo digitato dall'utente, prop `content` dal padre.
- **Output**: Callback `onChange` con il nuovo contenuto testuale.

## Esempi d'uso
- Digitare `# Titolo` per vedere l'evidenziazione della sintassi Markdown.
- Incollare codice Mermaid all'interno di blocchi di codice.

## Limitazioni
- Attualmente configurato solo per Markdown (non c'è highlighting specifico per Mermaid all'interno del blocco di codice, se non quello generico).
- Non supporta ancora autocompletamento avanzato.

## Diagrammi

### Flowchart
```mermaid
flowchart TD
    Start[Mount Editor] --> InitCM[Initialize CodeMirror State]
    InitCM --> ConfigExtensions[Configure Extensions]
    ConfigExtensions --> CreateView[Create EditorView]
    CreateView --> AttachDOM[Attach to DOM]
    
    UpdateProps{Content Prop Changed?} -->|Yes| Compare[Compare with Current Doc]
    Compare -->|Different| Dispatch[Dispatch Transaction]
    Dispatch --> UpdateView[Update Editor View]
    
    UserType[User Types] --> UpdateListener[Trigger Update Listener]
    UpdateListener --> ExtractDoc[Get New Content]
    ExtractDoc --> CallOnChange[Call onChange Prop]
    CallOnChange --> ParentUpdate[Parent Updates State]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    actor User
    participant Parent as App Component
    participant Editor as Editor Component
    participant CM as CodeMirror Instance

    Parent->>Editor: Mount (content="...")
    Editor->>CM: EditorState.create(doc: content)
    Editor->>CM: new EditorView(state)
    
    %% User Typing
    User->>CM: Type character
    CM->>CM: Update State (Transaction)
    CM->>Editor: UpdateListener(update)
    Editor->>Parent: onChange(newContent)
    Parent->>Parent: setContent(newContent)
    Parent->>Parent: setHasUnsavedChanges(true)
    
    %% External Update (e.g. file load)
    Parent->>Editor: Re-render (content="new text")
    Editor->>CM: view.state.doc.toString()
    alt Content Mismatch
        Editor->>CM: view.dispatch({ changes: ... })
        CM->>CM: Update View
    end
```

### User Journey
```mermaid
journey
    title Esperienza di Editing
    section Attivazione
      Toggle Edit Mode: 5: Utente
      Visualizzazione Editor: 5: Sistema
    section Scrittura
      Digitazione codice: 5: Utente
      Syntax Highlighting: 5: Sistema
      Auto-indentazione: 4: Sistema
    section Feedback
      Aggiornamento Preview: 5: Sistema
      Segnalazione modifiche: 5: Sistema
```
