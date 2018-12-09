import idb, { DB, UpgradeDB } from 'idb';
import { IDBStore, IStore } from './Store';

export interface IDatabase {
    name: string,
    storeConfigs: IStore[],
    version?: number
}

export class Database {

    public static createObjectStoreIfDoesNotExist = (upgradeDb: UpgradeDB, name: string, optionalParameters?: IDBObjectStoreParameters) => {
        if (!upgradeDb.objectStoreNames.contains(name)) {
            return upgradeDb.createObjectStore(name, optionalParameters);
        }
    }

    protected dbPromise: Promise<DB>;
    protected stores: Map<string, IDBStore> = new Map<string, IDBStore>();

    public constructor(option: IDatabase) {
        this.dbPromise = idb.open(option.name, option.version, this.newVersionInit);
        option.storeConfigs.forEach((option) => {
            this.stores.set(option.name, new IDBStore(this.dbPromise, option));
        });
    }

    public getStore = (name: string): IDBStore => {
        return this.stores.get(name);
    }

    private createObjectStore = (upgradeDb: UpgradeDB, store: IDBStore) => {
        let objStore = Database.createObjectStoreIfDoesNotExist(upgradeDb, store.name, store.options);
        store.indexes.forEach(index => {
            if (!objStore.indexNames.contains(index.name)) {
                objStore.createIndex(index.name, index.keyPath, index.optionalParameters);
            }
        });
    }

    private newVersionInit = (upgradeDb: UpgradeDB): void => {
        this.stores.forEach(store => {
            this.createObjectStore(upgradeDb, store);
        });
    };

}