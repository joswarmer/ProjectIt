// This file contains all methods to connect the webapp to the projectIt generated language editorEnvironment and to the server that stores the models
import { PiCompositeProjection, PiError, PiLogger, PiModel, PiNamedElement } from "@projectit/core";
// import { ServerCommunication } from "../server/ServerCommunication";
import { get } from "svelte/store";
import {
    currentModelName,
    currentUnitName,
    fileExtensions,
    languageName,
    noUnitAvailable,
    projectionNames,
    severityType,
    units,
    unitTypes
} from "../webapp-ts-utils/WebappStore";
import { modelErrors } from "../webapp-ts-utils/ModelErrorsStore";
import { setUserMessage } from "../webapp-ts-utils/UserMessageUtils";
import { editorEnvironment, serverCommunication } from "../WebappConfiguration";
import { IServerCommunication } from "../server/IServerCommunication";
import { MpsServerCommunication } from "../server/MpsServerCommunication";

const LOGGER = new PiLogger("EditorCommunication"); // .mute();

export class EditorCommunication {
    private static instance: EditorCommunication = null;

    static getInstance(): EditorCommunication {
        if (EditorCommunication.instance === null) {
            EditorCommunication.instance = new EditorCommunication();
            EditorCommunication.instance.serverCommunication = serverCommunication;
        }
        return EditorCommunication.instance;
    }

    /**
     * fills the WebappStore with initial values that describe the language
     */
    static initialize(): void {
        languageName.set(editorEnvironment.languageName);
        // unitTypes are the same for every model in the language
        unitTypes.set(editorEnvironment.unitNames);
        // file extensions are the same for every model in the language
        const tmp: string[] = [];
        for (const val of editorEnvironment.fileExtensions.values()) {
            tmp.push(val);
        }
        fileExtensions.set(tmp);
        // projectionNames are the same for every model in the language
        EditorCommunication.setProjectionNames();
    }

    /**
     * Sets the list of projection names in the right order, such that it can
     * be used in the projection menu.
     */
    static setProjectionNames() {
        const proj = editorEnvironment.editor.projection;
        let nameList: string[] = proj instanceof PiCompositeProjection ? proj.projectionNames() : [proj.name];
        // make sure 'default' is always the first name in the list
        // to do this, first reverse the order of the names
        nameList = nameList.reverse();
        // next, check whether the first is 'default'
        if (nameList[0] !== "default") {
            // find index
            const i = nameList.indexOf("default");
            // if already at start, nothing to do
            // else remove old occurrency, if existing
            if (i > 0) {
                nameList.splice( i, 1 );
            }
            // add 'default' as first
            nameList.unshift( "default" );
        }
        projectionNames.set(nameList);
    }

    currentUnit: PiNamedElement = null;
    currentModel: PiModel = null;
    hasChanges: boolean = false; // TODO get the value from the editor

    /**
     * Creates a new model
     * @param modelName
     * @param unitName
     */
    newModel(modelName: string) {
        LOGGER.log("new model called: " + modelName);
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        // reset all visible information on the model and unit
        this.resetGlobalVariables();
        // create a new model
        this.currentModel = editorEnvironment.newModel(modelName);
        currentModelName.set(this.currentModel.name);
    }

