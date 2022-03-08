import { ActionType } from "./entity/ActionType";
import { MessengerHost, ExtensionHost } from "./extension/Messenger";

const backgroundMessengerHost = new MessengerHost({
    name: ExtensionHost.BACKGROUND,
    parentReducer: {
        [ExtensionHost.OPTION]: {
            [ActionType.TEST]: (msg) => console.log(msg)
        }
    }
});