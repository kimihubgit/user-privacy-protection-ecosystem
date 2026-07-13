/**
 * Storage wrapper — Eliminates callback-based chrome.storage boilerplate.
 * Usage:
 *   import { Storage } from '../shared/storage.js';
 *   const data = await Storage.get(['key1', 'key2']);
 *   await Storage.set({ key1: 'value1' });
 */
export const Storage = {
    /**
     * Get values from chrome.storage.local
     * @param {string|string[]} keys
     * @returns {Promise<Object>}
     */
    get(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    },

    /**
     * Set values in chrome.storage.local
     * @param {Object} data
     * @returns {Promise<void>}
     */
    set(data) {
        return new Promise((resolve) => {
            chrome.storage.local.set(data, resolve);
        });
    },

    /**
     * Set values in both chrome.storage.local and chrome.storage.sync
     * @param {Object} localData - Data for local storage
     * @param {Object} syncData - Data for sync storage
     * @returns {Promise<void>}
     */
    async setWithSync(localData, syncData) {
        await this.set(localData);
        return new Promise((resolve) => {
            chrome.storage.sync.set(syncData || localData, resolve);
        });
    },

    /**
     * Remove values from chrome.storage.local
     * @param {string|string[]} keys
     * @returns {Promise<void>}
     */
    remove(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, resolve);
        });
    }
};
