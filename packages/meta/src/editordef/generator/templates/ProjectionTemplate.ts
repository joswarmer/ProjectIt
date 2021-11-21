import {
    PiBinaryExpressionConcept, PiConcept,
    PiConceptProperty,
    PiExpressionConcept,
    PiPrimitiveProperty,
    PiProperty,
    PiLanguage, PiLimitedConcept, PiClassifier
} from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { Roles } from "../../../utils/Roles";
import {
    PiEditConcept,
    PiEditUnit,
    PiEditProjection,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditProjectionDirection,
    PiEditParsedProjectionIndent,
    PiEditSubProjection,
    PiEditInstanceProjection
} from "../../metalanguage";
import { PiPrimitiveType } from "../../../languagedef/metalanguage/PiLanguage";

export class ProjectionTemplate {

    generateProjectionDefault(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        const binaryConceptsWithDefaultProjection = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept))
            .filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });

        const nonBinaryConceptsWithDefaultProjection = language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept) ).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        if (nonBinaryConceptsWithDefaultProjection.length > 0) {
            // console.error("Projection generator: there are elements without projections "+ nonBinaryConceptsWithDefaultProjection.map(c => c.name));
        }

        const allClassifiers: PiClassifier[] = [];
        // allClassifiers.push(language.modelConcept);
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);

        const nonBinaryConceptsWithProjection = allClassifiers.filter(c => !(c instanceof PiBinaryExpressionConcept) ).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return !!editor && !!editor.projection;
        });

        const modelImports: string[] = allClassifiers.map(u => `${Names.classifier(u)}`)
            .concat(language.interfaces.map(c => `${Names.interface(c)}`));

        // TODO sort out unused imports
        return `
            import { observable, makeObservable } from "mobx";

            import * as ${Names.styles} from "${relativePath}${EDITORSTYLES}";
            // TODO import { ${Names.styles} } from "${relativePath}${EDITORSTYLES}";
            import {
                styleToCSS,
                BoxFactory,
                AliasBox,
                Box,
                GridBox,
                IndentBox,
                GridCell,
                GridUtil,
                HorizontalListBox,
                SelectOption,
                SvgBox,
                SelectBox,
                KeyPressAction,
                LabelBox,
                ${Names.PiElement},
                ${Names.PiProjection},
                OptionalBox,
                TextBox,
                VerticalListBox,
                VerticalPiElementListBox,
                PiUtils,
                createDefaultBinaryBox,
                createDefaultExpressionBox,
                isPiBinaryExpression,
                ${Names.PiBinaryExpression},
                BehaviorExecutionResult
            } from "${PROJECTITCORE}";
            
            import { ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${modelImports.map(c => `${c}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${Names.selectionHelpers(language)} } from "./${Names.selectionHelpers(language)}";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

             /**
             * Class ${Names.projectionDefault(language)} implements the default projections for elements of
             * language ${language.name}.
             * These are merged with the custom build additions and definition-based editor parts 
             * in a three-way manner. For each modelelement, 
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.  
             */  
            export class ${Names.projectionDefault(language)} implements ${Names.PiProjection} {
                private helpers: ${Names.selectionHelpers(language)} = new ${Names.selectionHelpers(language)};
                rootProjection: ${Names.PiProjection};
                showBrackets: boolean = false;
                name: string = "${editorDef.name}";
                
                constructor(name?: string) {
                    if (!!name) {
                        this.name = name;
                    }
                    makeObservable(this, {
                        showBrackets: observable
                    });
                }
                
                getBox(exp: ${Names.PiElement}): Box {
                    if (exp === null ) {
                        return null;
                    }

                    switch( exp.piLanguageConcept() ) { 
                        ${allClassifiers.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.projectionFunction(c)} (exp as ${Names.classifier(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }

                ${binaryConceptsWithDefaultProjection.map(c => `
                private ${Names.projectionFunction(c)} (element: ${Names.concept(c)}) {
                     return this.createBinaryBox(this, element, "${editorDef.findConceptEditor(c).symbol}");
                }                
                `).join("\n")}    
                
                ${nonBinaryConceptsWithProjection.map(c => this.generateUserProjection(language, c, editorDef.findConceptEditor(c))).join("\n")}
                
                /**
                 *  Create a standard binary box to ensure binary expressions can be edited easily
                 */
                private createBinaryBox(projection: ${Names.projectionDefault(language)}, exp: PiBinaryExpression, symbol: string): Box {
                    const binBox = createDefaultBinaryBox(exp, symbol, ${Names.environment(language)}.getInstance().editor);
                    if (
                        this.showBrackets &&
                        !!exp.piContainer().container &&
                        isPiBinaryExpression(exp.piContainer().container)
                    ) {
                        return BoxFactory.horizontalList(exp, "brackets", [
                            BoxFactory.label(exp, "open-bracket", "("),
                            binBox,
                            BoxFactory.label(exp, "close-bracket", ")")
                        ]);
                    } else {
                        return binBox;
                    }
                }
                
            }
        `;
    }

    private generateUserProjection(language: PiLanguage, concept: PiClassifier, editor: PiEditConcept) {
        // TODO for now: do not do anything for a limited concept
        if (editor.concept instanceof PiLimitedConcept) {
            return ``;
        }

        let result: string = "";
        const elementVarName = Roles.elementVarName(concept);
        const projection: PiEditProjection = editor.projection;
        const multiLine = projection.lines.length > 1;
        if (multiLine) {
            result += `BoxFactory.verticalList(${elementVarName}, "${concept.name}-overall", [
            `;
        }

        projection.lines.forEach( (line, index) => {
            if (line.indent > 0) {
                result += `BoxFactory.indent(${elementVarName}, "${concept.name}-indent-line-${index}", ${line.indent}, `;
            }
            if (line.items.length > 1) {
                result += `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${index}", [ `;
            }
            // Now all projection items in the line
            line.items.forEach((item, itemIndex) => {
                result += this.itemProjection(item, elementVarName, index, itemIndex, concept, language);
                if (! (item instanceof PiEditParsedProjectionIndent) && itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) {
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                result += ` ], { selectable: true } ) `;
            }
            if (line.indent > 0) {
                // end of line, finish indent when applicable
                result += ` )`;
            }
            if (index !== projection.lines.length - 1) {
              result += ",";
            }
        });
        if (multiLine) {
            result += ` 
                ])
            `;
        }
        if (result === "") { result = "null"; }
        if (concept instanceof PiExpressionConcept) {
            return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.concept(concept)}) : Box {
                    return createDefaultExpressionBox( ${elementVarName}, "default-expression-box", [
                            ${result}
                        ],
                        { selectable: false }
                    );
                }`;
        } else {
            if (result[0] === "\n") {
                // TODO find out where this newline is added and make sure this is not done
                // this error occurred in openhab project for concept ItemModel (!!only for this concept)
                // for now:
                // console.log("FOUND NEWLINE");
                result = result.substr(1);
            }
            return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.classifier(concept)}) : Box {
                    return ${result};
                }`;
        }
    }

    private itemProjection(item: PiEditParsedProjectionIndent | PiEditProjectionText | PiEditPropertyProjection | PiEditSubProjection | PiEditInstanceProjection,
                           elementVarName: string,
                           index: number,
                           itemIndex: number,
                           concept: PiClassifier,
                           language: PiLanguage) {
        let result: string = "";
        if (item instanceof PiEditProjectionText) {
            result += ` BoxFactory.label(${elementVarName}, "${elementVarName}-label-line-${index}-item-${itemIndex}", "${item.text}", {
                            style: styleToCSS(${Names.styles}.${item.style}),
                            selectable: false
                        }) `;
        } else if (item instanceof PiEditPropertyProjection) {
            result += this.propertyProjection(item, elementVarName, concept, language);
        } else if (item instanceof PiEditSubProjection) {
            result += this.optionalProjection(item, elementVarName, index, itemIndex, concept, language);
        }
        return result;
    }

    private optionalProjection(item: PiEditSubProjection, elementVarName: string, index: number, itemIndex: number, concept: PiClassifier,
                               language: PiLanguage): string {
        let result = "";
        item.items.forEach((subitem, subitemIndex) => {
            result += this.itemProjection(subitem, elementVarName, index, subitemIndex, concept, language);
            // Add a comma if there was a projection and its in the middel of the list
            if (! (subitem instanceof PiEditParsedProjectionIndent) && subitemIndex < item.items.length - 1) {
                result += ", ";
            }
        });

        // If there are more items, surround with horizontal list
        if (item.items.length > 1) {
            result = `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${index}", [${result}])`;
        }

        const propertyProjection: PiEditPropertyProjection = item.optionalProperty();
        const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.propertyName());
        return `BoxFactory.optional(${elementVarName}, "optional-${optionalPropertyName}", () => (!!${elementVarName}.${optionalPropertyName}),
            ${ result},
            false, "<+>"
        ),`;
    }

    /**
     * Projection template for a property.
     *
     * @param item      The property projection
     * @param elementVarName
     * @param concept
     * @param language
     * @private
     */
    private propertyProjection(item: PiEditPropertyProjection, elementVarName: string, concept: PiClassifier, language: PiLanguage) {
        let result: string = "";
        const appliedFeature: PiProperty = item.expression.appliedfeature.referredElement.referred;
        if (appliedFeature instanceof PiPrimitiveProperty) {
            result += this.primitivePropertyProjection(appliedFeature, elementVarName);
        } else if (appliedFeature instanceof PiConceptProperty) {
            if (appliedFeature.isPart) {
                if (appliedFeature.isList) {
                    const direction = (!!item.listJoin ? item.listJoin.direction.toString() : PiEditProjectionDirection.Horizontal.toString());
                    result += this.conceptPartListProjection(item, direction, concept, appliedFeature, elementVarName);

                } else {
                    result += `((!!${elementVarName}.${appliedFeature.name}) ?
                                                this.rootProjection.getBox(${elementVarName}.${appliedFeature.name}) : 
                                                BoxFactory.alias(${elementVarName}, "${Roles.newPart(appliedFeature)}", "[add]", { propertyName: "${appliedFeature.name}" } ))`;
                }
            } else { // reference
                if (appliedFeature.isList) {
                    const direction = (!!item.listJoin ? item.listJoin.direction.toString() : PiEditProjectionDirection.Horizontal.toString());
                    result += this.conceptReferenceListProjection(direction, appliedFeature, elementVarName);
                } else {
                    result += this.conceptReferenceProjection(language, appliedFeature, elementVarName);
                }
            }
        } else {
            result += `/* ERROR unknown property box here for ${appliedFeature.name} */ `;
        }
        return result;
    }

    /**
     * generate the part list
     *
     * @param direction         Horizontal or Vertical.
     * @param concept
     * @param propertyConcept   The property for which the projection is generated.
     * @param element           The name of the element parameter of the getBox projection method.
     */
    conceptPartListProjection(item: PiEditPropertyProjection, direction: string, concept: PiClassifier, propertyConcept: PiConceptProperty, element: string) {
        return `
            BoxFactory.${direction.toLowerCase()}List(${element}, "${Roles.property(propertyConcept)}-list", 
                ${element}.${propertyConcept.name}.map(feature => {
                    const roleName: string =  "${Roles.property(propertyConcept)}-" + feature.piId() + "-separator";
                    return BoxFactory.horizontalList(${element}, roleName, [this.rootProjection.getBox(feature), BoxFactory.label(${element}, roleName + "label", "${item.listJoin.joinText}")]) as Box;
                }).concat(
                    BoxFactory.alias(${element}, "${Roles.newConceptPart(concept, propertyConcept)}", "<+ ${propertyConcept.name}>" , { //  add ${propertyConcept.name}
                        style: styleToCSS(${Names.styles}.placeholdertext),
                        propertyName: "${propertyConcept.name}"
                    })
                )
            )`;
    }

    conceptReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type.referred);
        return ` this.helpers.getReferenceBox(${element}, "${Roles.property(appliedFeature)}", "<select ${appliedFeature.name}>", "${featureType}",
                    () => {
                        if (!!${element}.${appliedFeature.name}) {
                            return { id: ${element}.${appliedFeature.name}.name, label: ${element}.${appliedFeature.name}.name };
                        } else {
                            return null;
                        }
                    },
                    async (option: SelectOption): Promise<BehaviorExecutionResult> => {
                        if (!!option) {
                            ${element}.${appliedFeature.name} = PiElementReference.create<${featureType}>(${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                ${element},
                                option.label,
                                "${featureType}"
                            ) as ${featureType}, "${featureType}");
                        } else {
                            ${element}.${appliedFeature.name} = null;
                        }
                        return BehaviorExecutionResult.EXECUTED;
                    }
                )
            `;
    }

    conceptReferenceProjectionInList(appliedFeature: PiConceptProperty, element: string) {
        const featureType = appliedFeature.type.name;
        return ` this.helpers.getReferenceBox(${element}, "${Roles.property(appliedFeature)}-" + index, "< select ${appliedFeature.name}>", "${featureType}",
                    () => {
                        if (!!${element}.${appliedFeature.name}) {
                            return { id: ent.name, label: ent.name };
                        } else {
                            return null;
                        }
                    },
                    async (option: SelectOption): Promise<BehaviorExecutionResult> => {
                        ent.name = option.label;
                        return BehaviorExecutionResult.EXECUTED;
                    }
                )
            `;
    }

    conceptReferenceListProjection(direction: string, reference: PiConceptProperty, element: string) {
        return `BoxFactory.${direction.toLowerCase()}List(
                    ${element},
                    "${Roles.property(reference)}",
                    ${element}.${reference.name}.map((ent, index) => {
                        return ${this.conceptReferenceProjectionInList(reference, element) }
                    }).concat(
                        BoxFactory.alias(${element}, "${Roles.newConceptReferencePart(reference)}", "<+ ${reference.name}>" , { //  add ${reference.name}
                            style: styleToCSS(${Names.styles}.placeholdertext),
                            propertyName: "${reference.name}"
                        })
                    )
                    , //  this one?
                    // TODO Change into an IndentComponent
                    // {
                    //     style: styleToCSS(${Names.styles}.indent)
                    // }
                )
            `;
    }

    primitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        if (property.isList) {
            // TODO remove this hack
            return this.listPrimitivePropertyProjection(property, element);
        } else {
            return this.singlePrimitivePropertyProjection(property, element);
        }
    }

    singlePrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        const listAddition: string = `${property.isList ? `[index]` : ``}`;
        switch (property.type.referred) {
            case PiPrimitiveType.string:
            case PiPrimitiveType.identifier:
                return `BoxFactory.text(${element}, "${Roles.property(property)}", () => ${element}.${property.name}${listAddition}, (c: string) => (${element}.${property.name}${listAddition} = c as string),
                {
                    placeHolder: "text",
                    style: styleToCSS(${Names.styles}.placeholdertext)
                })`;
            case PiPrimitiveType.number:
                return `BoxFactory.text(${element}, "${Roles.property(property)}", () => "" + ${element}.${property.name}${listAddition}, (c: string) => (${element}.${property.name}${listAddition} = Number.parseInt(c)) ,
                {
                    placeHolder: "text",
                    style: styleToCSS(${Names.styles}.placeholdertext)
                })`;
            case PiPrimitiveType.boolean:
                return `BoxFactory.text(${element}, "${Roles.property(property)}", () => "" + ${element}.${property.name}${listAddition}, (c: string) => (${element}.${property.name}${listAddition} = (c === "true" ? true : false)),
                {
                    placeHolder: "text",
                    style: styleToCSS(${Names.styles}.placeholdertext)
                })`;
            default:
                return `BoxFactory.text(${element}, "${Roles.property(property)}", () => ${element}.${property.name}${listAddition}, (c: string) => (${element}.${property.name}${listAddition} = c as string),
                {
                    placeHolder: "text",
                    style: styleToCSS(${Names.styles}.placeholdertext)
                })`;
        }
    }

    private listPrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        return `BoxFactory.horizontalList(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element)}
                            ) as Box[]).concat( [
                                // TODO  Create Action for the role to actually add an element.
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }
}
