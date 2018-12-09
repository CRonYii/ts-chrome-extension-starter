export enum ExtensionHost {
    BACKGROUND = "BACKGROUND",
    OPTION = "OPTION",
    POPUP = "POPUP",
    CONTENT = "CONTENT"
}

export interface IAction {
    name: any;
    params?: any;
}

export class Action {

    static readonly CONNECTED_ACTION = new Action({ name: 'connected' });
    static readonly IS_SENDER_ACTION = new Action({ name: 'isSender' });

    public readonly name: any;
    public readonly params: any;

    constructor(option: IAction) {
        this.name = option.name;
        this.params = option.params || {};
    }

}

export interface PortMessage {
    sender: string;
    action: Action;
}

export interface IMessenger {
    name: string,
    parentReducer: any
}

export class MessengerHost {

    public static connect(from: string, to: string): ExtensionPort {
        const port = chrome.runtime.connect({ name: to });
        const extPort = new ExtensionPort({
            sender: from,
            port,
            role: { name: "client" }
        });
        return extPort;
    }

    private readonly portMap: Map<string, ExtensionPort> = new Map<string, ExtensionPort>();
    private readonly name: string;
    private readonly parentReducer: any;

    constructor(option: IMessenger) {
        this.name = option.name;
        this.parentReducer = option.parentReducer;
        this.host();
    }

    public disconnect() {
        this.portMap.forEach((port) => {
            port.disconnect();
        });
    }

    private host() {
        chrome.runtime.onConnect.addListener((port) => {
            if (port.name !== this.name) return;

            const extPort = new ExtensionPort({
                sender: port.sender.url,
                port,
                role: {
                    name: "host",
                    callback: (sender) => {
                        extPort.setReceiver(this.parentReducer[sender]);
                        this.portMap.set(port.sender.id, extPort);
                        console.info(port.sender.url + ' connected to ' + this.name + ' port');
                    }
                },
                onDisconnect: (port) => {
                    console.info(`${port.sender.url} disconnected`);
                    this.portMap.delete(port.sender.id);
                }
            });

            extPort.send(Action.CONNECTED_ACTION);
        });

        console.info('Awaiting connection to ' + this.name + ' port.');
    }

}

export interface IExtensionPort {
    sender: string,
    role: {
        name: "host" | "client",
        callback?: (sender: string) => any
    },
    port: chrome.runtime.Port,
    onDisconnect?: (port: chrome.runtime.Port) => void
}

export class ExtensionPort {

    private readonly sender: string;
    private readonly port: chrome.runtime.Port;

    private receiverListener: (msg: PortMessage) => void;

    constructor(option: IExtensionPort) {
        this.sender = option.sender;
        this.port = option.port;
        this.port.onDisconnect.addListener(option.onDisconnect);
        if (option.role.name === "host") {
            this.hostHandShakeHandle(option.role.callback);
        } else {
            this.clientHandShakeHandle(option.role.callback);
        }
    }

    private hostHandShakeHandle(callback?: (sender: string) => any) {
        this.port.onMessage.addListener((msg: PortMessage) => {
            if (msg.action.name === Action.IS_SENDER_ACTION.name) {
                if (callback)
                    callback(msg.sender);
            }
        });
    }

    private clientHandShakeHandle(callback?: (sender: string) => any) {
        this.port.onMessage.addListener((msg: PortMessage) => {
            if (msg.action.name === Action.CONNECTED_ACTION.name) {
                this.send(Action.IS_SENDER_ACTION);
                if (callback)
                    callback(msg.sender);
                console.info('Connected to ' + this.port.name);
            }
        });
    }

    public disconnect() {
        console.info(`Disconnected from ${this.sender} to ${this.port.name}`);
        this.port.disconnect();
    }

    public setReceiver(reducer = {}) {
        this.port.onMessage.removeListener(this.receiverListener);
        this.receiverListener = (msg: PortMessage) => {
            const action = reducer[msg.action.name];
            if (action) {
                action(msg.action.params);
            } else {
                console.warn("Unable to execute action: " + msg.action.name);
            }
        };
        this.port.onMessage.addListener(this.receiverListener);
        return this;
    }

    public send(action: Action) {
        const msg: PortMessage = {
            sender: this.sender,
            action
        };
        try {
            this.port.postMessage(msg);
        } catch (e) {
            console.error(`Failed to send message from ${this.sender} to ${this.port.name}`);
        }
        return this;
    }

}