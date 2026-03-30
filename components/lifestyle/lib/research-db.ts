export interface ResearchData {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage?: string;
  date: string;
  stats?: string;
  featured?: boolean;
  large?: boolean;
  isLocked?: boolean;
  goldenWords?: string;
}

const DB_NAME = 'ResearchDB';
const STORE_NAME = 'research_items';

export const researchDb = {
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

  async saveResearch(item: ResearchData) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getResearch(id: string) {
    const db = await this.open();
    return new Promise<ResearchData | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllResearch() {
    const db = await this.open();
    return new Promise<ResearchData[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getResearchBySlug(slug: string) {
    const all = await this.getAllResearch();
    return all.find(item => item.slug === slug);
  },

  async deleteResearch(id: string) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ' '); // Strip HTML tags
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }
};
