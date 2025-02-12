// This file contains all methods to connect the webapp to the Freon generated language editorEnvironment and to the server that stores the models
import { AST, BoxFactory, FreError, FreErrorSeverity, FreLogger, FreUndoManager, InMemoryModel, isIdentifier } from "@freon4dsl/core";
import type {
    FreEnvironment,
    FreNode,
    FreModel,
    FreModelUnit,
    FreOwnerDescriptor,
    IServerCommunication,
} from "@freon4dsl/core";
import { get } from "svelte/store";
import {
    currentModelName,
    currentUnitName,
    editorProgressShown,
    noUnitAvailable,
    units,
    unitNames,
} from "../components/stores/ModelStore.js";
import { setUserMessage, userMessage } from "../components/stores/UserMessageStore.js";
import { modelErrors } from "../components/stores/InfoPanelStore.js";
import { autorun, runInAction } from "mobx";
import { WebappConfigurator } from "../WebappConfigurator.js";

const LOGGER = new FreLogger("EditorState").mute();

export class EditorState {
    private static instance: EditorState | null = null;

    static getInstance(): EditorState {
        if (EditorState.instance === null) {
            EditorState.instance = new EditorState();
        }
        return EditorState.instance;
    }

    modelStore: InMemoryModel;
    modelChanged = (store: InMemoryModel): void => {
        LOGGER.log(`modelChanged: ${store?.model?.name}`);
        currentModelName.set(store?.model?.name);
        unitNames.set(store.getUnitIdentifiers());
        units.set(store.getUnits());
    };

    private constructor() {
        this.modelStore = new InMemoryModel(this.langEnv, this.serverCommunication);
        this.modelStore.addCurrentModelListener(this.modelChanged);
    }

    // todo see whether we can use only the editor.rootElement as currentUnit
    private __currentUnit: FreModelUnit = null;
    get currentUnit(): FreModelUnit {
        return this.__currentUnit;
    }
    set currentUnit(unit: FreModelUnit) {
        this.__currentUnit = unit;
        FreUndoManager.getInstance().currentUnit = unit
        currentUnitName.set({ name: this?.currentUnit?.name, id: this?.currentUnit?.freId() });
    }

    get currentModel(): FreModel {
        return this.modelStore.model;
    }
    private langEnv: FreEnvironment = WebappConfigurator.getInstance().editorEnvironment;
    private serverCommunication: IServerCommunication = WebappConfigurator.getInstance().serverCommunication;

