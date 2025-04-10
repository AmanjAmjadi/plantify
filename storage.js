// storage.js
const dbName = "plantify-db";
const dbVersion = 1;

// Initialize the IndexedDB database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('garden')) {
                db.createObjectStore('garden', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Error opening database: ' + event.target.error);
        };
    });
}

// Save garden data to IndexedDB
async function saveGarden(gardenData) {
    try {
        const db = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['garden'], 'readwrite');
            const store = transaction.objectStore('garden');
            
            // Clear existing data
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                // Add each plant as a separate record
                gardenData.forEach(plant => {
                    store.add(plant);
                });
            };
            
            transaction.oncomplete = () => {
                resolve(true);
            };
            
            transaction.onerror = (event) => {
                reject('Error saving garden: ' + event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to save garden:', error);
        // Fall back to localStorage
        localStorage.setItem('garden', JSON.stringify(gardenData));
        return false;
    }
}

// Load garden data from IndexedDB
async function loadGarden() {
    try {
        const db = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['garden'], 'readonly');
            const store = transaction.objectStore('garden');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = (event) => {
                reject('Error loading garden: ' + event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to load garden:', error);
        // Fall back to localStorage
        const localData = localStorage.getItem('garden');
        return localData ? JSON.parse(localData) : [];
    }
}

// Save a setting value
async function saveSetting(key, value) {
    try {
        const db = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            const request = store.put({ key, value });
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                reject('Error saving setting: ' + event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to save setting:', error);
        // Fall back to localStorage
        localStorage.setItem(`setting:${key}`, JSON.stringify(value));
        return false;
    }
}

// Load a setting value
async function loadSetting(key, defaultValue = null) {
    try {
        const db = await initDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.value);
                } else {
                    resolve(defaultValue);
                }
            };
            
            request.onerror = (event) => {
                reject('Error loading setting: ' + event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to load setting:', error);
        // Fall back to localStorage
        const localData = localStorage.getItem(`setting:${key}`);
        return localData ? JSON.parse(localData) : defaultValue;
    }
}
