// IndexedDB uchun ulanish va oflayn keshlash
const dbName = 'maktab_db_local';
const storeName = 'students';
const syncQueueStore = 'sync_queue';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(syncQueueStore)) {
                db.createObjectStore(syncQueueStore, { autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveStudentsLocal(students) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Clear old data
    store.clear();
    
    // Add new data
    students.forEach(student => {
        store.add(student);
    });
    
    return tx.complete;
}

async function getStudentsLocal() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Oflayn qo'shilgan o'quvchilarni saqlash
async function addToSyncQueue(studentData) {
    const db = await openDB();
    const tx = db.transaction(syncQueueStore, 'readwrite');
    const store = tx.objectStore(syncQueueStore);
    store.add(studentData);
    return tx.complete;
}

async function getSyncQueue() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(syncQueueStore, 'readonly');
        const store = tx.objectStore(syncQueueStore);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function clearSyncQueue() {
    const db = await openDB();
    const tx = db.transaction(syncQueueStore, 'readwrite');
    const store = tx.objectStore(syncQueueStore);
    store.clear();
    return tx.complete;
}
