import { ChangeManager, PiElement, PiLogger } from "@projectit/core";
import { PiNamedElement } from "@projectit/core";
import { GenericModelSerializer } from "@projectit/core";
// TODO remove interface IModelUnitData
import { IModelUnitData, IServerCommunication } from "./IServerCommunication";
import { MpsServer } from "./MpsServer";
import { MpsServerModelSerializer } from "./MpsServerModelSerializer";

const LOGGER = new PiLogger("MpsServerCommunication"); //.mute();

export const URL = `http://localhost:2905`;
export const URL_MODEL = URL + `/modules/accenture.study.gen.model`;
export const URL_MODULES = URL + `/modules`;
export const URL_MODELS = URL + `/modules/org.projectit.mps.structure.to.ast.example`;

export class MpsServerCommunication implements IServerCommunication {
    public url_model(modelName: string): string {
        return URL + `/models/${modelName}`;
    }

    public url_root(modelName: string, rootid: string): string {
        return URL + `/models/${modelName}/${rootid}`;
    }
    static serial: GenericModelSerializer = new GenericModelSerializer();
    private static instance: MpsServerCommunication;

    static getInstance() : MpsServerCommunication {
        if (!(!!MpsServerCommunication.instance)) {
            MpsServerCommunication.instance = new MpsServerCommunication();
        }
        return MpsServerCommunication.instance;
    }

    private constructor() {
    }

    /**
     * Takes 'piUnit' and stores it under 'modelName' on the server at SERVER_URL.
     * 'modelInfo.unitName' must start with a character and contain only characters and/or numbers.
     * @param modelInfo
     * @param piUnit
     */
    async putModelUnit(modelInfo: IModelUnitData, piUnit: PiNamedElement) {
        LOGGER.log(`MpsServerCommunication.putModelUnit ${modelInfo.modelName}/${modelInfo.unitName}`);
    }

    async deleteModelUnit(modelInfo: IModelUnitData ) {
        LOGGER.log(`MpsServerCommunication.deleteModelUnit ${modelInfo.modelName}/${modelInfo.unitName}`);
    }

    async deleteModel(modelName: string ) {
        LOGGER.log(`MpsServerCommunication.deleteModel`);
    }

    /**
     * Reads the list of models that are available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadModelList(modelListCallback: (names: string[]) => void) {
        LOGGER.log(`MpsServerCommunication.loadModelList`);
    }

    /**
     * Reads the list of units in a model available on the server and calls 'modelListCallback'.
     * @param modelListCallback
     */
    async loadUnitList(modelName: string, modelListCallback: (names: string[]) => void) {
        LOGGER.log(`MpsServerCommunication.loadUnitList for: ` + this.url_model(modelName));
        await MpsServer.the.tryToConnect();
        const answer = await fetch(this.url_model(modelName));
        const text = await answer.text();
        const msg = JSON.parse(text)
        if (msg["success"] === false) {
            alert("Model not obtained: " + msg["message"]);
            return;
        }else {
            const mpsroots = msg["value"]["roots"];
            const names = mpsroots.map(root => {
                LOGGER.log("Root " + root["name"] + " concept " + root["concept"]);
                const rootid = root["id"]["regularId"];
                return this.url_root(modelName, rootid);
            });
            LOGGER.log("names" + names);
            modelListCallback(names);
        }
    }

    async loadUnit(url: string) {
        LOGGER.log("Fetch unit: " + url);
        const answer =  await fetch(url);
        const text = await answer.text();
        const msg = JSON.parse(text)
        if (msg["success"] === false) {
            alert("Root not obtained: " + msg["message"]);
            return null;
        } else {
            return msg["value"];
        }
    }

    /**
     * Reads the model with unitName 'modelName' from the server and calls 'loadCallBack',
     * which takes the model as parameter.
     * @param modelName
     * @param loadCallback
     */
    async loadModelUnit(modelName: string, unitName: string, loadCallback: (piUnit: PiNamedElement) => void) {
        LOGGER.log(`MpsServerCommunication.loadModelUnit ${unitName}`);
        ChangeManager.it.primitive = null;
        const rootCall = await this.loadUnit(unitName);
        LOGGER.log("Root callsed " + JSON.stringify(rootCall));
        // await MpsServer.the.core();
        const ser: MpsServerModelSerializer = new MpsServerModelSerializer();
        const newRoot = ser.toTypeScriptInstance(rootCall);
        // TODO TEST
        // const refname = await MpsServer.the.getReferenceName("org.projectit.mps.structure.to.ast.example.model1", "611540801835488555")
        // LOGGER.log("REF REF REF " + refname);
        loadCallback(newRoot);
        // await MpsServer.the.tryToConnect();
        console.log("SETTING MPS SERVER PROPAGATION")
        ChangeManager.it.primitive = mps;
    }

    async loadModelUnitInterface(modelName: string, unitName: string, loadCallback: (piUnitInterface: PiNamedElement) => void) {
        console.log(`ServerCommunication.loadModelUnitInterface for ${unitName}`);
        await this.loadModelUnit(modelName,unitName,loadCallback);
    }
}

function mps(self: PiElement, propertyName: string | Symbol, value: string | boolean | number) {
    LOGGER.log("Sending change to MPS Server "+ self.piLanguageConcept() + "[" + propertyName + "] := " + value);
    MpsServer.the.changedPrimitiveProperty(self, propertyName as string, value as string );
};

async function resolve(model: string, nodeid: string): Promise<string>  {
    console.log("================ really resolving ref ");
    return await MpsServer.the.getReferenceName(model, nodeid)
}
