import StorageArea = chrome.storage.StorageArea;

export class ChromeStorage {

    public static readonly localStorage: StorageArea = chrome.storage.local;
    public static readonly syncStorage: StorageArea = chrome.storage.sync;

    private storage: any;
    private numSubscribes: number = 0;
    private subscriberMap: Map<number, (storage: any) => any> = new Map();

    constructor(initialValue) {
        this.storage = initialValue;
        this.init();
    }

    private async init() {
        const local = await ChromeStorage.getExtensionStorage(ChromeStorage.localStorage);
        const sync = await ChromeStorage.getExtensionStorage(ChromeStorage.syncStorage);
        this.storage = { ...local, ...sync };
        this.triggerSubscribers();
        chrome.storage.onChanged.addListener((changes: Object) => {
            for (let key in changes) {
                this.storage[key] = changes[key].newValue;
            }
            this.triggerSubscribers();
        });
    }

    public subscribe = (func: (storage: any) => any) => {
        const id = this.numSubscribes;
        this.subscriberMap.set(id, func);
        this.numSubscribes += 1;

        return () => {
            this.subscriberMap.delete(id);
        };
    };

    private static getExtensionStorage = (storingArea: StorageArea) => {
        return new Promise((resolve) => {
            storingArea.get(null, (items) => {
                resolve(items);
            });
        });
    };

    public setItems = (param: any, storageArea = ChromeStorage.localStorage) => {
        let items = {};
        if (typeof param === 'function') {
            items = param(this.storage);
        } else {
            items = param;
        }

        return new Promise((resolve, reject) => {
            storageArea.set(items, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject({ items, error });
                }
                resolve();
            })
        });

    };

    private triggerSubscribers = () => {
        this.subscriberMap.forEach((subscriber) => {
            subscriber(this.getItems());
        });
    }

    public clearAllStorage = () => {
        const local = this.clearStorage(ChromeStorage.localStorage);
        const sync = this.clearStorage(ChromeStorage.syncStorage);
        return Promise.all([local, sync]);
    };

    public clearStorage = (storageArea: StorageArea) => {
        return new Promise(resolve => {
            storageArea.clear(resolve);
        });
    };

    public getItems = () => {
        return this.storage;
    };

}