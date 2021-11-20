import { Names } from "../../../utils";
import {
    PiPrimitiveProperty,
    PiBinaryExpressionConcept,
    PiExpressionConcept,
    PiConcept,
    PiLimitedConcept,
    PiProperty,
    PiPropertyInstance, PiClassifier
} from "../../metalanguage";
import {
    findMobxImports,
    makeBasicMethods,
    makeBasicProperties,
    makeConstructor,
    makeImportStatements,
    makePartProperty,
    makePrimitiveProperty,
    makeReferenceProperty, makeStaticCreateMethod
} from "./ConceptUtils";
import { PiPrimitiveType } from "../../metalanguage/PiLanguage";

export class ConceptTemplate {

    generateConcept(concept: PiConcept): string {
        if (concept instanceof PiLimitedConcept) {
            return this.generateLimited(concept);
        } else if (concept instanceof PiBinaryExpressionConcept) {
            return this.generateBinaryExpression(concept);
        } else {
            return this.generateConceptPrivate(concept);
        }
    }

    private generateConceptPrivate(concept: PiConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const isExpression = (concept instanceof PiBinaryExpressionConcept) || (concept instanceof PiExpressionConcept);
        const abstract = (concept.isAbstract ? "abstract" : "");
        const hasName = concept.implementedPrimProperties().some(p => p.name === "name");
        const implementsPi = (isExpression ? "PiExpression" : (hasName ? "PiNamedElement" : "PiElement"));
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(implementsPi).concat("PiUtils").concat("ChangeManager");
        const metaType = Names.metaType(language);
        const modelImports = this.findModelImports(concept, myName, hasReferences);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements ${implementsPi}${intfaces.map(imp => `, ${imp}`).join("")}
            {
                ${(!isAbstract) ? `${makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     
                              
                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false, isExpression, false)}                                   
            }
        `;
    }

    // assumptions:
    // an expression is not a model
    private generateBinaryExpression(concept: PiBinaryExpressionConcept) {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const hasReferences = concept.implementedReferences().length > 0;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const isAbstract = concept.isAbstract;
        const baseExpressionName = Names.concept(concept.language.findExpressionBase());
        const abstract = concept.isAbstract ? "abstract" : "";
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(["PiBinaryExpression", "PiUtils", "ChangeManager"]);
        const metaType = Names.metaType(language);
        let modelImports = this.findModelImports(concept, myName, hasReferences);
        if (!modelImports.includes(baseExpressionName)) {
            modelImports = modelImports.concat(baseExpressionName);
        }
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(needsObservable, coreImports, modelImports)}

            /**
             * Class ${myName} is the implementation of the binary expression concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements PiBinaryExpression${intfaces.map(imp => `, ${imp}`).join("")} {            
                ${(!isAbstract) ? `${makeStaticCreateMethod(concept, myName)}`
                : ""}
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}
                ${concept.implementedParts().map(p => makePartProperty(p)).join("\n")}
                ${concept.implementedReferences().map(p => makeReferenceProperty(p)).join("\n")}     
                              
                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false,true, true)}                    
                
                /**
                 * Returns the priority of this expression instance.
                 * Used to balance the expression tree.
                 */ 
                piPriority(): number {
                    return ${concept.getPriority() ? concept.getPriority() : "-1"};
                }
                
                /**
                 * Returns the left element of this binary expression.
                 */ 
                public piLeft(): ${baseExpressionName} {
                    return this.left;
                }

                /**
                 * Returns the right element of this binary expression.
                 */                 
                public piRight(): ${baseExpressionName} {
                    return this.right;
                }

                /**
                 * Sets the left element of this binary expression.
                 */                 
                public piSetLeft(value: ${baseExpressionName}): void {
                    this.left = value;
                }

                /**
                 * Sets the right element of this binary expression.
                 */                 
                public piSetRight(value: ${baseExpressionName}): void {
                    this.right = value;
                }
            }
        `;
    }


// the folowing template is based on assumptions about a limited concept.
    // a limited has a name property
    // a limited is not an expression ???
    // a limited does not have any non-prim properties
    // a limited does not have any references
    // the base of a limited is also a limited
    private generateLimited(concept: PiLimitedConcept): string {
        const language = concept.language;
        const myName = Names.concept(concept);
        const hasSuper = !!concept.base;
        const extendsClass = hasSuper ? Names.concept(concept.base.referred) : "MobxModelElementImpl";
        const abstract = (concept.isAbstract ? "abstract" : "");
        const needsObservable = concept.implementedPrimProperties().length > 0;
        const coreImports = findMobxImports(hasSuper, concept).concat(["PiNamedElement", "PiUtils", "ChangeManager"]);
        const metaType = Names.metaType(language);
        const imports = this.findModelImports(concept, myName, false);
        const intfaces = Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
            )
        );

        // Template starts here
        return `
            ${makeImportStatements(needsObservable, coreImports, imports)}

            /**
             * Class ${myName} is the implementation of the limited concept with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export ${abstract} class ${myName} extends ${extendsClass} implements PiNamedElement${intfaces.map(imp => `, ${imp}`).join("")}
            {           
                ${(!concept.isAbstract) ? `${makeStaticCreateMethod(concept, myName)}`
                : ""}
             
                ${concept.instances.map(predef =>
                    `static ${predef.name}: ${myName};  // implementation of instance ${predef.name}`).join("\n")}
                     static $piANY : ${myName};         // default predefined instance
                            
                ${makeBasicProperties(metaType, myName, hasSuper)}
                ${concept.implementedPrimProperties().map(p => makePrimitiveProperty(p)).join("\n")}

                ${makeConstructor(hasSuper, concept.implementedProperties())}
                ${makeBasicMethods(hasSuper, metaType,false, false,false, false)}                
            }
                       
            // Because of mobx we need to generate the initialisations outside of the class,
            // otherwise the state of properties with primitive type will not be kept correctly. 
            ${concept.instances.map(predef =>
                `${myName}.${predef.name} = ${myName}.create({
                        ${predef.props.map(prop => `${prop.name}: ${this.createInstancePropValue(prop)}`).join(", ")}
                    });` ). join(" ")}`;
    }

    private findModelImports(concept: PiConcept, myName: string, hasReferences: boolean): string[] {
        return Array.from(
            new Set(
                concept.interfaces.map(i => Names.interface(i.referred))
                    .concat((concept.base ? Names.concept(concept.base.referred) : null))
                    .concat(concept.implementedParts().map(part => Names.classifier(part.type.referred)))
                    .concat(concept.implementedReferences().map(part => Names.classifier(part.type.referred)))
                    .concat(Names.metaType(concept.language))
                    .concat(hasReferences ? (Names.PiElementReference) : null)
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }

    // TODO weave the next method into the template for limited concepts
    private createInstancePropValue(property: PiPropertyInstance): string {
        const refProperty: PiProperty = property.property?.referred;
        if (!!refProperty && refProperty instanceof PiPrimitiveProperty) { // should always be the case
            const type: PiClassifier = refProperty.type.referred;
            if (refProperty.isList) {
                return `[ ${property.valueList.map(value =>
                    `${(type === PiPrimitiveType.string || type === PiPrimitiveType.identifier) ? `"${value}"` : `${value}` }`
                ).join(", ")} ]`;
            } else {
                return `${(type === PiPrimitiveType.string || type === PiPrimitiveType.identifier) ? `"${property.value}"` : `${property.value}` }`;
            }
        }
        return ``;
    }
}
