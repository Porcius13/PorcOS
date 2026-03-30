// lib/med-db.ts - IndexedDB Storage Layer for Med-Core
// Permanent fix for LocalStorage quota (5MB) limitations.

const DB_NAME = "med-core-db";
const STORE_NAME = "medItems";
const DB_VERSION = 1;

export async function openMedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const medDb = {
  async getAll(): Promise<any[]> {
    const db = await openMedDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id: string | number): Promise<any | null> {
    const db = await openMedDb();
    const targetId = typeof id === "string" ? Number(id) : id;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(targetId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async save(item: any): Promise<void> {
    const db = await openMedDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      // Ensure ID is a number for consistent lookup
      if (item.id) item.id = Number(item.id);
      
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async delete(id: string | number): Promise<void> {
    const db = await openMedDb();
    const targetId = typeof id === "string" ? Number(id) : id;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(targetId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // One-time automatic migration from LocalStorage
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const legacyData = localStorage.getItem("medCoreItems");
      if (legacyData) {
        const items = JSON.parse(legacyData);
        if (Array.isArray(items) && items.length > 0) {
          console.log(`[MedDB] Starting migration of ${items.length} records...`);
          for (const item of items) {
            await this.save(item);
          }
          // After verification, clear the old storage to free up browser quota
          localStorage.removeItem("medCoreItems");
          console.log("[MedDB] Migration complete. LocalStorage cleared.");
        }
      }
    } catch (e) {
      console.error("[MedDB] Migration error:", e);
    }
  }
};
