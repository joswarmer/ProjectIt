import { PiElement } from "../language";
import { Language, Property } from "./Language";
import { isNullOrUndefined } from "../util";

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
        return this.toTypeScriptInstanceInternal(jsonObject);
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
        type = this.startWithUpperCase(type).replace(/\./g,"_");
        const result: PiElement = this.language.createConceptOrUnit(type);
        if (isNullOrUndefined(result)) {
            throw new Error(`Cannot read json: ${type} unknown.`);
        }
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
        // TODO
        const references = jsonObject["refs"];
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

    private convertPartProperty(result: PiElement, property: Property, value: any) {
        if (property.isList) {
            // console.log("    list property of size "+ value.length);
            // result[property.name] = [];
            for (const item in value) {
                if (!isNullOrUndefined(value[item])) {
                    result[property.name].push(this.toTypeScriptInstance(value[item]));
                }
            }
        } else {
            if (!isNullOrUndefined(value)) {
                result[property.name] = this.toTypeScriptInstance(value);
            }
        }
    }

    private convertReferenceProperties(result: PiElement, property: Property, value: any) {
        if (property.isList) {
            for (const item in value) {
                if (!isNullOrUndefined(value[item])) {
                    result[property.name].push(this.language.referenceCreator(value[item], property.type));
                }
            }
        } else {
            if (!isNullOrUndefined(value)) {
                result[property.name] = this.language.referenceCreator(value, property.type);
            }
        }
    }

    private convertProperties(result: PiElement, property: Property, value: any) {
        // console.log(">> creating property "+ property.name + "  of type " + property.propertyType + " isList " + property.isList);
        switch (property.propertyType) {
            case "primitive":
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
                break;
            case "part":
                if (property.isList) {
                    // console.log("    list property of size "+ value.length);
                    // result[property.name] = [];
                    for (const item in value) {
                        if (!isNullOrUndefined(value[item])) {
                            result[property.name].push(this.toTypeScriptInstance(value[item]));
                        }
                    }
                } else {
                    if (!isNullOrUndefined(value)) {
                        result[property.name] = this.toTypeScriptInstance(value);
                    }
                }
                break;
            case "reference":
                if (property.isList) {
                    for (const item in value) {
                        if (!isNullOrUndefined(value[item])) {
                            result[property.name].push(this.language.referenceCreator(value[item], property.type));
                        }
                    }
                } else {
                    if (!isNullOrUndefined(value)) {
                        result[property.name] = this.language.referenceCreator(value, property.type);
                    }
                }
                break;
            default:
        }
    }

    public startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }


}
