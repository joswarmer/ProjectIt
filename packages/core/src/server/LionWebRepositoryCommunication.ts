import { ClientResponse, ListPartitionsResponse, RepositoryClient } from "@lionweb/repository-client"
import process from "process"
import { FreModelUnit, FreNamedNode, FreNode } from "../ast/index"
import { FreLogger } from "../logging/index";
import { FreLionwebSerializer, FreSerializer } from "../storage/index";
import { FreErrorSeverity } from "../validator/index";
import type { IServerCommunication, ModelUnitIdentifier } from "./IServerCommunication";
import { ServerCommunication } from "./ServerCommunication";
import { collectUsedLanguages } from "./UsedLanguages"

const LOGGER = new FreLogger("LionWebRepositoryCommunication"); 

export class LionWebRepositoryCommunication implements IServerCommunication {
    client = new RepositoryClient("Freon", "default")
    lionweb_serial: FreSerializer = new FreLionwebSerializer();
    static instance: LionWebRepositoryCommunication;

    static getInstance(): LionWebRepositoryCommunication {
        if (!(!!LionWebRepositoryCommunication.instance)) {
            LionWebRepositoryCommunication.instance = new LionWebRepositoryCommunication();
        }
        return LionWebRepositoryCommunication.instance;
    }
    
    constructor() {
        this.client.loggingOn = true
    }

    // private static findParams(params?: string) {
    //     if (!!params && params.length > 0) {
    //         return "?" + params;
    //     } else {
    //         return "";
    //     }
    // }

    private _nodePort = process.env.NODE_PORT || 3005;
    private _SERVER_IP = `http://127.0.0.1`;
    private _SERVER_URL = `${this._SERVER_IP}:${this._nodePort}/`;

    onError(msg: string,  severity: FreErrorSeverity): void {
        // default implementation
        console.error(`LionWebRepositoryCommunication ${severity}: ${msg}`);
    }

