import {
    PiClassifier, PiConcept, PiInterface,
    PiLanguage, PiPrimitiveProperty
} from "../languagedef/metalanguage";
import { PiUnitDescription } from "../languagedef/metalanguage/PiLanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    // tslint:disable-next-line:variable-name
    public static PiNamedElement:string = "PiNamedElement";
    // tslint:disable-next-line:variable-name
    public static PiElement:string = "PiElement";
    // tslint:disable-next-line:variable-name
    public static PiExpression:string = "PiExpression";
    // tslint:disable-next-line:variable-name
    public static PiBinaryExpression:string = "PiBinaryExpression";
    // tslint:disable-next-line:variable-name
    public static PiScoper:string = "PiScoper";
    // tslint:disable-next-line:variable-name
    public static PiTyper:string = "PiTyper";
    // tslint:disable-next-line:variable-name
    public static PiTyperPart: string = "PiTyperPart";
    // tslint:disable-next-line:variable-name
    public static PiValidator:string = "PiValidator";
    // tslint:disable-next-line:variable-name
    public static PiStdlib:string = "PiStdlib";
    // tslint:disable-next-line:variable-name
    public static PiWriter:string = "PiWriter";
    // tslint:disable-next-line:variable-name
    public static PiReader:string = "PiReader";
    // tslint:disable-next-line:variable-name
    public static PiError:string = "PiError";
    // tslint:disable-next-line:variable-name
    public static PiErrorSeverity:string = "PiErrorSeverity";
    // tslint:disable-next-line:variable-name
    public static PiActions:string = "PiActions";
    // tslint:disable-next-line:variable-name
    public static PiEditor:string = "PiEditor";
    // tslint:disable-next-line:variable-name
    public static PiProjection:string = "PiProjection";
    // tslint:disable-next-line:variable-name
    public static PiModelInitialization:string = "PiModelInitialization";
    // tslint:disable-next-line:variable-name
    public static Box:string = "Box";
    // tslint:disable-next-line:variable-name
    public static PiElementReference:string = "PiElementReference";
    // tslint:disable-next-line:variable-name
    public static PiEnvironment:string = "PiEnvironment";
    // tslint:disable-next-line:variable-name
    public static CompositeProjection:string = "PiCompositeProjection";
    // tslint:disable-next-line:variable-name
    public static ProjectionalEditor:string = "ProjectionalEditor";
    public static mainProjectionalEditor:string = "MainProjectionalEditor";
    public static styles:string = "projectitStyles";
    public static nameForSelf:string = "self";
    public static initializeLanguage:string = "initializeLanguage";
    // reserved role names for expressions, use with care.
    // Should remain identical to the definitions in @projectit/core !!
    public static PI_BINARY_EXPRESSION_LEFT:string = "PiBinaryExpression-left";
    public static PI_BINARY_EXPRESSION_RIGHT:string = "PiBinaryExpression-right";
    public static BEFORE_BINARY_OPERATOR:string = "binary-pre";
    public static AFTER_BINARY_OPERATOR:string = "binary-post";
    public static LEFT_MOST:string = "exp-left";
    public static RIGHT_MOST:string = "exp-right";
    public static BINARY_EXPRESSION:string = "binary-expression";
    public static EXPRESSION:string = "expression";
    public static EXPRESSION_SYMBOL:string = "symbol";


    // because the below names are used to generate TypeScript classes
    // they all have to start with an uppercase character
    public static configuration() {
        return "ProjectitConfiguration";
    }

    public static environment(language: PiLanguage) {
        return this.startWithUpperCase(language?.name) + "Environment";
    }

    public static context(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Context";
    }

    public static actions(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Actions";
    }

    public static defaultActions(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultActions";
    }

    public static customActions(language: PiLanguage): string {
        return "Custom" + this.actions(language);
    }

    public static customTyper(language: PiLanguage): string {
        return "Custom" + this.typerPart(language);
    }

    public static customValidator(language: PiLanguage): string {
        return "Custom" + this.validator(language);
    }

    public static projectionDefault(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ProjectionDefault";
    }

    public static selectionHelpers(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SelectionHelpers";
    }

    public static customProjection(language: PiLanguage): string {
        return "Custom" + this.startWithUpperCase(language?.name) + "Projection";
    }

    public static language(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Language";
    }

    public static initialization(language: PiLanguage) {
        return this.startWithUpperCase(language?.name) + "Initialization";
    }

    public static concept(concept: PiConcept): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static classifier(concept: PiClassifier): string {
        return this.startWithUpperCase(concept?.name);
    }

    public static primitivePropertyField(property: PiPrimitiveProperty): string {
        return "$$" + property.name;
    }

    public static primitivePropertyGetter(property: PiPrimitiveProperty): string {
        return property.name;
    }

    public static primitivePropertySetter(property: PiPrimitiveProperty): string {
        return property.name;
    }

    public static interface(interf: PiInterface): string {
        return this.startWithUpperCase(interf?.name);
    }

    public static metaType(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "MetaType";
    }

    public static allConcepts(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "EveryConcept";
    }

    public static modelunit(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitType";
    }

    public static namespace(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Namespace";
    }

    public static scoper(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Scoper";
    }

    public static scoperUtils(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ScoperUtils";
    }

    public static namesCollector(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "NamesCollector";
    }

    public static validator(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Validator";
    }

    public static checkerInterface(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "CheckerInterface";
    }

    public static rulesChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ValidationRulesChecker";
    }

    public static nonOptionalsChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "NonOptionalsChecker";
    }

    public static referenceChecker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ReferenceChecker";
    }

    public static typerPart(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "TyperPart";
    }

    public static typer(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Typer";
    }

    public static stdlib(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Stdlib";
    }

    public static walker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Walker";
    }

    public static workerInterface(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "Worker";
    }

    public static defaultWorker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "DefaultWorker";
    }

    public static startWithUpperCase(word: string): string {
        if (!!word) {
            return word[0].toUpperCase() + word.substr(1);
        }
        return "";
    }

    public static projectionFunction(c: PiClassifier): string {
        return "get" + Names.classifier(c) + "Box";
    }

    public static writer(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitWriter";
    }

    public static parser(unit: PiUnitDescription): string {
        return this.startWithUpperCase(unit?.name) + "Parser";
    }

    public static grammar(unit: PiUnitDescription): string {
        return this.startWithUpperCase(unit?.name) + "Grammar";
    }

    public static grammarStr(unit: PiUnitDescription): string {
        return this.startWithUpperCase(unit?.name) + "GrammarStr";
    }

    public static syntaxAnalyser(unit: PiUnitDescription): string {
        return this.startWithUpperCase(unit?.name) + "SyntaxAnalyser";
    }

    public static semanticAnalyser(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalyser";
    }

    public static semanticWalker(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "SemanticAnalysisWalker";
    }

    public static reader(language: PiLanguage): string {
        return this.startWithUpperCase(language?.name) + "ModelUnitReader";
    }
}
