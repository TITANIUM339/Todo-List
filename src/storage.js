function localStorageAvailable() {
    try {
        const storage = window.localStorage;
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        
        return true;
    } catch {
        return false;
    }
}

function setItem(key, value) {
    if (localStorageAvailable()) localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key) {
    if (localStorageAvailable()) return JSON.parse(localStorage.getItem(key));
}

export { setItem, getItem };
