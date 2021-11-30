import { IArrayWillChange, IArrayWillSplice } from "mobx";
import { MODEL_NAME } from "./MobxModelDecorators";
import { PiLogger } from "../../util/PiLogging";
import { PiElement } from "../PiElement";

const LOGGER: PiLogger = new PiLogger("ChangeManager");

export class ChangeManager {
    public static it = new ChangeManager();

    private constructor() {
    }

    primitive: (self: Object, propertyName: string | Symbol, value: string | boolean | number) => void;

    public update(change: IArrayWillChange): void {
        // LOGGER.log("ChangeManager.Update " + (change.object as any)[MODEL_NAME]  + "[" + change.index+ "]");
    }

    public splice(change: IArrayWillSplice): void {
        // LOGGER.log("ChangeManager.Splice " + (change.object as any)[MODEL_NAME] + "[" + change.index + "]");
    }

    public setPart(propertyName: string | Symbol): void {
        // LOGGER.log("ChangeManager.SET PART in " + propertyName);
    }

    public setPrimitive(self: PiElement, propertyName: string | Symbol, value: string | boolean | number): void {
         if( !!this.primitive) {
             LOGGER.log("ChangeManager.SET PRIMITIVE VALUE for {" + self["$typename"] + "} [" + propertyName + "] := " + value);
             this.primitive(self, propertyName, value);
        }
    }
}
