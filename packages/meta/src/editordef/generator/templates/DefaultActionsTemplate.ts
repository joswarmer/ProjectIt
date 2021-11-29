import { flatten } from "lodash";
import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import {
    PiLanguage,
    PiBinaryExpressionConcept,
    PiConcept,
    PiClassifier,
    PiLangSelfExp
} from "../../../languagedef/metalanguage";
import { Roles, LangUtil } from "../../../utils";
import { PiEditConcept, PiEditPropertyProjection, PiEditSubProjection, PiEditUnit } from "../../metalanguage";
import { PiUnitDescription } from "../../../languagedef/metalanguage/PiLanguage";

export class DefaultActionsTemplate {

    // TODO generate the correct class comment for DefaultActions
    generate(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        const modelImports: string[] = language.conceptsAndInterfaces().map(c => `${Names.classifier(c)}`)
            .concat(language.units.map(u => `${Names.classifier(u)}`));
        return `
            import * as Keys from "${PROJECTITCORE}";
            import {
                AFTER_BINARY_OPERATOR,
                BEFORE_BINARY_OPERATOR,
                Box,
                KeyboardShortcutBehavior,
                MetaKey,
                PiActions,
                PiBinaryExpressionCreator,
                PiCaret,
                PiCustomBehavior,
                PiEditor,
                PiElement,
                PiExpressionCreator,
                PiBinaryExpression,
                PiKey,
                PiLogger,
                PiTriggerType,
                PiUtils,
                AliasBox,
                OptionalBox,
                LEFT_MOST,
                RIGHT_MOST
            } from "${PROJECTITCORE}";
            
            import { PiElementReference, ${modelImports.join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";

             /**
             * This module implements all default actions for the editor.
             * These default actions are merged with custom actions.
             */ 
            export const EXPRESSION_CREATORS: PiExpressionCreator[] = [];

            export const BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
                ${language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept) && !c.isAbstract).map(c =>
            `{
                    trigger: "${editorDef.findConceptEditor(c).symbol}",
                    activeInBoxRoles: [
                        LEFT_MOST,
                        RIGHT_MOST,
                        BEFORE_BINARY_OPERATOR,
                        AFTER_BINARY_OPERATOR
                    ],
                    expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
                        const parent = box.element;
                        const newExpression = new ${Names.concept(c)}();
                        parent[(box as AliasBox).propertyName] = newExpression;
                        return newExpression;
                    }
            }`
        )}
            ];
            
            export const CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
                ${this.customActionsForOptional(language, editorDef)}
                ${this.customActionForParts(language, editorDef)}
                ${this.customActionForReferences(language, editorDef)}
            ];
            
            export const KEYBOARD: KeyboardShortcutBehavior[] = [
                ${flatten(language.concepts.map(c => c.allParts())).filter(p => p.isList).map(part => {
                    const parentConcept = part.owningConcept;
                    const partConcept = part.type.referred;
                    // TODO add keyboard shortcut
                    return `
                    // {
                    //     activeInBoxRoles: ["new-${part.name}"],
                    //     trigger: { meta: MetaKey.None, keyCode: Keys.ENTER},
                    //     action: (box: Box, trigger: PiTriggerType, ed: PiEditor): Promise< PiElement> => {
                    //         var parent: ${Names.classifier(parentConcept)} = box.element as ${Names.classifier(parentConcept)};
                    //         const new${part.name}: ${Names.classifier(partConcept)} = new ${Names.classifier(partConcept)}();
                    //         parent.${part.name}.push(new${part.name});
                    //         return Promise.resolve(new${part.name});
                    //     },
                    //     boxRoleToSelect: "${part.name}-name"
                    // }`;
                 }).join(",")}
            ];
            `;
        }

    customActionsForOptional(language: PiLanguage, editorDef: PiEditUnit): string {
        let result: string = "";
        editorDef.conceptEditors.forEach( ce => {
            if (!!ce.projection) {
                ce.projection.lines.forEach(line => {
                    line.items.forEach(item => {
                        if (item instanceof PiEditSubProjection) {
                            if (item.optional) {
                                const firstLiteral: string = item.firstLiteral();
                                const propertyProjection: PiEditPropertyProjection = item.optionalProperty();
                                const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.propertyName());
                                result += `
                                    {
                                        trigger: "${firstLiteral === "" ? optionalPropertyName : firstLiteral}",
                                        activeInBoxRoles: ["optional-${optionalPropertyName}"],
                                        action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                            ((box.parent) as OptionalBox).mustShow = true;
                                            return null;
                                        },
                                        boxRoleToSelect: "${ce.concept.name}-${optionalPropertyName}"
                                    }`;
                                result += ","
                            }
                        }
                    });
                });
            }
        });
        return result;
    }

    customActionForReferences(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        const allClassifiers: PiClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        allClassifiers.forEach(concept => concept.allReferences().filter(ref => ref.isList).forEach(reference => {
                const referredConcept = reference.type.referred;
                const conceptEditor = editorDef.findConceptEditor(referredConcept);
                const trigger = (!!conceptEditor && !!conceptEditor.trigger) ? conceptEditor.trigger : reference.name;
                result += `
                {   // Action to insert new reference to a concept
                    activeInBoxRoles: ["${Roles.newConceptReferencePart(reference)}"],
                    trigger: "${trigger}",
                    action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                        const parent: ${Names.classifier(concept)} = box.element as ${Names.classifier(concept)};
                        const newBase: PiElementReference<${Names.classifier(referredConcept)}> = PiElementReference.create<${Names.classifier(referredConcept)}>("", null);
                        parent.${reference.name}.push(newBase);
                        return newBase.referred;
                    },
                    boxRoleToSelect: "${this.cursorLocation(editorDef, concept)}"  /* CURSOR 1 */
                }
                `;
                result += ",";
            })
        );
        return result;
    }

    customActionForParts(language: PiLanguage, editorDef: PiEditUnit): string {
        let result = "";
        const behaviorMap = new ActionMap();
        const behaviorDescriptor: BehaviorDescription[] = [];
        // All listy properties
        // language.concepts.forEach(concept => concept.allParts().filter(ref => ref.isList).forEach(part => {
        //     const childConcept = part.type.referred;
        //     // const trigger = !!conceptEditor.trigger ? conceptEditor.trigger : part.unitName
        //     result += `${LangUtil.subConceptsIncludingSelf(childConcept).filter(cls => !cls.isAbstract).map(subClass => `
        //             {
        //                 // ProjectIt Generator: customActionForPart list
        //                 activeInBoxRoles: ["${Roles.newConceptPart(concept, part)}"],
        //                 trigger: "${editorDef.findConceptEditor(subClass).trigger}",  // for Concept part
        //                 action: (box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
        //                     const parent = box.element;
        //                     const newElement = new ${Names.concept(subClass)}();
        //                     parent[(box as AliasBox).propertyName].push(newElement);
        //                     return newElement;
        //                 },
        //                 boxRoleToSelect: "${this.cursorLocation(editorDef, subClass)}" /* CURSOR 2 */
        //             },`).join("\n")}
        //             `;
        //     })
        // );
        // All NON listy properties

        // TODO is this needed, look like this is adding an action on a model that is never shown
        language.modelConcept.allParts().forEach(part => { // all parts are model units
            const partType = part.type.referred;
            if (partType instanceof PiUnitDescription) {
                const conceptEditor: PiEditConcept = editorDef.findConceptEditor(partType);
                behaviorMap.createOrAdd(partType,
                    {
                        activeInBoxRoles: [`${Roles.newConceptPart(language.modelConcept, part)}`],
                        trigger: `${conceptEditor.trigger}`,  // for single Concept part
                        action: `(box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                                const parent = box.element;
                                                const newElement = new ${Names.classifier(partType)}();
                                                const property = parent[(box as AliasBox).propertyName];
                                                if (Array.isArray(property)) {
                                                    parent[(box as AliasBox).propertyName].push(newElement);
                                                } else {
                                                    parent[(box as AliasBox).propertyName] = newElement;
                                                } 
                                                return newElement;
                                          }`,
                        referenceShortcut: (!!conceptEditor.referenceShortcut ?
                            `{
                                                              propertyname: "${((conceptEditor.referenceShortcut) as PiLangSelfExp).appliedfeature.sourceName}",
                                                              metatype: "${((conceptEditor.referenceShortcut) as PiLangSelfExp).appliedfeature.referredElement.referred.type.name}"
                                                         }` : undefined),
                        undo: (!!conceptEditor.referenceShortcut ?
                            `(box: Box, editor: PiEditor): void => {
                                                        const parent = box.element;
                                                        parent[(box as AliasBox).propertyName] = null;
                                                     }` : undefined),
                        boxRoleToSelect: `${this.cursorLocation(editorDef, partType)}` /* CURSOR 4  ${subClass.name} */
                    }
                );
            }
        });

        // we do need actions for all units and concepts
        const allClassifiers: PiClassifier[] = [];
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);
        allClassifiers.forEach(concept => concept.allParts().forEach(part => {
            // language.concepts.forEach(concept => concept.allParts().filter(ref => !ref.isList).forEach(part => {
            const partType = part.type.referred;
            // FIXME HERE SHOULD BE A CLASSIFIER, THEN INTERFACE SUBCONCEPTS ARE SHOWN IN EDITOR
            if (partType instanceof PiClassifier) { // exclude all primitive types
                LangUtil.subConceptsIncludingSelf(partType).filter(cls => !cls.isAbstract).forEach(subClass => {
                    const conceptEditor: PiEditConcept = editorDef.findConceptEditor(subClass);
                    behaviorMap.createOrAdd(subClass,
                        {
                                activeInBoxRoles: [`${Roles.newConceptPart(concept, part)}`],
                                trigger: `${conceptEditor.trigger}`,  // for single Concept part
                                action: `(box: Box, trigger: PiTriggerType, ed: PiEditor): PiElement | null => {
                                                const parent = box.element;
                                                const newElement = new ${Names.concept(subClass)}();
                                                const property = parent[(box as AliasBox).propertyName];
                                                if (Array.isArray(property)) {
                                                    parent[(box as AliasBox).propertyName].push(newElement);
                                                } else {
                                                    parent[(box as AliasBox).propertyName] = newElement;
                                                } 
                                                return newElement;
                                          }`,
                                referenceShortcut: (!!conceptEditor.referenceShortcut ?
                                                        `{
                                                              propertyname: "${((conceptEditor.referenceShortcut) as PiLangSelfExp).appliedfeature.sourceName}",
                                                              metatype: "${Names.classifier(((conceptEditor.referenceShortcut) as PiLangSelfExp).appliedfeature.referredElement.referred.type.referred)}"
                                                         }` : undefined),
                                undo: (!!conceptEditor.referenceShortcut ?
                                                    `(box: Box, editor: PiEditor): void => {
                                                        const parent = box.element;
                                                        parent[(box as AliasBox).propertyName] = null;
                                                     }` : undefined),
                                boxRoleToSelect: `${this.cursorLocation(editorDef, subClass)}` /* CURSOR 4  ${subClass.name} */
                            }
                    );
                });
            }
        }));
        for (const elem of behaviorMap.map.values()) {
            // console.log("FOUND "+ elem.trigger + " roles: " + elem.activeInBoxRoles.length + " ==> " + elem.activeInBoxRoles);
            result += `
                    {
                        // ProjectIt Generator: custom Action for creating a PiElement
                        activeInBoxRoles: [${elem.activeInBoxRoles.map(role => `"${role}"`).join(",")}],
                        trigger: "${elem.trigger}",  // for single Concept part
                        action: ${elem.action},
                        ${!!elem.referenceShortcut  ? `referenceShortcut: ${elem.referenceShortcut},` : ``}
                        ${!!elem.undo               ? `undo: ${elem.undo},`                           : ``}
                        boxRoleToSelect: "${elem.boxRoleToSelect}" /* CURSOR 4 */
                    },
                    `;
        }

        return result;
    }

    cursorLocation(editorDef: PiEditUnit, c: PiClassifier) {
        const projection = editorDef.findConceptEditor(c).projection;
        if (!!projection) {
            if (c.name === "DemoEntity") {
                // console.log("DemoEntity cursorLocation: " + projection.cursorLocation());
                // console.log(projection.toString());
            }
            return projection.cursorLocation();
        } else {
            if (c instanceof PiBinaryExpressionConcept) {
                return Names.PI_BINARY_EXPRESSION_LEFT;
            }
        }
        return "===== " + c.name + " =====";
    }
}

class BehaviorDescription {
    activeInBoxRoles: string[];
    trigger: string;
    action: string;
    referenceShortcut?: string;
    undo?: string;
    boxRoleToSelect: string;
}

/**
 * Keeps a map of all actions, ensuring that identical actions with different triggers are joined.
 */
class ActionMap {
    map: Map<string, BehaviorDescription> = new Map<string, BehaviorDescription>();

    createOrAdd(classifier: PiClassifier, bd: BehaviorDescription): void {
        const found: BehaviorDescription = this.map.get(classifier.name);
        if (!!found) {
            found.activeInBoxRoles = found.activeInBoxRoles.concat(...bd.activeInBoxRoles);
            // found.activeInBoxRoles.push(...bd.activeInBoxRoles);
        } else {
            this.map.set(classifier.name, bd);
        }
    }
}
