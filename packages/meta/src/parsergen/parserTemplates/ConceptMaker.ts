import {
    ListJoinType, PiEditClassifierProjection,
    PiEditProjection, PiEditProjectionGroup,
    PiEditProjectionItem,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection, PiEditSuperProjection,
    PiOptionalPropertyProjection
} from "../../editordef/metalanguage";
import { PiBinaryExpressionConcept, PiClassifier, PiLimitedConcept, PiPrimitiveProperty, PiPrimitiveType, PiProperty } from "../../languagedef/metalanguage";
import { ParserGenUtil } from "./ParserGenUtil";
import {
    GrammarRule,
    ConceptRule,
    RightHandSideEntry,
    RHSText,
    RHSPropEntry,
    RHSOptionalGroup,
    RHSBooleanWithSingleKeyWord,
    RHSPrimEntry,
    RHSPrimOptionalEntry,
    RHSPrimListEntry,
    RHSPrimListEntryWithSeparator,
    RHSPartEntry,
    RHSPartOptionalEntry,
    RHSPartListEntry,
    RHSPartListEntryWithSeparator,
    RHSRefEntry,
    RHSRefOptionalEntry,
    RHSRefListEntry,
    RHSRefListWithSeparator,
    RHSLimitedRefEntry,
    RHSLimitedRefOptionalEntry,
    RHSLimitedRefListEntry,
    RHSLimitedRefListWithSeparator,
    RHSListGroup,
    RHSPrimListGroup, RHSListGroupWithInitiator, RHSPrimListGroupWithInitiator, RHSBooleanWithDoubleKeyWord
} from "./grammarModel";
import { LOG2USER } from "../../utils/UserLogger";

export class ConceptMaker {
    imports: PiClassifier[] = [];
    private currentProjectionGroup: PiEditProjectionGroup = null;
    // namedProjections is the list of projections with a different name than the current projection group
    // this list is filled during the build of the template and should alwyas be the last to added
    private namedProjections: PiEditProjection[] = [];

    generateClassifiers(projectionGroup: PiEditProjectionGroup, conceptsUsed: PiClassifier[]): GrammarRule[] {
        this.currentProjectionGroup = projectionGroup;
        let rules: GrammarRule[] = [];
        for (const piConcept of conceptsUsed) {
            // find editDef for this concept
            let projection: PiEditProjection = ParserGenUtil.findNonTableProjection(projectionGroup, piConcept);
            // generate a grammar rule entry
            if (projection instanceof PiEditProjection) {
                rules.push(this.generateProjection(piConcept, projection, false));
            }
        }
        for (const projection of this.namedProjections) {
            // generate a grammar rule entry
            rules.push(this.generateProjection(projection.classifier.referred, projection, true));
        }
        return rules;
    }

    private generateProjection(piConcept: PiClassifier, projection: PiEditProjection, addName: boolean) {
        let rule: ConceptRule;
        if (addName) {
            rule = new ConceptRule(piConcept, projection.name);
        } else {
            rule = new ConceptRule(piConcept);
        }
        for (const l of projection.lines) {
            rule.ruleParts.push(...this.doLine(l, false));
        }
        this.checkRule(rule);
        return rule;
    }

    private doLine(line: PiEditProjectionLine, inOptionalGroup: boolean): RightHandSideEntry[] {
        const subs = this.addItems(line.items, inOptionalGroup);
        if (!!subs && !!subs[subs.length - 1] ) {
            // to manage the layout of the grammar, we set 'addNewLineToGrammar' of the last entry in the line
            subs[subs.length - 1].addNewLineToGrammar = true;
        }
        return subs;
    }

    private addItems(list: PiEditProjectionItem[], inOptionalGroup: boolean): RightHandSideEntry[] {
        let parts: RightHandSideEntry[] = [];
        if (!!list && list.length > 0) {
            list.forEach((item) => {
                if (item instanceof PiOptionalPropertyProjection) {
                    let subs: RightHandSideEntry[] = [];
                    item.lines.forEach(line => {
                        subs.push(...this.addItems(line.items, true));
                    })
                    parts.push(new RHSOptionalGroup(item.property.referred, subs));
                } else if (item instanceof PiEditPropertyProjection) {
                    const propPart = this.makePropPart(item, inOptionalGroup);
                    if (!!propPart) parts.push(propPart);
                } else if (item instanceof PiEditProjectionText) {
                    parts.push(...this.makeTextPart(item));
                } else if (item instanceof PiEditSuperProjection) {
                    parts.push(...this.makeSuperParts(item, inOptionalGroup))
                }
            });
        }
        return parts;
    }