    /**
     * Adds a new unit to the current model and shows it in the editor
     * @param newName
     * @param unitType
     */
    newUnit(newName: string, unitType: string) {
        LOGGER.log("new unit called, unitType: " + unitType + ", name: " + newName);

        // save the old current unit, if there is one
        this.saveCurrentUnit();

        // replace the current unit by its interface
        // and create a new unit named 'newName'
        const oldName: string = get(currentUnitName);
        if (!!oldName && oldName !== "") {
            // get the interface of the current unit from the server
            serverCommunication.loadModelUnitInterface(
                get(currentModelName),
                get(currentUnitName),
                (oldUnitInterface: PiNamedElement) => {
                    if (!!oldUnitInterface) {
                        // swap current unit with its interface in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                    }
                    this.createNewUnit(newName, unitType);
                });
        } else {
            this.createNewUnit(newName, unitType);
        }
    }

    /**
     * Because of the asynchronicity the true work of creating a new unit is done by this function
     * which is called at various points in the code.
     * @param newName
     * @param unitType
     * @private
     */
    private createNewUnit(newName: string, unitType: string) {
        LOGGER.log("private createNewUnit called, unitType: " + unitType + " name: "+ newName);
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        // create a new unit and add it to the current model
        const newUnit = EditorCommunication.getInstance().currentModel.newUnit(unitType);
        // TODO check whether the next statement is valid in all cases: units should have a name attribute called 'name'
        newUnit.name = newName;
        if (!!newUnit) {
            // show the new unit in the editor
            this.showUnitAndErrors(newUnit);
        } else {
            setUserMessage(`Model unit of type '${unitType}' could not be created.`);
        }
        currentUnitName.set(newName);
    }

    /**
     * Pushes the current unit to the server
     */
    async saveCurrentUnit() {
        LOGGER.log("EditorCommunication.saveCurrentUnit: " + get(currentUnitName));
        const unit: PiNamedElement = editorEnvironment.editor.rootElement as PiNamedElement;
        if (!!unit) {
            if (unit.name && unit.name.length > 0) {
                await serverCommunication.putModelUnit(this.currentModel.name, this.currentUnit.name, unit);
                currentUnitName.set(unit.name);
                EditorCommunication.getInstance().setUnitLists();
                this.hasChanges = false;
            } else {
                setUserMessage(`Unit without name cannot be saved. Please, name it and try again.`);
            }
        } else {
            LOGGER.log("No current model unit");
        }
    }

    /**
     * Deletes the unit 'unit', from the server and from the current in-memory model
     * @param unit
     */
    async deleteModelUnit(unit: PiNamedElement) {
        LOGGER.log("delete called for unit: " + unit.name);

        // get rid of the unit on the server
        await serverCommunication.deleteModelUnit(get(currentModelName), unit.name);
        // get rid of old model unit from memory
        this.currentModel.removeUnit(unit);
        // if the unit is shown in the editor, get rid of that one, as well
        if (this.currentUnit === unit) {
            editorEnvironment.editor.rootElement = null;
            noUnitAvailable.set(true);
            modelErrors.set([]);
        }
        // get rid of the name in the navigator
        this.setUnitLists();
    }

    /**
     * Whenever there is a change in the units of the current model,
     * this function is called. It sets the store varible 'units' to the
     * right value.
     * @private
     */
    private setUnitLists() {
        console.log("setUnitLists");
        const newUnitList: PiNamedElement[][] = [];
        for (const name of editorEnvironment.unitNames) {
            newUnitList.push(this.currentModel.getUnitsForType(name));
        }
        units.set(newUnitList);
    }
    // TODO check all calls to setUnitLists => probably to many

    /**
     * Reads the model with name 'modelName' from the server and makes this the current model.
     * The first unit in the model is shown, if present.
     * @param modelName
     */
    async openModel(modelName: string) {
        LOGGER.log("EditorCommunication.openmodel(" + modelName + ")");
        this.resetGlobalVariables();

        // save the old current unit, if there is one
        this.saveCurrentUnit();
        // create new model instance in memory and set its name
        const model: PiModel = editorEnvironment.newModel(modelName);
        this.currentModel = model;
        currentModelName.set(modelName);
        // fill the new model with the units loaded from the server
        serverCommunication.loadUnitList(modelName, (unitNames: string[]) => {
            // console.log(`callback unitNames: ${unitNames}`);
            if (unitNames && unitNames.length > 0) {
                // load the first unit completely and show it
                // load all others units as interfaces
                let first: boolean = true;
                for (const unitName of unitNames) {
                    LOGGER.log("load unit: " + unitName);
                    if (first) {
                        serverCommunication.loadModelUnit( modelName, unitName, (unit: PiNamedElement) => {
                            this.currentModel.addUnit(unit);
                            this.currentUnit = unit;
                            unit.name = unitName;
                            currentUnitName.set(this.currentUnit.name);
                            EditorCommunication.getInstance().showUnitAndErrors(this.currentUnit);
                        });
                        first = false;
                    } else {
                        serverCommunication.loadModelUnitInterface(modelName, unitName, (unit: PiNamedElement) => {
                            this.currentModel.addUnit(unit);
                            unit.name = unitName;
                            this.setUnitLists();
                        });
                    }
                }
            }
        });
    }

    /**
     * When another unit is shown in th editor this function is called.
     * It resets a series of global variables.
     * @private
     */
    private resetGlobalVariables() {
        noUnitAvailable.set(true);
        units.set([]);
        modelErrors.set([]);
    }

    /**
     * Reads the unit called 'newUnit' from the server and shows it in the editor
     * @param newUnit
     */
    openModelUnit(newUnit: PiNamedElement) {
        LOGGER.log("openModelUnit called, unitName: " + newUnit.name);
        if (!!this.currentUnit && newUnit.name === this.currentUnit.name ) {
            // the unit to open is the same as the unit in the editor, so we are doing nothing
            LOGGER.log("openModelUnit doing NOTHING");
            return;
        }
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        // newUnit is stored in the in-memory model as an interface only
        // we must get the full unit from the server and make a swap
        await serverCommunication.loadModelUnit(this.currentModel.name, newUnit.name, (newCompleteUnit: PiNamedElement) => {
            this.swapInterfaceAndUnits(newCompleteUnit, newUnit);
        });
    }

    /**
     * Swaps 'newUnitInterface', which is part of the in-memory current model, for the complete unit 'newCompleteUnit'.
     * Next, the current -complete- unit is swapped with its interface from the server.
     * This makes sure that the state of in-memory model is such that only the unit that is shown in the editor
     * is fully present, all other units are interfaces only.
     * @param newCompleteUnit
     * @param newUnitInterface
     * @private
     */
    private swapInterfaceAndUnits(newCompleteUnit: PiNamedElement, newUnitInterface: PiNamedElement) {
        if (!!EditorCommunication.getInstance().currentUnit) {
            // get the interface of the current unit from the server
            serverCommunication.loadModelUnitInterface(
                EditorCommunication.getInstance().currentModel.name,
                EditorCommunication.getInstance().currentUnit.name,
                (oldUnitInterface: PiNamedElement) => {
                    if (!!newCompleteUnit) { // the new unit which has been retrieved from the server
                        if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
                            // swap old unit with its interface in the in-memory model
                            EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
                        }
                        // swap the new unit interface with the full unit in the in-memory model
                        EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
                        // show the new unit in the editor
                        this.showUnitAndErrors(newCompleteUnit);
                    }
                });
        } else {
            // swap the new unit interface with the full unit in the in-memory model
            EditorCommunication.getInstance().currentModel.replaceUnit(newUnitInterface, newCompleteUnit);
            // show the new unit in the editor
            this.showUnitAndErrors(newCompleteUnit);
        }
    }

