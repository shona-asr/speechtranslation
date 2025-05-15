import { HistoryItem, HistoryItemType } from './types';

const DB_NAME = 'speechAIDB';
const DB_VERSION = 1;
const HISTORY_STORE = 'history';

export class HistoryDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create history store with index on type and timestamp
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
          store.createIndex('byType', 'type', { unique: false });
          store.createIndex('byTimestamp', 'timestamp', { unique: false });
          store.createIndex('byUserId', 'userId', { unique: false });
          store.createIndex('byUserAndType', ['userId', 'type'], { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async addHistoryItem(item: HistoryItem): Promise<string> {
    await this.open();
    if (!this.db) throw new Error('Database not initialized');

    // Make a copy of the item to avoid modifying the original
    const itemToStore = { ...item };
    
    // Check if the item has audio blobs and if they're too large
    // Handle audio blobs more safely
    try {
      // Process originalAudioBlob if it exists
      if ('originalAudioBlob' in itemToStore && itemToStore.originalAudioBlob instanceof Blob) {
        const originalBlobSize = itemToStore.originalAudioBlob.size;
        console.log(`Original audio blob size: ${originalBlobSize} bytes`);
        
        // If blob is too large (over 5MB), don't store it
        if (originalBlobSize > 5 * 1024 * 1024) {
          console.warn("Original audio blob is too large, removing it from storage");
          (itemToStore as any).originalAudioBlob = undefined;
        }
      }
      
      // Process translatedAudioBlob if it exists
      if ('translatedAudioBlob' in itemToStore && itemToStore.translatedAudioBlob instanceof Blob) {
        const translatedBlobSize = itemToStore.translatedAudioBlob.size;
        console.log(`Translated audio blob size: ${translatedBlobSize} bytes`);
        
        // If blob is too large (over 5MB), don't store it
        if (translatedBlobSize > 5 * 1024 * 1024) {
          console.warn("Translated audio blob is too large, removing it from storage");
          (itemToStore as any).translatedAudioBlob = undefined;
        }
      }
      
      // Process regular audioBlob if it exists
      if ('audioBlob' in itemToStore && itemToStore.audioBlob instanceof Blob) {
        const audioBlobSize = itemToStore.audioBlob.size;
        console.log(`Audio blob size: ${audioBlobSize} bytes`);
        
        // If blob is too large (over 5MB), don't store it
        if (audioBlobSize > 5 * 1024 * 1024) {
          console.warn("Audio blob is too large, removing it from storage");
          (itemToStore as any).audioBlob = undefined;
        }
      }
    } catch (error) {
      console.error("Error processing audio blobs:", error);
      // If there's an error processing blobs, remove them all
      if ('originalAudioBlob' in itemToStore) (itemToStore as any).originalAudioBlob = undefined;
      if ('translatedAudioBlob' in itemToStore) (itemToStore as any).translatedAudioBlob = undefined;
      if ('audioBlob' in itemToStore) (itemToStore as any).audioBlob = undefined;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.add(itemToStore);

        request.onsuccess = () => {
          resolve(item.id);
        };

        request.onerror = (event) => {
          console.error("Error adding item to IndexedDB:", (event.target as IDBRequest).error);
          // If there's an error storing with blobs, try once more without them
          try {
            if (
              ('originalAudioBlob' in itemToStore && itemToStore.originalAudioBlob) ||
              ('translatedAudioBlob' in itemToStore && itemToStore.translatedAudioBlob) ||
              ('audioBlob' in itemToStore && itemToStore.audioBlob)
            ) {
              console.log("Trying again without audio blobs...");
              const itemWithoutBlobs = { ...itemToStore };
              if ('originalAudioBlob' in itemWithoutBlobs) (itemWithoutBlobs as any).originalAudioBlob = undefined;
              if ('translatedAudioBlob' in itemWithoutBlobs) (itemWithoutBlobs as any).translatedAudioBlob = undefined;
              if ('audioBlob' in itemWithoutBlobs) (itemWithoutBlobs as any).audioBlob = undefined;
              
              const fallbackRequest = store.add(itemWithoutBlobs);
              fallbackRequest.onsuccess = () => {
                console.log("Successfully stored item without audio blobs");
                resolve(item.id);
              };
              fallbackRequest.onerror = (fallbackEvent) => {
                console.error("Still failed to store item:", (fallbackEvent.target as IDBRequest).error);
                reject((fallbackEvent.target as IDBRequest).error);
              };
            } else {
              reject((event.target as IDBRequest).error);
            }
          } catch (fallbackError) {
            console.error("Error in fallback storage attempt:", fallbackError);
            reject(fallbackError);
          }
        };
      } catch (transactionError) {
        console.error("Transaction error:", transactionError);
        reject(transactionError);
      }
    });
  }

  async getHistoryItems(userId: string, type?: HistoryItemType): Promise<HistoryItem[]> {
    await this.open();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      
      let request: IDBRequest;
      
      if (type) {
        const index = store.index('byUserAndType');
        request = index.getAll([userId, type]);
      } else {
        const index = store.index('byUserId');
        request = index.getAll(userId);
      }

      request.onsuccess = (event) => {
        const items = (event.target as IDBRequest<HistoryItem[]>).result;
        // Sort by timestamp (newest first)
        items.sort((a, b) => b.timestamp - a.timestamp);
        resolve(items);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getHistoryItem(id: string): Promise<HistoryItem | null> {
    await this.open();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest<HistoryItem>).result || null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async deleteHistoryItem(id: string): Promise<void> {
    await this.open();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async clearHistory(userId: string): Promise<void> {
    await this.open();
    if (!this.db) throw new Error('Database not initialized');

    // We'll get all items for the user and delete them one by one
    const items = await this.getHistoryItems(userId);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      
      let completed = 0;
      let errors = 0;
      
      if (items.length === 0) {
        resolve();
        return;
      }

      items.forEach(item => {
        const request = store.delete(item.id);
        
        request.onsuccess = () => {
          completed++;
          if (completed + errors === items.length) {
            errors > 0 ? reject(new Error(`Failed to delete ${errors} items`)) : resolve();
          }
        };
        
        request.onerror = () => {
          errors++;
          if (completed + errors === items.length) {
            reject(new Error(`Failed to delete ${errors} items`));
          }
        };
      });
      
      transaction.onerror = (event) => {
        reject((event.target as IDBTransaction).error);
      };
    });
  }
}

// Export singleton instance
export const historyDB = new HistoryDB();
