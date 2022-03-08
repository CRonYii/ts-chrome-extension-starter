import { DBSchema } from 'idb';
import { Database } from "../extension/Database";

interface IExtensionDatabase extends DBSchema {
    Test: {
        key: number;
        value: { id: number, test: number, test2: number };
        indexes: { 'test-index': number }
    }
}

export const ExtensionDatabase = new Database<IExtensionDatabase>({
    name: "extensionDatabase",
    storeConfigs: [
        {
            name: "Test",
            options: {
                keyPath: 'id',
                autoIncrement: true
            },
            indexes: [
                {
                    name: "test-index",
                    keyPath: "test"
                }
            ]
        }
    ]
});

const teststore = ExtensionDatabase.getStore("Test");
teststore.addItems([{ test: 1000, test2: 2000 }]);
teststore.addItems([{ test: 3000, test2: 2000 }]);
teststore.getItems().then((data) => {
    console.log('get all items', data.length);
    data.forEach(row => {
        console.log(row.id, row.test, row.test2);
    })
});
teststore.getIndexedItems('test-index', IDBKeyRange.lowerBound(2000)).then((data) => {
    console.log('get items test > 2000', data.length);
    data.forEach(row => {
        console.log(row.id, row.test, row.test2);
    })
});
teststore.deleteAll();