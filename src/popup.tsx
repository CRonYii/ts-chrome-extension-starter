import { Button } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ChromeStorageProps } from "./extension/ChromeStorageContext";
import "./extension/ExtensionDatabase";
import { ActionType } from "./entity/ActionType";
import { Action, MessengerHost, ExtensionHost } from "./extension/Messenger";
import { chromeStorage, connectStorage, ChromeStorageProvider } from "./util/ChromeStorageUtil";

export const optionMessenger = MessengerHost.connect(ExtensionHost.POPUP, ExtensionHost.BACKGROUND);

interface AppProps extends ChromeStorageProps { }

const App = connectStorage(
    class App extends React.Component<AppProps> {

        randomValue = () => {
            chromeStorage.setItems({
                popup: {
                    random: Math.random()
                }
            });
        }

        clearValue = () => {
            chromeStorage.clearStorage();
        }

        sendMsg = () => {
            optionMessenger.send(new Action({ name: ActionType.TEST, params: "Test Message" }));
        }

        render() {
            return <div>
                <div>
                    Value: {this.props.storage.popup.random}
                </div>
                <Button onClick={this.randomValue}>Random Value!!</Button>
                <Button onClick={this.sendMsg}>Send Message!!</Button>
                <Button onClick={this.clearValue}>Clear Value</Button>
            </div>;
        }

    }
);

ReactDOM.render(
    <ChromeStorageProvider>
        <App />
    </ChromeStorageProvider>,
    document.querySelector("#root")
);