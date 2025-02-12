import { makeObservable, observable, runInAction } from "mobx";
import { FreModel, FreModelUnit } from "../ast/index.js";
import { AST } from "../change-manager/index.js";
import { FreEnvironment } from "../environment/index.js";
import { FreLogger } from "../logging/index.js";
import { isNullOrUndefined } from "../util/index.js";
import { IServerCommunication, ModelUnitIdentifier } from "./server/index.js";

export type ModelChangedCallbackFunction = (m: InMemoryModel) => void;

const LOGGER: FreLogger = new FreLogger("InMemoryModel").mute();

export class InMemoryModel {
    private languageEnvironment: FreEnvironment;
    private server: IServerCommunication;
    model: FreModel | undefined = undefined;

    constructor(languageEnvironment: FreEnvironment, server: IServerCommunication) {
        this.languageEnvironment = languageEnvironment;
        this.server = server;
        makeObservable(this, { model: observable });
    }

    /**
     * Create a new model on the server and make this the current in memory model.
     * After this call the newly created model can be retrieved using _getModel_.
     * @param name
     */
    async createModel(name: string): Promise<FreModel> {
        LOGGER.log(`createModel ${name}`)
        runInAction(() => {
            this.model = this.languageEnvironment.newModel(name);
        })
        await this.server.createModel(name);
        this.currentModelChanged();
        return this.model;
    }

    /**
     * Delete current model from the server.
     * After this call the current model is undefined.
     * @param name
     */
    async deleteModel(): Promise<void> {
        await this.server.deleteModel(this.model.name);
        this.model = undefined;
    }

    /**
     * Open an existing model on the server as the in memory model.
     * After this call the newly opened model can be retrieved using _getModel_.
     * * @param name
     */
    async openModel(name: string): Promise<FreModel> {
        LOGGER.log("openModel(" + name + ")");
        AST.change( () => {
            this.model = this.languageEnvironment.newModel(name);
        })
        const unitsIds = await this.server.loadUnitList(name);
        for (const unitId of unitsIds) {
            LOGGER.log("openModel: load model-unit: " + unitId.name);
            const unit = await this.server.loadModelUnit(this.model.name, unitId);
            AST.change( () => {
                this.model.addUnit(unit as FreModelUnit);
            })
        }
        this.currentModelChanged();
        return this.model;
    }

    /**
     * Get a list of all model names that are available on the server.
     */
    async getModels(): Promise<string[]> {
        const models = await this.server.loadModelList();
        return models;
    }

    /**
     * Create a new unit of type _unitConcept_ with name _name_ and store it on the server.
     * Returns the created model unit
     * @param name
     * @param unitConcept
     */
    async createUnit(name: string, unitConcept: string): Promise<FreModelUnit> {
        LOGGER.log(`createUnit ${name} of concept ${unitConcept}`)
        const newUnit = this.model.newUnit(unitConcept);
        runInAction( () => {
            newUnit.name = name;
        })
        await this.server.createModelUnit(this.model.name, newUnit);
        this.currentModelChanged();
        return newUnit;
    }

    /**
     * Delete _unit_ from thge model.
     * @param unit
     */
    async deleteUnit(unit: FreModelUnit) {
        await this.server.deleteModelUnit(this.model.name, { name: unit.name, id: unit.freId() });
        AST.change( () => {
            this.model.removeUnit(unit);
        })
        this.currentModelChanged();
    }

    /**
     * Find a unit with name equal to _name_
     * @param name
     */
    getUnitByName(name: string) {
        return this.model.findUnit(name);
    }

    /**
     * Add _unit_ to the model and save it to the server.
     * Unit should not be in the model when calling this method.
     * @param unit
     */
    async addUnit(unit: FreModelUnit): Promise<void> {
        LOGGER.log(`addUnit ${unit?.name}`)
        AST.change( () => {
            this.model.addUnit(unit);
        })
        await this.saveUnit(unit);
        this.currentModelChanged();
    }

    /**
     * TODO Implement
     * @param id
     */
    getUnitById(id: ModelUnitIdentifier) {
        console.log(`getUnitById: ${id.name}`);
    }

    /**
     * Get all units of the current model.
     */
    getUnits(): FreModelUnit[] {
        const units = this?.model?.getUnits()
        if (isNullOrUndefined(units)) {
            return []
        } else {
            return units
        }
    }

    /**
     * Get all unit identifiers of the current model.
     */
    getUnitIdentifiers(): ModelUnitIdentifier[] {
        const units = this?.model?.getUnits()
        if (isNullOrUndefined(units)) {
            return []
        } else {
            return units.map((u) => {
                return { name: u.name, id: u.freId() };
            });
        }
    }

    /**
     * Save _unit_ to server.
     * The _unit_ needs to be part of the current model.
     * TODO Check whether the above is true.
     * @param unit
     */
    async saveUnit(unit: FreModelUnit): Promise<void> {
        await this.server.putModelUnit(this.model.name, { name: unit.name, id: unit.freId() }, unit);
        this.currentModelChanged();
    }

    /************************************************************
     * Listeners to model state
     ***********************************************************/

    /**
     * Callbacks to inform listeners that the currentmodel/currentunit has changed.
     */
    private currentModelListeners: ModelChangedCallbackFunction[] = [];
    addCurrentModelListener(l: ModelChangedCallbackFunction): void {
        this.currentModelListeners.push(l);
    }
    currentModelChanged(): void {
        this.currentModelListeners.forEach((l) => l(this));
    }
}
