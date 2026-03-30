export interface CuriosityData {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage?: string;
  date: string;
  stats?: string;
  didYouKnow?: string;
  sourceUrl?: string;
  status: 'Wishlist' | 'Planned' | 'Achieved';
  location?: string;
  targetDate?: string;
}

const DB_NAME = 'CuriosityDB';
const STORE_NAME = 'curiosity_items';

export const curiosityDb = {
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

  async saveCuriosity(item: CuriosityData) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAllCuriosities() {
    const db = await this.open();
    return new Promise<CuriosityData[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteCuriosity(id: string) {
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
    const text = content.replace(/<[^>]*>/g, ' '); 
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min discovery`;
  }
};