    // TODO fix callback
    // @ts-ignore
    async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
        const ids = await this.client.bulk.ids(quantity)
        return ids.body.ids
    }

    async createModelUnit(modelName: string, unit: FreModelUnit): Promise<void> {
        const model = this.lionweb_serial.convertToJSON(unit);
        const usedLanguages = collectUsedLanguages(model)
        let output = {
            "serializationFormatVersion": "2023.1",
            "languages": usedLanguages,
            "nodes": model
        }
        console.log("Used Languages " + JSON.stringify(usedLanguages));
        this.client.repository = modelName
        const requestResult = await this.client.bulk.createPartitions(output);
        console.log("CREATE MODEL UNIT " + JSON.stringify(requestResult));
    }

    
    /**
     * Takes 'unit' and stores it as 'unitName' in the folder 'modelName' on the server at SERVER_URL.
     * 'unitName' must start with a character and contain only characters and/or numbers.
     * @param modelName
     * @param unitIdentifier
     * @param unit
     */
    async putModelUnit(modelName: string, unitIdentifier: ModelUnitIdentifier, unit: FreNamedNode) {
        LOGGER.log(`LionWebRepositoryCommunication.putModelUnit ${modelName}/${unitIdentifier.name}`);
        if (!!unitIdentifier.name && unitIdentifier.name.length > 0 && unitIdentifier.name.match(/^[a-z,A-Z][a-z,A-Z0-9_\-\.]*$/)) {
            const model = this.lionweb_serial.convertToJSON(unit);
            const usedLanguages = collectUsedLanguages(model)
            let output = {
                "serializationFormatVersion": "2023.1",
                "languages": usedLanguages,
                "nodes": model
            }
            console.log("USed Languages " + JSON.stringify(usedLanguages));
            this.client.repository = modelName
            const requestResuklt = await this.client.bulk.store(output);
            console.log("PUT MODEL UNIT " + JSON.stringify(requestResuklt));
        } else {
            LOGGER.error( "Name of Unit '" + unitIdentifier.name + "' may contain only characters, numbers, '_', or '-', and must start with a character.");
            this.onError("Name of Unit '" + unitIdentifier.name
                + "' may contain only characters, numbers, '_', or '-', and must start with a character.", FreErrorSeverity.NONE);
        }
    }

    async createModel(modelName: string): Promise<any> {
        await this.client.dbAdmin.createRepository(modelName, false)
    }

    
    /**
     * Deletes the unit indicated by 'modelInfo' including its interface.
     * @param modelName
     * @param unitName
     */
    async deleteModelUnit(modelName: string, unit: ModelUnitIdentifier) {
        LOGGER.log(`LionWebRepositoryCommunication.deleteModelUnit ${modelName}/${unit.name}`);
        if (!!unit.name && unit.name.length > 0) {
            this.client.repository = modelName
            await this.client.bulk.deletePartitions([unit.id])
        }
    }

    /**
     * Deletes the complete model named 'modelName'.
     * @param modelName
     */
    async deleteModel(modelName: string ) {
        LOGGER.log(`LionWebRepositoryCommunication.deleteModel ${modelName}`);
        if (!!modelName && modelName.length > 0) {
            await this.client.dbAdmin.deleteRepository(modelName)
        }
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        LOGGER.log(`loadModelList`);
        const repos = await this.client.dbAdmin.listRepositories()
        const res = repos.body.repositoryNames 
        if (!!res) {
            await modelListCallback(res);
        } else {
            await modelListCallback([]);
        }
        return []
    }

    /**
     * Reads the list of units in model 'modelName' that are available on the server and calls 'modelListCallback'.
     * @param modelName
     * @param modelListCallback
     */
    async loadUnitList(modelName: string): Promise<ModelUnitIdentifier[]> {
        LOGGER.log(`loadUnitList`);
        this.client.repository = modelName
        let modelUnits: ClientResponse<ListPartitionsResponse> = await this.client.bulk.listPartitions();
        return modelUnits.body.chunk.nodes.map(n => { return {name: "name " + n.id, id: n.id} } );
    }

    /**
     * Loads the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @return the loaded in memory modelunit
     */
    async loadModelUnit(modelName: string, unit: ModelUnitIdentifier): Promise<FreNode> {
        LOGGER.log(`loadModelUnit ${unit.name}`);
        this.client.repository = modelName
        if (!!unit.name && unit.name.length > 0) {
            const res = await this.client.bulk.retrieve([unit.id])
            if (!!res) {
                try {
                    console.log(JSON.stringify(res, null, 2))
                    let unit = ServerCommunication.lionweb_serial.toTypeScriptInstance(res.body.chunk);
                    return unit as FreNode;
                } catch (e) {
                    LOGGER.error( "loadModelUnit, " + e.message);
                    this.onError(e.message, FreErrorSeverity.NONE);
                    console.log(e.stack);
                }
            }
        }
        return null
    }

    /**
     * Loads the interface of the unit named 'unitName' of model 'modelName' from the server and calls 'loadCallBack',
     * which takes the unit as parameter.
     * @param modelName
     * @param unitName
     * @param loadCallback
     */
    // @ts-ignore
    async loadModelUnitInterface(modelName: string, unit: ModelUnitIdentifier, loadCallback: (unit: FreModelUnit) => void) {
    // async loadModelUnitInterface(modelName: string, unitName: ModelUnitIdentifier, loadCallback: (piUnitInterface: FreNamedNode) => void) {
        // LOGGER.log(`ServerCommunication.loadModelUnitInterface for ${modelName}/${unitName}`);
        // if (!!unitName && unitName.length > 0) {
        //     const res = await this.fetchWithTimeout<Object>(`getModelUnit`, `folder=${modelName}&name=${unitName}${modelUnitInterfacePostfix}`);
        //     if (!!res) {
        //         try {
        //             let unit: FreNode;
        //             if (res["$typename"] === undefined) {
        //                 unit = this.lionweb_serial.toTypeScriptInstance(res);
        //             } else {
        //                 unit = ServerCommunication.serial.toTypeScriptInstance(res);
        //             }
        //             // const model = ServerCommunication.serial.toTypeScriptInstance(res);
        //             loadCallback(unit as FreNamedNode);
        //         } catch (e) {
        //             LOGGER.error( "loadModelUnitInterface, " + e.message);
        //             this.onError(e.message, FreErrorSeverity.NONE);
        //         }
        //     }
        // }
    }
  
    // @ts-ignore
    private handleError(e: Error) {
        let errorMess: string = e.message;
        if (e.message.includes("aborted")) {
            errorMess = `Time out: no response from ${this._SERVER_URL}.`;
        }
        LOGGER.error( errorMess);
        this.onError(errorMess, FreErrorSeverity.NONE);
    }

    async renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode) {
        LOGGER.log(`ServerCommunication.renameModelUnit ${modelName}/${oldName} to ${modelName}/${newName}`);
        this.client.repository = modelName
        // put the unit and its interface under the new name
        this.putModelUnit(modelName, {name: newName, id: unit.freId()}, unit);
        // remove the old unit and interface
        this.deleteModelUnit(modelName, { name: unit.name, id: unit.freId()});
    }

}
