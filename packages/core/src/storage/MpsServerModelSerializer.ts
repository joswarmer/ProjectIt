import { PiElement } from "../language";
import { Language, Property } from "./Language";
import { isNullOrUndefined } from "../util";

// This postfix is added by the MPS 2 ProjectIt coinverter to allow modelunits to have a base
// and implement interfaces
const UNIT_POSTFIX = "_Unit";

/**
 * Helper class to serialize a model using MobXModelElementImpl.
 * Will take care of model references.
 *
 * Depends on private keys etc. as defined in MobXModelElement decorators.
 */
export class MpsServerModelSerializer {
    private language: Language;

    constructor() {
        this.language = Language.getInstance();
    }

     /**
     * Convert a JSON object formerly JSON-ified by this very class and turn it into
     * a TypeScript object (being an instance of TypeScript class).
     * Works recursively.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): any {
        if (jsonObject === null) {
            throw new Error("jsonObject is null, cannot convert to TypeScript");
        }
        let type: string = jsonObject["concept"];
        if (isNullOrUndefined(type)) {
            throw new Error(`Cannot read json: not a ProjectIt structure, concept missing: ${JSON.stringify(jsonObject)}`);
        }
        type = this.pi_type(type) + UNIT_POSTFIX;
        const result: PiElement = this.language.createConceptOrUnit(type);
        if (isNullOrUndefined(result)) {
            throw new Error(`Cannot read json: ${type} unknown.`);
        }
        const concept = this.toTypeScriptInstanceInternal(jsonObject);
        result["name"] = type;
        result["content"] = concept;
        return result;
        // return this.toTypeScriptInstanceInternal(jsonObject);
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(jsonObject: Object): any {
        if (jsonObject === null) {
            throw new Error("jsonObject is null, cannot convert to TypeScript");
        }
        let type: string = jsonObject["concept"];
        if (isNullOrUndefined(type)) {
            throw new Error(`Cannot read json: not a ProjectIt structure, concept missing: ${JSON.stringify(jsonObject)}`);
        }
        type = this.pi_type(type);
        const result: PiElement = this.language.createConceptOrUnit(type);
        if (isNullOrUndefined(result)) {
            throw new Error(`Cannot read json: ${type} unknown.`);
        }
        // Get the id , as MPS needs this
        // TODO result
        const properties = jsonObject["properties"];
        for (const property of this.language.allConceptProperties(type)) {
            const value = properties[property.name];
            if (isNullOrUndefined(value)) {
                continue;
                // TODO how to report this to the user..?
            }
            this.convertPrimitiveProperty(result, property, value);
        }
        const parts = jsonObject["children"];
        for (const child of parts) {
            this.convertPartProperty(result, child);
        }
        // TODO
        const references = jsonObject["refs"];
        // for (const ref of references) {
            this.convertReferenceProperties(result, references)
        // }
        // TODO
        return result;
    }

    private convertPrimitiveProperty(result: PiElement, property: Property, value: any) {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyType + " isList " + property.isList);
        if (property.isList) {
            result[property.name] = [];
            for (const item in value) {
                result[property.name].push(value[item]);
            }
        } else {
            // TODO Add other primitive property types
            if (typeof value === "string") {
                result[property.name] = value;
            } else if (typeof value === "number") {
                result[property.name] = value;
            } else if (typeof value === "boolean") {
                result[property.name] = value;
            }
        }
    }

    private convertPartProperty(parent: PiElement, json: Object) {
        const linkNameInParent = json["containingLink"];
        const conceptType = this.pi_type(json["concept"]);
        // console.log("convertPartProperty of type [" + parent.piLanguageConcept() + "] propName: [" + linkNameInParent + "]");
        // It is either a concept or a modelunit
        let property: Property;
        // if (!!this.language.concept(parent.piLanguageConcept() )) {
            property = this.language.conceptProperty(parent.piLanguageConcept(), linkNameInParent);
        // } else {
        //     property = this.language.unitProperty(parent.piLanguageConcept(), linkNameInParent);
        // }
        if (!!property){
            if (property.isList) {
                // console.log("    list property of size "+ value.length);
                // result[property.name] = [];
                parent[property.name].push(this.toTypeScriptInstanceInternal(json));
            } else {
                parent[property.name] = this.toTypeScriptInstanceInternal(json);
            }
        } else {
            console.error("Unknown: convertPartProperty of type [" + parent.piLanguageConcept() + "] propName: [" + linkNameInParent + "]");
        }
    }

    private convertReferenceProperties(parent: PiElement, json: Object) {
        for (const refLinkName of Object.keys(json)) {
            console.log("=========== converting reference property: " + refLinkName)
            const id = json[refLinkName]["id"]["regularId"];
            const modelName = json[refLinkName]["model"]["qualifiedName"];
            parent[refLinkName] = this.language.referenceCreator(refLinkName, this.language.conceptProperty(parent.piLanguageConcept(), refLinkName).type);
        }
    }

    public startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }

    public pi_type(conceptName: string): string {
        return this.startWithUpperCase(conceptName).replace(/\./g,"_");
    }


}
