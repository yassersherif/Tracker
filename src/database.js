/**
 * Local persistence boundary. UI code only talks to this repository, leaving a
 * future sync adapter free to sit alongside it without exposing IndexedDB.
 */
export class LocalRepository {
  constructor(name = 'form-training') {
    this.database = new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(new Error('IndexedDB is not available in this browser.'));
        return;
      }

      let request;
      try {
        request = indexedDB.open(name, 1);
      } catch (error) {
        reject(error);
        return;
      }
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('state')) request.result.createObjectStore('state');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Unable to open local storage.'));
      request.onblocked = () => reject(new Error('Local storage is blocked by another open version of the app.'));
    });
  }

  async read() {
    const db = await this.database;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('state', 'readonly');
      const request = transaction.objectStore('state').get('app');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Unable to read local training data.'));
      transaction.onabort = () => reject(transaction.error || new Error('Unable to read local training data.'));
    });
  }

  async write(value) {
    const db = await this.database;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('state', 'readwrite');
      transaction.objectStore('state').put(value, 'app');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Unable to save local training data.'));
      transaction.onabort = () => reject(transaction.error || new Error('Unable to save local training data.'));
    });
  }
}
