import { ChromeStorage } from "../extension/ChromeStorage";
import { createChromeStorageContext } from "../extension/ChromeStorageContext";

export const chromeStorage = new ChromeStorage({
    initialValue: {
        random: null,
        popup: {
            random: null
        }
    }
});

const { ChromeStorageProvider, connectStorage } = createChromeStorageContext(chromeStorage);

export { ChromeStorageProvider, connectStorage };