import { IArrayWillChange, IArrayWillSplice } from "mobx";
import { MODEL_NAME } from "./MobxModelDecorators";
import { PiLogger } from "../../util/PiLogging";
import { PiElement } from "../PiElement";
import { DecoratedModelElement } from "./DecoratedModelElement";

const LOGGER: PiLogger = new PiLogger("ChangeManager");

export class ChangeManager {
    public static it = new ChangeManager();

    private constructor() {
    }

    primitiveCallback: (self: Object, propertyName: string | Symbol, value: string | boolean | number) => void;
    partCallback: (self: Object, propertyName: string | Symbol, value: string | boolean | number) => void;

    public update(change: IArrayWillChange): void {
        // LOGGER.log("ChangeManager.Update " + (change.object as any)[MODEL_NAME]  + "[" + change.index+ "]");
    }

    public splice(change: IArrayWillSplice): void {
        // LOGGER.log("ChangeManager.Splice " + (change.object as any)[MODEL_NAME] + "[" + change.index + "]");
    }

    public setPart(self: PiElement, propertyName: string | Symbol, DecoratedModelElement): void {
        // LOGGER.log("ChangeManager.SET PART in " + propertyName);
    }

    public setPrimitive(self: PiElement, propertyName: string | Symbol, value: string | boolean | number): void {
         if( !!this.primitiveCallback) {
             LOGGER.log("PROPAGATE ChangeManager.SET PRIMITIVE VALUE for {" + self["$typename"] + "} [" + propertyName + "] := " + value);
             this.primitiveCallback(self, propertyName, value);
        } else {
             LOGGER.log("ChangeManager.SET PRIMITIVE VALUE for {" + self["$typename"] + "} [" + propertyName + "] := " + value);
         }
    }
}
