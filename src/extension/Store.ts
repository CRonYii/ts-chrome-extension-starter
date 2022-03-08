import { DBSchema, IDBPDatabase, IndexNames, StoreKey, StoreNames, IndexKey, StoreValue } from 'idb';

export interface Index<DBTypes extends DBSchema | unknown> {
    name: IndexNames<DBTypes, StoreNames<DBTypes>>,
    keyPath: string | string[],
    optionalParameters?: IDBIndexParameters
}

export interface IStore<DBTypes extends DBSchema | unknown> {
    name: StoreNames<DBTypes>;
    options: IDBObjectStoreParameters;
    indexes?: Index<DBTypes>[];
}

export class IDBStore<DBTypes extends DBSchema | unknown> {

    public name: StoreNames<DBTypes>;
    public options: IDBObjectStoreParameters;
    public indexes: Index<DBTypes>[];

    protected dbPromise: Promise<IDBPDatabase<DBTypes>>;

    public constructor(dbPromise: Promise<IDBPDatabase<DBTypes>>, option: IStore<DBTypes>) {
        this.name = option.name;
        this.options = option.options;
        this.indexes = option.indexes || [];
        this.dbPromise = dbPromise;
    }

    public getStore = (mode: 'readonly' | 'readwrite' = 'readwrite') => {
        return this.dbPromise.then(db => {
            const transaction = db.transaction(this.name, mode);
            const store = transaction.objectStore(this.name);
            return { transaction, store };
        });
    };

    public addItems = (items: any[]) => {
        return this.getStore()
            .then(({ transaction, store }) => {
                items.forEach(item => {
                    store.add(item);
                });
                return transaction.done;
            })
    };

    public updateItems = (items: any[]) => {
        return this.getStore()
            .then(({ transaction, store }) => {
                items.forEach(({ item, primaryKey }) => {
                    store.put(item, primaryKey);
                });
                return transaction.done;
            });
    }

    public deleteItems = (primaryKeyValues: any[]) => {
        return this.getStore()
            .then(({ transaction, store }) => {
                primaryKeyValues.forEach(primaryKey => {
                    store.delete(primaryKey);
                });
                return transaction.done;
            });
    }

    public deleteAll = () => {
        return this.getStore()
            .then(({ store }) => {
                return store.clear();
            });
    }

    public getItems = (query?: IDBKeyRange | StoreKey<DBTypes, StoreNames<DBTypes>>, count?: number) => {
        return this.getStore('readonly')
            .then(({ store }) => {
                return store.getAll(query, count);
            });
    }

    public getIndexedItems = (indexName: IndexNames<DBTypes, StoreNames<DBTypes>>,
        query?: IndexKey<DBTypes, StoreNames<DBTypes>, IndexNames<DBTypes, StoreNames<DBTypes>>> | IDBKeyRange | null,
        direction?: IDBCursorDirection): Promise<StoreValue<DBTypes, StoreNames<DBTypes>>[]> => {
        const valueArray: StoreValue<DBTypes, StoreNames<DBTypes>>[] = [];
        return this.getStore('readonly')
            .then(({ store }) => {
                return store.index(indexName).openCursor(query, direction);
            })
            .then(function getValue(cursor) {
                if (!cursor) return valueArray;
                valueArray.push(cursor.value);
                return cursor.continue().then(getValue);
            });
    }
}