import { Database } from "./Database";

const testStoreConfig = {
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
};

export const ExtensionDatabase = new Database({
    name: "extensionDatabase",
    storeConfigs: [
        testStoreConfig
    ]
});

ExtensionDatabase.getStore("Test").addItems([{ test: 1000, test2: 2000 }]);
ExtensionDatabase.getStore("Test").getItems().then(console.log);