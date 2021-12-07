import { action, runInAction } from "mobx";
import { PiLogger } from "./internal";
// the following import is needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.PiKey'
import { PiKey } from "./Keys";
import { Box, PiEditor } from "../editor";
import { PiContainerDescriptor, PiElement, PiExpression, isPiExpression } from "../language";

export type BooleanCallback = () => boolean;
export type DynamicBoolean = BooleanCallback | boolean;

export const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const NBSP: string = "".concat("\u00A0");

let LATEST_ID = 0;

const LOGGER = new PiLogger("PiUtils");

export class PiUtils {

    /**
     *
     */
    static ID() {
        LATEST_ID++;
        return "ID-" + LATEST_ID;
    }
    /** Initialize an object with a JSON object
     */
    static initializeObject<TTarget, TSource>(target: TTarget, source: TSource) {
        if (!(target && source)) {
            return;
        }
        Object.keys(source).forEach(key => {
            if (source.hasOwnProperty(key)) {
                (target as any)[key] = (source as any)[key];
            }
        });
    }

    static CHECK(b: boolean, msg?: string): void {
        if (!b) {
            throw new Error(msg ? "FAILED Check: " + msg : "check error");
        }
    }

    static setContainer(exp: PiElement, piContainer: PiContainerDescriptor | null, editor: PiEditor): void {
        runInAction(() => {
            if (!!piContainer) {
                if (piContainer.propertyIndex === undefined) {
                    piContainer.container[piContainer.propertyName] = exp;
                } else {
                    piContainer.container[piContainer.propertyName][piContainer.propertyIndex] = exp;
                }
            } else {
                editor.rootElement = exp;
            }
        });
    }

    static replaceExpression(oldExpression: PiExpression, newExpression: PiExpression, editor: PiEditor) {
        PiUtils.CHECK(isPiExpression(oldExpression), "replaceExpression: old element should be a PiExpression, but it isn't");
        PiUtils.CHECK(isPiExpression(newExpression), "replaceExpression: new element should be a PiExpression, but it isn't");
        runInAction( () => {
            PiUtils.setContainer(newExpression, oldExpression.piContainer(), editor);
        });
    }

    // TODO refactor this into an InternalBehavior class, like other behaviors.
    /**
     * Check whether `piKey` is a defined keyboard-shortcut for `box`.
     * If so execute the corresponding keyboard-shortcut action and return true.
     * Else return false.
     * @param piKey
     * @param box
     * @param editor
     */
    static async handleKeyboardShortcut(piKey: PiKey, box: Box, editor: PiEditor): Promise<boolean> {
        for (const act of editor.keyboardActions) {
            // LOGGER.log("handleKeyboardShortcut activeroles: " + act.activeInBoxRoles);
            if (act.trigger.meta === piKey.meta && act.trigger.keyCode === piKey.keyCode) {
                if (act.activeInBoxRoles.includes(box.role)) {
                    LOGGER.log("handleKeyboardShortcut: executing keyboard action");
                   await runInAction( async () => {
                        const selected = await act.action(box, piKey, editor);
                    if (selected) {
                        editor.selectElement(selected, act.boxRoleToSelect);
                    }
                    });
                    return true;
                } else {
                    LOGGER.log("handleKeyboardShortcut: Keyboard action does not include role " + box.role);
                }
            }
        }
        return false;
    }
}

export function isNullOrUndefined(obj: Object | null | undefined): obj is null | undefined {
    return obj === undefined || obj === null;
}
