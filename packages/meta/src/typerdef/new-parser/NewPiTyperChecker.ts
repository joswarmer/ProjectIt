import { Checker, LangUtil } from "../../utils";
import {
    PiLanguage,
    PiClassifier,
    PiLangExpressionChecker,
    PiElementReference,
    PiLimitedConcept, PiProperty, PiInterface, PiConcept
} from "../../languagedef/metalanguage";
import { MetaLogger } from "../../utils";
import {
    PitAnytypeExp,
    PitAnyTypeRule,
    PitClassifierRule,
    PitConceptRule,
    PitConformanceOrEqualsRule,
    PitExp,
    PitFunctionCallExp,
    PitInferenceRule,
    PitInstanceExp,
    PitLimitedRule,
    PitPropertyCallExp,
    PitSelfExp,
    PitSingleRule,
    PitStatement,
    PitWhereExp,
    PiTyperDef
} from "../new-metalanguage";
import { ParserGenUtil } from "../../parsergen/parserTemplates/ParserGenUtil";
import { CommonSuperTypeUtil } from "../../utils/common-super/CommonSuperTypeUtil";

const LOGGER = new MetaLogger("NewPiTyperChecker"); //.mute();
const validFunctionNames: string[] = ["conformsTo", "equalsType", "typeof", "commonSuperType", "ancestor"];