    private makePropPart(item: PiEditPropertyProjection, inOptionalGroup: boolean): RHSPropEntry {
        const prop: PiProperty = item.property.referred;
        let result: RHSPropEntry = null;
        if (!!prop) {
            const propType: PiClassifier = prop.type.referred; // more efficient to determine referred only once
            this.imports.push(propType);
            // take care of named projections
            let myProjName: string = null;
            if (!!item.projectionName && item.projectionName.length > 0 && item.projectionName !== this.currentProjectionGroup.name) {
                ParserGenUtil.addIfNotPresent(this.namedProjections, ParserGenUtil.findNonTableProjection(this.currentProjectionGroup, propType, item.projectionName));
                myProjName = item.projectionName;
            }
            //
            if (prop instanceof PiPrimitiveProperty) {
                result = this.makePrimitiveProperty(prop, propType, item, inOptionalGroup);
            } else if (propType instanceof PiLimitedConcept) {
                result = this.makeLimitedProp(prop, item, inOptionalGroup);
            } else if (propType instanceof PiBinaryExpressionConcept) {
                console.log("asking for a binary: " + propType.name);
                // TODO
            } else {
                if (!prop.isList) {
                    result = this.makeSingleProperty(prop, myProjName, inOptionalGroup);
                } else {
                    result = this.makeListProperty(prop, item);
                }
            }
        }
        return result;
    }

    private makeListProperty(prop: PiProperty, item: PiEditPropertyProjection): RHSPropEntry {
        // TODO adjust this when the default for joinType is properly set in the .edit parser
        let result: RHSPropEntry;
        if (prop.isPart) {
            // (list, part, optionality not relevant)
            if (!!item.listInfo && item.listInfo.isTable) {
                // TODO adjust for tables
            } else {
                let joinText = this.makeListJoinText(item.listInfo?.joinText);
                if (joinText.length == 0 || item.listInfo?.joinType === ListJoinType.NONE) {
                    result = new RHSPartListEntry(prop); // propTypeName*
                } else if (item.listInfo?.joinType === ListJoinType.Separator) {
                    result = new RHSPartListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listInfo?.joinType === ListJoinType.Initiator) {
                    const sub1 = new RHSPartEntry(prop);
                    result = new RHSListGroupWithInitiator(prop, sub1, joinText); // `("joinText" propTypeName)*`
                } else if (item.listInfo?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSPartEntry(prop);
                    result = new RHSListGroup(prop, sub1, joinText); // `(${propTypeName} '${joinText}' )* /* option C */`
                }
            }
        } else if (!prop.isPart) {
            // (list, reference, optionality not relevant)
            if (!!item.listInfo && item.listInfo.isTable) {
                // TODO adjust for tables
            } else {
                let joinText = this.makeListJoinText(item.listInfo?.joinText);
                if (joinText.length == 0 || item.listInfo?.joinType === ListJoinType.NONE) {
                    result = new RHSRefListEntry(prop); // propTypeName*
                } else if (item.listInfo?.joinType === ListJoinType.Separator) {
                    result = new RHSRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listInfo?.joinType === ListJoinType.Initiator) {
                    const sub1 = new RHSRefEntry(prop);
                    result = new RHSListGroupWithInitiator(prop, sub1, joinText); // `("joinText" propTypeName)*`
                } else if (item.listInfo?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSRefEntry(prop);
                    result = new RHSListGroup(prop, sub1, joinText); // `(propTypeName "joinText")*`
                }
            }
        }
        return result;
    }

    private makeSingleProperty(prop: PiProperty, myProjName: string, inOptionalGroup: boolean): RHSPropEntry {
        let result: RHSPropEntry;
        if (prop.isPart && (!prop.isOptional || inOptionalGroup)) {
            result = new RHSPartEntry(prop, myProjName); //`${propTypeName}`;
        } else if (prop.isPart && prop.isOptional && !inOptionalGroup) {
            result = new RHSPartOptionalEntry(prop, myProjName); //`${propTypeName} `;
        } else if (!prop.isPart && (!prop.isOptional || inOptionalGroup)) {
            result = new RHSRefEntry(prop); //`${propTypeName} `;
        } else if (!prop.isPart && prop.isOptional && !inOptionalGroup) {
            result = new RHSRefOptionalEntry(prop); //`${propTypeName} `;
        }
        return result;
    }

