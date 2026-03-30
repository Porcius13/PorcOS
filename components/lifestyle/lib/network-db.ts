export interface NetworkNode {
  id: string;
  name: string;
  role: string;
  type: 'strategic' | 'personal' | 'professional';
  image?: string;       // Base64
  notes: string;
  connections: string[]; // Array of node IDs
  position: { x: number; y: number };
  lastContact?: string;
  affinity?: number;    // 0-100 matching strength
  tags?: string[];      // Strategic tags
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

const DB_NAME = 'NetworkHubDB';
const STORE_NAME = 'network_nodes';

export const networkDb = {
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

  async saveNode(node: NetworkNode) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAllNodes() {
    const db = await this.open();
    return new Promise<NetworkNode[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteNode(id: string) {
    const db = await this.open();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