export class NewPiTyperChecker extends Checker<PiTyperDef> {
    definition: PiTyperDef;
    myExpressionChecker: PiLangExpressionChecker;
    typeConcepts: PiClassifier[] = [];         // all concepts marked as 'isType'
    conceptsWithRules: PiClassifier[] = [];    // all concepts for which a rule is found.
                                               // Used to check whether there are two rules for the same concept.

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    public check(definition: PiTyperDef): void {
        // MetaLogger.unmuteAllLogs();
        this.definition = definition;
        LOGGER.log("Checking typer definition '");

        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Typer checker does not known the language.`);
        }
        definition.language = this.language;

        this.checkTypeReferences(definition.__types_references);
        this.checkTypeReferences(definition.__conceptsWithType_references);
        // from now on we can use the getters 'types' and 'conceptsWithType'!
        // all references that cannot be found are filtered out!

        // add all concepts that are types or have a type, because they inherit
        // from a concept or interface that is a type, or has a type
        definition.types = this.addInheritedConcepts(definition.types);
        definition.conceptsWithType = this.addInheritedConcepts(definition.conceptsWithType);

        if (!!definition.anyTypeRule) {
            this.checkAnyTypeRule(definition.anyTypeRule);
        } else {
            // maybe one of the PitConformanceOrEqualsRules is actually a PitAnyTypeRule
            // check this and make the neccessary changes
            let anyTypeRuleIndex: number = -1;
            definition.classifierRules.forEach((rule, index) => {
                if (rule.__myClassifier.name === "anytype" && rule instanceof PitConformanceOrEqualsRule) {
                    // TODO ask David about other way of parsing
                    // make a copy of the information into an object of another class
                    const newRule: PitAnyTypeRule = new PitAnyTypeRule();
                    newRule.myRules = rule.myRules;
                    newRule.agl_location = rule.agl_location;
                    // set the new rule
                    definition.anyTypeRule = newRule;
                    this.checkAnyTypeRule(newRule);
                    // remember the location of the incorrect rule
                    anyTypeRuleIndex = index;
                }
            });
            // remove the found incorrect PitConformanceOrEqualsRule
            if (anyTypeRuleIndex > -1) {
                definition.classifierRules.splice(anyTypeRuleIndex, 1);
            }
        }

        definition.classifierRules.forEach((rule, index) => {
            this.checkClassifierRule(rule);
        });

        definition.conceptsWithType.forEach(con => {
            if (con instanceof PiConcept && !con.isAbstract) {
                const conRule = definition.classifierRules.filter(rule => rule.__myClassifier.name === con.name && rule instanceof PitInferenceRule);
                this.simpleCheck(
                    conRule.length > 0,
                    `Concept '${con.name}' is marked 'hasType', but has no 'inferType' rule ${Checker.location(definition)}.`
                );
            }
        })

        // when everything has been checked we can do even more ...
        // let's find the top of the type hierarchy, if present
        definition.typeRoot = this.findTypeRoot(definition);

        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkTypeReferences(types: PiElementReference<PiClassifier>[]) {
        LOGGER.log("Checking types: '" + types.map(t => t.name).join(", ") + "'");
        for (const t of types) {
            t.owner = this.language;
            this.myExpressionChecker.checkClassifierReference(t);
            if (!!t.referred) { // error message given by myExpressionChecker
                this.nestedCheck({
                    check: !this.typeConcepts.includes(t.referred),
                    error: `Concept or interface '${t.name}' occurs more than once in this list ${Checker.location(t)}.`,
                    whenOk: () => {
                        this.typeConcepts.push(t.referred);
                    }
                });
            }
        }
    }

    private addInheritedConcepts(types: PiClassifier[]): PiConcept[] {
        LOGGER.log("addInheritedConcepts to: '" + types.map(t => t.name).join(", ") + "'");
        const result: PiConcept[] = [];
        types.forEach((t: PiClassifier) => {
            ParserGenUtil.addListIfNotPresent<PiClassifier>(result, LangUtil.subConceptsIncludingSelf(t));
            if (t instanceof PiInterface) {
                ParserGenUtil.addListIfNotPresent<PiClassifier>(result, LangUtil.findImplementorsRecursive(t));
            }
        });
        return result;
    }

    private checkAnyTypeRule(rule: PitAnyTypeRule) {
        LOGGER.log("Checking anyTypeRule '" + rule.toPiString() + "'");
        rule.myRules.forEach(stat => {
            // check the statement, using the overall model as enclosing concept
            this.checkSingleRule(stat, this.language.modelConcept);
        });
    }

    private checkClassifierRule(rule: PitClassifierRule) {
        LOGGER.log("Checking PitClassifierRule '" + rule.toPiString() + "'");
        this.myExpressionChecker.checkClassifierReference(rule.__myClassifier);
        rule.__myClassifier.owner = this.language;
        if (!!rule.__myClassifier.referred) { // error message done by myExpressionChecker
            const classifier: PiClassifier = rule.myClassifier;
            // see whether there are two or more rules for one concept or interface
            this.nestedCheck({
                check: !this.conceptsWithRules.includes(classifier),
                error: `Only one rule allowed per concept or interface ${Checker.location(rule)}.`,
                whenOk: () => {
                    this.conceptsWithRules.push(classifier);
                    // now check the rule itself
                    if (rule instanceof PitInferenceRule) {
                        this.checkInferenceRule(rule, classifier);
                    } else if (rule instanceof PitConformanceOrEqualsRule) {
                        this.checkConformanceOrEqualsRule(rule, classifier);
                    } else if (rule instanceof PitLimitedRule) {
                        this.checkLimitedRule(rule, classifier);
                    } else if (rule instanceof PitConceptRule) {
                        this.checkConceptRule(rule, classifier);
                    }
                }
            });
        }
    }

    private checkInferenceRule(rule: PitInferenceRule, classifier: PiClassifier) {
        this.simpleCheck(this.definition.conceptsWithType.includes(classifier),
            `Concept or interface '${classifier.name}' is not marked 'hasType', therefore it cannot have an infertype rule ${Checker.location(rule)}.`);
        rule.exp = this.changeInstanceToPropCallExp(rule.exp, classifier);
        this.checkPitExp(rule.exp, classifier);
        rule.returnType = rule.exp.returnType;
    }

    private checkConformanceOrEqualsRule(rule: PitConformanceOrEqualsRule, classifier: PiClassifier) {
        this.simpleCheck(this.definition.types.includes(classifier),
            `Concept or interface '${classifier.name}' is not marked 'isType', therefore it cannot have a conforms or equals rule ${Checker.location(rule)}.`);
        for (const stat of rule.myRules) {
            this.checkSingleRule(stat, classifier);
        }
    }

    private checkLimitedRule(rule: PitLimitedRule, classifier: PiClassifier) {
        for (const stat of rule.statements) {
            this.checkStatement(stat, classifier);
        }
    }

    private checkConceptRule(rule: PitConceptRule, classifier: PiClassifier) {
        LOGGER.log("Checking checkConceptRule '" + rule.toPiString() + "'");
        for (const stat of rule.statements) {
            this.checkStatement(stat, classifier);
        }
    }

    private checkSingleRule(rule: PitSingleRule, classifier: PiClassifier) {
        rule.exp = this.changeInstanceToPropCallExp(rule.exp, classifier);
        this.checkPitExp(rule.exp, classifier);
    }

    private checkStatement(stat: PitStatement, classifier: PiClassifier, surroundingExp?: PitWhereExp) {
        LOGGER.log("Checking checkStatement '" + stat.toPiString() + "'");
        stat.left = this.changeInstanceToPropCallExp(stat.left, classifier);
        this.checkPitExp(stat.left, classifier, surroundingExp);
        stat.right = this.changeInstanceToPropCallExp(stat.right, classifier);
        this.checkPitExp(stat.right, classifier, surroundingExp);
        // check type conformance of left and right side
        // TODO returnType of expression should also include isList and isReferred, commonSuperType should handle these
        const type1: PiClassifier = stat.right.returnType;
        const type2: PiClassifier = stat.left.returnType;
        if (!!type1 && !!type2) { // either of these can be undefined when an earlier error has occurred
            if (type1 !== PiClassifier.ANY && type2 !== PiClassifier.ANY) {
                const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType([type1, type2]);
                this.simpleCheck(
                    possibles.length > 0,
                    `Types of '${type1.name}' and '${type2.name}' do not conform ${Checker.location(stat)}.`
                );
            }
        }
        // TODO check use of function calls on property of whereExp
    }

    private changeInstanceToPropCallExp(exp: PitExp, classifier: PiClassifier): PitExp {
        let result: PitExp = exp;
        if (exp instanceof PitInstanceExp) {
            if (!exp.__myLimited) {
                if (!(classifier instanceof PiLimitedConcept)) {
                    // console.log("FOUND PitInstanceExp, but suspect it is a PitPropertyCallExp: " + exp.toPiString())
                    result = new PitPropertyCallExp();
                    result.agl_location = exp.agl_location;
                    (result as PitPropertyCallExp).__property =
                        PiElementReference.create<PiProperty>(exp.__myInstance.name, "PiProperty");
                    (result as PitPropertyCallExp).__property.agl_location = exp.__myInstance.agl_location;
                }
            }
        }
        return result;
    }

    private checkPitExp(exp: PitExp, classifier: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // LOGGER.log("Checking PitExp '" + exp.toPiString() + "'");
        exp.language = this.language;
        if (exp instanceof PitAnytypeExp ) {
            // nothing to check
            exp.returnType = PiClassifier.ANY;
        } else if (exp instanceof PitSelfExp) {
            // nothing to check
            exp.returnType = classifier;
        } else if (exp instanceof PitFunctionCallExp) {
            this.checkFunctionCallExpression(exp, classifier, surroundingExp);
        } else if (exp instanceof PitPropertyCallExp ) {
            this.checkPropertyCallExp(exp, classifier, surroundingExp, surroundingAllowed);
        } else if (exp instanceof PitInstanceExp) {
            this.checkInstanceExp(exp, classifier);
        } else if (exp instanceof PitWhereExp) {
            this.checkWhereExp(exp, classifier);
        }
    }

    private checkWhereExp(exp: PitWhereExp, classifier: PiClassifier) {
        // LOGGER.log("Checking PitWhereExp '" + exp.toPiString() + "'");
        exp.otherType.refType.owner = this.language; // the type of the new property must be declared within the language
        this.nestedCheck({
            check: !!exp.otherType.type,
            error: `Cannot find type '${exp.otherType.refType.name}' ${Checker.location(exp.otherType.refType)}.`,
            whenOk: () => {
                this.simpleCheck(this.definition.types.includes(exp.otherType.type),
                    `Concept or interface '${exp.otherType.refType.name}' is not marked 'isType' ${Checker.location(exp.otherType.refType)}.`);
                exp.conditions.forEach(cond => {
                    this.checkStatement(cond, classifier, exp);
                });
                exp.returnType = exp.otherType.type;
            }
        });
    }

    private checkInstanceExp(exp: PitInstanceExp, classifier: PiClassifier | PiLimitedConcept) {
        exp.__myInstance.owner = this.language;
        if (!!exp.__myLimited) {
            exp.__myLimited.owner = this.language;
            this.simpleCheck(
                !!exp.myLimited,
                `Cannot find limited concept '${exp.__myLimited.name}' ${Checker.location(exp.__myLimited)}.`);
        } else {
            // use the enclosing classifier as limited concept
            if (classifier instanceof PiLimitedConcept) {
                exp.myLimited = classifier;
            }
        }
        exp.returnType = exp.myLimited;
        this.nestedCheck({
            check: !!exp.myInstance,
            error: `Cannot find instance '${exp.__myInstance.name}' of '${exp.__myLimited?.name}' ${Checker.location(exp.__myInstance)}.`,
            whenOk: () => {
                this.simpleCheck(!!exp.myLimited.findInstance(exp.__myInstance.name),
                    `Instance '${exp.__myInstance.name}' is not of type '${exp.__myLimited.name}' ${Checker.location(exp.__myInstance)}.`);
            }
        });
    }

    private checkPropertyCallExp(exp: PitPropertyCallExp, classifier: PiClassifier, surroundingExp?: PitWhereExp, surroundingAllowed?: boolean) {
        // The parameter surroundingAllowed is present to be able to give better errors messages.
        // It indicates whether or not the property from the surrounding whereExp may be used.
        if (surroundingAllowed === null || surroundingAllowed === undefined) {
            surroundingAllowed = true;
        }
        let errMessDone: boolean = false;
        if (!!exp.source) {
            exp.source = this.changeInstanceToPropCallExp(exp.source, classifier);
            this.checkPitExp(exp.source, classifier, surroundingExp, surroundingAllowed);
            // TODO check ownership!
            exp.__property.owner = exp.source.returnType;
        } else {
            if (!!surroundingExp) {
                // use the surrounding PitWhereExp, because there an extra prop is defined
                if (exp.__property.name === surroundingExp.otherType.name) {
                    if (!surroundingAllowed) {
                        this.simpleCheck(
                            false,
                            `Reference to property '${exp.__property.name}' is not allowed ${Checker.location(exp.__property)}.`
                        );
                        errMessDone = true;
                    }
                    exp.property = surroundingExp.otherType;
                    exp.returnType = exp.property.type;
                }
                // console.log(exp.toPiString() + " using surrounding exp: " + exp.property.name)
            }
        }

        if (!errMessDone) {
            this.nestedCheck({
                check: !!exp.property,
                error: `Cannot find property '${exp.__property.name}' ${Checker.location(exp.__property)}.`,
                whenOk: () => {
                    exp.returnType = exp.property.type;
                }
            });
        }
    }

    private checkFunctionCallExpression(exp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        LOGGER.log("checkFunctionCallExpression " + exp?.toPiString());
        this.checkArguments(exp, enclosingConcept, surroundingExp);
        // the returntype is always calcalated base on the common super type of the arguments
        this.findReturnType(exp);
        const functionName = validFunctionNames.find(name => name === exp.calledFunction);
        this.nestedCheck({
            check: !!functionName,
            error: `${exp.calledFunction} is not a valid function ${Checker.location(exp)}.`,
            whenOk: () => {
                if (exp.calledFunction === validFunctionNames[2]) { // "typeof"
                    // TODO extra check: may not have source
                    this.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`
                    });
                } else if (exp.calledFunction === validFunctionNames[4]) { // "ancestor"
                    this.nestedCheck({
                        check: exp.actualParameters.length === 1,
                        error: `Function '${functionName}' in '${enclosingConcept.name}' should have 1 parameter, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`
                    });
                } else {
                    this.nestedCheck({
                        check: exp.actualParameters.length === 2,
                        error:  `Function '${functionName}' in '${enclosingConcept.name}' should have 2 parameters, ` +
                            `found ${exp.actualParameters.length} ${Checker.location(exp)}.`
                    });
                }
            }
        });
    }

    private findReturnType(exp: PitFunctionCallExp) {
        const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(exp.actualParameters.map(par => par.returnType));
        if (possibles.length === 1) {
            exp.returnType = possibles[0];
        } else {
            exp.returnType = PiClassifier.ANY;
        }
    }

    private checkArguments(langExp: PitFunctionCallExp, enclosingConcept: PiClassifier, surroundingExp: PitWhereExp) {
        const newArgs: PitExp[] = [];
        langExp.actualParameters.forEach(p => {
                newArgs.push(this.changeInstanceToPropCallExp(p, enclosingConcept));
            }
        );
        newArgs.forEach(p => {
                this.checkPitExp(p, enclosingConcept, surroundingExp, false);
            }
        );
    }

    private findTypeRoot(definition: PiTyperDef): PiClassifier {
        const possibles: PiClassifier[] = CommonSuperTypeUtil.commonSuperType(definition.types);
        if (possibles.length === 1) {
            return possibles[0];
        } else {
            return PiClassifier.ANY;
        }
    }
}