    private makeTextPart(item: PiEditProjectionText): RHSText[] {
        let result: RHSText[] = [];
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) {
            // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" ");
            splitted.forEach((str) => {
                if (str.length > 0) {
                    result.push(new RHSText(`\'${this.addExtraEscape(str)}\' `));
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                result.push(new RHSText(`\'${this.addExtraEscape(trimmed)}\' `));
            }
        }
        return result;
    }

    private makePrimitiveProperty(prop: PiPrimitiveProperty, propType: PiClassifier, item: PiEditPropertyProjection, inOptionalGroup: boolean): RHSPropEntry {
        if (propType === PiPrimitiveType.boolean && !!item.boolInfo) {
            // TODO list???
            if (!item.boolInfo.falseKeyword) {
                return new RHSBooleanWithSingleKeyWord(prop, item.boolInfo.trueKeyword);
            } else {
                return new RHSBooleanWithDoubleKeyWord(prop, item.boolInfo.trueKeyword, item.boolInfo.falseKeyword);
            }
        } else if (!prop.isList) {
            if (!prop.isOptional || inOptionalGroup) {
                return new RHSPrimEntry(prop);
            } else {
                return new RHSPrimOptionalEntry(prop);
            }
        } else {
            if (!!item.listInfo && item.listInfo.isTable) {
                // TODO adjust for tables
            } else {
                let joinText = this.makeListJoinText(item.listInfo?.joinText);
                if (joinText.length == 0 || item.listInfo?.joinType === ListJoinType.NONE) {
                    return new RHSPrimListEntry(prop); // propTypeName*
                } else if (item.listInfo?.joinType === ListJoinType.Separator) {
                    return new RHSPrimListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listInfo?.joinType === ListJoinType.Initiator) {
                    const sub1 = new RHSRefEntry(prop);
                    return new RHSPrimListGroupWithInitiator(prop, sub1, joinText); // `("joinText" propTypeName)*`
                } else if (item.listInfo?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSPrimEntry(prop);
                    return new RHSPrimListGroup(prop, sub1, joinText); // `(propTypeName 'joinText' )*`
                } else {
                    return null;
                }
            }
        }
        return null;
    }

    private addExtraEscape(str: string) {
        str = ParserGenUtil.escapeRelevantChars(str);
        // apparantly "\'" needs an extra backslash in the grammar
        return str.replace(new RegExp("\'", "gm"), "\\" + "\'");
    }

    private makeListJoinText(joinText: string): string {
        let result: string = "";
        if (!!joinText) {
            result = joinText.trimEnd();
        }
        // TODO should test on all manners of whitespace
        result = result.replace(new RegExp("\\\\n", "g"), "");
        result = result.replace(new RegExp("\\\\t", "g"), "");
        result = result.replace(new RegExp("\\\\r", "g"), "");
        result = result.trimEnd();
        return result;
    }

    private makeSuperParts(item: PiEditSuperProjection, inOptionalGroup: boolean): RightHandSideEntry[] {
        let subs: RightHandSideEntry[] = [];
        // find the projection that we need
        let myProjection: PiEditProjection = ParserGenUtil.findNonTableProjection(this.currentProjectionGroup, item.superRef.referred, item.projectionName);
        myProjection.lines.forEach(line => {
            subs.push(...this.addItems(line.items, inOptionalGroup));
        });
        return subs;
    }

    private makeLimitedProp(prop: PiProperty, item: PiEditPropertyProjection, inOptionalGroup: boolean): RHSPropEntry {
        if (!prop.isList) {
            if (!prop.isOptional || inOptionalGroup) {
                return new RHSLimitedRefEntry(prop);
            } else {
                return new RHSLimitedRefOptionalEntry(prop);
            }
        } else {
            if (!!item.listInfo && item.listInfo.isTable) {
                // TODO adjust for tables
            } else {
                let joinText = this.makeListJoinText(item.listInfo?.joinText);
                if (joinText.length == 0 || item.listInfo?.joinType === ListJoinType.NONE) {
                    return new RHSLimitedRefListEntry(prop); // propTypeName*
                } else if (item.listInfo?.joinType === ListJoinType.Separator) {
                    return new RHSLimitedRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listInfo?.joinType === ListJoinType.Initiator) {
                    const sub1 = new RHSLimitedRefEntry(prop);
                    return new RHSListGroupWithInitiator(prop, sub1, joinText); // `("joinText" propTypeName)*`
                } else if (item.listInfo?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSLimitedRefEntry(prop);
                    return new RHSListGroup(prop, sub1, joinText); // `(propTypeName 'joinText' )*`
                }
            }
        }
        return null;
    }

    private checkRule(rule: ConceptRule) {
        let xx: PiProperty[] = [];
        for (const part of rule.ruleParts) {
            if (part instanceof RHSPropEntry) {
                if (!xx.includes(part.property)) {
                    xx.push(part.property);
                } else {
                    LOG2USER.warning(`Warning: Found two entries for property '${part.property.name}' in '${rule.concept.name}'. Only the last will yield a parse result.`);
                }
            }
        }

    }
}
