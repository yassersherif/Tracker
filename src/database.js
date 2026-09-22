/**
 * Local persistence boundary. UI code only talks to this repository, leaving a
 * future sync adapter free to sit alongside it without exposing IndexedDB.
 */
export class LocalRepository {
  constructor(name = 'form-training') {
    this.database = new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('state')) request.result.createObjectStore('state');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async read() {
    const db = await this.database;
    return new Promise((resolve, reject) => {
      const request = db.transaction('state', 'readonly').objectStore('state').get('app');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async write(value) {
    const db = await this.database;
    return new Promise((resolve, reject) => {
      const request = db.transaction('state', 'readwrite').objectStore('state').put(value, 'app');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
