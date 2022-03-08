import StorageArea = chrome.storage.StorageArea;

export interface IChromeStorage {
    initialValue: any,
    storageArea?: StorageArea
}

export class ChromeStorage {

    public static readonly localStorage: StorageArea = chrome.storage.local;
    public static readonly syncStorage: StorageArea = chrome.storage.sync;

    private readonly initialValue: any;

    private storage: any;
    private storageArea: StorageArea;
    private numSubscribes: number = 0;
    private subscriberMap: Map<number, (storage: any) => any> = new Map();

    constructor(option: IChromeStorage) {
        this.initialValue = option.initialValue;
        this.storageArea = option.storageArea || ChromeStorage.localStorage;
        this.storage = Object.assign({}, this.initialValue);
        this.init();
    }

    private async init() {
        this.storage = await ChromeStorage.getExtensionStorage(ChromeStorage.localStorage);
        this.triggerSubscribers();
        chrome.storage.onChanged.addListener(this.updateStorageEvent);
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

    public setItems = (param: any) => {
        let items = {};
        if (typeof param === 'function') {
            items = param(this.storage);
        } else {
            items = param;
        }

        return new Promise((resolve, reject) => {
            this.storageArea.set(items, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject({ items, error });
                }
                resolve(true);
            })
        });

    };

    private triggerSubscribers = () => {
        this.subscriberMap.forEach((subscriber) => {
            subscriber(this.getItems());
        });
    }

    public clearStorage = () => {
        return this.setItems(this.initialValue);
    };

    private updateStorageEvent = (changes: Object) => {
        for (let key in changes) {
            this.storage[key] = changes[key].newValue;
        }
        this.triggerSubscribers();
    };

    public getItems = () => {
        return this.storage;
    };

}