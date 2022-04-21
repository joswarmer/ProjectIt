import {
    PiConcept, PiConceptProperty,
    PiInterface,
    PiLangExp,
    PiLangFunctionCallExp,
    PiLanguage
} from "../../../languagedef/metalanguage";
import {
    Names,
    LANGUAGE_GEN_FOLDER,
    PROJECTITCORE,
    TYPER_GEN_FOLDER,
    CONFIGURATION_GEN_FOLDER,
    langExpToTypeScript,
    replaceInterfacesWithImplementors, LangUtil
} from "../../../utils";
import { PiScopeDef, ScopeConceptDef } from "../../metalanguage";

export class ScoperTemplate {
    hasAlternativeScopeText: string = "";
    getAlternativeScopeText: string = "";
    alternativeScopeImports: string = "";

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.scoper(language)}";
        // export * from "./${Names.scoperUtils(language)}";
        // export * from "./${Names.namespace(language)}";
        // export * from "./${Names.namesCollector(language)}";
        export * from "./${Names.scoperDef(language)}";
        `;
    }

    generateScoper(language: PiLanguage, scopedef: PiScopeDef, relativePath: string): string {
        this.hasAlternativeScopeText = "";
        this.getAlternativeScopeText = "";
        this.alternativeScopeImports = "";

        const allLangConcepts: string = Names.allConcepts(language);
        const langConceptType: string = Names.metaType(language);
        const generatedClassName: string = Names.scoper(language);
        const namespaceClassName: string = Names.namespace(language);
        const scoperInterfaceName: string = Names.PiScoper;
        const typerClassName: string = Names.typer(language);

        let generateAlternativeScopes = false;
        if (!!scopedef) { // should always be the case, either the definition read from file or the default
            this.makeAlternativeScopeTexts(scopedef, language);
            this.makeAdditionalNamespaceTexts(scopedef, language);
            if (this.hasAlternativeScopeText.length > 0) {
                generateAlternativeScopes = true;
            }
        }

        // Template starts here
        return `
        import { ${allLangConcepts}, ${langConceptType},
                    ${replaceInterfacesWithImplementors(scopedef.namespaces).map(ref =>
                        `${Names.classifier(ref)}`).join(", ")}${this.alternativeScopeImports} 
                } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        // import { ${namespaceClassName} } from "./${namespaceClassName}";
        import { ${scoperInterfaceName},  ${Names.PiNamedElement}, PiLogger, Language, PiElement, PiModelUnit, FreonNamespace, modelUnit } from "${PROJECTITCORE}"
        import { ${Names.environment(language)} } from "${relativePath}${CONFIGURATION_GEN_FOLDER}/${Names.environment(language)}";
        ${generateAlternativeScopes ? `import { ${typerClassName} } from "${relativePath}${TYPER_GEN_FOLDER}";` : `` }          
                                   
        const LOGGER = new PiLogger("${generatedClassName}");  
        
        /**
         * Class ${generatedClassName} implements the scoper generated from, if present, the scoper definition,
         * otherwise this class implements the default scoper. 
         */      
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            ${generateAlternativeScopes ? `myTyper: ${typerClassName};` : ``}
    
            public resolvePathName(basePosition: PiElement, doNotSearch: string, pathname: string[], metatype?: ${langConceptType}): ${Names.PiNamedElement} {
                // get the names from the namespace where the pathname is found (i.e. the basePostion) to be able to check against this later on
                let elementsFromBasePosition: ${Names.PiNamedElement}[] = this.getVisibleElements(basePosition);
                // start the loop over the set of names in the pathname
                let previousFound: PiElement = basePosition;
                let found: ${Names.PiNamedElement} = null;
                for (let index = 0; index < pathname.length; index++) {
                    if (index === pathname.length - 1) { // it is the last name in the path, use 'metatype'
                        found = this.getFromVisibleElements(previousFound, pathname[index], metatype);
                    } else {
                        // search the next name of pathname in the namespace of 'previousFound'
                        // but do not use the metatype information, because only the element with the last of the pathname will have the correct type
                        found = this.getFromVisibleElements(previousFound, pathname[index]);
                        if (found === null || found === undefined || !Language.getInstance().classifier(found.piLanguageConcept()).isNamespace) {
                            return null;
                        }
                        previousFound = found;
                    }
                    // check if 'found' is public or 'found' is in the namespace of the basePosition
                    if (!this.isPublic(found) && !elementsFromBasePosition.includes(found)) {
                        return null;
                    }
                }
                return found;
            }
 
            private isPublic(found: PiNamedElement) : boolean {
                // find the information about whether this element is public or private within its parent from the its owner:
                // 1. check the language description to find the concept description of the parent
                // 2. from the parent find the property description with the right name
                // 3. check whether the found property is public
                if (found === null || found === undefined) {
                    return false;
                }
                const ownerDescriptor = found.piOwnerDescriptor();
                if (ownerDescriptor === null || ownerDescriptor === undefined) {
                    return false;
                }
                const metaType: string = ownerDescriptor.owner.piLanguageConcept();
                if (metaType === "${Names.classifier(language.modelConcept)}" ) {
                    return true; // model only has units as properties, all units are public
                } else ${language.units.map(u => ` if (metaType === "${Names.classifier(u)}") {
                    return Language.getInstance().unit(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
                } else`).join("")} {
                    return Language.getInstance().concept(metaType).properties.get(ownerDescriptor.propertyName).isPublic;
                }
            }   
                    
            /**
             * See ${scoperInterfaceName}.
             */
            public getVisibleElements(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): PiNamedElement[] {
                ${generateAlternativeScopes ? `this.myTyper = ${Names.environment(language)}.getInstance().typer as ${typerClassName};` : ``}
                const visitedNamespaces: FreonNamespace[] = [];
                const result: ${Names.PiNamedElement}[] = [].concat(this.getElementsFromStdlib(metatype));
                this.getVisibleElementsIntern(modelelement, result, visitedNamespaces, metatype, excludeSurrounding);
                return result;
            }

            private getVisibleElementsIntern(modelelement: PiElement, result: ${Names.PiNamedElement}[], visitedNamespaces: FreonNamespace[], metatype?: string, excludeSurrounding?: boolean): void {
                if (!!modelelement) {
                    const origin: PiModelUnit = modelUnit(modelelement)
                    let doSurrouding: boolean = !(!(excludeSurrounding === undefined) && excludeSurrounding);
                    let nearestNamespace: FreonNamespace;
                    // first, see if we need to use an alternative scope/namespace
                    if (this.hasAlternativeScope(modelelement)) {
                        nearestNamespace = this.getAlternativeScope(modelelement);
                        // do not search surrounding namespaces for alternative scopes
                        doSurrouding = false;
                    } else {
                        nearestNamespace = this.findNearestNamespace(modelelement);
                    }
                    
                   while (!!nearestNamespace) {
                        // Second, get the elements from the found namespace
                        if( !visitedNamespaces.includes(nearestNamespace)) {
                            FreonNamespace.joinResultsWithShadowing(nearestNamespace.getVisibleElements(origin, metatype), result);
                            visitedNamespaces.push(nearestNamespace);
                                for (const elem of this.additionalNamespaces(nearestNamespace._myElem)) {
                                    this.getVisibleElementsIntern(elem, result, visitedNamespaces, metatype, true);
                                }
                        }
                        modelelement = modelelement.piOwner();
                        nearestNamespace = doSurrouding ? this.findNearestNamespace(modelelement) : null;
                    }
                } else {
                    LOGGER.error(this, "getVisibleElements: modelelement is null");
                }
            }
        
            /**
             * See ${scoperInterfaceName}.
             */
            public getFromVisibleElements(modelelement: PiElement, name : string, metatype?: string, excludeSurrounding? : boolean) : ${Names.PiNamedElement} {
                const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                if (visibleElements !== null) {
                    for (const element of visibleElements) {
                        const n: string = element.name;
                        if (name === n) {
                            return element;
                        }  
                    }
                }    
                return null;
            }
            
            /**
             * See ${scoperInterfaceName}.
             */
            public getVisibleNames(modelelement: PiElement, metatype?: string, excludeSurrounding? : boolean) : string[] {
                const result: string[] = [];
                const visibleElements = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                for (const element of visibleElements) {
                    const n: string = element.name;
                    result.push(n);                    
                }
                return result;
            }
            
            /**
             * See ${scoperInterfaceName}.
             */
            public isInScope(modelElement: PiElement, name: string, metatype?: string, excludeSurrounding? : boolean) : boolean {
                return this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null;
            }
            
             /**
             * Returns the enclosing namespace for 'modelelement'.
             * @param modelelement
             */
            private findNearestNamespace(modelelement: PiElement): FreonNamespace {
                if (modelelement === null) {
                    return null;
                }
                if (Language.getInstance().classifier(modelelement.piLanguageConcept()).isNamespace) {
                    return FreonNamespace.create(modelelement);
                } else {
                    return this.findNearestNamespace(modelelement.piOwner());
                }
            }

             /**
             * Returns the namespace to be used as alternative scope for 'modelelement'.
             * @param modelelement
             */
            private getAlternativeScope(modelelement: PiElement): FreonNamespace {
                ${this.getAlternativeScopeText}
                return null;
            }
        
             /**
             * Returns true if there is an alternative scope defined for this 'modelelement'.
             * @param modelelement
             */
            private hasAlternativeScope(modelelement: PiElement): boolean {
                ${this.hasAlternativeScopeText}
                return false;
            }
            
             /**
             * Returns all elements that are in the standard library, which types equal 'metatype'.
             * @param metatype
             */           
            private getElementsFromStdlib(metatype?: string): ${Names.PiNamedElement}[] {
                if (!!metatype) {
                    return ${Names.environment(language)}.getInstance().stdlib.elements.filter((elem) => elem.piLanguageConcept() === metatype ||
                            Language.getInstance().subConcepts(metatype).includes(elem.piLanguageConcept()));
                } else {
                    return ${Names.environment(language)}.getInstance().stdlib.elements;
                }
            }
            
            /**
             * Returns all PiElements that are defined as additional namespaces for \`element'.
             * @param element
             */
            public additionalNamespaces(element: PiElement): PiElement[] {
                const result: PiElement[] = [];
                ${this.getAdditionalNamespacetext}
                return result;

            }
        }`;
    }

    private makeAdditionalNamespaceTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const generatedConcepts: PiConcept[] = [];
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.namespaceAdditions) {
                const myClassifier = def.conceptRef.referred;
                let isDone: boolean = false;
                const comment = "// based on namespace addition for " + myClassifier.name + "\n";
                if (myClassifier instanceof PiInterface) {
                    for (const implementor of LangUtil.findImplementorsRecursive(myClassifier)) {
                        if ( !generatedConcepts.includes(implementor)) {
                            isDone = true;
                        }
                        this.makeAdditionalNamespaceTextsForConcept(implementor, def, language, isDone, comment);
                        generatedConcepts.push(implementor);
                        this.imports.push(Names.concept(implementor));
                    }
                } else {
                    if ( !generatedConcepts.includes(myClassifier)) {
                        isDone = true;
                    }
                    this.makeAdditionalNamespaceTextsForConcept(myClassifier, def, language, isDone, comment);
                    generatedConcepts.push(myClassifier);
                    this.imports.push(Names.classifier(myClassifier));
                }
            }
        }
    }

    imports: string[] = [];
    getAdditionalNamespacetext = "";
    additionalNamespaceImports = "";
    // hasAdditionalNamespacetext = "";

    private makeAdditionalNamespaceTextsForConcept(piConcept: PiConcept, def: ScopeConceptDef, language: PiLanguage, isDone: boolean, comment: string) {
        const typeName = Names.concept(piConcept);
        // we are adding to three textstrings
        // first, to the import statements
        if (isDone) { // do this only if the concept has not yet been imported (indicated by isDone)
            this.additionalNamespaceImports = this.additionalNamespaceImports.concat(", " + typeName);
        }

        // second, to the 'getAlternativeScope' method
        // Do this always, because the expression can be different for a concrete concept
        // and the interface that its implements. Both should added!
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(comment);
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `if (element instanceof ${typeName}) {`);
        for (const expression of def.namespaceAdditions.expressions) {
            this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(this.addNamespaceExpression(expression, language));
        }
        this.getAdditionalNamespacetext = this.getAdditionalNamespacetext.concat(
            `}\n`);
    }


    private makeAlternativeScopeTexts(scopedef: PiScopeDef, language: PiLanguage) {
        const allLangConcepts: string = Names.allConcepts(language);
        for (const def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope) {
                const conceptName = def.conceptRef.referred.name;
                // we are adding to three textstrings
                // first, to the import statements
                this.alternativeScopeImports = this.alternativeScopeImports.concat(", " + conceptName);

                // second, to the 'hasAlternativeScope' method
                this.hasAlternativeScopeText = this.hasAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        return true;
                     }`);

                // third, to the 'getAlternativeScope' method
                this.getAlternativeScopeText = this.getAlternativeScopeText.concat(
                    `if (!!modelelement && modelelement instanceof ${conceptName}) {
                        // use alternative scope '${def.alternativeScope.expression.toPiString()}'
                        ${this.altScopeExpToTypeScript(def.alternativeScope.expression, allLangConcepts, language)}
                    }`);
            }
        }
    }

    private addNamespaceExpression(expression: PiLangExp, language: PiLanguage): string {
        let result: string = "";
        const generatedClassName: string = Names.namespace(language);
        const myRef = expression.findRefOfLastAppliedFeature();

        const loopVar: string = "loopVariable";
        let loopVarExtended = loopVar;
        if (myRef.isList) {
            if (myRef instanceof PiConceptProperty) {
                if (!myRef.isPart) {
                    loopVarExtended = loopVarExtended.concat(".referred");
                }
            }
            result = result.concat(`
            // generated based on '${expression.toPiString()}'
            for (let ${loopVar} of element.${expression.appliedfeature.toPiString()}) {
                if (!!${loopVarExtended}) {
                    result.push(${loopVarExtended});
                    // let extraNamespace = ${generatedClassName}.create(${loopVarExtended});
                    // ${generatedClassName}.joinResultsWithShadowing(extraNamespace.getVisibleElements(metatype), result);
                }
            }`);
        } else {
            // TODO check use of toPiString()
            result = result.concat(`
               // generated based on '${expression.toPiString()}' 
               if (!!element.${expression.appliedfeature.toPiString()}) {
                   result.push(element.${expression.appliedfeature.toPiString()}.referred);
               }`);
        }
        return result;
    }

    private altScopeExpToTypeScript(expression: PiLangExp, allLangConcepts: string, language: PiLanguage): string {
        let result = "";
        // special case: the expression refers to 'typeof'
        if (expression instanceof PiLangFunctionCallExp && expression.sourceName === "typeof") {
            let actualParamToGenerate: string = "";
            // we know that typeof has exactly 1 actual parameter
            if ( expression.actualparams[0].sourceName === "container" ) {
                actualParamToGenerate = `modelelement.piOwnerDescriptor().owner as ${allLangConcepts}`;
            } else {
                actualParamToGenerate = langExpToTypeScript(expression.actualparams[0]);
            }
            result = `let owner = ${actualParamToGenerate};
                if (!!owner) {
                    let newScopeElement = this.myTyper.inferType(owner).toAstElement();
                    // 'newScopeElement' could be null, when the type found by the typer does not correspond to an AST element
                    if (!!newScopeElement) {
                        return FreonNamespace.create(newScopeElement);
                    }
                }`;
        } else {
            // normal case: the expression is an ordinary expression over the language
            result = langExpToTypeScript(expression);
        }
        return result;
    }
}
