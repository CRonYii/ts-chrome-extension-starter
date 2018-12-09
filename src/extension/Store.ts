import { DB } from "idb";

export interface Index {
    name: string,
    keyPath: string | string[],
    optionalParameters?: IDBIndexParameters
}

export interface IStore {
    name: string;
    options: IDBObjectStoreParameters;
    indexes?: Index[];
}

export class IDBStore {

    public name: string;
    public options: IDBObjectStoreParameters;
    public indexes: Index[];

    protected dbPromise: Promise<DB>;

    public constructor(dbPromise: Promise<DB>, option: IStore) {
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
                return transaction.complete;
            })
    };

    public updateItems = (items: any[]) => {
        return this.getStore()
            .then(({ transaction, store }) => {
                items.forEach(({ item, primaryKey }) => {
                    store.put(item, primaryKey);
                });
                return transaction.complete;
            });
    }

    public deleteItems = (primaryKeyValues: any[]) => {
        return this.getStore()
            .then(({ transaction, store }) => {
                primaryKeyValues.forEach(primaryKey => {
                    store.delete(primaryKey);
                });
                return transaction.complete;
            });
    }

    public deleteAll = () => {
        return this.getStore()
            .then(({ store }) => {
                return store.clear();
            });
    }

    public getItems = (query?: IDBKeyRange | IDBValidKey, count?: number) => {
        return this.getStore('readonly')
            .then(({ store }) => {
                return store.getAll(query, count);
            });
    }

    public getIndexedItems = (indexName: string, rule?) => {
        const valueArray = [];
        return this.getStore('readonly')
            .then(({ store }) => {
                return store.index(indexName).openCursor(rule);
            })
            .then(function getValue(cursor) {
                if (!cursor) return valueArray;
                valueArray.push(cursor.value);
                return cursor.continue().then(getValue);
            });
    }
}