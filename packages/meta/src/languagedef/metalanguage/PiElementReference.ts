import { PiLangElement, PiLangConceptType, PiMetaEnvironment } from "./internal";
import { ParseLocation } from "../../utils";

/**
 * Implementation for a (named) reference in ProjectIt.
 * Reference can be set with either a referred object, or with a unitName.
 */
export class PiElementReference<T extends PiLangElement> {

    // TODO remove this method in favour of the next one
    public static createNamed<T extends PiLangElement>(name: string, typeName: PiLangConceptType): PiElementReference<T> {
        const result = new PiElementReference(null, typeName);
        result.name = name;
        result.typeName = typeName;
        return result;
    }

    public static create<T extends PiLangElement>(name: string | T, typeName: PiLangConceptType): PiElementReference<T> {
        const result = new PiElementReference(null, typeName);
        if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
        }
        result.typeName = typeName;
        return result;
    }

    private _PI_name: string = "";
    private _PI_referred: T = null;

    public owner: PiLangElement;
    public location: ParseLocation;

    // Need for the scoper to work
    private typeName: PiLangConceptType;
    private scoper = PiMetaEnvironment.metascoper;

    private constructor(referredElement: T, typeName: PiLangConceptType) {
        // super();
        this.referred = referredElement;
        this.typeName = typeName;
    }

    set name(value: string) {
        this._PI_name = value;
        this._PI_referred = null;
    }

    get name(): string {
        if (!!this._PI_referred) {
            return this.referred.name;
        }
        return this._PI_name;
    }

    get referred(): T {
        if (!!this._PI_referred) {
            return this._PI_referred;
        } else {
            this._PI_referred = this.scoper.getFromVisibleElements(
                this.owner,
                this._PI_name,
                this.typeName
            ) as T;
        }
        if( this._PI_referred === undefined || this._PI_referred === null){
            console.error("Cannot find [" + this._PI_name + "]");
        }
        return this._PI_referred;
    }

    set referred(referredElement) {
        if (!!referredElement) {
            this._PI_name = referredElement.name;
        } else {
            this._PI_name = "";
        }
        this._PI_referred = referredElement;
    }
}
