import { IArrayWillChange, IArrayWillSplice } from "mobx";
import { MODEL_NAME } from "./MobxModelDecorators";
import { PiLogger } from "../../util";

const LOGGER: PiLogger = new PiLogger("ChangeManager");

export class ChangeManager {
    public static it = new ChangeManager();

    public update(change: IArrayWillChange): void {
        LOGGER.log("ChangeManager.Update " + (change.object as any)[MODEL_NAME]  + "[" + change.index+ "]");
    }

    public splice(change: IArrayWillSplice): void {
        LOGGER.log("ChangeManager.Splice " + (change.object as any)[MODEL_NAME] + "[" + change.index + "]");
    }

    public setPart(propertyName: string | Symbol): void {
        LOGGER.log("ChangeManager.SET PART in " + propertyName);
    }

    public setPrimitive(self: Object, propertyName: string | Symbol): void {
        LOGGER.log("ChangeManager.SET PRIMITIVE VALUE " + propertyName + " of class " + self["$typename"]);
    }
}
