import { runInAction } from "mobx";
import { isRegExp, isString, Box, PiEditor, InternalBehavior } from "../editor";
import { PiElement } from "../language/index";
import { Language } from "../storage/Language";
import { LEFT_MOST, PiLogger } from "./internal";

const LOGGER = new PiLogger("BehaviorUtils");

export enum PiCaretPosition {
    UNSPECIFIED,
    LEFT_MOST,
    RIGHT_MOST,
    INDEX
}

export class PiCaret {
    static RIGHT_MOST = new PiCaret(PiCaretPosition.RIGHT_MOST, 0);
    static LEFT_MOST = new PiCaret(PiCaretPosition.LEFT_MOST, 0);
    static UNSPECIFIED = new PiCaret(PiCaretPosition.UNSPECIFIED, 0);

    static IndexPosition(i: number): PiCaret {
        return new PiCaret(PiCaretPosition.INDEX, i);
    }

    position: PiCaretPosition;
    index: number;

    constructor(p: PiCaretPosition, i: number) {
        this.position = p;
        this.index = i;
    }
}

export enum BehaviorExecutionResult {
    NULL,
    EXECUTED,
    PARTIAL_MATCH,
    NO_MATCH
}

/**
 * Try to execute the alias `text`, and return true if this succeeds
 * Matching on full text only.
 * @param {Box} box
 * @param {string} text
 * @param {PiEditor} editor
 * @returns {boolean}
 */
export function executeBehavior(box: Box, text: string, label: string, editor: PiEditor): BehaviorExecutionResult {
    LOGGER.log("Enter executeBehavior text [" + text + "] label [" + label + "] box role [" + box.role + "]");
    let partialMatch: boolean = false;

    for (const behavior of editor.behaviors) {
        const trigger = behavior.trigger;
        if (behavior.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = label.match(trigger);
                LOGGER.log("executeBehavior: MATCH " + label + " against " + trigger +
                    "  results in " + (!!matchArray ? matchArray.length : "null"));
                let execresult: PiElement = null;
                if (matchArray !== null && label === matchArray[0]) {
                    runInAction( () => {
                        execresult = behavior.execute(box, label, editor);
                        // if( !!execresult){
                        //     editor.selectElement(execresult);
                        //     editor.selectFirstLeafChildBox();
                        // }
                    });
                    if(!!execresult) {
                        if (!!behavior.boxRoleToSelect) {
                            editor.selectBoxByRoleAndElementId(execresult.piId(), behavior.boxRoleToSelect, behavior.caretPosition);
                        } else {
                            editor.selectElement(execresult);
                            editor.selectFirstEditableChildBox();
                        }
                    }
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log("executeBehavior: MATCH FULL TEXT label [" + label + "] refShortcut [" + behavior.referenceShortcut + "]");
                    runInAction( () => {
                        console.log("============== START")
                        const execresult = behavior.execute(box, label, editor);
                        // If this is a referenceShortcut, fill in the selected reference, which is in the label
                        // TODO CHECK: The assumption is that 'newElement' has a property with the name and type
                        //  of the reference shortcut with the
                        if (!!label && !!behavior.referenceShortcut) {
                            execresult[behavior.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(label, behavior.referenceShortcut.metatype);
                        }
                        console.log("============== END")
                    });
                    // if( !!execresult){
                    //     await editor.selectElement(execresult, LEFT_MOST);
                    //     editor.selectFirstLeafChildBox();
                    // }
                    return BehaviorExecutionResult.EXECUTED;
                } else if (trigger.startsWith(label)) {
                    LOGGER.log("executeBehavior: MATCH PARTIAL TEXT");
                    partialMatch = true;
                }
            }
        }
    }
    LOGGER.log("executeBehavior: no alias match, ;partial is " + partialMatch);
    if (partialMatch) {
        return BehaviorExecutionResult.PARTIAL_MATCH;
    } else {
        return BehaviorExecutionResult.NO_MATCH;
    }
}

/**
 * We know the behavior to be executed, so just do it.
 * @param behavior
 * @param box
 * @param text
 * @param label
 * @param editor
 */
export function executeSingleBehavior(behavior: InternalBehavior, box: Box, text: string, label: string, editor: PiEditor): BehaviorExecutionResult {
    console.log("Enter @@@@@@@@@ executeSingleBehavior text [" + text + "] label [" + label + "] refshortcut [" + behavior.referenceShortcut + "]");
    let partialMatch: boolean = false;
    let execresult: PiElement;

    const trigger = behavior.trigger;
    runInAction( () => {
        console.log("========================== START");
        execresult = behavior.execute(box, label, editor);
        // If this is a referenceShortcut, fill in the selected reference, which is in the label
        if (!!label && !!behavior.referenceShortcut) {
            execresult[behavior.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(label, behavior.referenceShortcut.metatype);
        }
        console.log("===============================")
    });
    if( !!execresult){
        if (!!behavior.boxRoleToSelect) {
            editor.selectBoxByRoleAndElementId(execresult.piId(),behavior.boxRoleToSelect,behavior.caretPosition);
        }else {
            editor.selectElement(execresult);
            editor.selectFirstLeafChildBox();
            if (editor.selectedBox.role.includes(LEFT_MOST)){
                // Special expression prefix box, don't select it
                editor.selectNextLeaf()
            }
        }
    }
    // if( !!execresult){
    //     await editor.selectElement(execresult, LEFT_MOST);
    //     editor.selectFirstLeafChildBox();
    // }
    return BehaviorExecutionResult.EXECUTED;
}
