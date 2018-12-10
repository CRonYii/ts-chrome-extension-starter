import { Button } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ActionType } from "./entity/ActionType";
import { ChromeStorageProps } from "./extension/ChromeStorageContext";
import "./extension/ExtensionDatabase";
import { Action, ExtensionHost, MessengerHost } from "./extension/Messenger";
import { chromeStorage, ChromeStorageProvider, connectStorage } from "./util/ChromeStorageUtil";

export const optionMessenger = MessengerHost.connect(ExtensionHost.OPTION, ExtensionHost.BACKGROUND);

interface AppProps extends ChromeStorageProps { }

const App = connectStorage(
    class App extends React.Component<AppProps> {

        randomValue = () => {
            chromeStorage.setItems({
                random: Math.random()
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
                <div className="testStyle">
                    Value: {this.props.storage.random}
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