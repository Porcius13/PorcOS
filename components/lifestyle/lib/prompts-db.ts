export interface PromptData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  aiModel?: string;      // e.g., "GPT-4-Turbo", "Claude-3-Opus"
  modelColor?: string;   // e.g., "bg-amber-400", "bg-blue-400"
  date: string;
  isFavorite: boolean;
  usageCount: number;
  temperature?: number;  // Neural Temperature (0.0 - 1.0)
  image?: string;        // Base64 Image Data
  aiTool?: string;       // AI Tool/Suite (Nano, Pro, Deep Research)
  explanation?: string;  // Purpose of the prompt
}

const DB_NAME = 'PromptHubDB';
const STORE_NAME = 'prompt_items';

export const promptsDb = {
  async open() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async savePrompt(item: PromptData) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getPrompt(id: string) {
    const db = await this.open();
    return new Promise<PromptData | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllPrompts() {
    const db = await this.open();
    return new Promise<PromptData[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deletePrompt(id: string) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async incrementUsage(id: string) {
    const prompt = await this.getPrompt(id);
    if (prompt) {
      prompt.usageCount = (prompt.usageCount || 0) + 1;
      await this.savePrompt(prompt);
    }
  }
};
