import { DBSchema, IDBPDatabase, IDBPObjectStore, openDB, StoreNames } from 'idb';
import { IDBStore, IStore } from './Store';

export interface IDatabase<DBTypes extends DBSchema | unknown> {
    name: string,
    storeConfigs: IStore<DBTypes>[],
    version?: number
}

export class Database<DBTypes extends DBSchema | unknown> {

    protected dbPromise: Promise<IDBPDatabase<DBTypes>>;
    protected stores = new Map<string, IDBStore<DBTypes>>();

    public constructor(options: IDatabase<DBTypes>) {
        this.dbPromise = openDB<DBTypes>(options.name, options.version,
            {
                upgrade: this.newVersionInit // XXX: This does not support upgrade from older to newer version.
            });
        options.storeConfigs.forEach((store) => {
            this.stores.set(store.name, new IDBStore<DBTypes>(this.dbPromise, store));
        });
    }

    public getStore = (name: string): IDBStore<DBTypes> => {
        return this.stores.get(name);
    }

    public createObjectStoreIfDoesNotExist =
        (database: IDBPDatabase<DBTypes>, name: StoreNames<DBTypes>,
            optionalParameters?: IDBObjectStoreParameters) => {
            if (!database.objectStoreNames.contains(name)) {
                return database.createObjectStore(name, optionalParameters);
            }
        }

    private createObjectStore = (database: IDBPDatabase<DBTypes>, store: IDBStore<DBTypes>) => {
        let objStore = this.createObjectStoreIfDoesNotExist(database, store.name, store.options);
        store.indexes.forEach(index => {
            index.name
            if (!objStore.indexNames.contains(index.name)) {
                objStore.createIndex(index.name, index.keyPath, index.optionalParameters);
            }
        });
    }

    private newVersionInit = (database: IDBPDatabase<DBTypes>): void => {
        this.stores.forEach(store => {
            this.createObjectStore(database, store);
        });
    };

}