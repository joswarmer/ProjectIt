import { Names, PROJECTITCORE } from "../../../utils";
import {
    findMobxImports,
    makeBasicMethods,
    makeBasicProperties, makeConstructor,
    makePartProperty,
    makePrimitiveProperty,
    makeStaticCreateMethod
} from "./ConceptUtils";
import { PiConcept, PiModelDescription } from "../../metalanguage/PiLanguage";

export class ModelTemplate {
    // the following template is based on assumptions about a 'model'
    // a model is not abstract
    // a model is not an expression
    // a model is not a modelunit
    // a model may not have a superclass
    // a model may not implement any interfaces
    // a model only has parts ??
    // TODO may a model have other properties than units???
    public generateModel(modelDescription: PiModelDescription): string {
        const language = modelDescription.language;
        const myName = Names.classifier(modelDescription);
        const extendsClass = "MobxModelElementImpl";
        const coreImports = this.findMobxImports(modelDescription).concat(["PiModel", "Language", "PiUtils", "ChangeManager"]);
        const modelImports = this.findModelImports(modelDescription, myName);
        const metaType = Names.metaType(language);

        // Template starts here
        return `
            import { ${coreImports.join(",")} } from "${PROJECTITCORE}";
            import { ${Names.modelunit(language)}, ${modelImports.join(", ")} } from "./internal";
            
            /**
             * Class ${myName} is the implementation of the model with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react 
             * to changes in the state of its properties.
             */            
            @model
            export class ${myName} extends ${extendsClass} implements PiModel {     
            
                ${makeStaticCreateMethod(modelDescription, myName)}
                                      
                ${makeBasicProperties(metaType, myName, false)}
                ${modelDescription.primProperties.map(p => makePrimitiveProperty(p)).join("\n")}
                ${modelDescription.parts().map(p => makePartProperty(p)).join("\n")}

                ${makeConstructor(false, modelDescription.properties)}            
                ${makeBasicMethods(false, metaType,true, false,false, false)}
                
                /**
                 * A convenience method that finds a unit of this model based on its name and 'metatype'.
                 * @param name
                 * @param metatype
                 */
                findUnit(name: string, metatype?: ${metaType} ): ${Names.modelunit(language)} {
                    let result: ${Names.modelunit(language)} = null;
                    ${modelDescription.parts().map(p =>
            `${p.isList ?
                `result = this.${p.name}.find(mod => mod.name === name);`
                :
                `if (this.${p.name}.name === name ) result = this.${p.name}`
            }`
        ).join("\n")}
                    if (!!result && !!metatype) {
                        const myMetatype = result.piLanguageConcept();
                        if (myMetatype === metatype || Language.getInstance().subConcepts(metatype).includes(myMetatype)) {
                            return result;
                        }
                    } else {
                        return result;
                    }                    
                    return null;
                }               
                    
                /**
                 * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
                 * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
                 * @param oldUnit
                 * @param newUnit
                 */
                replaceUnit(oldUnit: ${Names.modelunit(language)}, newUnit: ${Names.modelunit(language)}): boolean {
                    if ( oldUnit.piLanguageConcept() !== newUnit.piLanguageConcept()) {
                        return false;
                    }
                    if ( oldUnit.piContainer().container !== this) {
                        return false;
                    }
                    // we must store the interface in the same place as the old unit, which info is held in PiContainer()
                    ${modelDescription.parts().map(part =>
            `if ( oldUnit.piLanguageConcept() === "${Names.classifier(part.type.referred)}" && oldUnit.piContainer().propertyName === "${part.name}" ) {
                                ${part.isList ?
                `const index = this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type.referred)});
                                this.${part.name}.splice(index, 1, newUnit as ${Names.classifier(part.type.referred)});`
                :
                `this.${part.name} = newUnit as ${Names.classifier(part.type.referred)};`}
                            } else`
        ).join(" ")}                    
                    {
                        return false;
                    }        
                    return  true;
                }
                
                    /**
                     * Adds a model unit. Returns false if anything goes wrong.
                     *
                     * @param newUnit
                     */
                    addUnit(newUnit: ${Names.modelunit(language)}): boolean {
                        if (!!newUnit) {
                            const myMetatype = newUnit.piLanguageConcept();
                            // TODO this depends on the fact the only one part of the model concept has the same type, should we allow differently???
                            switch (myMetatype) {
                            ${language.modelConcept.allParts().map(part =>
            `case "${Names.classifier(part.type.referred)}": {
                                    ${part.isList ?
                `this.${part.name}.push(newUnit as ${Names.classifier(part.type.referred)});`
                :
                `this.${part.name} = newUnit as ${Names.classifier(part.type.referred)}`
            }
                                    return true;
                                }`).join("\n")}
                            }
                        }
                        return false;                 
                    }
                    
                    /**
                     * Removes a model unit. Returns false if anything goes wrong.
                     *
                     * @param oldUnit
                     */
                    removeUnit(oldUnit: ${Names.modelunit(language)}): boolean {
                        if (!!oldUnit) {
                            const myMetatype = oldUnit.piLanguageConcept();
                            switch (myMetatype) {
                            ${language.modelConcept.allParts().map(part =>
            `case "${Names.classifier(part.type.referred)}": {
                                    ${part.isList ?
                `this.${part.name}.splice(this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type.referred)}), 1);`
                :
                `this.${part.name} = null;`
            }
                                    return true;
                                }`).join("\n")}
                            }
                        } 
                        return false;
                    }
                    
                /** 
                 * Returns an empty model unit of type 'unitTypeName' within 'model'. 
                 * 
                 * @param model
                 * @param unitTypeName
                 */
                newUnit(typename: ${Names.metaType(language)}) : ${Names.modelunit(language)}  {
                    switch (typename) {
                        ${language.modelConcept.allParts().map(part =>
            `case "${Names.classifier(part.type.referred)}": {
                                const unit: ${Names.classifier(part.type.referred)} = new ${Names.classifier(part.type.referred)}();
                                    ${part.isList ?
                `this.${part.name}.push(unit as ${Names.classifier(part.type.referred)});`
                :
                `this.${part.name} = unit as ${Names.classifier(part.type.referred)}`
            }
                                    return unit;
                                }`
        ).join("\n")
        }
                    }
                    return null;
                } 
                                    
                    /**
                     * Returns a list of model units.
                     */
                    getUnits(): ${Names.modelunit(language)}[] {
                        let result : ${Names.modelunit(language)}[] = [];
                        ${language.modelConcept.allParts().map(part =>
            `${part.isList ?
                `result = result.concat(this.${part.name});`
                :
                `result.push(this.${part.name});`
            }`).join("\n")}
                        return result;
                    }
                    
                    /**
                     * Returns a list of model units of type 'type'.
                     */
                    getUnitsForType(type: string): ${Names.modelunit(language)}[] {
                        switch (type) {
                        ${language.modelConcept.allParts().map(part =>
            `${part.isList ?
                `case "${part.type.referred.name}": {
                                    return this.${part.name};
                                }`
                :
                `case "${part.type.referred.name}": {
                                    let result : ${Names.modelunit(language)}[] = [];
                                    result.push(this.${part.name});
                                    return result;
                                }`
            }`).join("\n")}
                        }
                        return [];
                    }
                }`;
    }

    private findModelImports(modelDescription: PiModelDescription, myName: string): string[] {
        return Array.from(
            new Set(
                modelDescription.parts().map(part => Names.classifier(part.type.referred))
                    .concat(Names.metaType(modelDescription.language))
                    .filter(name => !(name === myName))
                    .filter(r => (r !== null) && (r.length > 0))
            )
        );
    }

    private findMobxImports(concept: PiModelDescription): string[] {
        const mobxImports: string[] = ["model"];
        mobxImports.push("MobxModelElementImpl");
        if (concept.properties.some(part => part.isList && !part.isPrimitive)) {
            mobxImports.push("observablelistpart");
        }
        if (concept.properties.some(part => !part.isList && !part.isPrimitive)) {
            mobxImports.push("observablepart");
        }
        return mobxImports;
    }
}