    /**
     * Parses the string 'content' to create a model unit. If the parsing is ok,
     * then the unit is added to the current model.
     * @param content
     * @param metaType
     */
    unitFromFile(content: string, metaType: string) {
        // save the old current unit, if there is one
        this.saveCurrentUnit();
        let elem: PiNamedElement = null;
        elem = editorEnvironment.reader.readFromString(content, metaType) as PiNamedElement;
        if (elem) {
            if (this.currentModel.getUnits().filter(unit => unit.name === elem.name).length > 0) {
                setUserMessage(`Unit named '${elem.name}' already exists.`, severityType.error);
                return;
            }

            // TODO find way to get interface without use of the server, because of concurrency error
            // swap old unit with its interface in the in-memory model
            // serverCommunication.loadModelUnitInterface(
            //     EditorCommunication.getInstance().currentModel.name,
            //     EditorCommunication.getInstance().currentUnit.name,
            //     (oldUnitInterface: PiNamedElement) => {
            //         if (!!oldUnitInterface) { // the old unit has been previously stored, and there is an interface available
            //             // swap old unit with its interface in the in-memory model
            //             EditorCommunication.getInstance().currentModel.replaceUnit(EditorCommunication.getInstance().currentUnit, oldUnitInterface);
            //         }
            //     });

            // add the new unit to the current model
            this.currentModel.addUnit(elem);
            // add the new unit to the navigator
            this.setUnitLists();
            // set elem in editor
            this.showUnitAndErrors(elem);
        }
    }

