import { PiLogger } from "@projectit/core";
import { PiNamedElement } from "@projectit/core";
import { GenericModelSerializer } from "@projectit/core";
import { SERVER_URL } from "../WebappConfiguration";
import { IServerCommunication } from "./IServerCommunication";
import { setUserMessage } from "../webapp-ts-utils/UserMessageUtils";

const LOGGER = new PiLogger("ServerCommunication"); // .mute();
const modelUnitInterfacePostfix: string = "Public";

export class ServerCommunication implements IServerCommunication {
    static serial: GenericModelSerializer = new GenericModelSerializer();
    private static instance: ServerCommunication;

    static getInstance(): ServerCommunication {
        if (!(!!ServerCommunication.instance)) {
            ServerCommunication.instance = new ServerCommunication();
        }
        return ServerCommunication.instance;
    }

    private static findParams(params: string) {
        if (!!params && params.length > 0) {
            return "?" + params;
        } else {
            return "";
        }
    }

    /**
     * Takes 'piUnit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitName
     * @param piUnit
     */
    async putModelUnit(modelName: string, unitName: string, piUnit: PiNamedElement) {
        LOGGER.log(`ServerCommunication.putModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0 && unitName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
            const model = ServerCommunication.serial.convertToJSON(piUnit);
            const publicModel = ServerCommunication.serial.convertToJSON(piUnit, true);
            await this.putWithTimeout(`putModelUnit`, model, `folder=${modelName}&name=${unitName}` );
            await this.putWithTimeout(
                `putModelUnit`,
                publicModel,
                `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`
            );
        } else {
            LOGGER.error(this, "Name of Unit '" + unitName + "' may contain only characters and numbers, and must start with a character.");
        }
    }

    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unitName
     */
    async deleteModelUnit(modelName: string, unitName: string) {
        LOGGER.log(`ServerCommunication.deleteModelUnit ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}`);
            await this.fetchWithTimeout<any>(`deleteModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string ) {
        LOGGER.log(`ServerCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.fetchWithTimeout<any>(`deleteModel`, `folder=${modelName}`);
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadModelList`);
        const res: string[] = await this.fetchWithTimeout<string[]>(`getModelList`);
        modelListCallback(res);
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    async loadUnitList(modelName: string, modelListCallback: (names: string[]) => void) {
        LOGGER.log(`ServerCommunication.loadUnitList`);
        let modelUnits: string[] = await this.fetchWithTimeout<string[]>(`getUnitList`, `folder=${modelName}`);
        // filter out the modelUnitInterfaces
        if (!!modelUnits) {
            modelUnits = modelUnits.filter( (name: string) => name.indexOf(modelUnitInterfacePostfix) === -1 );
        }
        modelListCallback(modelUnits);
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: PiNamedElement) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnit ${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res: string = await this.fetchWithTimeout<string>(`getModelUnit`, `folder=${modelName}&name=${unitName}`);
            try {
                const unit = ServerCommunication.serial.toTypeScriptInstance(res);
                loadCallback(unit);
            } catch (e) {
                LOGGER.error(this, "loadModelUnit, " + e.message);
                setUserMessage(e.message);
            }
        }
    }

    /**
     * Loads the interface of the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    async loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnitInterface: PiNamedElement) => void) {
        LOGGER.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unitName}`);
        if (!!unitName && unitName.length > 0) {
            const res: string = await this.fetchWithTimeout<string>(`getModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
            try {
                const model = ServerCommunication.serial.toTypeScriptInstance(res);
                loadCallback(model);
            } catch (e) {
                LOGGER.error(this, "loadModelUnitInterface, " + e.message);
                setUserMessage(e.message);
            }
        }
    }

    private async fetchWithTimeout<T>(method: string, params?: string): Promise<T> {
        params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const promise = await fetch(
                `${SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                }
            });
            clearTimeout(timeoutId);
            return await promise.json() as Promise<T>;
        } catch (e) {
            this.handleError(e);
        }
        return null;
    }

    private async putWithTimeout(method: string, data: Object, params?: string) {
        params = ServerCommunication.findParams(params);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            await fetch(
                `${SERVER_URL}${method}${params}`,
                {
                    signal: controller.signal,
                    method: "put",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
            clearTimeout(timeoutId);
        } catch (e) {
            this.handleError(e);
        }
    }

    private handleError(e) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${SERVER_URL}.`;
        }
        LOGGER.error(this, errorMess);
        setUserMessage(errorMess);
    }
}
