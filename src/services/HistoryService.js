const HistoryService = {
    getHistoryKey: (filePath) => `history_${filePath}`,

    saveSnapshot: (filePath, content) => {
        if (!filePath) return;

        const key = HistoryService.getHistoryKey(filePath);
        const history = HistoryService.getHistory(filePath);

        // Avoid saving duplicate consecutive snapshots
        if (history.length > 0 && history[0].content === content) {
            return;
        }

        const newSnapshot = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            content: content
        };

        // Keep last 50 versions
        const newHistory = [newSnapshot, ...history].slice(0, 50);

        try {
            localStorage.setItem(key, JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save history snapshot', e);
            // Handle quota exceeded if necessary
        }
    },

    getHistory: (filePath) => {
        if (!filePath) return [];
        const key = HistoryService.getHistoryKey(filePath);
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : [];
        } catch (e) {
            console.error('Failed to load history', e);
            return [];
        }
    },

    clearHistory: (filePath) => {
        if (!filePath) return;
        const key = HistoryService.getHistoryKey(filePath);
        localStorage.removeItem(key);
    }
};

export default HistoryService;