    /**
     * Unparses the current model unit to a string, which can be used as content in a
     * downloadable file.
     */
    unitAsText(): string {
        return editorEnvironment.writer.writeToString(this.currentUnit);
    }

    /**
     * Returns the right file extension for the current unit, based on the type of the unit.
     */
    unitFileExtension(): string {
        const unitType = this.currentUnit.piLanguageConcept();
        return editorEnvironment.fileExtensions.get(unitType);
    }

    /**
     * This function takes care of actually showing the new unit in the editor
     * and getting the validation errors, if any, and show them in the error list.
     * @param newUnit
     * @private
     */
    private showUnitAndErrors(newUnit: PiNamedElement) {
        LOGGER.log("showUnitAndErrors called, unitName: " + newUnit.name);
        if (!!newUnit) {
            noUnitAvailable.set(false);
            editorEnvironment.editor.rootElement = newUnit;
            this.currentUnit = newUnit;
            currentUnitName.set(newUnit.name);
            this.setUnitLists();
            this.hasChanges = true;
            this.getErrors();
        } else {
            noUnitAvailable.set(true);
            editorEnvironment.editor.rootElement = null;
            this.currentUnit = null;
            currentUnitName.set("<noUnit>");
            this.setUnitLists();
            this.hasChanges = false;
        }
    }

    /**
     * When an error in the errorlist is selected, the editor jumps to the faulty element.
     * @param error
     */
    errorSelected(error: PiError) {
        LOGGER.log("Error selected: '" + error.message + "', location:  '" + error.locationdescription + "'");
        // TODO test this when editor setFocus is fully implemented
        if (Array.isArray(error.reportedOn)) {
            editorEnvironment.editor.selectElement(error.reportedOn[0]);
        } else {
            editorEnvironment.editor.selectElement(error.reportedOn);
        }
    }

    /**
     * Runs the validator for the current unit
     */
    getErrors() {
        LOGGER.log("EditorCommunication.getErrors() for " + this.currentUnit.name);
        if (!!this.currentUnit) {
            const list = editorEnvironment.validator.validate(this.currentUnit);
            modelErrors.set(list);
        }
    }

    /**
     * Makes sure that the editor show the current unit using the projections selected by the user
     * @param name
     */
    setProjection(name: string): void {
        LOGGER.log("setting Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectiontoFront(name);
        }
    }

    /**
     * Makes sure that the editor show the current unit using the projections selected or unselected by the user
     * @param name
     */
    unsetProjection(name: string): void {
        LOGGER.log("unsetting Projection " + name);
        const proj = editorEnvironment.editor.projection;
        if (proj instanceof PiCompositeProjection) {
            proj.projectionToBack(name);
        }
    }

    redo() {
        // TODO implement redo()
        LOGGER.log("redo called");
        return undefined;
    }

    undo() {
        // TODO implement undo()
        LOGGER.log("undo called");
        return undefined;
    }

    validate() {
        // TODO implement validate()
        LOGGER.log("validate called");
        EditorCommunication.getInstance().getErrors();
    }

    replace() {
        // TODO implement replace()
        LOGGER.log("replace called");
        return undefined;
    }

    findText() {
        // TODO implement replace()
        LOGGER.log("findText called");
        return undefined;
    }

    findElement() {
        // TODO implement replace()
        LOGGER.log("findElement called");
        return undefined;
    }
}
