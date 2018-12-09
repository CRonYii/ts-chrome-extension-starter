import * as React from "react";
import { ChromeStorage } from "./ChromeStorage";

export interface ChromeStorageProps {
    storage: any
};

export const createChromeStorageContext = (chromeStorage: ChromeStorage) => {

    const ChromeStorageContext = React.createContext(chromeStorage.getItems());

    class ChromeStorageProvider extends React.Component {

        constructor(props) {
            super(props);
            this.state = chromeStorage.getItems();
            chromeStorage.subscribe((storage) => {
                this.setState(storage);
            });
        }

        render() {
            return <ChromeStorageContext.Provider value={this.state}>
                {this.props.children}
            </ChromeStorageContext.Provider>
        }

    }

    const connectStorage = (Component) => {
        return class StorageComponent extends React.Component {
            render() {
                return (<ChromeStorageContext.Consumer>
                    {
                        (storage: any) => {
                            return <Component {...this.props} storage={storage} />;
                        }
                    }
                </ChromeStorageContext.Consumer>);
            };
        }
    }

    return { ChromeStorageProvider, connectStorage };

}