    /**
     * Creates a new model
     * @param modelName
     */
    async newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        editorProgressShown.set(true);
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // reset all visible information on the model and unit
        this.resetGlobalVariables();
        // create a new model
        await this.modelStore.createModel(modelName);
        this.updateUnitList("1")
        editorProgressShown.set(false);
    }

    updateUnitListRunning: boolean = false
    
    updateUnitList(n: string): void {
        // Ensure this is done only once
        if (!this.updateUnitListRunning) {
            this.updateUnitListRunning = true
            autorun(() => {
                unitNames.set(this.modelStore.getUnitIdentifiers());
                units.set(this.modelStore.getUnits());
            })
        }
    }
    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * @param modelName
     */
    async openModel(modelName: string) {
        LOGGER.log("EditorState.openmodel(" + modelName + ")");
        editorProgressShown.set(true);
        this.resetGlobalVariables();
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        // create new model instance in memory and set its name
        await this.modelStore.openModel(modelName);
        const unitIdentifiers = this.modelStore.getUnitIdentifiers();
        LOGGER.log("unit identifiers: " + JSON.stringify(unitIdentifiers));
        if (!!unitIdentifiers && unitIdentifiers.length > 0) {
            // load the first unit completely and show it
            let first: boolean = true;
            for (const unitIdentifier of unitIdentifiers) {
                if (first) {
                    const unit = this.modelStore.getUnitByName(unitIdentifier.name);
                    LOGGER.log("UnitId " + unitIdentifier.name + " unit is " + unit?.name);
                    this.currentUnit = unit;
                    first = false;
                }
            }
            BoxFactory.clearCaches()
            this.langEnv.projectionHandler.clear()
            EditorState.getInstance().showUnitAndErrors(this.currentUnit);
        } else {
            editorProgressShown.set(false);
        }
        this.updateUnitList("2")
    }

    /**
     * When another model is shown in the editor this function is called.
     * It resets a series of global variables.
     * @private
     */
    private resetGlobalVariables() {
        noUnitAvailable.set(true);
        units.set([]);
        modelErrors.set([]);
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    async newUnit(newName: string, unitType: string) {
        LOGGER.log("EditorState.newUnit: unitType: " + unitType + ", name: " + newName + " in model " + this.currentModel?.name);
        editorProgressShown.set(true);
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        await this.createNewUnit(newName, unitType);
    }

    /**
     * Because of the asynchronicity the true work of creating a new unit is done by this function
     * which is called at various points in the code.
     * @param newName
     * @param unitType
     * @private
     */
    private async createNewUnit(newName: string, unitType: string) {
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: " + newName);
        const newUnit = await this.modelStore.createUnit(newName, unitType);
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            setUserMessage(`Model unit of type '${unitType}' could not be created.`);
        }
    }

    /**
     * Pushes the current unit to the server
     */
    async saveCurrentUnit() {
        LOGGER.log("saveCurrentUnit: " + get(currentUnitName)?.name + `real name is ${(this.langEnv.editor.rootElement as FreModelUnit)?.name}` ) ;
        const unit: FreModelUnit = this.langEnv.editor.rootElement as FreModelUnit;
        if (!!unit) {
            if (!!this.currentModel?.name && this.currentModel?.name?.length) {
                if (!!unit.name && unit.name.length > 0) {
                    if (get(currentUnitName).id === unit.freId() && get(currentUnitName).name !== unit.name)  {
                        // Saved unit already exists but its name has changed.
                        LOGGER.log(`Saving unit that changed name, do a rename from ${get(currentUnitName).name} to ${unit.name}`)
                        await this.renameModelUnit(unit, get(currentUnitName).name, unit.name)
                    } else {
                        await this.modelStore.saveUnit(unit);
                    }
                    currentUnitName.set({ name: unit.name, id: unit.freId() }); // just in case the user has changed the name in the editor
                } else {
                    setUserMessage(`Unit without name cannot be saved. Please, name it and try again.`);
                }
            } else {
                LOGGER.log("Internal error: cannot save unit because current model is unknown.");
            }
        } else {
            LOGGER.log("No current model unit");
        }
    }

    async renameModelUnit(unit: FreModelUnit, oldName: string, newName: string) {
        LOGGER.log(`renameModelUnit: from ${oldName} to ${newName} isId: ${isIdentifier(newName)} Units before: ` + this.currentModel.getUnits().map((u: FreModelUnit) => u.name));
        if (!isIdentifier(newName)) {
            setUserMessage(`Name of Unit '${newName}' may contain only characters, numbers, '_', or '-', and must start with a character.`)
            return
        }
        unit.name = newName;
        // TODO Use model store
        this.serverCommunication.renameModelUnit(this.currentModel.name, oldName, newName, unit);
        this.modelChanged(this.modelStore)
        setUserMessage(`Saved ${newName}`)
        LOGGER.log("renameModelUnit: Units after: " + this.currentModel.getUnits().map((u: FreModelUnit) => u.name));
    }

    /**
     * Deletes the unit 'unit', from the server and from the current in-memory model
     * @param unit
     */
    async deleteModelUnit(unit: FreModelUnit) {
        LOGGER.log("delete called for unit: " + unit.name);

        // get rid of the unit on the server
        await this.modelStore.deleteUnit(unit);
        // if the unit is shown in the editor, get rid of that one, as well
        if (this.currentUnit.freId() === unit.freId()) {
            runInAction(() => {
                this.langEnv.editor.rootElement = null;
            });
            noUnitAvailable.set(true);
            modelErrors.set([]);
        }
        // get rid of the name in the navigator
        currentUnitName.set({ name: "", id: "???" });
    }

    /**
     * Whenever there is a change in the units of the current model,
     * this function is called. It sets the store variable 'units' to the
     * right value.
     * @private
     */
    private setUnitLists() {
        LOGGER.log("setUnitLists");
        const unitsInModel = this.currentModel.getUnits();
        unitNames.set(unitsInModel.map((u) => ({ name: u.name, id: u.freId() })));
        units.set(unitsInModel);
    }

    /**
     * Reads the unit called 'newUnit' from the server and shows it in the editor
     * @param newUnit
     */
    async openModelUnit(newUnit: FreModelUnit) {
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name);
        // TODO currentUnitName is not updated properly
        if (!!this.currentUnit && newUnit.name === this.currentUnit.name) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING");
            return;
        }
        // save the old current unit, if there is one
        await this.saveCurrentUnit();
        this.showUnitAndErrors(newUnit);
    }

    /**
     * Parses the string 'content' to create a model unit. If the parsing is ok,
     * then the unit is added to the current model.
     * @param content
     * @param metaType
     */
    async unitFromFile(fileName: string, content: string, metaType: string, showIt: boolean) {
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        let unit: FreModelUnit = null;
        try {
            // the following also adds the new unit to the model
            unit = this.langEnv.reader.readFromString(content, metaType, this.currentModel, fileName) as FreModelUnit;
            if (!!unit) {
                // if the element does not yet have a name, try to use the file name
                if (!unit.name || unit.name.length === 0) {
                    unit.name = this.makeUnitName(fileName);
                }
                if (showIt) {
                    // set elem in editor
                    this.showUnitAndErrors(unit);
                }
                await this.modelStore.addUnit(unit);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setUserMessage(e.message, FreErrorSeverity.Error);
            }
        }
    }

    private makeUnitName(fileName: string): string {
        const nameExist: boolean = !!this.currentModel
            .getUnits()
            .find((existing: FreModelUnit) => existing.name === fileName);
        if (nameExist) {
            setUserMessage(`Unit named '${fileName}' already exists, adding number.`, FreErrorSeverity.Error);
            // find the existing names that start with the file name
            const unitsWithSimiliarName = this.currentModel
                .getUnits()
                .filter((existing: FreModelUnit) => existing.name.startsWith(fileName));
            if (unitsWithSimiliarName.length > 1) {
                // there are already numbered units
                // find the biggest number that is in use after the filename, e.g. Home12, Home3 => 12
                let biggestNr: number = 1;
                // find the characters in each of the existing names that come after the file name
                const trailingParts: string[] = unitsWithSimiliarName.map((existing: FreModelUnit) =>
                    existing.name.slice(fileName.length),
                );
                trailingParts.forEach((trailing) => {
                    const nextNumber: number = Number.parseInt(trailing, 10);
                    if (!isNaN(nextNumber) && nextNumber >= biggestNr) {
                        biggestNr = nextNumber + 1;
                    }
                });
                return fileName + biggestNr;
            } else {
                return fileName + "1";
            }
        } else {
            return fileName;
        }
    }

    /**
     * This function takes care of actually showing the new unit in the editor
     * and getting the validation errors, if any, and show them in the error list.
     * @param newUnit
     * @private
     */
    private showUnitAndErrors(newUnit: FreModelUnit) {
        LOGGER.log("showUnitAndErrors called, unitName: " + newUnit?.name);
        if (!!newUnit) {
            noUnitAvailable.set(false);
            runInAction(() => {
                this.langEnv.editor.rootElement = newUnit;
            });
            this.currentUnit = newUnit;
            // todo reinstate the following statement
            // this.getErrors();
            // for now:
            WebappConfigurator.getInstance().editorEnvironment.editor.setErrors([]);
        } else {
            noUnitAvailable.set(true);
            runInAction(() => {
                this.langEnv.editor.rootElement = null;
            });
            this.currentUnit = null;
        }
        editorProgressShown.set(false);
    }

    /**
     * When an error in the errorlist is selected, or a search result is selected, the editor jumps to the faulty element.
     * @param item
     */
    selectElement(item: FreNode, propertyName?: string) {
        LOGGER.log("Item selected");
        this.langEnv.editor.selectElement(item, propertyName);
    }

    /**
     * Runs the validator for the current unit
     */
    getErrors() {
        LOGGER.log("EditorState.getErrors() for " + this.currentUnit.name);
        if (!!this.currentUnit) {
            try {
                const list = this.langEnv.validator.validate(this.currentUnit);
                WebappConfigurator.getInstance().editorEnvironment.editor.setErrors(list);
                modelErrors.set(list);
            } catch (e: unknown) {
                // catch any errors regarding erroneously stored model units
                if (e instanceof Error) {
                    console.log(e.message + e.stack);
                    modelErrors.set([
                        new FreError(
                            "Problem validating model unit: '" + e.message + "'",
                            this.currentUnit,
                            this.currentUnit.name,
                            FreErrorSeverity.Error,
                        ),
                    ]);
                }
            }
        }
    }


}
